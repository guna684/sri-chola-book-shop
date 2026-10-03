import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Book, CartItem } from '@/types/book';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CART_STORAGE_KEY = 'srichola_cart';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load cart from localStorage:', e);
  }
  return [];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  const addToCart = useCallback((book: Book, quantity = 1) => {
    setItems(prev => {
      const maxStock = book.stock ?? 999;
      if (maxStock <= 0) {
        toast.error(`"${book.title}" is out of stock`);
        return prev;
      }
      const existingItem = prev.find(item => item.book.id === book.id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      if (currentQty + quantity > maxStock) {
        toast.error(`Cannot add more. Only ${maxStock} copies of "${book.title}" available in stock`);
        return prev;
      }
      if (existingItem) {
        toast.success(`Updated "${book.title}" quantity in cart`);
        return prev.map(item =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      toast.success(`Added "${book.title}" to cart`);
      return [...prev, { book, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((bookId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.book.id === bookId);
      if (item) {
        toast.info(`Removed "${item.book.title}" from cart`);
      }
      return prev.filter(item => item.book.id !== bookId);
    });
  }, []);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.book.id === bookId) {
          const maxStock = item.book.stock ?? 999;
          if (quantity > maxStock) {
            toast.error(`Only ${maxStock} copies of "${item.book.title}" available in stock`);
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.info('Cart cleared');
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.book.price * item.quantity, 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
