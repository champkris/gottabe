<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PaySolutionsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private PaySolutionsService $paymentService;

    public function __construct(PaySolutionsService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Initiate payment with PaySolutions
     */
    public function initiatePayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        try {
            $order = Order::with('user')->findOrFail($validated['order_id']);

            // Check if order belongs to authenticated user
            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized access to order'
                ], 403);
            }

            // Check if payment already processed
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'message' => 'Order already paid',
                ], 400);
            }

            // Prepare payment data
            $paymentData = [
                'order_id' => $order->id,
                'amount' => $order->total,
                'customer_email' => $order->user->email,
                'customer_name' => $order->shipping_name ?? $order->user->name,
                'customer_phone' => $order->shipping_phone ?? $order->user->phone,
                'customer_address' => $order->shipping_address,
                'product_detail' => "Order #{$order->id}",
            ];

            // Create payment with PaySolutions
            $result = $this->paymentService->createPayment($paymentData);

            if ($result['success']) {
                // Update order with transaction ID
                $order->update([
                    'payment_transaction_id' => $result['transaction_id'] ?? null,
                    'payment_status' => 'pending',
                ]);

                return response()->json([
                    'success' => true,
                    'payment_url' => $result['payment_url'],
                    'form_data' => $result['form_data'] ?? null,
                    'method' => $result['method'] ?? 'GET',
                    'transaction_id' => $result['transaction_id'],
                    'debug_info' => $result['debug_info'] ?? null,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment',
                'error' => $result['error'] ?? 'Unknown error',
            ], 500);

        } catch (\Exception $e) {
            Log::error('Payment initiation failed', [
                'order_id' => $validated['order_id'],
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle payment callback from PaySolutions
     */
    public function handleCallback(Request $request): JsonResponse
    {
        try {
            // Log raw request for debugging
            Log::info('=== PaySolutions Callback Received ===', [
                'method' => $request->method(),
                'headers' => $request->headers->all(),
                'body' => $request->all(),
                'raw_body' => $request->getContent(),
                'ip' => $request->ip(),
            ]);

            $callbackData = $request->all();

            // If body is empty, try to get JSON from raw content
            if (empty($callbackData)) {
                $rawContent = $request->getContent();
                if (!empty($rawContent)) {
                    $callbackData = json_decode($rawContent, true);
                    Log::info('Parsed JSON from raw body', ['data' => $callbackData]);
                }
            }

            if (empty($callbackData)) {
                Log::warning('Empty callback data received');
                return response()->json([
                    'success' => false,
                    'message' => 'Empty callback data'
                ], 400);
            }

            // Extract order reference from callback
            // PaySolutions might send 'refno' or 'merchant' field
            $refNo = $callbackData['refno'] ?? $callbackData['merchant'] ?? null;

            if ($refNo) {
                // Remove leading zeros to get actual order ID
                $orderId = ltrim($refNo, '0');
                $order = Order::find($orderId);

                if ($order) {
                    Log::info('Found order from callback', [
                        'order_id' => $orderId,
                        'order_status' => $order->status,
                        'payment_status' => $order->payment_status
                    ]);

                    // Only update if not already paid (prevent duplicate processing)
                    if ($order->payment_status !== 'paid') {
                        DB::beginTransaction();
                        try {
                            $order->update([
                                'payment_status' => 'paid',
                                'status' => 'processing',
                                'paid_at' => now(),
                            ]);

                            DB::commit();

                            Log::info('Order updated from callback', ['order_id' => $orderId]);

                            return response()->json([
                                'success' => true,
                                'message' => 'Callback processed successfully'
                            ]);
                        } catch (\Exception $e) {
                            DB::rollBack();
                            throw $e;
                        }
                    } else {
                        Log::info('Order already paid, skipping update', ['order_id' => $orderId]);

                        return response()->json([
                            'success' => true,
                            'message' => 'Order already processed'
                        ]);
                    }
                } else {
                    Log::warning('Order not found in callback', ['refNo' => $refNo, 'orderId' => $orderId]);
                }
            }

            // Return success anyway to avoid retries from PaySolutions
            return response()->json([
                'success' => true,
                'message' => 'Callback received',
                'data' => $callbackData
            ]);

        } catch (\Exception $e) {
            Log::error('Payment callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Callback processing failed'
            ], 500);
        }
    }

    /**
     * Handle user return from payment gateway
     */
    public function handleReturn(Request $request)
    {
        $orderId = $request->query('refno') ?? $request->query('order_id');

        if (!$orderId) {
            return redirect('/shop')->with('error', 'Invalid payment return');
        }

        $order = Order::find($orderId);

        if (!$order) {
            return redirect('/shop')->with('error', 'Order not found');
        }

        // Check payment status
        $statusResult = $this->paymentService->checkPaymentStatus($orderId);

        if ($statusResult['success']) {
            $status = $statusResult['data']['status'] ?? 'pending';

            if ($status === 'success' || $status === 'paid' || $status === '00') {
                return redirect("/customer/orders/{$order->id}")
                    ->with('success', 'Payment successful! Your order is being processed.');
            } elseif ($status === 'failed') {
                return redirect("/customer/orders/{$order->id}")
                    ->with('error', 'Payment failed. Please try again.');
            }
        }

        return redirect("/customer/orders/{$order->id}")
            ->with('info', 'Payment is being processed. Please wait for confirmation.');
    }

    /**
     * Check payment status for an order
     */
    public function checkStatus(Request $request, $orderId): JsonResponse
    {
        try {
            $order = Order::findOrFail($orderId);

            // Check if order belongs to authenticated user
            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized access to order'
                ], 403);
            }

            $statusResult = $this->paymentService->checkPaymentStatus($order->id);

            return response()->json([
                'success' => true,
                'payment_status' => $order->payment_status,
                'order_status' => $order->status,
                'gateway_status' => $statusResult['data'] ?? null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check payment status',
            ], 500);
        }
    }
}
