// src/context/SmartCartContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import type { FavoriteItem, Product, SmartCartItem } from '../types';
import axios from 'axios';

interface SmartCartContextProps {
  cart: SmartCartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  decreaseQuantity: (id: number) => void; // 👈 ESTA LÍNEA
  total: number;
  budgetLimit: number;
  isOverBudget: boolean;
  updateBudgetLimit: (newLimit: number) => void;
  fetchSmartCart: (userId: number) => Promise<void>;
}


const SmartCartContext = createContext<SmartCartContextProps | undefined>(
  undefined
);

export const SmartCartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<SmartCartItem[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const isOverBudget = budgetLimit > 0 && total > budgetLimit;

  const updateBudgetLimit = (newLimit: number) => {
    setBudgetLimit(newLimit);
    localStorage.setItem('budgetLimit', newLimit.toString());
  };

 const fetchSmartCart = async (userId: number) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/generatedCart/${userId}`);
    setCart(res.data);
    const calc = res.data.reduce((acc: number, item: SmartCartItem) => acc + item.subtotal, 0);
    setTotal(calc);
  } catch (error) {
    console.error('Error al obtener el carro inteligente', error);
  }
};


  const addToCart = (product: Product) => {
    const found = cart.find((item) => item.name === product.name);
    if (found) {
      const updatedCart = cart.map((item) =>
        item.id === found.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.price
            }
          : item
      );
      setCart(updatedCart);
    } else {
      const newItem: SmartCartItem = {
        id: product.id, // 👈 Usa el ID real del producto de la base de datos
        name: product.name,
        quantity: 1,
        price: product.price,
        source: product.is_offer ? 'offer' : 'history',
        subtotal: Number(product.price)
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (id: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    setCart(cart.filter((i) => i.id !== id));
    setTotal((prev) => prev - item.subtotal);
  };

 const importFavoritesToCart = (favorites: FavoriteItem[]) => {
  const formatted = favorites.map((fav) => ({
    id: fav.product_id,
    name: fav.name,
    price: Number(fav.price),
    quantity: fav.quantity,
    source: 'favorite',
    subtotal: Number(fav.price) * fav.quantity
  }));
  setCart(formatted);
};



  const decreaseQuantity = (id: number) => {
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  if (item.quantity > 1) {
    const updatedCart = cart.map((i) =>
      i.id === id
        ? {
            ...i,
            quantity: i.quantity - 1,
            subtotal: (i.quantity - 1) * i.price
          }
        : i
    );
    setCart(updatedCart);
  } else {
    removeFromCart(id); // ya existe
  }
};


useEffect(() => {
  const newTotal = cart.reduce((acc, item) => acc + Number(item.subtotal), 0);
  setTotal(newTotal);
}, [cart]);



  return (
    <SmartCartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        total,
        budgetLimit,
        isOverBudget,
        updateBudgetLimit,
        fetchSmartCart,
        importFavoritesToCart,
        decreaseQuantity,
      }}
    >
      {children}
    </SmartCartContext.Provider>
  );
};

export const useSmartCart = () => {
  const context = useContext(SmartCartContext);
  if (!context)
    throw new Error('useSmartCart debe usarse dentro de SmartCartProvider');
  return context;
};
