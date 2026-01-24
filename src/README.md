# Full-Stack E-Commerce Platform

A production-ready e-commerce system built with React, Supabase, and JWT-based authentication.

## 🎯 Features

### User Features
- **Authentication**: Secure signup/login with JWT tokens
- **Product Browsing**: Search, filter by category/price/rating, and sort products
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout**: Complete order flow with shipping and payment details
- **Order Tracking**: View order history with status updates
- **Profile Management**: Update personal information and address

### Admin Features
- **Dashboard**: View KPIs (users, orders, revenue, products)
- **Product Management**: Create, edit, and delete products
- **Category Management**: Organize products into categories
- **Order Management**: Update order status (pending → processing → shipped → delivered)
- **Database Seeding**: Initialize sample data for testing

## 🏗️ Architecture

### Frontend (React)
- **Router**: React Router with data mode pattern
- **State Management**: Context API for authentication
- **Styling**: Tailwind CSS v4 with custom color scheme
- **Components**: Modular, reusable components

### Backend (Supabase Edge Functions)
- **Server**: Hono web framework running on Deno
- **Database**: PostgreSQL with KV store abstraction
- **Authentication**: Supabase Auth with JWT
- **API**: RESTful endpoints with role-based access control

### Color Scheme
- Primary: `#342639`
- Secondary: `#4DC2EF`
- Accent: `#5E998C`

## 🚀 Getting Started

### 1. Initialize Demo Accounts

On first visit, click "Initialize Demo" to create test accounts:
- **Admin**: admin@demo.com / admin123
- **User**: user@demo.com / user123

### 2. Seed Sample Data

Login as admin and navigate to the Admin Dashboard. Click "Seed Database" to populate with sample products and categories.

### 3. Explore Features

**As User:**
1. Browse products on the home page
2. Use filters to find products by category, price, or rating
3. Add items to cart
4. Proceed to checkout and complete purchase
5. Track orders in the Orders page
6. Update profile information

**As Admin:**
1. View dashboard statistics
2. Create/edit/delete products
3. Manage categories
4. Update order status
5. View all users and orders

## 📁 Project Structure

```
/
├── components/
│   ├── Header.tsx              # Navigation with profile menu
│   ├── Layout.tsx              # Main layout wrapper
│   ├── ProductCard.tsx         # Product display component
│   └── InitDemo.tsx            # First-run initialization
├── pages/
│   ├── Login.tsx               # Authentication page
│   ├── Signup.tsx              # Registration page
│   ├── Products.tsx            # Product catalog with filters
│   ├── Cart.tsx                # Shopping cart management
│   ├── Checkout.tsx            # Order placement
│   ├── Orders.tsx              # Order history and tracking
│   ├── Profile.tsx             # User profile settings
│   └── Admin.tsx               # Admin dashboard
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── services/
│   └── api.ts                  # API client functions
├── supabase/functions/server/
│   ├── index.tsx               # Main server with all routes
│   ├── kv_store.tsx            # Database abstraction (protected)
│   └── init-demo.tsx           # Demo account initialization
├── App.tsx                     # Root component
└── routes.ts                   # Route configuration
```

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (User/Admin)
- Protected API endpoints
- Secure password handling (min 6 characters)
- Auto-confirmed email (demo mode)
- Sensitive data protection (card numbers masked)

## 🛣️ API Endpoints

### Authentication
- `POST /make-server-fe618f6f/signup` - Create new account
- `POST /make-server-fe618f6f/login` - Login
- `POST /make-server-fe618f6f/init-demo` - Initialize demo accounts

### Products
- `GET /make-server-fe618f6f/products` - List all products
- `GET /make-server-fe618f6f/products/:id` - Get product details
- `POST /make-server-fe618f6f/products` - Create product (admin)
- `PUT /make-server-fe618f6f/products/:id` - Update product (admin)
- `DELETE /make-server-fe618f6f/products/:id` - Delete product (admin)

### Categories
- `GET /make-server-fe618f6f/categories` - List categories
- `POST /make-server-fe618f6f/categories` - Create category (admin)

### Cart
- `GET /make-server-fe618f6f/cart` - Get user's cart
- `POST /make-server-fe618f6f/cart` - Add item to cart
- `PUT /make-server-fe618f6f/cart/:productId` - Update quantity
- `DELETE /make-server-fe618f6f/cart/:productId` - Remove item

### Orders
- `GET /make-server-fe618f6f/orders` - List orders
- `GET /make-server-fe618f6f/orders/:id` - Get order details
- `POST /make-server-fe618f6f/orders` - Create order
- `PUT /make-server-fe618f6f/orders/:id` - Update order status

### Payments
- `POST /make-server-fe618f6f/payments` - Process payment
- `POST /make-server-fe618f6f/payments/verify` - Verify payment

### Profile
- `GET /make-server-fe618f6f/profile` - Get profile
- `PUT /make-server-fe618f6f/profile` - Update profile

### Admin
- `GET /make-server-fe618f6f/admin/stats` - Get statistics
- `POST /make-server-fe618f6f/seed` - Seed sample data

## 📊 Data Entities

### User
- id, email, name, phone, role, address

### Product
- id, name, description, price, category, rating, stock, imageUrl

### Category
- id, name, description

### Order
- id, userId, items[], total, shippingAddress, paymentMethod, paymentStatus, status

### Cart
- items: [{ productId, quantity }]

### Payment
- id, orderId, userId, amount, status, paymentDetails

## 🎨 UI Components

- **Header**: Top navigation with profile dropdown
- **Product Filters**: Category, price range, rating filters
- **Product Card**: Display with add-to-cart or admin actions
- **Cart Items**: Quantity controls and removal
- **Order Cards**: Status tracking with visual indicators
- **Profile Menu**: User info, role badge, navigation
- **Status Badges**: Color-coded order statuses

## 🔄 Order Status Flow

1. **Pending** → Order placed, awaiting processing
2. **Processing** → Order confirmed, being prepared
3. **Shipped** → Order dispatched
4. **Delivered** → Order completed
5. **Cancelled** → Order cancelled by user or admin

## ⚠️ Important Notes

- This is a demonstration platform
- Payment processing is simulated (no real transactions)
- Email confirmation is auto-enabled (no email server required)
- Not intended for production use with real PII or payment data
- Additional security measures needed for production deployment

## 🔧 Technical Stack

- **Frontend**: React, React Router, Tailwind CSS v4
- **Backend**: Hono, Deno, Supabase Edge Functions
- **Database**: PostgreSQL (via Supabase KV Store)
- **Authentication**: Supabase Auth (JWT)
- **Icons**: Lucide React
- **State**: React Context API

## 📝 Development Notes

- All API requests use JWT tokens from localStorage
- Protected routes redirect to login if not authenticated
- Admin features hidden from regular users
- Real-time cart updates
- Responsive design for mobile/desktop

---

Built with ❤️ using React and Supabase
