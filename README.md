# Seedly Naturals - Premium Organic Seeds & Herbal Teas (Pakistan)

A modern, high-performance e-commerce platform built for **Seedly Naturals**, offering heirloom seeds, wellness herbal teas, gardening kits, and holistic apothecary products tailored for Pakistani gardeners and wellness enthusiasts.

---

## 🌟 Key Features

### 🛍️ Storefront & Customer Experience
- **Interactive Catalog**: Heirloom vegetable, herb, and flower seeds with germination rates, sunlight requirements, sowing months, and difficulty ratings.
- **Herbal Infusions & Teas**: Wellness blends with organic certifications, brewing instructions, and health benefits.
- **Gardening & Starter Kits**: Beginner-friendly combo kits with bundled seed varieties, soil mix, and coir pots.
- **Interactive "Find Your Seed" Quiz**: Recommends the ideal seeds based on city, sunlight, garden space, and gardening experience.
- **Dynamic Cart & Checkout**:
  - Live subtotal calculation with free nationwide shipping threshold progress bar.
  - Multi-step checkout with real-time Pakistani validation (email, phone numbers matching `03xx-xxxxxxx` / `+923xxxxxxxxx`, street address).
  - City dropdown with 30+ Pakistani cities, auto-province mapping, and custom city entry.
- **Back-in-Stock ("Notify Me") Alerts**:
  - When an item or kit is out of stock, purchase controls are automatically replaced with a "Notify Me" modal.
  - Automatic email notifications when stock is replenished.
- **Customer Reviews**: Verified customer reviews with star ratings and admin moderation.

### 💳 Pakistani Payment Methods
- **Mobile Wallets**: JazzCash & Easypaisa with instant account number display, one-tap copy, and Transaction ID (TID) verification.
- **Direct Bank Transfer**: Meezan Bank IBAN & account details with payment proof / receipt screenshot upload.
- **Cash on Delivery (COD)**: Available nationwide across Pakistan via TCS & Leopards.

### 🛡️ Admin Management Dashboard (`/admin`)
- **Inventory & Product Management**: Add, edit, manage stock, variants, and pricing.
- **Kits Management**: Build and edit starter kits with component bundle items.
- **Order Processing & Receipt Inspection**: Live order status transitions (Pending Payment -> Confirmed -> Shipped -> Delivered), inspect uploaded bank receipts, and approve/reject payments.
- **Customer Reviews Moderation**: Approve or delete pending user reviews.
- **Stock Alert Broadcasts**: View subscribers, status, and manually broadcast restock alerts.
- **Store Settings**: Configure bank account numbers, JazzCash, Easypaisa, and shipping thresholds dynamically.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: Built-in SQLite (`node:sqlite` in WAL mode) with automated seeding
- **State Management**: React Context (`useCart`) with local storage persistence

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.18+ or 20+ (Node 22 recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Seedly
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
├── app/                  # Next.js App Router (Storefront & Admin routes)
│   ├── (store)/          # Customer-facing storefront pages
│   ├── admin/            # Admin dashboard and management pages
│   └── api/              # RESTful API route handlers
├── components/           # Reusable UI & business components
│   ├── layout/           # Navbar, Footer, MobileNav
│   ├── product/          # Product cards, detail views, NotifyMe modal
│   └── ui/               # Badges, buttons, modals, input elements
├── data/                 # SQLite database & data directory
├── lib/                  # Business logic, services, store & database
│   ├── db/               # SQLite schema & initial seed data
│   ├── services/         # Orders, products, reviews, stock alerts
│   └── store/            # Shopping cart state management
└── public/               # Static assets (images, logos, uploads)
```

---

## 📄 License
Private & Proprietary - Seedly Naturals Pakistan.
