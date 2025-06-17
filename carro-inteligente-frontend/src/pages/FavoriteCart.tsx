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
  const [view, setView] = useState<'recommended' | 'catalog'>('recommended');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!userId || fetchOnce.current) return;

      await fetchFavorites(Number(userId));

      const res = await axios.get(`http://localhost:3000/api/recommendation/${userId}`);
      const recommendedData: RecommendationGroups = res.data;
      setRecommended(recommendedData);

      const productRes = await axios.get(`http://localhost:3000/api/products`);
      const all = productRes.data;

      const recommendedIds = new Set([
        ...recommendedData.most.map(p => p.id),
        ...recommendedData.regular.map(p => p.id),
        ...recommendedData.occasional.map(p => p.id)
      ]);

      const filtered = all.filter((product: Product) => !recommendedIds.has(product.id));
      setAllProducts(filtered);

      fetchOnce.current = true;
    };

    loadData();
  }, [userId]);

  const toggleSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleAddSelected = () => {
    const productsToAdd =
      view === 'recommended'
        ? [...recommended.most, ...recommended.regular, ...recommended.occasional].filter(p => selectedProducts.includes(p.id))
        : allProducts.filter(p => selectedProducts.includes(p.id));

    productsToAdd.forEach(product => addFavorite(Number(userId), product, 1));
    setSelectedProducts([]);
  };

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
    <div className="favorite-cart-page">
      <div className="top-bar">
        <div className="left">
          <div className="icon-button">&#8592;</div>
        </div>
        <div className="page-title">Configurando tu carro favorito</div>
        <div className="right">
          <div className="icon-button" onClick={() => setView('recommended')}>🤖</div>
          <div className="icon-button" onClick={() => setView('catalog')}>🛒</div>
        </div>
      </div>

     <div className="favorite-cart-grid">
        <div className="left-column">
          <section className="section-box">
            <div className="section-header">
              <h2>🛒 Tu Carro Favorito</h2>
            </div>
            {Object.values(groupedFavorites).length === 0 ? (
              <p>No has agregado productos favoritos aún.</p>
            ) : (
              <ul>
                {Object.values(groupedFavorites).map((item) => (
                  <li key={item.id} className="product-item">
                    <div className="title">{item.name}</div>
                    <div>Marca: {item.brand}</div>
                    <div>Cantidad: {item.quantity}</div>
                    <div>Precio: ${Number(item.price).toLocaleString()}</div>
                    <div>Total: ${Number(item.total).toLocaleString()}</div>
                    <div className="actions">
                      <button className="btn btn-add" onClick={() => updateFavoriteQuantity(item.id, item.quantity + 1)}>➕</button>
                      <button className="btn btn-remove" onClick={() => removeFavorite(item.id)}>🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="summary-box">
            <p>Total productos: {totalItems}</p>
            <p>Costo total del carro: ${totalPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="right-column">
          <section className="section-box">
            <div className="section-header">
              <h2>{view === 'recommended' ? '✨ Recomendados por tu historial' : '🧺 Productos disponibles'}</h2>
            </div>
            <ul>
              {(view === 'recommended'
                ? [...recommended.most, ...recommended.regular, ...recommended.occasional]
                : allProducts
              ).map((product) => (
                <li key={product.id} className="product-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelection(product.id)}
                    />{' '}
                    <span className="title">{product.name}</span>
                  </label>
                  <div>Marca: {product.brand}</div>
                  <div>Precio: ${Number(product.price).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </section>
          {selectedProducts.length > 0 && (
            <button className="add-button" onClick={handleAddSelected}>
              Agregar al carro favorito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoriteCartPage;
