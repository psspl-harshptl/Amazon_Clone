# api.md — AmazonClone REST API Reference

## Base URL
```
Development:  http://localhost:5000/api/v1
Production:   https://yourdomain.com/api/v1
```

## Auth Header (Private routes)
```
Authorization: Bearer <JWT_TOKEN>
```

## Standard Response Format
```json
// Success
{ "success": true, "data": {}, "message": "..." }

// Error
{ "success": false, "error": "Error message", "statusCode": 400 }
```

---

## AUTH ENDPOINTS

### POST `/auth/register`
Register a new buyer account.

**Request Body:**
```json
{
  "name": "Rahul Mehta",
  "email": "rahul@example.com",
  "password": "SecurePass123",
  "phone": "9876543210"
}
```
**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": 1, "name": "Rahul Mehta", "email": "rahul@example.com", "role": "buyer" }
  },
  "message": "Account created successfully"
}
```
**Errors:** `400` email already exists | `400` validation failed

---

### POST `/auth/login`
**Request Body:**
```json
{ "email": "rahul@example.com", "password": "SecurePass123" }
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": 1, "name": "Rahul Mehta", "email": "rahul@example.com" }
  },
  "message": "Login successful"
}
```
**Errors:** `401` invalid credentials | `400` validation failed

---

### GET `/auth/me` 🔒
**Response 200:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "Rahul Mehta", "email": "rahul@example.com", "phone": "9876543210", "role": "buyer" }
}
```

---

## PRODUCT ENDPOINTS

### GET `/products`
**Query Params:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| page | number | `1` | Page number |
| limit | number | `20` | Items per page |
| search | string | `laptop` | Keyword search |
| category | number | `2` | Category ID |
| minPrice | number | `1000` | Min price filter |
| maxPrice | number | `50000` | Max price filter |
| rating | number | `4` | Min rating |
| discount | number | `25` | Min discount % |
| sort | string | `price_asc` | `price_asc\|price_desc\|rating\|newest` |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "boAt Wave Call 2 Smart Watch",
        "price": 1499,
        "mrp": 3999,
        "rating": 4.2,
        "reviewCount": 2341,
        "imageUrl": "https://...",
        "badge": "Best Seller",
        "stock": 50,
        "Category": { "id": 1, "name": "Electronics" }
      }
    ],
    "total": 148,
    "page": 1,
    "totalPages": 8
  }
}
```

---

### GET `/products/:id`
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "description": "Industry-leading noise cancelling...",
    "price": 24990,
    "mrp": 34990,
    "rating": 4.8,
    "reviewCount": 8102,
    "stock": 24,
    "imageUrl": "https://...",
    "images": ["https://...", "https://..."],
    "badge": "Amazon's Choice",
    "Category": { "id": 1, "name": "Electronics", "slug": "electronics" }
  }
}
```
**Errors:** `404` product not found

---

### GET `/products/search?q=laptop`
Same response shape as GET `/products` — shorthand for `?search=`.

---

### GET `/categories`
**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Electronics", "slug": "electronics", "imageUrl": "https://..." },
    { "id": 2, "name": "Fashion", "slug": "fashion", "imageUrl": "https://..." }
  ]
}
```

---

## CART ENDPOINTS 🔒 (All require JWT)

### GET `/cart`
Returns the buyer's cart with all items.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "items": [
      {
        "id": 12,
        "quantity": 2,
        "product": {
          "id": 2,
          "name": "Sony WH-1000XM5",
          "price": 24990,
          "imageUrl": "https://...",
          "stock": 24
        }
      }
    ]
  }
}
```

---

### POST `/cart/items`
Add item to cart. If product already in cart, increments quantity.

**Request Body:**
```json
{ "productId": 2, "quantity": 1 }
```
**Response 201:**
```json
{
  "success": true,
  "data": { "id": 12, "cartId": 5, "productId": 2, "quantity": 1 },
  "message": "Item added to cart"
}
```
**Errors:** `404` product not found | `400` quantity exceeds stock | `400` validation

---

### PUT `/cart/items/:itemId`
Update quantity of a cart item.

**Request Body:**
```json
{ "quantity": 3 }
```
**Response 200:**
```json
{
  "success": true,
  "data": { "id": 12, "quantity": 3 },
  "message": "Cart updated"
}
```
**Errors:** `404` item not found | `400` quantity exceeds stock | `403` not your item

