import { useEffect, useRef, useState } from 'react';
import { useFavoriteCart } from '../context/FavoriteCartContext';
import type { Product } from '../types';
import axios from 'axios';

interface RecommendationGroups {
  most: Product[];
  regular: Product[];
  occasional: Product[];
}

const FavoriteCartPage = () => {
  const userId = localStorage.getItem('userId');
  const {
    favorites,
    fetchFavorites,
    addFavorite,
    updateFavoriteQuantity,
    removeFavorite
  } = useFavoriteCart();

  const fetchOnce = useRef(false);
  const [recommended, setRecommended] = useState<RecommendationGroups>({
    most: [],
    regular: [],
    occasional: []
  });
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!userId || fetchOnce.current) return;

      await fetchFavorites(Number(userId));

      // Cargar productos recomendados
      const res = await axios.get(`http://localhost:3000/api/recommendation/${userId}`);
      const recommendedData: RecommendationGroups = res.data;
      setRecommended(recommendedData);
      console.log('Productos recomendados:', recommendedData);

      // Cargar todos los productos
      const productRes = await axios.get(`http://localhost:3000/api/products`);
      const all = productRes.data;
      console.log('Todos los productos:', all);

      // Filtrar productos que no están en recomendados
      const recommendedIds = new Set([
        ...recommendedData.most.map(p => p.id),
        ...recommendedData.regular.map(p => p.id),
        ...recommendedData.occasional.map(p => p.id)
      ]);

      const filtered = all.filter((product: Product) => !recommendedIds.has(product.id));
      console.log('Productos filtrados:', filtered);

      setAllProducts(filtered);
      fetchOnce.current = true;
    };

    loadData();
  }, [userId]);

  const renderGroup = (title: string, products: Product[], color: string) => (
    <div className={`mb-6 p-4 rounded shadow-sm border-l-4 ${color}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">Sin productos en esta categoría.</p>
      ) : (
        <ul className="list-disc list-inside">
          {products.map((product) => (
            <li key={product.id} className="mb-3">
              <div className="font-semibold">{product.name}</div>
              <div>Marca: {product.brand}</div>
              <div>Precio: ${Number(product.price).toLocaleString()}</div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const safeProduct = { ...product };
                  addFavorite(Number(userId), safeProduct, 1);
                  console.log("Agregando:", product.id, product.name);
                }}
                className="bg-green-600 text-white px-3 py-1 rounded mt-2"
              >
                Agregar al carro favorito
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const groupedFavorites = favorites.reduce((acc, item) => {
    const key = item.id;
    const price = Number(item.price);
    acc[key] = {
      ...item,
      price,
      total: price * item.quantity,
    };
    return acc;
  }, {} as Record<number, typeof favorites[0]>);

  const totalItems = Object.values(groupedFavorites).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(groupedFavorites).reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <section>
        <h2 className="text-xl font-bold mb-4">🛒 Tu Carro Favorito</h2>
        {Object.values(groupedFavorites).length === 0 ? (
          <p>No has agregado productos favoritos aún.</p>
        ) : (
          <>
            <ul>
              {Object.values(groupedFavorites).map((item) => (
                <li key={item.id} className="border p-2 mb-2 rounded">
                  <div className="font-semibold">{item.name}</div>
                  <div>Marca: {item.brand}</div>
                  <div>Cantidad: {item.quantity}</div>
                  <div>Precio: ${Number(item.price).toLocaleString()}</div>
                  <div>Total: ${Number(item.total).toLocaleString()}</div>
                  <button
                    onClick={() => updateFavoriteQuantity(item.id, item.quantity + 1)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    ➕
                  </button>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-4 bg-gray-100 rounded border">
              <p className="font-semibold">Total productos: {totalItems}</p>
              <p className="font-semibold">Costo total del carro: ${totalPrice.toLocaleString()}</p>
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">✨ Recomendados por tu historial</h2>
        {renderGroup('🟢 Más comprados', recommended.most, 'border-green-400 bg-green-50')}
        {renderGroup('🟡 Comprados regularmente', recommended.regular, 'border-yellow-400 bg-yellow-50')}
        {renderGroup('🔵 Comprados ocasionalmente', recommended.occasional, 'border-blue-400 bg-blue-50')}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">🧺 Productos disponibles</h2>
        {allProducts.length === 0 ? (
          <p className="text-sm text-gray-500">No hay más productos disponibles.</p>
        ) : (
          <ul className="list-disc list-inside">
            {allProducts.map((product) => (
              <li key={product.id} className="mb-3">
                <div className="font-semibold">{product.name}</div>
                <div>Marca: {product.brand}</div>
                <div>Precio: ${Number(product.price).toLocaleString()}</div>
                <button
                  onClick={() => addFavorite(Number(userId), { ...product }, 1)}
                  className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
                >
                  Agregar al carro favorito
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default FavoriteCartPage;
