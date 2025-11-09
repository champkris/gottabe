# Gottabe - Laravel + React Multi-Merchant Platform

A modern multi-merchant ecommerce platform built with Laravel (backend) and React + Vite (frontend).

## Tech Stack

### Backend
- **Laravel 11** - PHP framework
- **MySQL** - Database
- **Laravel Sanctum** - API authentication
- **Laravel Horizon** - Queue management (optional)

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **React Query** - Data fetching

## Features

### For Customers
- Browse products from multiple merchants
- Advanced search and filtering
- Shopping cart with multi-merchant support
- User reviews and ratings
- Order tracking
- Wishlist functionality

### For Merchants
- Store management dashboard
- Product inventory management
- Order processing
- Sales analytics
- Customer communication
- Commission tracking

### For Admins
- Platform oversight dashboard
- Merchant approval system
- Commission management
- Platform analytics
- User management
- Content moderation

## Setup Instructions

### Backend Setup (Laravel)

1. Install dependencies:
```bash
cd backend
composer install
```

2. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
```

3. Set up database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gottabe
DB_USERNAME=root
DB_PASSWORD=
```

4. Run migrations:
```bash
php artisan migrate
php artisan db:seed
```

5. Start the server:
```bash
php artisan serve
```

### Frontend Setup (React + Vite)

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## API Documentation

The API follows RESTful conventions:

- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/merchant/dashboard` - Merchant dashboard data
- `GET /api/admin/dashboard` - Admin dashboard data

## Database Schema

### Users Table
- id, email, password, role (customer/merchant/admin)

### Merchants Table
- id, user_id, business_name, commission_rate, is_approved

### Products Table
- id, merchant_id, name, description, price, stock, category_id

### Orders Table
- id, user_id, merchant_id, total, commission, status

### Order Items Table
- id, order_id, product_id, quantity, price

## License

MIT