# state.md — AmazonClone State Management

## Strategy
- **Global state:** React Context API (AuthContext + CartContext)
- **Local state:** `useState` / `useReducer` inside components
- **Server state:** Axios calls in `useEffect`, no external lib (no Redux, no React Query)
- **Persistent state:** JWT in `localStorage` only; no sensitive data in localStorage

---

## AuthContext

**File:** `src/context/AuthContext.jsx`

### State Shape
```js
{
  user: null | {
    id: number,
    name: string,
    email: string,
    role: "buyer"
  },
  token: null | string,   // JWT
  loading: boolean        // true while verifying token on app load
}
```

### Actions / Methods
| Method | Description |
|--------|-------------|
| `login(email, password)` | POST /auth/login → sets user + token, stores token in localStorage |
| `register(name, email, password, phone)` | POST /auth/register → auto-login after success |
| `logout()` | Clears user, token, localStorage |
| `loadUser()` | Called on app mount — reads token from localStorage, GET /auth/me to rehydrate user |

### Provider Setup
```jsx
// src/context/AuthContext.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  const login = async (email, password) => { ... };
  const logout = () => { setUser(null); setToken(null); localStorage.removeItem("token"); };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## CartContext

**File:** `src/context/CartContext.jsx`

### State Shape
```js
{
  items: [
    {
      id: number,          // cart_item id
      product: {
        id, name, price, imageUrl, stock
      },
      quantity: number
    }
  ],
  totalItems: number,      // sum of all quantities (for badge)
  totalAmount: number,     // sum of price × quantity
  loading: boolean
}
```

### Actions / Methods
| Method | Endpoint Hit | Description |
|--------|-------------|-------------|
| `fetchCart()` | GET /cart | Load cart from server, called on login/mount |
| `addItem(productId, quantity)` | POST /cart/items | Add or merge item |
| `updateQty(itemId, quantity)` | PUT /cart/items/:id | Change quantity |
| `removeItem(itemId)` | DELETE /cart/items/:id | Remove one item |
| `clearCart()` | DELETE /cart | Empty entire cart (called after order placed) |

### Derived State (computed, not stored)
```js
const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
```

### Provider Setup
```jsx
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) fetchCart();
    else setItems([]);
  }, [token]);

  return (
    <CartContext.Provider value={{ items, totalItems, totalAmount, loading, addItem, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
```

---

## Local Component State

### Login.jsx
```js
{ email: "", password: "", error: "", loading: false }
```

### Register.jsx
```js
{ name: "", email: "", password: "", confirmPassword: "", error: "", loading: false }
```

### Home.jsx
```js
{ featuredProducts: [], categories: [], deals: [], loading: true }
```

### ProductList.jsx
```js
{
  products: [],
  total: 0,
  page: 1,
  loading: true,
  filters: {
    category: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    discount: "",
    inStock: false,
    sort: "relevance"
  }
}
```

### ProductDetail.jsx
```js
{
  product: null,
  selectedImage: 0,
  selectedQty: 1,
  loading: true,
  addingToCart: false,
  wishlist: false
}
```

### Cart.jsx
```js
{ loading: false }
// items come from CartContext
```

### Checkout.jsx
```js
{
  step: 1, // 1=address, 2=payment, 3=review
  address: { name, phone, pincode, line1, line2, city, state },
  paymentMethod: "COD",
  placing: false,
  error: ""
}
```

### OrderHistory.jsx
```js
{ orders: [], loading: true, filter: "past3months" }
```

### OrderDetail.jsx
```js
{ order: null, loading: true }
```

### OrderSuccess.jsx
```js
// reads orderId from URL params, fetches order detail
{ order: null, loading: true }
```

---

## Axios Instance & Interceptors

**File:** `src/api/axios.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:5000/api/v1
  timeout: 10000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## App Provider Wrapping Order

```jsx
// src/main.jsx
<BrowserRouter>
  <AuthProvider>       {/* must be outermost — CartProvider depends on it */}
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
</BrowserRouter>
```

---

## Toast State

Managed in `App.jsx` via a simple list, passed via context or prop-drilled to a `<ToastContainer />` fixed top-right.

```js
// App-level
const [toasts, setToasts] = useState([]);
const addToast = (message, type = "success") => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message, type }]);
  setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
};
```

---

## State Flow Diagram

```
App Mount
  └─ AuthProvider.loadUser()
       ├─ token in localStorage? → GET /auth/me → setUser
       └─ no token → user = null

User logs in (Login.jsx)
  └─ AuthContext.login()
       ├─ POST /auth/login → token received
       ├─ setToken + localStorage.setItem("token")
       ├─ GET /auth/me → setUser
       └─ CartContext.fetchCart() (triggered by token change)

User adds to cart (ProductDetail.jsx / ProductCard.jsx)
  └─ CartContext.addItem(productId, qty)
       ├─ POST /api/v1/cart/items
       ├─ update local items state
       └─ Navbar badge re-renders (totalItems)

User places order (Checkout.jsx)
  └─ POST /api/v1/orders
       ├─ success → CartContext.clearCart()
       └─ navigate to /orders/:id/success
```
