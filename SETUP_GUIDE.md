# Laravel + React Marketplace Setup Guide

## Project Overview
A modern multi-merchant ecommerce platform with:
- **Backend**: Laravel 11 with Sanctum authentication
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **State**: Zustand for state management
- **API**: RESTful API with role-based access control

## Project Structure
```
marketplace-laravel/
├── backend/           # Laravel API backend
│   ├── app/
│   │   ├── Models/    # Eloquent models
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   ├── database/
│   │   └── migrations/
│   └── routes/
│       └── api.php
└── frontend/          # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   └── ui/    # shadcn/ui components
    │   ├── stores/    # Zustand stores
    │   ├── lib/       # Utilities
    │   └── App.tsx
    └── package.json
```

## Installation Instructions

### Backend Setup (Laravel)

1. **Navigate to backend directory:**
```bash
cd marketplace-laravel/backend
```

2. **Install PHP dependencies:**
```bash
composer install
```

3. **Copy environment file:**
```bash
cp .env.example .env
```

4. **Generate application key:**
```bash
php artisan key:generate
```

5. **Configure database in `.env`:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=marketplace
DB_USERNAME=root
DB_PASSWORD=yourpassword
```

6. **Create database:**
```bash
mysql -u root -p
CREATE DATABASE marketplace;
exit;
```

7. **Run migrations:**
```bash
php artisan migrate
```

8. **Install Laravel Sanctum:**
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

9. **Start Laravel server:**
```bash
php artisan serve
```

The backend will run on: **http://localhost:8000**

### Frontend Setup (React + Vite)

1. **Navigate to frontend directory:**
```bash
cd marketplace-laravel/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

4. **Start development server:**
```bash
npm run dev
```

The frontend will run on: **http://localhost:5173**

## Features Implemented

### Backend Features
✅ **Database Schema**
- Users (customers, merchants, admins)
- Merchants with approval system
- Products with categories
- Orders with commission calculation
- Reviews and ratings

✅ **Authentication System**
- JWT-based auth with Laravel Sanctum
- Role-based access control (customer, merchant, admin)
- Protected API routes

✅ **API Endpoints**
- Authentication (register, login, logout)
- Product browsing and filtering
- Order management
- Merchant dashboard APIs
- Admin management APIs

### Frontend Features
✅ **Modern UI/UX**
- Responsive design with Tailwind CSS
- shadcn/ui component library
- Dark mode support
- Loading states and error handling

✅ **Authentication**
- Login/Register pages
- Protected routes
- Role-based navigation

✅ **State Management**
- Zustand for global state
- Persistent auth storage
- React Query for data fetching

✅ **Routing Structure**
- Public routes (shop, product details)
- Customer dashboard
- Merchant dashboard
- Admin panel

## User Roles & Access

### Customer
- Browse products
- Add to cart
- Place orders
- Leave reviews
- Track orders

### Merchant
- Manage products
- Process orders
- View analytics
- Track earnings
- Update store settings

### Admin
- Approve/reject merchants
- Manage categories
- View platform analytics
- Set commission rates
- Monitor all orders

## Database Models

### Core Models
1. **User** - Authentication and profile
2. **Merchant** - Store information
3. **Product** - Product catalog
4. **Category** - Product categories
5. **Order** - Purchase orders
6. **OrderItem** - Order line items
7. **Review** - Product reviews

### Key Relationships
- User → Merchant (1:1)
- Merchant → Products (1:N)
- Merchant → Orders (1:N)
- Order → OrderItems (1:N)
- Product → Reviews (1:N)

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/user
```

### Public Endpoints
```
GET  /api/products
GET  /api/products/{slug}
GET  /api/categories
GET  /api/merchants
```

### Protected Endpoints
```
# Customer
GET  /api/orders
POST /api/orders

# Merchant
GET  /api/merchant/dashboard
GET  /api/merchant/products
POST /api/merchant/products

# Admin
GET  /api/admin/dashboard
PUT  /api/admin/merchants/{id}/approve
```

## Next Steps

1. **Complete Backend Controllers**
   - Create remaining controller implementations
   - Add validation rules
   - Implement file upload for images

2. **Enhance Frontend Pages**
   - Complete all page components
   - Add data fetching with React Query
   - Implement shopping cart functionality

3. **Add Payment Integration**
   - Integrate Stripe/PayPal
   - Handle payment processing
   - Implement refunds

4. **Deploy to Production**
   - Set up hosting (DigitalOcean, AWS, etc.)
   - Configure production database
   - Set up CI/CD pipeline

## Development Commands

### Backend
```bash
# Run migrations
php artisan migrate

# Create new migration
php artisan make:migration create_table_name

# Create controller
php artisan make:controller ControllerName

# Clear cache
php artisan cache:clear
php artisan config:clear

# Run tests
php artisan test
```

### Frontend
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### CORS Issues
Add frontend URL to Laravel CORS config:
```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173']
```

### Database Connection
Ensure MySQL is running:
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Port Conflicts
Change ports in:
- Backend: `.env` file (APP_PORT)
- Frontend: `vite.config.ts` (server.port)

## Support

For issues or questions:
1. Check Laravel docs: https://laravel.com/docs
2. Check React docs: https://react.dev
3. Check Vite docs: https://vitejs.dev