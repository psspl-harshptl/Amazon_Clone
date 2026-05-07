import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};

// Flatten API cart items into the shape Cart.jsx expects
const normalizeItems = (apiItems) =>
  apiItems.map(({ id: itemId, productId, quantity, product }) => ({
    ...product,
    id: productId,
    itemId,
    quantity,
    price: parseFloat(product.price),
  }));

const getLocalCart = () => {
  try { return JSON.parse(localStorage.getItem('amazon_cart') || '[]'); } catch { return []; }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(normalizeItems(data.data.items));
    } catch {
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // On login: push any guest cart items to backend then fetch fresh
  const syncGuestCart = useCallback(async () => {
    const localCart = getLocalCart();
    if (localCart.length) {
      await Promise.allSettled(
        localCart.map(item =>
          api.post('/cart/items', { productId: item.id, quantity: item.quantity })
        )
      );
      localStorage.removeItem('amazon_cart');
    }
  }, []);

  useEffect(() => {
    if (user) {
      syncGuestCart().then(() => fetchCart());
    } else {
      setCart(getLocalCart());
    }
  }, [user]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('amazon_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        await api.post('/cart/items', { productId: product.id, quantity: Number(quantity) });
        await fetchCart();
      } catch (err) {
        console.error('Add to cart failed:', err);
      }
    } else {
      setCart(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) {
          return prev.map(i =>
            i.id === product.id ? { ...i, quantity: i.quantity + Number(quantity) } : i
          );
        }
        return [...prev, { ...product, quantity: Number(quantity) }];
      });
    }
    setIsDrawerOpen(true);
  };

  const removeFromCart = async (productId) => {
    if (user) {
      const item = cart.find(i => i.id === productId);
      if (!item) return;
      try {
        await api.delete(`/cart/items/${item.itemId}`);
        setCart(prev => prev.filter(i => i.id !== productId));
      } catch (err) {
        console.error('Remove failed:', err);
      }
    } else {
      setCart(prev => prev.filter(i => i.id !== productId));
    }
  };

  const updateQuantity = async (productId, delta) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    const newQty = item.quantity + delta;

    if (user) {
      if (newQty <= 0) {
        await removeFromCart(productId);
      } else {
        try {
          await api.put(`/cart/items/${item.itemId}`, { quantity: newQty });
          setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i));
        } catch (err) {
          console.error('Update quantity failed:', err);
        }
      }
    } else {
      if (newQty <= 0) {
        setCart(prev => prev.filter(i => i.id !== productId));
      } else {
        setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i));
      }
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error('Clear cart failed:', err);
      }
    }
    setCart([]);
  };

  const toggleDrawer = (open) =>
    setIsDrawerOpen(open !== undefined ? open : !isDrawerOpen);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartSubtotal,
      isDrawerOpen,
      toggleDrawer,
    }}>
      {children}
    </CartContext.Provider>
  );
};
