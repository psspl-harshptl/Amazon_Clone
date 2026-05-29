import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};

function buildVariantLabel(variant) {
  if (!variant) return null;
  const parts = [];
  if (variant.size) parts.push(`Size: ${variant.size}`);
  if (variant.color) parts.push(`Color: ${variant.color}`);
  return parts.join(' / ') || null;
}

// itemId for logged-in users = DB cart item id (number)
// itemId for guest users = `${productId}-${variantId || ''}`
const normalizeItems = (apiItems) =>
  apiItems.map(({ id: itemId, productId, variantId, quantity, product, variant }) => ({
    ...product,
    id: productId,
    itemId,
    variantId: variantId || null,
    variantLabel: buildVariantLabel(variant),
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

  const syncGuestCart = useCallback(async () => {
    const localCart = getLocalCart();
    if (localCart.length) {
      await Promise.allSettled(
        localCart.map(item =>
          api.post('/cart/items', { productId: item.id, quantity: item.quantity, variantId: item.variantId || null })
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

  useEffect(() => {
    if (!user) {
      localStorage.setItem('amazon_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (product, quantity = 1, variantId = null, variantLabel = null) => {
    if (user) {
      try {
        await api.post('/cart/items', { productId: product.id, quantity: Number(quantity), variantId: variantId || null });
        await fetchCart();
      } catch (err) {
        console.error('Add to cart failed:', err);
      }
    } else {
      const guestItemId = `${product.id}-${variantId || ''}`;
      setCart(prev => {
        const existing = prev.find(i => i.itemId === guestItemId);
        if (existing) {
          return prev.map(i =>
            i.itemId === guestItemId ? { ...i, quantity: i.quantity + Number(quantity) } : i
          );
        }
        return [...prev, {
          ...product,
          id: product.id,
          itemId: guestItemId,
          variantId: variantId || null,
          variantLabel: variantLabel || null,
          quantity: Number(quantity),
        }];
      });
    }
    setIsDrawerOpen(true);
  };

  // itemId-based removal (works for both logged-in and guest)
  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        await api.delete(`/cart/items/${itemId}`);
        setCart(prev => prev.filter(i => i.itemId !== itemId));
      } catch (err) {
        console.error('Remove failed:', err);
      }
    } else {
      setCart(prev => prev.filter(i => i.itemId !== itemId));
    }
  };

  // itemId-based quantity update
  const updateQuantity = async (itemId, delta) => {
    const item = cart.find(i => i.itemId === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;

    if (user) {
      if (newQty <= 0) {
        await removeFromCart(itemId);
      } else {
        try {
          await api.put(`/cart/items/${itemId}`, { quantity: newQty });
          setCart(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity: newQty } : i));
        } catch (err) {
          console.error('Update quantity failed:', err);
        }
      }
    } else {
      if (newQty <= 0) {
        setCart(prev => prev.filter(i => i.itemId !== itemId));
      } else {
        setCart(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity: newQty } : i));
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
