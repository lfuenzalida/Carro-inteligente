import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Product} from '../types';
import CartSidebar from '../components/CartSidebar';
import { useSmartCart } from '../context/SmartCartContext';

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
    <div>
      <div className="title"><h1>Productos disponibles</h1></div>
    <div className="products-container">
      {isOverBudget && <p style={{ color: 'red' }}>⚠ Presupuesto excedido</p>}
      <div className="grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>Categoría: {product.category}</p>
            <p>Precio: ${product.price.toLocaleString()}</p>
            {!!product.is_offer && (<span className="offer-badge">En Oferta 🏷</span>)}
            <button onClick={() => addToCart(product)}>Agregar al carro</button>
          </div>
        ))}
      </div>
    </div>
        <CartSidebar />
    </div>
    
  );
};

export default Products;
