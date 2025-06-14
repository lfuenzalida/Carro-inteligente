const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const favoriteCartRoutes = require('./routes/favoriteCart.routes');
const generatedCartRoutes = require('./routes/generatedCart.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const recommendationRoutes = require('./routes/recommendation.routes');



app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favoriteCart', favoriteCartRoutes);
app.use('/api/generatedCart', generatedCartRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/recommendation', recommendationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
