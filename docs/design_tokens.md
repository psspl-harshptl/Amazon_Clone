# design_tokens.md — AmazonClone UI Design Reference

> Extracted directly from Figma screens. Use these exact values everywhere.

---

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `amazon-header` | `#131921` | Top navbar background |
| `amazon-nav` | `#232F3E` | Secondary nav bar + Footer main bg |
| `amazon-nav-hover` | `#37475A` | Nav hover, back-to-top bar |
| `amazon-accent` | `#FF9900` | Search button, star ratings, cart badge |
| `amazon-btn` | `#FFD814` | Add to Cart button |
| `amazon-btn-hover` | `#F7CA00` | Add to Cart hover |
| `amazon-buy` | `#FFA41C` | Buy Now button |
| `amazon-buy-hover` | `#FA8900` | Buy Now hover |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `amazon-text` | `#0F1111` | Primary body text, headings |
| `amazon-muted` | `#565959` | Secondary text, MRP price |
| `amazon-link` | `#007185` | Clickable links, review counts |
| `amazon-link-hover` | `#C45500` | Link hover state |
| `amazon-white` | `#FFFFFF` | Text on dark backgrounds |
| `amazon-gray-nav` | `#CCCCCC` | Nav bar links (non-hover) |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `amazon-green` | `#067D62` | In Stock, success states |
| `amazon-red` | `#CC0C39` | Best Seller badge, errors, out of stock |
| `amazon-orange` | `#C45500` | Link hover, deal price |
| `amazon-blue` | `#002F36` | Amazon's Choice badge |

### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `amazon-bg` | `#F3F3F3` | Page background |
| `amazon-white` | `#FFFFFF` | Card background |
| `amazon-card-img` | `#F3F3F3` | Product image placeholder bg |
| `amazon-footer` | `#232F3E` | Footer main section |
| `amazon-footer-bottom` | `#131921` | Footer copyright bar |
| `amazon-section-header` | `#F3F3F3` | Order card header row bg |

### Border Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `amazon-border` | `#DDD` | Card borders, dividers |
| `amazon-border-focus` | `#FF9900` | Input focus ring (search bar) |

---

## Typography

### Font Family
- **Primary:** `"Amazon Ember"`, fallback: `Arial`, `sans-serif`
- **Fallback stack:** `system-ui, -apple-system, sans-serif`

### Font Scale
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Product name (card) | 14px | 400 | `#0F1111` |
| Product name (detail) | 24px | 400 | `#0F1111` |
| Price (card) | 18px | 700 | `#0F1111` |
| Price (detail) | 28px | 400 | `#0F1111` |
| MRP strikethrough | 13px | 400 | `#565959` |
| Section heading | 21px | 700 | `#0F1111` |
| Nav links | 13px | 700 | `#FFFFFF` |
| Nav sub-text | 12px | 400 | `#CCCCCC` |
| Footer headings | 16px | 700 | `#FFFFFF` |
| Footer links | 14px | 400 | `#CCCCCC` |
| Badge text | 11px | 700 | `#FFFFFF` |
| Button text | 13px | 400 | `#0F1111` |
| Star rating | 14px | — | `#FF9900` |
| Review count | 14px | 400 | `#007185` |

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Page horizontal padding | `24px` desktop, `16px` mobile | Main content wrapper |
| Card padding | `12px` | Product card inner |
| Card gap | `16px` | Grid gap between cards |
| Section margin | `24px 0` | Between page sections |
| Navbar height | `56px` (row 1) + `38px` (row 2) | Fixed heights |
| Buy box padding | `16px` | Right column in product detail |
| Footer column gap | `24px` | Between footer columns |

---

## Border Radius

| Element | Value |
|---------|-------|
| Buttons (Add to Cart, Buy Now) | `4px` — slight rounding only |
| Search bar | `4px` |
| Product cards | `4px` (subtle, not pill) |
| Buy box | `4px` border with `#DDD` |
| Badges (Best Seller) | `3px` |
| Cart badge (count) | `50%` (circle) |
| Input fields | `3px` |

---

## Navbar Layout (from Figma)

