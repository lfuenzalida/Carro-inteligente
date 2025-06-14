// src/context/FavoriteCartContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import axios from 'axios';
import { type Product } from '../types';

interface FavoriteItem {
  brand: string;
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface FavoriteCartContextProps {
  favorites: FavoriteItem[];
  fetchFavorites: (userId: number) => Promise<void>;
  addFavorite: (userId: number, product: Product, quantity: number) => Promise<void>;
  updateFavoriteQuantity: (favoriteId: number, quantity: number) => Promise<void>;
  removeFavorite: (favoriteId: number) => Promise<void>;
}

const FavoriteCartContext = createContext<FavoriteCartContextProps | undefined>(undefined);

export const FavoriteCartProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const fetchFavorites = async (userId: number) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/favoriteCart/${userId}`);
      setFavorites(
                    res.data.map((item: any) => ({
                      ...item,
                      price: Number(item.price),
                      total: Number(item.price) * item.quantity
                    }))
                  );
    } catch (error) {
      console.error('Error al obtener el carro favorito', error);
    }
  };

  const addFavorite = async (userId: number, product: Product, quantity: number) => {
  try {
    const existing = favorites.find(item => item.product_id === product.id);

    if (existing) {
      // Ya existe → actualizamos cantidad
      const newQuantity = existing.quantity + quantity;
      await updateFavoriteQuantity(existing.id, newQuantity);
    } else {
      // No existe → insertamos
      await axios.post(`http://localhost:3000/api/favoriteCart`, {
        user_id: userId,
        product_id: product.id,
        quantity
      });
      await fetchFavorites(userId); // refresca lista
    }
  } catch (error) {
    console.error('Error al agregar producto favorito', error);
  }
};


  const updateFavoriteQuantity = async (favoriteId: number, quantity: number) => {
    try {
      await axios.put(`http://localhost:3000/api/favoriteCart/${favoriteId}`, { quantity });
      const updated = favorites.map(item =>
        item.id === favoriteId ? { ...item, quantity, total: item.price * quantity } : item
      );
      setFavorites(updated);
    } catch (error) {
      console.error('Error al actualizar cantidad favorita', error);
    }
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/favoriteCart/${favoriteId}`);
      setFavorites(favorites.filter(item => item.id !== favoriteId));
    } catch (error) {
      console.error('Error al eliminar producto favorito', error);
    }
  };

  return (
    <FavoriteCartContext.Provider value={{ favorites, fetchFavorites, addFavorite, updateFavoriteQuantity, removeFavorite }}>
      {children}
    </FavoriteCartContext.Provider>
  );
};

export const useFavoriteCart = () => {
  const context = useContext(FavoriteCartContext);
  if (!context) throw new Error('useFavoriteCart debe usarse dentro de FavoriteCartProvider');
  return context;
};
