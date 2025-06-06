import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Product } from '../types';
import CartSidebar from '../components/CartSidebar';
import { useSmartCart } from '../context/SmartCartContext';
import ProductCard from '../components/ProductsCard';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart, isOverBudget } = useSmartCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<Product[]>('http://localhost:3000/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Error al cargar productos', err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>🛍️ Productos disponibles</h1>
        {isOverBudget && <p style={{ color: 'red', fontWeight: 'bold' }}>⚠ Presupuesto excedido</p>}
      </div>
      <div className="products-container">
        <div className="grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </div>
      <CartSidebar />
    </div>
  );
};

export default Products;
