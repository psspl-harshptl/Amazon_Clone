# pages.md — AmazonClone Page Reference

> Every page includes `<Navbar />` at top and `<Footer />` at bottom unless noted.
> Color tokens: accent `#FF9900`, primary btn `#FFD814`, buy btn `#FFA41C`, link `#007185`

---

## Route Map

### Buyer Routes
| Route | Page | Access |
|-------|------|--------|
| `/login` | Login.jsx | Public (redirect if logged in) |
| `/register` | Register.jsx | Public (redirect if logged in) |
| `/` | Home.jsx | Public |
| `/products` | ProductList.jsx | Public |
| `/products/:id` | ProductDetail.jsx | Public |
| `/cart` | Cart.jsx | **Private — buyer JWT** |
| `/checkout` | Checkout.jsx | **Private — buyer JWT** |
| `/orders` | OrderHistory.jsx | **Private — buyer JWT** |
| `/orders/:id` | OrderDetail.jsx | **Private — buyer JWT** |
| `/orders/:id/success` | OrderSuccess.jsx | **Private — buyer JWT** |

### Seller Routes
| Route | Page | Access |
|-------|------|--------|
| `/seller/login` | SellerLogin.jsx | Public (seller only) |
| `/seller/register` | SellerRegister.jsx | Public |
| `/seller/dashboard` | SellerDashboard.jsx | **Private — approved seller** |
| `/seller/listings` | MyListings.jsx | **Private — approved seller** |
| `/seller/listings/new` | CreateListing.jsx | **Private — approved seller** |
| `/seller/listings/:id/edit` | EditListing.jsx | **Private — approved seller** |

### Admin Routes
| Route | Page | Access |
|-------|------|--------|
| `/admin/login` | AdminLogin.jsx | Public (super_admin only) |
| `/admin/dashboard` | AdminDashboard.jsx | **Private — super_admin** |
| `/admin/products` | AdminProducts.jsx | **Private — super_admin** |
| `/admin/sellers` | AdminSellers.jsx | **Private — super_admin** |

---

## Login.jsx

**Figma Screen:** Centered white card on light gray background, dark footer visible.

**Layout:**
```
[Navbar — logo only, no search/cart]
─────────────────────────────────────
         [AmazonClone Logo]
  ┌────────────────────────────────┐
  │  Sign In                       │
  │  Email or phone number [____]  │
  │  Password              [____]  │
  │  [Continue]                    │  ← #FFD814 full-width btn
  │  By continuing you agree to... │
  ├────────────────────────────────┤
  │  [Create your AmazonClone      │
  │   account]                     │  ← outline btn
  └────────────────────────────────┘
─────────────────────────────────────
[Footer — simplified, no top-bar]
```

**Behavior:**
- On success → redirect to `/` (or previous page via `location.state.from`)
- Show inline error under field on failed login
- "Create account" → navigates to `/register`

---

## Register.jsx

**Layout:** Same card style as Login.

**Fields:** Name, Email, Password, Re-enter Password  
**Button:** `[Create your AmazonClone account]` — `#FFD814`  
**Below:** Already have account? → `/login`

---

## Home.jsx

**Figma Screen:** Richest page — hero + 3 product sections + category grid.

**Sections (top to bottom):**

### 1. Hero Banner
```
Full-width image/gradient (bg #232F3E or real image)
  Overlay: dark left-side gradient
  Content: "Sign in for your best experience"
           [Sign in] → /login   (bg #FFD814)
Height: ~360px
```

### 2. Best Sellers in Electronics
```
Section heading: "Best Sellers in Electronics" + [See all] link
Horizontal scroll row: 5 ProductCards (⌚📷💻🎧📱)
Each card shows: img, name, price, rating
```

### 3. Category Grid — "Shop by Category"
```
Grid 4 cols × 2 rows = 8 categories
Each tile: square image + label below
Home under ₹999 | Kitchen Specials | For Gamers | Gifts for Spa Deals
```