---

### DELETE `/cart/items/:itemId`
Remove a single item.

**Response 200:**
```json
{ "success": true, "data": null, "message": "Item removed from cart" }
```

---

### DELETE `/cart`
Clear entire cart.

**Response 200:**
```json
{ "success": true, "data": null, "message": "Cart cleared" }
```

---

## ORDER ENDPOINTS 🔒 (All require JWT)

### POST `/orders`
Place order from current cart. Uses DB transaction — copies price at time of purchase.

**Request Body:**
```json
{
  "shippingAddress": {
    "name": "Rahul Mehta",
    "phone": "9876543210",
    "line1": "42, MG Road",
    "line2": "Near City Mall",
    "city": "Vadodara",
    "state": "Gujarat",
    "pincode": "390001"
  },
  "paymentMethod": "COD"
}
```
**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "totalAmount": 26489,
    "status": "pending",
    "shippingAddress": { ... },
    "paymentMethod": "COD",
    "items": [
      {
        "productId": 2,
        "quantity": 1,
        "priceAtPurchase": 24990,
        "product": { "name": "Sony WH-1000XM5" }
      }
    ]
  },
  "message": "Order placed successfully"
}
```
**Errors:** `400` cart is empty | `400` item out of stock | `500` transaction failed

---

### GET `/orders`
Order history for the logged-in buyer.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "totalAmount": 26489,
      "status": "delivered",
      "createdAt": "2025-04-24T10:30:00Z",
      "items": [
        {
          "quantity": 1,
          "priceAtPurchase": 24990,
          "product": { "id": 2, "name": "Sony WH-1000XM5", "imageUrl": "..." }
        }
      ]
    }
  ]
}
```

---

### GET `/orders/:id`
Full detail of one order.

**Response 200:** Same shape as place order response, with full item + product data.  
**Errors:** `404` order not found | `403` not your order

---

---

## SELLER ENDPOINTS 🔒 (Require JWT + approved seller role)

> All seller routes require `Authorization: Bearer <JWT>` where the token belongs to a user with `role: 'seller'` and `sellerStatus: 'approved'`.

### POST `/auth/seller/register`
Register a new seller account. Account is created with `sellerStatus: 'pending'` and must be approved by an admin before the seller can log in to the seller portal.

**Request Body:**
```json
{
  "name": "Ravi Sharma",
  "email": "ravi@myshop.com",
  "password": "SecurePass123",
  "phone": "9876543210"
}
```
**Response 201:**
```json
{
  "success": true,
  "data": { "id": 42, "name": "Ravi Sharma", "email": "ravi@myshop.com", "role": "seller", "sellerStatus": "pending" },
  "message": "Seller account created. Awaiting admin approval."
}
```
**Errors:** `400` email already exists | `400` validation failed

---

### GET `/seller/dashboard` 🔒
Returns the seller's dashboard statistics and a preview of their most recent listings.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "stats": { "total": 12, "pending": 3, "approved": 8, "rejected": 1 },
    "recentProducts": [
      { "id": 5, "name": "Bluetooth Speaker", "status": "approved", "price": 1299, "stock": 20, "createdAt": "2025-05-01T10:00:00Z" }
    ]
  }
}
```
**Errors:** `401` not authenticated | `403` seller not approved

---

### GET `/seller/products` 🔒
List all products belonging to the authenticated seller.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Bluetooth Speaker",
      "price": 1299,
      "stock": 20,
      "status": "approved",
      "rejectionReason": null,
      "createdAt": "2025-05-01T10:00:00Z"
    }
  ]
}
```

---

### POST `/seller/products` 🔒
Create a new product listing. The product is created with `status: 'pending'` and must be approved by an admin before it appears in buyer search results.

**Request Body:**
```json
{
  "name": "Bluetooth Speaker",
  "description": "Compact wireless speaker with 10-hour battery",
  "price": 1299,
  "mrp": 1999,
  "stock": 50,
  "categoryId": 1,
  "imageUrl": "https://...",
  "images": ["https://...", "https://..."]
}
```
**Response 201:**
```json
{
  "success": true,
  "data": { "id": 5, "name": "Bluetooth Speaker", "status": "pending", "sellerId": 42 },
  "message": "Product submitted for review"
}
```
**Errors:** `400` validation failed | `403` seller not approved

