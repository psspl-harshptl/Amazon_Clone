# components.md — AmazonClone Component Reference

> Design tokens from Figma:
> - Header bg: `#131921` | Nav secondary: `#232F3E` | Accent/CTA: `#FF9900`
> - Primary button: `#FFD814` | Buy Now: `#FFA41C` | Link color: `#007185`
> - Body text: `#0F1111` | Muted: `#565959` | Border: `#DDD` | Background: `#F3F3F3`
> - Footer bg: `#232F3E` | Footer bottom bar: `#131921`

---

## Common Components

### `Navbar.jsx`
**Figma:** Top bar on every screen — 3-row structure on home, 2-row on inner pages.

**Structure:**
```
Row 1 (bg #131921):
  [Logo: "AmazonClone"] [Search: category-select | input | orange-btn] [Account] [Orders] [Cart+badge]

Row 2 (bg #232F3E):
  [All ☰] [Today's Deals] [Customer Service] [Electronics] [Fashion] [Home & Kitchen] [Prime]
```

**Props:** none (reads from AuthContext + CartContext)

**Key Details:**
- Logo font: bold, white, `.in` in smaller text below
- Search bar: category `<select>` left, input middle (flex-1), search button bg `#FF9900`
- Cart badge: `#FF9900` circle, count from CartContext
- Account: shows "Hello, [name]" when logged in, "Hello, Sign in" when not
- Sticky: `position: sticky; top: 0; z-index: 50`

---

### `Footer.jsx`
**Figma:** Dark multi-column footer on every page.

**Structure:**
```
Back-to-top bar (bg #37475A, full width, centered text "Back to top")
Main footer (bg #232F3E):
  4 columns: Get to Know Us | Connect with Us | Make Money with Us | Let Us Help You
  Each column: heading (white) + links (gray, hover white)
Bottom bar (bg #131921):
  Logo center | "© 2025 AmazonClone.com" | links row
```

**Props:** none

---

### `Loader.jsx`
Centered spinner, `#FF9900` color.
```jsx
// Usage
<Loader />
<Loader size="sm" />  // for inline use
```

---

### `Toast.jsx`
Top-right notification, auto-dismiss after 3s.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| message | string | Text to show |
| type | `'success'` \| `'error'` \| `'info'` | Color variant |
| onClose | fn | Called on dismiss |

**Design:** `bg-white`, left border `4px solid` (green/red/orange), shadow, slide-in animation.

---

### `ProtectedRoute.jsx`
Wraps private pages. Redirects to `/login` if no token.
```jsx
// Usage in App.jsx
<Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
```

---

## Product Components

### `ProductCard.jsx`
**Figma:** Used in Home (Best Sellers, Top Deals) and ProductList grid.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| product | object | Full product object |
| onAddToCart | fn | Triggers cart add |

**Design:**
```
┌─────────────────────┐
│  [Badge: "Best      │  ← #CC0C39 red pill, top-left overlay
│   Seller"]          │
│                     │
│     [Product Img]   │  ← bg #F3F3F3, object-contain, h-48
│                     │
│  Product Name       │  ← 2-line clamp, font-size 14px, #0F1111
│  ★★★★☆ (2,341)    │  ← stars #FF9900, count #007185
│  ₹1,499            │  ← bold 18px
│  M.R.P: ₹3,999     │  ← strikethrough, muted, 12px
│  [Add to Cart]      │  ← bg #FFD814, full width, rounded
└─────────────────────┘
```
- Card: `bg-white border border-[#DDD] rounded p-3`
- Hover: `shadow-lg scale-[1.01] transition`
- Wishlist heart icon: top-right, toggle red on click

---

### `ProductGrid.jsx`
**Figma:** Used in ProductList page — responsive grid.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| products | array | Array of product objects |
| loading | bool | Shows skeleton cards |

**Layout:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`

---

### `ProductFilters.jsx`
**Figma:** Left sidebar on ProductList — fixed width 220px.

**Sections (from Figma):**
1. Department (category checkboxes)
2. Customer Reviews (4★ & up, 3★ & up)
3. Price Range (slider or min/max inputs)
4. Availability (In Stock checkbox)
5. Discount (10%+, 25%+, 50%+ checkboxes)

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| filters | object | Current filter state |
| onChange | fn | Called with updated filters |

---

### `StarRating.jsx`
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| rating | number | e.g. 4.2 |
| count | number | Review count |
| size | `'sm'`\|`'md'`\|`'lg'` | Star size |

Renders filled/half/empty stars in `#FF9900`.

---

### `ProductBadge.jsx`
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| label | string | "Best Seller", "Amazon's Choice", "Deal" |

Color map:
- `Best Seller` → `#CC0C39` (red)
- `Amazon's Choice` → `#232F3E` (dark)
- `Deal` → `#CC0C39` (red)
- `New` → `#007185` (teal)

---

## Cart Components

