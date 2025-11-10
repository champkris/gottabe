<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'paysolutions' => [
        'api_url' => env('PAYSOLUTIONS_API_URL', 'https://api.paysolutions.asia'),
        'merchant_id' => env('PAYSOLUTIONS_MERCHANT_ID'),
        'secret_key' => env('PAYSOLUTIONS_SECRET_KEY'),
        'return_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment/return',
        'callback_url' => env('APP_URL', 'http://localhost:8000') . '/api/payment/callback',
    ],

];
