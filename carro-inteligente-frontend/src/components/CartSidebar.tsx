// src/components/CartSidebar.tsx
import React, { useState, useEffect } from 'react';
import { useSmartCart } from '../context/SmartCartContext';
import { FaShoppingCart, FaEdit } from 'react-icons/fa';

const CartSidebar = () => {

  const { cart, total, budgetLimit, isOverBudget, removeFromCart, updateBudgetLimit, decreaseQuantity } = useSmartCart();
  const [isOpen, setIsOpen] = useState(false);
  const [newLimit, setNewLimit] = useState(() => {
  const stored = localStorage.getItem('budgetLimit');
  return stored ? stored : '0';
});
  const [showBudgetPrompt, setShowBudgetPrompt] = useState(true);
  const [budgetActive, setBudgetActive] = useState(() => budgetLimit > 0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showOverBudgetPopup, setShowOverBudgetPopup] = useState(false);
  const [hasSeenOverBudget, setHasSeenOverBudget] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

   const handleBudgetChange = () => {
    const parsed = parseFloat(newLimit);
    if (!isNaN(parsed)) {
      updateBudgetLimit(parsed);
      setShowBudgetModal(false);
      setBudgetActive(true);
      setHasSeenOverBudget(false);
    }
  };

  const handleActivateBudget = () => {
    setShowBudgetModal(true);
    setShowBudgetPrompt(false);
  };

  const handleDeclineBudget = () => {
    setBudgetActive(false);
    setShowBudgetPrompt(false);
  };

   useEffect(() => {
    const stored = localStorage.getItem('budgetLimit');
    if (!stored) {
      localStorage.setItem('budgetLimit', '0');
      updateBudgetLimit(0);
    }
  }, []);

  useEffect(() => {
  if (
    budgetLimit > 0 &&
    total > budgetLimit &&
    !showOverBudgetPopup &&
    !hasSeenOverBudget
  ) {
    setShowOverBudgetPopup(true);
    setHasSeenOverBudget(true);
  }
}, [total, budgetLimit, showOverBudgetPopup, hasSeenOverBudget]);

  const handleManageCart = () => {
    setShowOverBudgetPopup(false);
    setIsOpen(true);
    setHasSeenOverBudget(true); // permite que vuelva a mostrarse si vuelve a exceder
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1001,
          background: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
      >
        <FaShoppingCart size={20} />
      </button>

      {/* Overlay sidebar */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          right: isOpen ? 0 : '-320px',
          top: 0,
          height: '100vh',
          width: '300px',
          background: '#f8f9fa',
          borderLeft: '1px solid #ccc',
          display: 'flex',
          flexDirection: 'column',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1002
        }}
      >
        <div style={{
          padding: '1rem',
          background: '#f8f9fa',
          borderBottom: '1px solid #ccc',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <h2>🛒 Carro Inteligente</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {cart.length === 0 ? (
            <p>Tu carro está vacío</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.id} style={{ marginBottom: '1rem' }}>
                  <strong>{item.name}</strong><br />
                  {item.quantity} x ${item.price.toLocaleString()}<br />
                  <em>Subtotal:</em> ${item.subtotal.toLocaleString()}<br />
                  <div>
                    <button onClick={() => decreaseQuantity(item.id)}>➖</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '0.5rem' }}>❌</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{
          padding: '1rem',
          borderTop: '1px solid #ccc',
          background: '#f8f9fa',
          position: 'sticky',
          bottom: 0
        }}>
          <p><strong>Total:</strong> ${total.toLocaleString()}</p>

          {showBudgetPrompt && (
            <div style={{ marginTop: '1rem' }}>
              <p>¿Deseas activar el control de presupuesto?</p>
              <button onClick={handleActivateBudget} style={{ marginRight: '0.5rem' }}>Sí</button>
              <button onClick={handleDeclineBudget}>No</button>
            </div>
          )}

          {!showBudgetPrompt && budgetLimit > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Presupuesto:</strong> ${budgetLimit.toLocaleString()}&nbsp;
                <button onClick={() => setShowBudgetModal(true)} style={{ fontSize: '0.8rem' }}><FaEdit /></button>
              </p>
              {isOverBudget && <p style={{ color: 'red' }}>⚠ Presupuesto excedido</p>}
            </div>
          )}
        </div>

        {showBudgetModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}
          >
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '320px' }}>
              <h3>Editar presupuesto</h3>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="Nuevo presupuesto"
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
              <button onClick={handleBudgetChange} style={{ marginTop: '0.5rem' }}>Guardar</button>
              <button onClick={() => setShowBudgetModal(false)} style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>Cancelar</button>
            </div>
          </div>
        )}

        {showOverBudgetPopup && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001
            }}
          >
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '320px' }}>
              <h3>Presupuesto excedido</h3>
              <p>Has sobrepasado tu presupuesto actual.</p>
              <button onClick={handleManageCart} style={{ marginTop: '1rem' }}>Gestionar carro</button>
              <button
                    onClick={() => {
                      setShowOverBudgetPopup(false);
                      setHasSeenOverBudget(true); // 👈 evita que se vuelva a mostrar
                    }}
                    style={{ marginTop: '1rem', marginLeft: '1rem' }}
                  >
                    Seguir comprando
                  </button>

            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;
