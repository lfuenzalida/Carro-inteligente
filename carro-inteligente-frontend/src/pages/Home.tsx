import React from 'react';
import { useSmartCart } from '../context/SmartCartContext';
import Button from '../components/ui/Button';

const Home = () => {
  const { cart, total, budgetLimit, isOverBudget, updateBudgetLimit } = useSmartCart();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      {/* Título principal */}
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">🛒 Bienvenido a tu Carro Inteligente</h1>
        <p className="mt-2 text-gray-500 text-sm md:text-base">Organiza tus compras de forma inteligente, rápida y económica</p>
      </section>

      {/* Presupuesto */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">💰 Presupuesto Máximo</h2>
            <p className="text-2xl font-bold text-green-600">${budgetLimit.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">🧾 Total Actual</h2>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>${total.toLocaleString('es-CL')}</p>
            {isOverBudget && <p className="text-sm mt-1 text-red-500">⚠️ Has excedido tu presupuesto</p>}
          </div>
        </div>
      </section>

      {/* Carro Inteligente */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🧠 Sugerencias del Carro Inteligente</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cart.length === 0 ? (
            <p className="text-gray-500 italic col-span-full">Aún no hay sugerencias generadas</p>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-white shadow rounded-xl overflow-hidden">
                <div className="h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Imagen</span>
                </div>
                <div className="p-4">
                  <h3 className="text-md font-bold text-gray-700">{item.product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Precio: ${item.product.price.toLocaleString('es-CL')}</p>
                  <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Productos disponibles */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🛍️ Productos disponibles</h2>
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500 italic">
          Aquí aparecerán productos disponibles no incluidos en el carro inteligente
        </div>
      </section>

      {/* Botón de acción */}
      <section className="text-center">
        <Button className="text-base px-6 py-3">⭐ Cargar Carro Favorito</Button>
      </section>
    </div>
  );
};

export default Home;