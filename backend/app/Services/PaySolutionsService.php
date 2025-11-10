<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaySolutionsService
{
    private string $apiUrl;
    private string $merchantId;
    private string $apiKey;
    private string $paymentLinkName;
    private string $returnUrl;
    private string $callbackUrl;

    public function __construct()
    {
        $this->apiUrl = config('services.paysolutions.api_url');
        $this->merchantId = config('services.paysolutions.merchant_id');
        $this->apiKey = config('services.paysolutions.api_key');

        // Extract payment link name from URL if full URL is provided
        $paymentLinkConfig = config('services.paysolutions.payment_link_name');
        if (filter_var($paymentLinkConfig, FILTER_VALIDATE_URL)) {
            // Extract the last part of the URL (e.g., "pigmeup" from "https://pay.sn/pigmeup")
            $this->paymentLinkName = basename(parse_url($paymentLinkConfig, PHP_URL_PATH));
        } else {
            $this->paymentLinkName = $paymentLinkConfig;
        }

        $this->returnUrl = config('services.paysolutions.return_url');
        $this->callbackUrl = config('services.paysolutions.callback_url');
    }

    /**
     * Create a payment request using direct form POST method
     */
    public function createPayment(array $orderData): array
    {
        try {
            // Generate unique 12-digit reference number
            $refNo = str_pad($orderData['order_id'], 12, '0', STR_PAD_LEFT);

            // Prepare payment form data as per PaySolutions HTML form example
            $formData = [
                'customeremail' => $orderData['customer_email'],
                'productdetail' => $orderData['product_detail'],
                'refno' => $refNo,
                'merchantid' => $this->merchantId,
                'cc' => '00', // Currency code (00 = THB as per PaySolutions format)
                'total' => number_format($orderData['amount'], 2, '.', ''),
                'lang' => 'TH', // TH or EN
                'resulturl1' => $this->returnUrl, // Try adding return URL
                'resulturl2' => $this->returnUrl, // Alternative parameter name
                'postbackurl' => $this->callbackUrl, // Callback URL
            ];

            // Add return URL and callback URL to form data (if PaySolutions supports it)
            // Note: Some payment gateways accept these in the form, others use dashboard config

            Log::info('PaySolutions form POST payment', [
                'form_data' => $formData,
                'payment_url' => 'https://payments.paysolutions.asia/payment',
                'return_url' => $this->returnUrl,
                'callback_url' => $this->callbackUrl,
                'config_check' => [
                    'FRONTEND_URL' => config('services.paysolutions.return_url'),
                    'returnUrl_property' => $this->returnUrl,
                ]
            ]);

            // PaySolutions direct payment gateway URL
            $paymentUrl = 'https://payments.paysolutions.asia/payment';

            return [
                'success' => true,
                'payment_url' => $paymentUrl,
                'form_data' => $formData,
                'method' => 'POST',
                'transaction_id' => $refNo,
                'debug_info' => [
                    'return_url' => $this->returnUrl,
                    'callback_url' => $this->callbackUrl,
                ],
            ];

        } catch (\Exception $e) {
            Log::error('PaySolutions exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify callback from PaySolutions
     * Note: PaySolutions callbacks should be verified based on their documentation
     */
    public function verifyCallback(array $callbackData): bool
    {
        // For now, we'll accept all callbacks from PaySolutions
        // In production, implement proper signature verification based on PaySolutions docs
        return true;
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus(string $refNo): array
    {
        try {
            $data = [
                'merchant' => $this->paymentLinkName,
                'refNo' => $refNo,
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'apikey' => $this->apiKey,
            ])->post("{$this->apiUrl}/secure/v3/payment/status", $data);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to check payment status',
            ];

        } catch (\Exception $e) {
            Log::error('PaySolutions status check error', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Parse callback response
     */
    public function parseCallback(array $callbackData): array
    {
        return [
            'order_id' => $callbackData['refno'] ?? null,
            'transaction_id' => $callbackData['transaction_id'] ?? null,
            'status' => $callbackData['status'] ?? null,
            'amount' => $callbackData['amount'] ?? null,
            'currency' => $callbackData['cc'] ?? 'THB',
            'payment_date' => $callbackData['payment_date'] ?? null,
            'raw_data' => $callbackData,
        ];
    }
}
