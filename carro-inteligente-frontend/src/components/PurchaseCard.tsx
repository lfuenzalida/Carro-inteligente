import React, { useState } from 'react';
import type { GroupedPurchase } from '../types';

interface Props {
  purchase: GroupedPurchase;
  isSelected: boolean;
  onSelect: () => void;
  userId: string;
  index: number;
}

const PurchaseCard: React.FC<Props> = ({ purchase, isSelected, onSelect, index }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`purchase-card animate-fade-in ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="purchase-header">
        <div className="purchase-header-left">
          <span className="purchase-title">🧾 Compra {index}</span>
        </div>
        <div className="purchase-header-right">
          <p><strong>Fecha de compra:</strong> {new Date(purchase.timestamp).toLocaleDateString('es-CL')}</p>
          <p><strong>Total:</strong> ${purchase.total.toLocaleString('es-CL')}</p>
          <button
            className="toggle-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            {showDetails ? 'Ocultar detalle' : 'Ver detalle de compra'}
          </button>
        </div>
      </div>

      {showDetails && (
        <ul className="purchase-product-list">
          <li className="purchase-product header">
            <span className="product-name"><strong>Producto</strong></span>
            <span className="product-qty"><strong>Cantidad</strong></span>
            <span className="product-price"><strong>Precio</strong></span>
          </li>
            {purchase.products.map((product, idx) => (
            
            <li key={idx} className="purchase-product">
              <span className="product-name">🛒 {product.name}</span>
              <span className="product-qty">x{product.quantity}</span>
              <span className="product-price">${product.total.toLocaleString('es-CL')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PurchaseCard;