```
Row 1 — height 56px, bg #131921
├─ Logo: "AmazonClone" white bold, ".in" small below
│   └─ border: 1px solid transparent, hover border-white
├─ [Deliver to] section (optional)
│   └─ Location icon + "Deliver to Gujarat 390001"
├─ Search bar (flex-1)
│   ├─ Category select: bg #E8E8E8, border-right #CCC, height 38px, 13px font
│   ├─ Input: bg white, flex-1, font-size 15px, no border
│   └─ Submit btn: bg #FF9900, hover #F3A847, width 45px, search icon white 20px
├─ Account section
│   ├─ "Hello, Sign in" (12px, white)
│   └─ "Account & Lists ▼" (13px, bold, white)
├─ Orders
│   ├─ "Returns" (12px, white)
│   └─ "& Orders" (13px, bold, white)
└─ Cart
    ├─ Cart icon (SVG, white, 28px)
    ├─ Item count badge (circle, #FF9900 bg, #131921 text, 18px)
    └─ "Cart" label (13px, bold, white)

Row 2 — height 38px, bg #232F3E
└─ Links: [☰ All] [Today's Deals] [Customer Service] [Electronics] [Fashion] [Prime]
   └─ 13px, white, hover: underline, padding 8px 10px
```

---

## Button Styles (from Figma)

### Add to Cart
```css
background-color: #FFD814;
border: 1px solid #FCD200;
border-radius: 20px;   /* pill shape in Figma */
padding: 8px 16px;
font-size: 13px;
color: #0F1111;
cursor: pointer;
/* hover */
background-color: #F7CA00;
```

### Buy Now
```css
background-color: #FFA41C;
border: 1px solid #FF8F00;
border-radius: 20px;
padding: 8px 16px;
font-size: 13px;
color: #0F1111;
```

### Proceed to Buy (Cart page)
```css
background-color: #FFD814;
border-radius: 8px;
width: 100%;
padding: 10px;
font-size: 14px;
```

---

## Product Card Anatomy (from Figma)

```
┌─────────────────────────────┐
│ [Best Seller]               │  ← absolute top-left, #CC0C39 bg, white text, 11px
│                             │
│        [Product Image]      │  ← bg #F3F3F3, height 200px, object-contain, p-4
│                             │
├─────────────────────────────┤
│ Product Name (2 lines max)  │  ← 14px, #0F1111, line-clamp-2
│ ★★★★☆  4.2  (2,341)       │  ← stars #FF9900, count #007185 underline
│ ₹1,499                     │  ← 18px bold, #0F1111
│ M.R.P: ~~₹3,999~~          │  ← 12px, #565959, line-through
│ 63% off                    │  ← 12px, #CC0C39
│                             │
│ [Add to Cart]               │  ← #FFD814, full width, border-radius 20px
└─────────────────────────────┘
Card border: 1px solid #DDD
Card bg: #FFFFFF
Card hover: box-shadow 0 2px 8px rgba(0,0,0,0.15)
```

---

## Footer Structure (from Figma)

```
[Back to top bar] — bg #37475A, centered "Back to top", 14px white, hover bg #3d5166

[Main footer] — bg #232F3E, padding 36px 0
  4 equal columns:
  ├── Get to Know Us
  │   About AmazonClone / Careers / Press Releases / Investor Relations
  ├── Connect with Us
  │   Facebook / Twitter / Instagram / YouTube
  ├── Make Money with Us
  │   Sell on Amazon / Advertise / Associates / Logistics
  └── Let Us Help You
      Your Account / Orders / Delivery / Returns / Help

[Bottom bar] — bg #131921, padding 16px
  Logo center (white, 18px bold)
  © 2025 AmazonClone.com, Inc.
  Links: Conditions | Privacy | Interest-Based Ads
```

---

## Responsive Breakpoints (Tailwind)

| Breakpoint | Width | Layout change |
|------------|-------|---------------|
| `sm` | 640px | 2-col product grid |
| `md` | 768px | Show filter sidebar |
| `lg` | 1024px | 3-col product grid, full navbar |
| `xl` | 1280px | 4-col product grid |
| `2xl` | 1536px | Max container 1500px |

---

## Figma Screen Summary

| Screen | Key Design Note |
|--------|----------------|
| Login | White card 350px wide, centered, logo above card, simplified footer |
| Home | Hero full-width ~360px tall, dark overlay, category 4-col grid |
| Product List | 220px fixed sidebar, product grid right, orange filter pills |
| Product Detail (simple) | 3-col: gallery 40% + info 35% + buy-box 25% |
| Product Detail (full) | + specs table + reviews accordion + Q&A + recommendations |
| Cart | 2-col: items left (70%) + summary right (30%) |
| Order Success | Centered, green check circle, status tracker right side |
| Order Confirmation | Dark themed, full order breakdown |
