# pages.md — AmazonClone Page Reference

> Every page includes `<Navbar />` at top and `<Footer />` at bottom unless noted.
> Color tokens: accent `#FF9900`, primary btn `#FFD814`, buy btn `#FFA41C`, link `#007185`

---

## Route Map

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login.jsx | Public (redirect if logged in) |
| `/register` | Register.jsx | Public (redirect if logged in) |
| `/` | Home.jsx | Public |
| `/products` | ProductList.jsx | Public |
| `/products/:id` | ProductDetail.jsx | Public |
| `/cart` | Cart.jsx | **Private** |
| `/checkout` | Checkout.jsx | **Private** |
| `/orders` | OrderHistory.jsx | **Private** |
| `/orders/:id` | OrderDetail.jsx | **Private** |
| `/orders/:id/success` | OrderSuccess.jsx | **Private** |

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
