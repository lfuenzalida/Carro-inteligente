import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <main>
      {/* Título */}
      <h1>Bienvenido</h1>

      {/* Botones circulares */}
      <div className="options-container">
        <div className="circle-btn" onClick={() => navigate('/productos')}>
          Produtos
        </div>

        <div className="circle-btn" onClick={() => navigate('/favoritos')}>
          Carro Favorito
        </div>
      </div>
    </main>
  );
};

export default Home;

