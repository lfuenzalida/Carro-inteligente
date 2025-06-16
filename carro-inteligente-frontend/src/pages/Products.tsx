import { useEffect, useState } from 'react';
import axios from 'axios';

import type { Product } from '../types';
import CartSidebar from '../components/Products/CartSidebar';
import { useSmartCart } from '../context/SmartCartContext';
import ProfileButton from '../components/Products/ProfileButton';
import ProductsHeader from '../components/Products/ProductsHeader';
import ProductGrid from '../components/Products/ProductGrid';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useSmartCart();

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
  <div className="products-page">
     <ProductsHeader />
    <ProfileButton />
     <CartSidebar />
   

    
    <div className="products-container">
      <ProductGrid products={products} onAddToCart={addToCart} />
    </div>

   
  </div>
);
};

export default Products;
