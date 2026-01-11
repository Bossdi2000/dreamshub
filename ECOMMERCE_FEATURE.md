# Dreams E-Commerce Platform - User Shopping Portal

## Overview
The Dreams platform now includes a complete customer-facing e-commerce portal where users can shop online, pay, and pickup items in-store. This is separate from the admin inventory management system.

## 🎯 Key Features

### Customer Portal
1. **User Authentication**
   - Sign up with email, username, and profile details
   - Login system separate from admin
   - Profile management with avatar support

2. **Shopping Experience**
   - Browse all available products
   - Search and filter by category
   - Grid/List view toggle
   - Real-time stock availability
   - Add to cart functionality

3. **Cart & Checkout**
   - Shopping cart with quantity management
   - Real-time total calculations (with 0.5% tax)
   - Add order notes
   - Instant online payment/checkout

4. **Digital Receipts**
   - Professional receipt generation
   - Printable format
   - Pickup instructions included
   - Order ID for verification

5. **Order History**
   - View all past orders
   - Order status tracking
   - Access receipts anytime

6. **Profile Settings**
   - Update personal information
   - Manage delivery address
   - Change password
   - Upload profile picture

### Admin Portal Enhancements
1. **Online Orders Dashboard**
   - View all customer orders
   - Revenue and sales statistics
   - Customer activity monitoring
   - Order details and status

## 📁 File Structure

```
src/
├── context/
│   ├── UserAuthContext.tsx      # Customer authentication
│   └── CartContext.tsx           # Shopping cart & orders
│
├── components/
│   └── user/
│       └── UserLayout.tsx        # Customer portal layout
│
├── pages/
│   ├── OnlineOrders.tsx          # Admin: View customer orders
│   │
│   └── user/
│       ├── UserLogin.tsx         # Customer login
│       ├── UserSignup.tsx        # Customer registration
│       ├── UserDashboard.tsx     # Product browsing
│       ├── UserCart.tsx          # Shopping cart
│       ├── UserOrders.tsx        # Order history
│       ├── UserReceipt.tsx       # Digital receipt
│       └── UserSettings.tsx      # Profile settings
```

## 🔗 Routes

### Customer Routes
- `/user/login` - Customer login
- `/user/signup` - Create account
- `/user/dashboard` - Browse products
- `/user/cart` - Shopping cart
- `/user/orders` - Order history
- `/user/receipt/:orderId` - View receipt
- `/user/settings` - Profile settings

### Admin Routes
- `/online-orders` - View all customer orders (NEW)
- All existing admin routes remain unchanged

## 🚀 User Flow

### Customer Journey
1. **Sign Up** → Create account at `/user/signup`
2. **Browse** → View products at `/user/dashboard`
3. **Add to Cart** → Select products and quantities
4. **Checkout** → Pay online at `/user/cart`
5. **Receive Receipt** → Get digital receipt
6. **Visit Store** → Show receipt to pick up items

### Admin Workflow
1. **Monitor Orders** → View customer purchases at `/online-orders`
2. **Check Details** → See what customers ordered
3. **Verify Receipt** → Customer shows receipt ID
4. **Fulfill Order** → Hand over purchased items

## 💾 Data Storage

All data is currently stored in localStorage:
- `registered_users` - User accounts
- `user_token` - Customer session
- `user_data` - Current user profile
- `user_cart` - Shopping cart items
- `all_orders` - All customer orders

## 🎨 Design Features

- Responsive mobile-first design
- Premium glass-morphism UI
- Orange & gold brand colors
- Smooth animations with Framer Motion
- Bottom navigation for mobile
- Print-optimized receipts

## 📊 Admin Statistics

The Online Orders page shows:
- Total number of orders
- Total revenue generated
- Unique customer count
- Total items sold

## 🔐 Security

- Separate authentication for users and admins
- Protected routes with auth guards
- Session management
- Password requirements (min 6 characters)

## 🛠️ Technical Stack

- React + TypeScript
- React Router (multi-route support)
- Context API (state management)
- Framer Motion (animations)
- shadcn/ui (components)
- Tailwind CSS (styling)
- date-fns (date formatting)

## 📝 Usage Instructions

### For Customers
1. Navigate to `/user/login` or `/user/signup`
2. Create an account with email and details
3. Browse products and add to cart
4. Checkout to receive digital receipt
5. Show receipt ID at store to collect items

### For Admins
1. Login at `/login` with admin credentials
2. Navigate to "Online Orders" in sidebar
3. View customer orders and activity
4. Click "View" to see order details
5. Verify receipts when customers arrive

## 🔄 Integration with Inventory

- Customer browsing shows only in-stock items
- Products automatically filtered by availability
- Real-time stock counts displayed
- Low stock warnings shown

## 🎁 Future Enhancements (Recommendations)

1. Email notifications for orders
2. SMS order confirmations
3. Order status updates (processing, ready, completed)
4. Admin order fulfillment workflow
5. Inventory deduction on order
6. Multiple payment methods
7. Delivery option
8. Customer reviews and ratings
9. Product recommendations
10. Loyalty program

## 📞 Demo Credentials

**Admin Access:**
- Email: `admin@dreams.com`
- Password: `password`

**Create Your Customer Account:**
- Visit `/user/signup` to register
- No demo accounts - create your own!

---

Built with ❤️ for Dreams - Your Online Shopping Destination