### 4. Top Deals
```
Section heading: "Top Deals" + [See all]
Horizontal scroll row: 4 ProductCards with red "Deal" badge
Shows deal price + original strikethrough price
```

### 5. Footer
Full dark footer.

---

## ProductList.jsx

**Figma Screen:** Left sidebar filters + right product grid.

**Layout:**
```
[Navbar]
Breadcrumb: Home > Electronics
─────────────────────────────────────
[Filters 220px] │ [Sort bar        ]
                │ [ProductGrid     ]
                │ [Pagination      ]
─────────────────────────────────────
[Footer]
```

**Sort bar:** "Results for 'query'" | Sort by: [Relevance ▼] | Page X of Y

**Filter sidebar sections:**
- Department (category list with counts)
- Avg. Customer Review (star options)
- Price (₹0–₹1000, ₹1000–₹5000, etc.)
- Availability (In Stock)
- Discount (10%+, 25%+, 50%+)

**Pagination:** Prev | 1 2 3 ... N | Next — centered below grid.

**URL params:** `?category=&search=&minPrice=&maxPrice=&rating=&page=`

---

## ProductDetail.jsx

**Figma Screens:** Two variants — simple view and full view (same page, more content below).

**Layout:**
```
[Navbar]
Breadcrumb: Home > Electronics > Laptops > Product Name
─────────────────────────────────────────────────────
[Image Gallery 40%]   │ [Product Info 35%]  │ [Buy Box 25%]
                      │                     │
  Main image          │ Name (h1)           │ ₹Price
  Thumbnail row       │ Brand               │ FREE Delivery
                      │ ★★★★☆ (reviews)    │ In Stock
                      │ Price + MRP         │ Qty [1 ▼]
                      │ Colour options      │ [Add to Cart] #FFD814
                      │ [Add to Cart]       │ [Buy Now]    #FFA41C
                      │ [Buy Now]           │ Secure transaction
                      │                     │
                      │ About this item     │
                      │ • bullet points     │
─────────────────────────────────────────────────────
[Specifications Table — full width]
  Model | Brand | OS | RAM | Storage | Display | etc.

[Technical Specifications — accordion/tabs]

[Customer Reviews section]
  Overall rating widget (stars bar chart)
  Individual review cards

[Customer Q&A section]
  Question + Answer accordion

[Related Products — horizontal scroll]

[Footer]
```

**Buy Box (right column) design:**
```
┌──────────────────────┐
│ ₹2,07,417.00        │  ← bold 24px
│ M.R.P: ₹2,07,417   │  ← strikethrough muted
│ FREE Delivery        │  ← green #067D62
│ Expected by: Tue...  │
│ ─────────────────── │
│ In Stock            │  ← green
│ Qty: [1 ▼]          │
│ [Add to Cart]        │  ← #FFD814, full width, rounded
│ [Buy Now]            │  ← #FFA41C, full width, rounded
│ 🔒 Secure transaction│
└──────────────────────┘
```

---

## Cart.jsx

**Figma Screen:** "Shopping Cart" heading, item list left, summary right.

**Layout:**
```
[Navbar]
─────────────────────────────────────
Shopping Cart                [Deselect all items]

[CartItem] × N               ┌─────────────────┐
                             │  Order Summary  │
[Subtotal (N items): ₹XX]    │  Subtotal: ₹XX  │
                             │  [Proceed to Buy]│
                             └─────────────────┘

── Also Recommend ──
[Horizontal scroll of recommended products]
─────────────────────────────────────
[Footer]
```

