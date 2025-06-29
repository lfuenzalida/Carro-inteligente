import { useEffect, useState, useMemo } from 'react';
import type { PurchaseRecord, GroupedPurchase } from '../types';
import PurchaseCard from '../components/PurchaseCard';
import { groupPurchasesByOrder } from '../utils/purchaseUtils';

const PurchaseHistory = () => {
  const userId = localStorage.getItem('userId');
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<GroupedPurchase | null>(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      const res = await fetch(`http://localhost:3000/api/purchase/${userId}`);
      const json = await res.json();
      console.log('Compras recibidas:', json);
      setPurchases(json);
    };

    fetchPurchaseHistory();
  }, [userId]);

  const groupedPurchases = useMemo(() => groupPurchasesByOrder(purchases), [purchases]);

  return (
    <div className="purchase-history-container">
      <div className="purchase-list">
        <h1>🧾 Historial de Compras</h1>
        {groupedPurchases.length === 0 ? (
          <p>No hay compras registradas.</p>
        ) : (
          groupedPurchases.map((purchase, idx) => (
            <PurchaseCard
              key={idx}
              purchase={purchase}
              userId={userId!}
              isSelected={selectedPurchase?.timestamp === purchase.timestamp}
              onSelect={() => setSelectedPurchase(purchase)} 
              index={groupedPurchases.length - idx}            />
          ))
        )}
      </div>
      <div className="purchase-details-panel">
        {selectedPurchase ? (
          <div className="purchase-details animate-slide-in">
            <h2>🛍️ Detalle de Compra</h2>
            <p><strong>Fecha:</strong> {selectedPurchase.timestamp}</p>
            <ul className="purchase-product-list">
              {selectedPurchase.products.map((product, idx) => (
                <li key={idx} className="purchase-product">
                  <span className="product-name">🛒 {product.name}</span>
                  <span className="product-qty">x{product.quantity}</span>
                  <span className="product-price">${product.total.toLocaleString('es-CL')}</span>
                </li>
              ))}
            </ul>
            <p className="purchase-total"><strong>Total:</strong> ${selectedPurchase.total.toLocaleString('es-CL')}</p>
          </div>
        ) : (
          <div className="purchase-details-placeholder">
            <p>Selecciona una compra para ver los detalles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
