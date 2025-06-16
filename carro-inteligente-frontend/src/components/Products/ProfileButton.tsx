// src/components/ProfileButton.tsx
import { useState, useRef, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const ProfileButton = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-dropdown-container" ref={ref}>
      <button className="side-button left" onClick={() => setOpen(!open)}>
        <CgProfile size={40} />
      </button>

      {open && (
        <div className="profile-dropdown">
          <ul>
            <li onClick={() => navigate('/favoritos')}>Carro Favorito</li>
            <li onClick={() => navigate('/historial-compras')}>Historial de Compras</li>
            <li onClick={() => navigate('/perfil')}>Gestionar Usuario</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
