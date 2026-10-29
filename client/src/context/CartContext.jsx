import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { readStored, writeStored } from '../lib/storage.js';

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(line => line.id === action.id);
      return existing
        ? state.map(line => line.id === action.id ? { ...line, quantity: Math.min(20, line.quantity + 1) } : line)
        : [...state, { id: action.id, quantity: 1 }];
    }
    case 'QUANTITY': return state.map(line => line.id === action.id ? { ...line, quantity: Math.min(20, Math.max(1, action.quantity)) } : line);
    case 'REMOVE': return state.filter(line => line.id !== action.id);
    case 'CLEAR': return [];
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, () => {
    const saved = readStored('cart', []);
    return Array.isArray(saved) ? saved.filter(x => typeof x.id === 'string' && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 20) : [];
  });
  useEffect(() => writeStored('cart', items), [items]);
  const value = useMemo(() => ({
    items, count: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem: (id) => dispatch({ type: 'ADD', id }),
    setQuantity: (id, quantity) => dispatch({ type: 'QUANTITY', id, quantity }),
    removeItem: (id) => dispatch({ type: 'REMOVE', id }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
