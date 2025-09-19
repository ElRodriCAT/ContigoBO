const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const productoRoutes = require('./routes/producto');
const ventaRoutes = require('./routes/venta');
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

// Vista principal y otras vistas

app.get(['/', '/index.html'], (req, res) => {
  res.render('index');
});


const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

app.get(['/productos', '/productos.html'], async (req, res) => {
  const productos = await prisma.producto.findMany();
  res.render('productos', { productos });
});


app.get(['/ventas', '/ventas.html'], async (req, res) => {
  const ventas = await prisma.venta.findMany({ 
    include: { 
      detalles: { 
        include: { 
          producto: true 
        } 
      } 
    } 
  });
  const productos = await prisma.producto.findMany();
  res.render('ventas', { ventas, productos });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
