const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas

const productoRoutes = require('./routes/producto');
const ventaRoutes = require('./routes/venta');
const usuarioRoutes = require('./routes/usuario');

app.use('/productos', productoRoutes);
app.use('/ventas', ventaRoutes);
app.use('/usuarios', usuarioRoutes);

// Vista principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
