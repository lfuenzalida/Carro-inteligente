// src/utils/purchaseUtils.ts
import type { PurchaseRecord, GroupedPurchase, ProductSummary } from '../types';

/**
 * Agrupa las compras por pedido (usando la fecha y hora del `purchased_at`)
 * Asumimos que cada `purchased_at` es único por transacción.
 */
export function groupPurchasesByOrder(records: PurchaseRecord[]): GroupedPurchase[] {
  const groupedMap = new Map<string, ProductSummary[]>();

  for (const record of records) {
    const dateKey = record.purchased_at;

    const parsedPrice = typeof record.price === 'string' ? parseFloat(record.price) : record.price;
    const parsedQuantity = typeof record.quantity === 'string' ? parseInt(record.quantity) : record.quantity;
    const parsedTotal = parsedPrice * parsedQuantity;

    const existing = groupedMap.get(dateKey) || [];

    // Si ya existe un producto con el mismo nombre, acumula cantidad y total
    const existingIndex = existing.findIndex(p => p.name === record.name);
    if (existingIndex !== -1) {
      existing[existingIndex].quantity += parsedQuantity;
      existing[existingIndex].total += parsedTotal;
    } else {
      existing.push({
        id: record.product_id,
        name: record.name || 'Producto desconocido',
        quantity: parsedQuantity,
        price: parsedPrice,
        total: parsedTotal
      });
    }

    groupedMap.set(dateKey, existing);
  }

  const result: GroupedPurchase[] = [];

  for (const [timestamp, products] of groupedMap.entries()) {
    const total = products.reduce((sum, p) => sum + (p.total || 0), 0);
    result.push({ timestamp, products, total });
  }

  // Ordenar descendente por fecha
  result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return result;
}

// Utilidad para agrupar productos por nombre y sumar cantidades
export function groupProductsByName(products: ProductSummary[]) {
  const grouped: Record<string, { quantity: number; total: number; price: number }> = {};

  for (const p of products) {
    if (!grouped[p.name]) {
      grouped[p.name] = {
        quantity: p.quantity,
        total: p.total,
        price: p.price
      };
    } else {
      grouped[p.name].quantity += p.quantity;
      grouped[p.name].total += p.total;
    }
  }

  return Object.entries(grouped).map(([name, data]) => ({
    name,
    quantity: data.quantity,
    total: data.total,
    price: data.price,
    id: undefined
  }));
}
