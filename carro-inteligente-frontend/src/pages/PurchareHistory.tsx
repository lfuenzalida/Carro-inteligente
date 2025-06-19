// src/pages/PurchaseHistory.tsx
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { PurchaseRecord, GroupedPurchase } from '../types';
import PurchaseCard from '../components/PurchaseCard';
import { groupPurchasesByOrder } from '../utils/purchaseUtils';

const PurchaseHistory = () => {
  const userId = localStorage.getItem('userId');
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`/api/purchase/${userId}`);
        setPurchases(res.data);
      } catch (err) {
        console.error('Error al obtener historial de compras:', err);
      }
    };
    fetchPurchaseHistory();
  }, [userId]);

  // Agrupamos las compras por fecha y hora
  const groupedPurchases = useMemo(() => groupPurchasesByOrder(purchases), [purchases]);

  return (
    <div className="purchase-history-page">
      <h1>🧾 Historial de Compras</h1>
      {groupedPurchases.length === 0 ? (
        <p>No hay compras registradas.</p>
      ) : (
        groupedPurchases.map((purchase, idx) => (
          <PurchaseCard key={idx} purchase={purchase} userId={userId!} />
        ))
      )}
    </div>
  );
};

export default PurchaseHistory;