---

### PUT `/seller/products/:id` 🔒
Update a seller's own product. Only the seller who owns the product can update it.

**Request Body:** Same fields as POST (all optional — partial update supported).

**Response 200:**
```json
{ "success": true, "data": { "id": 5, "name": "Bluetooth Speaker Pro", "status": "pending" }, "message": "Product updated" }
```
**Errors:** `404` product not found | `403` not your product

---

### DELETE `/seller/products/:id` 🔒
Delete a seller's own product.

**Response 200:**
```json
{ "success": true, "data": null, "message": "Product deleted" }
```
**Errors:** `404` product not found | `403` not your product

---

## ADMIN ENDPOINTS 🔒 (Require JWT + super_admin role)

> All admin routes require `Authorization: Bearer <JWT>` where the token belongs to a user with `role: 'super_admin'`.

### GET `/admin/dashboard` 🔒
Platform-wide analytics for the admin overview page.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "products": { "total": 148, "pending": 12, "approved": 130, "rejected": 6 },
    "sellers": { "total": 20, "pending": 5, "approved": 14, "rejected": 1 },
    "topViewedProducts": [
      { "id": 2, "name": "Sony WH-1000XM5", "viewCount": 8102, "status": "approved" }
    ]
  }
}
```

---

### GET `/admin/products` 🔒
List all products across all sellers with optional filters.

**Query Params:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| status | string | `pending` | Filter by `pending\|approved\|rejected` |
| search | string | `speaker` | Keyword search on product name |
| page | number | `1` | Page number |
| limit | number | `20` | Items per page |

**Response 200:** Paginated list of products with seller info attached.

---

### PUT `/admin/products/:id/approve` 🔒
Approve a product — sets `status: 'approved'`, making it visible to buyers.

**Response 200:**
```json
{ "success": true, "data": { "id": 5, "status": "approved" }, "message": "Product approved" }
```

---

### PUT `/admin/products/:id/reject` 🔒
Reject a product with a mandatory reason shown to the seller.

**Request Body:**
```json
{ "reason": "Images are too low quality. Please re-upload at 800x800px or higher." }
```
**Response 200:**
```json
{ "success": true, "data": { "id": 5, "status": "rejected", "rejectionReason": "Images are too low quality..." }, "message": "Product rejected" }
```

---

### PUT `/admin/products/:id` 🔒
Update any product as admin (override any field).

**Response 200:** Updated product object.

---

### DELETE `/admin/products/:id` 🔒
Permanently delete any product.

**Response 200:**
```json
{ "success": true, "data": null, "message": "Product deleted" }
```

---

### GET `/admin/sellers` 🔒
List all seller accounts with optional status filter.

**Query Params:** `status` — `pending|approved|rejected`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "name": "Ravi Sharma",
      "email": "ravi@myshop.com",
      "sellerStatus": "pending",
      "createdAt": "2025-05-01T09:00:00Z"
    }
  ]
}
```

---

### GET `/admin/sellers/:id` 🔒
Get full detail for a single seller, including their product listings.

**Response 200:** Seller object with associated `listings` array.  
**Errors:** `404` seller not found

---

### PUT `/admin/sellers/:id/approve` 🔒
Approve a seller — sets `sellerStatus: 'approved'`, allowing them to log in and list products.

**Response 200:**
```json
{ "success": true, "data": { "id": 42, "sellerStatus": "approved" }, "message": "Seller approved" }
```

---

### PUT `/admin/sellers/:id/reject` 🔒
Reject a seller with an optional reason.

**Request Body:**
```json
{ "reason": "Business documents could not be verified." }
```
**Response 200:**
```json
{ "success": true, "data": { "id": 42, "sellerStatus": "rejected", "sellerRejectionReason": "Business documents could not be verified." }, "message": "Seller rejected" }
```

---

## HTTP Status Codes Used

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET, PUT, DELETE success |
| 201 | Created | POST register, add cart item, place order |
| 400 | Bad Request | Validation error, business rule violation |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Valid JWT but wrong user (e.g. another user's cart) |
| 404 | Not Found | Product, order, cart item not found |
| 500 | Server Error | Unexpected error, transaction failure |