**Empty state:** Illustration + "Your Amazon Cart is empty" + [Shop today's deals]

---

## Checkout.jsx

**Layout:**
```
[Navbar — simplified]
─────────────────────────────────────
Checkout (Step indicator: Address → Payment → Review)

[Delivery Address Form]        [Order Summary sidebar]
  Name, Phone, Pincode          Items list
  Address Line 1, 2             Subtotal
  City, State                   Delivery
  [Use this address]            Total

[Payment Method]
  ○ Credit/Debit Card
  ○ UPI
  ○ Cash on Delivery

[Place Order btn] → #FFD814
─────────────────────────────────────
[Footer]
```

---

## OrderSuccess.jsx

**Figma Screen:** Clean confirmation page — green checkmark, order details.

**Layout:**
```
[Navbar]
─────────────────────────────────────
        ✅ (large green circle)
   Order Placed Successfully!

   Order #123-456-789
   Estimated delivery: Tue, 29 Apr

   [Order Summary card]
     Item × N
     Total: ₹XX,XXX

   [Delivery Status sidebar]
     Order Placed ✓
     Processing
     Shipped
     Delivered

   [Go to Orders]   [Continue Shopping]
─────────────────────────────────────
[Footer]
```

---

## OrderHistory.jsx

**Layout:**
```
[Navbar]
─────────────────────────────────────
Your Orders

Filter: [past 3 months ▼]  Search: [search orders...]

[OrderCard] × N

─────────────────────────────────────
[Footer]
```

**Empty state:** "No orders found" illustration.

---

## OrderDetail.jsx

**Layout:**
```
[Navbar]
─────────────────────────────────────
Order Details  |  Order# 123-456-789  Placed on 24 Apr 2025

[Delivery status bar: Placed → Confirmed → Shipped → Delivered]

[Items section]               [Order Summary]
  [Img] Name                    Subtotal
        Qty: 1                  Delivery
        ₹Price                  Total: ₹XX

[Shipping Address]
  Name, Address, Phone

[Payment Method]
  Cash on Delivery
─────────────────────────────────────
[Footer]
```

---

# Seller Pages

> All seller pages use a `<SellerNavbar />` instead of the buyer `<Navbar />`. No buyer footer is shown.

---

## SellerLogin.jsx

**Route:** `/seller/login`

**Layout:**
```
[SellerNavbar — logo only]
─────────────────────────────────────
         [AmazonClone Seller Logo]
  ┌────────────────────────────────┐
  │  Seller Sign In                │
  │  Email            [____]       │
  │  Password         [____]       │
  │  [Sign In]                     │  ← #FFD814 full-width btn
  └────────────────────────────────┘
  New seller? [Register here]
─────────────────────────────────────
```

**Behavior:**
- On success: checks `user.role`. If not `seller`, shows error "Not a seller account".
- If `sellerStatus === 'pending'`: shows "Your application is under review."
- If `sellerStatus === 'rejected'`: shows rejection reason.
- If `sellerStatus === 'approved'`: redirects to `/seller/dashboard`.

---

## SellerRegister.jsx

**Route:** `/seller/register`

**Fields:** Name, Email, Password, Phone  
**Button:** `[Create Seller Account]` — `#FFD814`

**Post-submit state:** Replaces form with an "Application Submitted" confirmation card:
```
✅ Application Submitted
Your seller account is under review. We'll notify you once approved.
[Back to home]
```

---

## SellerDashboard.jsx

**Route:** `/seller/dashboard`

**Layout:**
```
[SellerNavbar]
─────────────────────────────────────
  Welcome, [SellerName]

  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  Total   │ │ Pending  │ │ Approved │ │ Rejected │
  │    12    │ │    3     │ │    8     │ │    1     │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘

  Recent Listings
  ┌──────────────────────────────────────────────────┐
  │ Name           │ Status   │ Price  │ Stock │ Date │
  ├──────────────────────────────────────────────────┤
  │ Bluetooth Spkr │ approved │ ₹1,299 │  20   │ ... │
  └──────────────────────────────────────────────────┘

  [+ Add New Listing]  →  /seller/listings/new
─────────────────────────────────────
```

**Stats cards:** Total | Pending | Approved | Rejected (colored badge per status)

---

## MyListings.jsx

**Route:** `/seller/listings`

**Layout:**
```
[SellerNavbar]
─────────────────────────────────────
  My Listings                [+ Add Listing]

  Filter: [All ▼] [Pending] [Approved] [Rejected]

  ┌─────────────────────────────────────────────────────┐
  │ Name         │ Price  │ Stock │ Status   │ Actions   │
  ├─────────────────────────────────────────────────────┤
  │ Product Name │ ₹1,299 │  20   │ approved │ [Edit][✕] │
  └─────────────────────────────────────────────────────┘
─────────────────────────────────────
```

**Status badges:** `pending` → yellow, `approved` → green, `rejected` → red  
**Rejection reason:** Shown inline below the product row when `status === 'rejected'`

---

## CreateListing.jsx

**Route:** `/seller/listings/new`

**Layout:** Page wrapper with `<ListingForm />` in create mode. On submit → `POST /seller/products` → redirects to `/seller/listings`.

---

## EditListing.jsx

**Route:** `/seller/listings/:id/edit`

**Layout:** Loads product by ID → renders `<ListingForm />` pre-filled with existing data. On submit → `PUT /seller/products/:id` → redirects to `/seller/listings`.

---

# Admin Pages

> All admin pages use an `<AdminSidebar />` layout — no buyer Navbar or Footer.

---

## AdminLogin.jsx

**Route:** `/admin/login`

**Layout:** Same centered card as buyer Login.  
**Behavior:** Checks `user.role === 'super_admin'`. Any other role shows "Access denied." On success redirects to `/admin/dashboard`.

---

## AdminDashboard.jsx

**Route:** `/admin/dashboard`

**Layout:**
```
[AdminSidebar] │ [Main content]
               │
               │  Platform Overview
               │
               │  Products
               │  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
               │  │ Total  │ │ Pending │ │ Approved │ │ Rejected │
               │  │  148   │ │   12    │ │   130    │ │    6     │
               │  └────────┘ └─────────┘ └──────────┘ └──────────┘
               │
               │  Sellers
               │  ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
               │  │ Total  │ │ Pending │ │ Approved │ │ Rejected │
               │  │   20   │ │    5    │ │    14    │ │    1     │
               │  └────────┘ └─────────┘ └──────────┘ └──────────┘
               │
               │  Top Viewed Products
               │  ┌──────────────────────────────────────────┐
               │  │ # │ Name              │ Views │ Status   │
               │  ├──────────────────────────────────────────┤
               │  │ 1 │ Sony WH-1000XM5   │ 8,102 │ approved │
               │  └──────────────────────────────────────────┘
```

---

## AdminProducts.jsx

**Route:** `/admin/products`

**Layout:**
```
[AdminSidebar] │ Products Management
               │
               │ Tabs: [All] [Pending (12)] [Approved] [Rejected]
               │ Search: [search products...]
               │
               │ ┌──────────────────────────────────────────────────────┐
               │ │ Name │ Seller │ Price │ Status │ Actions              │
               │ ├──────────────────────────────────────────────────────┤
               │ │ ... │ ravi@  │ ₹1,299│ pending│ [✓ Approve][✗ Reject]│
               │ └──────────────────────────────────────────────────────┘
               │
               │ [Reject modal — textarea for rejection reason]
```

**Actions:**
- Approve → `PUT /admin/products/:id/approve`
- Reject → opens modal, submits reason → `PUT /admin/products/:id/reject`
- Delete → `DELETE /admin/products/:id`

---

## AdminSellers.jsx

**Route:** `/admin/sellers`

**Layout:**
```
[AdminSidebar] │ Seller Management
               │
               │ Tabs: [All] [Pending (5)] [Approved] [Rejected]
               │
               │ ┌──────────────────────────────────────────────────────┐
               │ │ Name       │ Email        │ Joined  │ Status │ Actions│
               │ ├──────────────────────────────────────────────────────┤
               │ │ Ravi Sharma│ ravi@myshop  │ 1 May   │ pending│ [✓][✗] │
               │ └──────────────────────────────────────────────────────┘
               │
               │ [Reject modal — optional reason textarea]
```

**Actions:**
- Approve → `PUT /admin/sellers/:id/approve`
- Reject → opens modal with optional reason → `PUT /admin/sellers/:id/reject`
