# Click n' Dine – React Native Restaurant App

A React Native restaurant app (Expo) with user auth, menu browsing, cart, checkout, orders, and profile. Includes a **web CMS** for managing food items, orders, and customers.

---

## Design (Figma)

**[Figma – Task 4 React Native | Restaurant App](https://www.figma.com/design/7ZIf4538aPzLMJQz82od2P/Task4-React-Native%7C-Restaurant-App?node-id=3-36&t=D1ASR63LK1hkGx6m-1)**

---

## How to run

### Mobile app (Expo)

From the **project root**:

```bash
npm install
npm start
```

Then press `w` (web), `a` (Android), or `i` (iOS). Configure **`lib/supabase.ts`** with your Supabase URL and anon key, and run the SQL scripts in Supabase (see [DOCUMENTATION.md](./DOCUMENTATION.md)).

### CMS (web admin)

From the **`cms`** folder:

```bash
cd cms
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). Use the same Supabase project; set **`cms/src/lib/supabase.ts`** and ensure an admin user exists in the `profiles` table.

**Host the CMS on Vercel:** See [DOCUMENTATION.md](./DOCUMENTATION.md#hosting-the-cms-on-vercel) for step-by-step deployment (root directory: `cms`, optional env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The **hosted CMS link** is available under **Deployments** in this repository on GitHub.

**Full setup and details:** [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## Features

### User Features
- **Authentication**: Email/password registration and login
- **Multi-step Registration**: Collects email, personal details, and payment information
- **Menu Browsing**: View food items by category (Starters, Burgers, Mains, etc.)
- **Item Details**: View detailed item information with customization options
- **Cart Management**: Add, remove, update quantities, and clear cart
- **Checkout**: Place orders with delivery address and payment selection
- **Order History**: View past orders with status tracking
- **Profile Management**: Update personal and payment information

### Admin Features
- **Dashboard**: View statistics (total orders, revenue, pending orders)
- **Order Management**: View and update order statuses
- **Food Item Management**: View and manage food items
- **Data Visualization**: Charts and analytics (to be implemented)

## Tech Stack

- **React Native** with **Expo Router** (file-based routing)
- **Supabase** for backend (authentication, database)
- **TypeScript** for type safety
- **React Context** for state management (Cart)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the Supabase dashboard
3. Update `lib/supabase.ts` with your credentials:

```typescript
const SUPABASE_URL = 'your-project-url'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

### 3. Database Setup

Run the SQL script in `supabase-schema.sql` in your Supabase SQL editor to create the necessary tables:

- `profiles` - User profile information
- `orders` - Order records
- `food_items` - Food item catalog (optional, currently using local data)
- `restaurant_info` - Restaurant information

### 4. Start the Development Server

```bash
npx expo start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## Project Structure

```
RestaurantApp/
├── app/
│   ├── (auth)/          # Authentication screens
│   │   ├── login.tsx
│   │   └── register/    # Multi-step registration
│   ├── (tabs)/          # Main app tabs
│   │   ├── index.tsx    # Home screen
│   │   ├── cart.tsx     # Cart screen
│   │   ├── orders.tsx   # Orders screen
│   │   └── profile.tsx  # Profile screen
│   ├── category/        # Category pages
│   ├── item.tsx         # Item detail screen
│   ├── checkout.tsx     # Checkout screen
│   ├── admin.tsx        # Admin dashboard
│   └── _layout.tsx      # Root layout
├── contexts/
│   └── CartContext.tsx  # Cart state management
├── data/
│   └── foodItems.ts     # Food item data
├── lib/
│   └── supabase.ts      # Supabase client
└── supabase-schema.sql  # Database schema
```

## Design

The app follows the [Figma design](https://www.figma.com/design/7ZIf4538aPzLMJQz82od2P/Task4-React-Native%7C-Restaurant-App?node-id=3-36&t=D1ASR63LK1hkGx6m-1) with:
- Orange accent (#FF6B2C / #F97316) for primary actions
- Clean, modern interface
- Consistent navigation and responsive layouts

## Testing

### Test Cards (VCC Generator)
For testing payment functionality, you can use test card numbers from [vccgenerator.org](https://www.vccgenerator.org/).

### Test User Flow
1. Register a new account (multi-step process)
2. Browse food items by category
3. View item details and customize
4. Add items to cart
5. Proceed to checkout
6. Place an order
7. View order history

## Admin Access

To access the admin dashboard:
1. Navigate to `/admin` route
2. Admin functionality requires `is_admin` flag in profiles table (can be set manually in Supabase)

## Future Enhancements

- [ ] Social login (Google, Apple, Facebook)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Push notifications
- [ ] Real-time order tracking
- [ ] Advanced admin analytics with charts
- [ ] Food item CRUD operations in admin panel
- [ ] Search functionality
- [ ] Favorites/Wishlist

## License

This project is created for educational purposes.

## Submission

- **Design (Figma)**: [Task 4 React Native | Restaurant App](https://www.figma.com/design/7ZIf4538aPzLMJQz82od2P/Task4-React-Native%7C-Restaurant-App?node-id=3-36&t=D1ASR63LK1hkGx6m-1)
- **Repository**: [Add your repository link here]
- **Hosted CMS**: The live CMS link is under **Deployments** in this repository on GitHub.
- **Demo Video**: [Add your demo video link here]

## Contact

For questions or issues, please refer to the task requirements or contact your instructor.
