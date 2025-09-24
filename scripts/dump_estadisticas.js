const estadisticaController = require('../src/controllers/estadisticaController');

// Mock req/res
const req = {};
const res = {
  render: (view, data) => {
    console.log('VIEW:', view);
    console.log('ESTADISTICAS KEYS:', Object.keys(data.estadisticas));
    console.log('ventasDiarias length:', data.estadisticas.ventasDiarias.length);
    console.log('ventasDiarias sample:', data.estadisticas.ventasDiarias.slice(0,10));
    console.log('ventasMensuales length:', data.estadisticas.ventasMensuales.length);
    console.log('ventasMensuales sample:', data.estadisticas.ventasMensuales.slice(0,10));
    process.exit(0);
  },
  status: (code) => ({ send: (msg) => { console.error('Error', code, msg); process.exit(1); } })
};

estadisticaController.obtenerEstadisticas(req, res).catch(err => { console.error(err); process.exit(1); });
