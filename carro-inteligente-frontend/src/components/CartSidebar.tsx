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

 const syncCartToServer = async (): Promise<boolean> => {
  const userId = localStorage.getItem('userId');
  if (!userId) return false;

  try {
    const responses = await Promise.all(
      cart.map(async (item) => {
        const res = await fetch(`http://localhost:3000/api/generatedCart/add/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
            source: 'history'
          })
        });

        const data = await res.json();
        console.log('<-----datos enviados al servidor------>');
        console.log(res);

        if (!res.ok) {
          console.error('❌ Error al guardar producto:', data.error || data.message);
          return false;
        }

        console.log('✅ Producto guardado:', data);
        return true;
      })
    );

    // Verifica si todos los inserts fueron exitosos
    return responses.every(r => r === true);

  } catch (err) {
    console.error('❌ Error general en syncCartToServer:', err);
    return false;
  }
};

const handleConfirmPurchase = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return alert("Debes iniciar sesión");

  const synced = await syncCartToServer();
  if (!synced) {
    return alert("❌ Error al sincronizar productos antes de confirmar compra.");
  }

  try {
    const res = await fetch(`http://localhost:3000/api/purchase/${userId}`, {
      method: 'POST'
    });

    if (res.ok) {
      alert("✅ Compra registrada exitosamente");
      window.location.reload();
    } else {
      const data = await res.json();
      alert(`❌ Error al confirmar: ${data.message || 'intenta nuevamente'}`);
    }
  } catch (err) {
    console.error("Error al confirmar compra", err);
    alert("❌ Ocurrió un error inesperado");
  }
};

const { fetchSmartCart } = useSmartCart(); // 👈 asegúrate de que esté en tu contexto

const loadFavoritesToSmartCart = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return alert("Debes iniciar sesión");

  try {
    const res = await fetch(`http://localhost:3000/api/generatedCart/from-favorites/${userId}`, {
      method: 'POST'
    });

    const data = await res.json();

    if (res.ok) {
      await fetchSmartCart(Number(userId)); // ✅ actualiza el carrito en estado
      setIsOpen(true); // ✅ abre el sidebar para mostrarlo
    } else {
      alert(`❌ Error al cargar favoritos: ${data.error || 'intenta nuevamente'}`);
    }
  } catch (err) {
    console.error("❌ Error al cargar favoritos:", err);
    alert("Ocurrió un error inesperado");
  }
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
          <h2>🛒 Carro de compras</h2>
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
          <button
          onClick={loadFavoritesToSmartCart}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#6f42c1',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Cargar carro favorito
        </button>
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
            {cart.length > 0 && (
      <div style={{ padding: '1rem', borderTop: '1px solid #ccc' }}>
        
        <button
          onClick={handleConfirmPurchase}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Confirmar compra
        </button>

        
      </div>
    )}

    


      </aside>
    </>
  );
};

export default CartSidebar;
