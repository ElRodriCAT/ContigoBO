const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const estadisticaController = require('../src/controllers/estadisticaController');

// Llamar al controlador y capturar la render
const req = {};
const res = {
  render: (view, data) => {
    const file = path.join(__dirname, '..', 'src', 'views', view + '.ejs');
    ejs.renderFile(file, data, {}, (err, str) => {
      if (err) {
        console.error('Error renderizando EJS:', err);
        process.exit(1);
      }
      const out = path.join(__dirname, 'temp_estadisticas_render.html');
      fs.writeFileSync(out, str, 'utf8');
      console.log('HTML renderizado guardado en:', out);
      // Mostrar fragmentos alrededor de .card-header occurrences
      const matches = [...str.matchAll(/(<div class="card-header">[\s\S]*?<\/div>)/g)];
      if (matches.length === 0) {
        console.log('No se encontraron <div class="card-header"> en el HTML renderizado');
      } else {
        console.log('Encontradas', matches.length, 'card-header. Mostrando primera:');
        console.log(matches[0][1].slice(0, 1000));
      }
      process.exit(0);
    });
  },
  status: (code) => ({ send: (msg) => { console.error('Error', code, msg); process.exit(1); } })
};

estadisticaController.obtenerEstadisticas(req, res).catch(err => { console.error(err); process.exit(1); });
