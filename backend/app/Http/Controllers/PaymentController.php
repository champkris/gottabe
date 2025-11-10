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
                    'transaction_id' => $result['transaction_id'],
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
            $callbackData = $request->all();

            Log::info('PaySolutions callback received', ['data' => $callbackData]);

            // Verify callback authenticity
            if (!$this->paymentService->verifyCallback($callbackData)) {
                Log::warning('Invalid payment callback signature', ['data' => $callbackData]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid signature'
                ], 400);
            }

            // Parse callback data
            $parsed = $this->paymentService->parseCallback($callbackData);

            // Find order
            $order = Order::find($parsed['order_id']);

            if (!$order) {
                Log::error('Order not found in callback', ['order_id' => $parsed['order_id']]);

                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Update order based on payment status
            DB::beginTransaction();
            try {
                $paymentStatus = strtolower($parsed['status']);

                if ($paymentStatus === 'success' || $paymentStatus === 'paid' || $paymentStatus === '00') {
                    $order->update([
                        'payment_status' => 'paid',
                        'payment_transaction_id' => $parsed['transaction_id'],
                        'payment_method' => 'paysolutions',
                        'status' => 'processing',
                        'paid_at' => now(),
                    ]);

                    Log::info('Payment successful', ['order_id' => $order->id]);

                } elseif ($paymentStatus === 'failed' || $paymentStatus === 'error') {
                    $order->update([
                        'payment_status' => 'failed',
                        'payment_transaction_id' => $parsed['transaction_id'],
                        'status' => 'cancelled',
                    ]);

                    Log::warning('Payment failed', ['order_id' => $order->id]);

                } else {
                    $order->update([
                        'payment_status' => 'pending',
                        'payment_transaction_id' => $parsed['transaction_id'],
                    ]);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Callback processed successfully'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

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
