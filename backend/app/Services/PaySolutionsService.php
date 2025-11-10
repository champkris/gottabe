<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaySolutionsService
{
    private string $apiUrl;
    private string $merchantId;
    private string $secretKey;
    private string $returnUrl;
    private string $callbackUrl;

    public function __construct()
    {
        $this->apiUrl = config('services.paysolutions.api_url');
        $this->merchantId = config('services.paysolutions.merchant_id');
        $this->secretKey = config('services.paysolutions.secret_key');
        $this->returnUrl = config('services.paysolutions.return_url');
        $this->callbackUrl = config('services.paysolutions.callback_url');
    }

    /**
     * Create a payment request
     */
    public function createPayment(array $orderData): array
    {
        try {
            $paymentData = [
                'merchantid' => $this->merchantId,
                'refno' => $orderData['order_id'],
                'amount' => number_format($orderData['amount'], 2, '.', ''),
                'customeremail' => $orderData['customer_email'],
                'productdetail' => $orderData['product_detail'],
                'cc' => 'THB', // Currency code
                'returnurl' => $this->returnUrl,
                'callbackurl' => $this->callbackUrl,
                'customeraddress' => $orderData['customer_address'] ?? '',
                'customername' => $orderData['customer_name'] ?? '',
                'customertel' => $orderData['customer_phone'] ?? '',
            ];

            // Generate checksum/hash for security
            $paymentData['hash'] = $this->generateHash($paymentData);

            Log::info('PaySolutions payment request', ['data' => $paymentData]);

            // Send request to PaySolutions API
            $response = Http::post("{$this->apiUrl}/payment/create", $paymentData);

            if ($response->successful()) {
                $result = $response->json();

                return [
                    'success' => true,
                    'payment_url' => $result['payment_url'] ?? null,
                    'transaction_id' => $result['transaction_id'] ?? null,
                    'data' => $result,
                ];
            }

            Log::error('PaySolutions payment failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => 'Payment gateway error',
                'details' => $response->json(),
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
     */
    public function verifyCallback(array $callbackData): bool
    {
        if (!isset($callbackData['hash'])) {
            return false;
        }

        $receivedHash = $callbackData['hash'];
        $dataToHash = $callbackData;
        unset($dataToHash['hash']);

        $calculatedHash = $this->generateHash($dataToHash);

        return hash_equals($calculatedHash, $receivedHash);
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus(string $refNo): array
    {
        try {
            $data = [
                'merchantid' => $this->merchantId,
                'refno' => $refNo,
            ];

            $data['hash'] = $this->generateHash($data);

            $response = Http::post("{$this->apiUrl}/payment/status", $data);

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
     * Generate hash/checksum for security
     */
    private function generateHash(array $data): string
    {
        // Sort data by key
        ksort($data);

        // Concatenate values
        $hashString = '';
        foreach ($data as $key => $value) {
            if ($key !== 'hash') {
                $hashString .= $value;
            }
        }

        // Append secret key
        $hashString .= $this->secretKey;

        // Generate hash (adjust algorithm based on PaySolutions requirements)
        return hash('sha256', $hashString);
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
