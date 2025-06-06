import React from 'react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: Props) => {
  return (
    <div className="product-card" style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', width: '100%', maxWidth: '320px', margin: '0 auto', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <h3 style={{ fontSize: '1.1rem' }}>{product.name}</h3>
      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }} />
      <p style={{ margin: '0.25rem 0' }}><strong>Marca:</strong> {product.brand}</p>
      <p style={{ margin: '0.25rem 0' }}><strong>Precio:</strong> ${product.price.toLocaleString()} CLP</p>
      <p style={{ margin: '0.25rem 0' }}><strong>Stock:</strong> {product.stock} {product.unit}</p>
      <div style={{ minHeight: '1.5rem' }}>
        {Boolean(product.is_offer) && <span style={{ color: 'green', fontWeight: 'bold' }}>🔥 En Oferta</span>}
      </div>
      <button onClick={() => onAddToCart(product)} style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
        Agregar al carro
      </button>
    </div>
  );
};

export default ProductCard;