### `CartItem.jsx`
**Figma:** Each row in Shopping Cart page.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| item | object | `{ product, quantity }` |
| onUpdateQty | fn | `(itemId, qty) => void` |
| onRemove | fn | `(itemId) => void` |

**Design:**
```
┌──────────────────────────────────────────────────┐
│ [Img 96x96] │ Product Name (bold)                │
│             │ In Stock (green)                   │
│             │ ₹24,990                            │
│             │ [Qty: - 1 +]  [Delete] [Save]      │
└──────────────────────────────────────────────────┘
```
- Qty stepper: `border border-[#DDD] rounded flex`
- Delete/Save: text links in `#007185`
- Bottom border separates items

---

### `OrderSummary.jsx`
**Figma:** Right column in Cart page.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| items | array | Cart items |
| onProceed | fn | Navigates to Checkout |

**Design:**
```
┌─────────────────────────┐
│ Order Summary           │
│ ─────────────────────── │
│ Subtotal (3 items) ₹XX  │
│ Delivery              ₹0│
│ ─────────────────────── │
│ Total            ₹XX,XX │
│ [Proceed to Buy]        │  ← bg #FFD814, full width
└─────────────────────────┘
```

---

## Order Components

### `OrderCard.jsx`
**Figma:** Used in OrderHistory page.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| order | object | Order with items |
| onClick | fn | Navigate to OrderDetail |

**Design:**
```
┌─────────────────────────────────────┐
│ ORDER PLACED    TOTAL    SHIP TO    │  ← header row, bg #F3F3F3
│ 24 Apr 2025    ₹XX,XX   [Name]     │
│ Order# 123-456-7890    [View Order] │
├─────────────────────────────────────┤
│ [Img] Product Name        ₹Price    │
│       Status: Delivered            │
│ [Buy Again]  [View item]           │
└─────────────────────────────────────┘
```

---

# Seller Components

> Seller components are used only within `/seller/*` pages. They do not import buyer contexts (CartContext).

---

## `SellerNavbar.jsx`
Top bar for all seller pages.

**Structure:**
```
Row 1 (bg #131921):
  [AmazonClone Seller Central logo]   [Hello, SellerName]   [Sign Out]
```

**Props:** none (reads from AuthContext)  
**On Sign Out:** clears token, redirects to `/seller/login`

---

## `ListingForm.jsx`
Reusable form for creating and editing product listings. Used by both `CreateListing.jsx` and `EditListing.jsx`.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| initialValues | object \| null | Pre-filled data for edit mode; `null` for create |
| onSubmit | fn | `(formData) => void` — called with validated form payload |
| loading | bool | Disables submit button while request is in flight |

**Fields:**
| Field | Type | Validation |
|-------|------|-----------|
| name | text | required, min 3 chars |
| description | textarea | required |
| price | number | required, > 0 |
| mrp | number | optional, must be ≥ price |
| stock | number | required, ≥ 0 |
| categoryId | select | required |
| imageUrl | text (URL) | required |
| images | multi-input (URLs) | optional, up to 5 |

---

## `StatusBadge.jsx`
Pill badge showing product or seller approval status.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| status | `'pending'` \| `'approved'` \| `'rejected'` | Status value |

**Color map:**
- `pending` → `bg-yellow-100 text-yellow-800`
- `approved` → `bg-green-100 text-green-800`
- `rejected` → `bg-red-100 text-red-800`

---

# Admin Components

> Admin components are used only within `/admin/*` pages.

---

## `AdminSidebar.jsx`
Left sidebar navigation for all admin pages.

**Structure:**
```
┌────────────────┐
│ AmazonClone    │
│ Admin          │
├────────────────┤
│ 📊 Dashboard   │  → /admin/dashboard
│ 📦 Products    │  → /admin/products
│ 👤 Sellers     │  → /admin/sellers
├────────────────┤
│ [Sign Out]     │
└────────────────┘
```

**Active link:** highlighted with `bg-[#232F3E]` left border `4px solid #FF9900`.  
**Props:** none (reads from AuthContext + React Router location)

---

## `RejectModal.jsx`
Shared modal for product and seller rejection flows.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| isOpen | bool | Controls visibility |
| onClose | fn | Called on cancel / outside click |
| onConfirm | fn | `(reason: string) => void` — called with rejection reason |
| required | bool | If `true`, disables confirm until reason is non-empty (product rejection); if `false`, reason is optional (seller rejection) |
| title | string | Modal heading, e.g. "Reject Product" |

**Design:**
```
┌─────────────────────────────┐
│ Reject Product              │ ← title
│ ─────────────────────────── │
│ Reason for rejection:       │
│ ┌─────────────────────────┐ │
│ │ textarea (3 rows)       │ │
│ └─────────────────────────┘ │
│ [Cancel]        [Confirm]   │ ← Confirm disabled if required + empty
└─────────────────────────────┘
```
