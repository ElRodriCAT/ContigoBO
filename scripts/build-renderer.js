const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const srcPublic = path.join(root, 'src', 'public');
  const srcViews = path.join(root, 'src', 'views');
  const out = path.join(root, 'build', 'public');

  // limpiar carpeta build/public
  await fs.remove(out);
  await fs.ensureDir(out);

  // copiar assets estáticos (css, img, fonts)
  const staticDirs = ['css', 'img', 'fonts'];
  for (const d of staticDirs) {
    const src = path.join(srcPublic, d);
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(out, d));
    }
  }

  // copiar vendor y librerías estáticas si existen
  if (await fs.pathExists(path.join(srcPublic, 'vendor'))) {
    await fs.copy(path.join(srcPublic, 'vendor'), path.join(out, 'vendor'));
  }

  // bundlear js (toma todos los archivos de src/public/js y los bundlea en uno)
  const jsDir = path.join(srcPublic, 'js');
  if (await fs.pathExists(jsDir)) {
    await fs.ensureDir(path.join(out, 'js'));
    const jsFiles = await fs.readdir(jsDir);
    for (const f of jsFiles) {
      const full = path.join(jsDir, f);
      if (!f.endsWith('.js')) continue;
      const outFile = path.join(out, 'js', f);
      try {
        await esbuild.build({
          entryPoints: [full],
          bundle: true,
          minify: true,
          sourcemap: false,
          outfile: outFile,
          platform: 'browser',
          target: ['chrome58']
        });
      } catch (err) {
        // If bundling fails for some file, fallback to copy
        await fs.copy(full, outFile);
      }
    }
  }

  // renderizar vistas EJS a HTML (index y estadisticas)
  const viewsToRender = ['index.ejs', 'estadisticas.ejs', 'productos.ejs', 'ventas.ejs'];
  for (const v of viewsToRender) {
    const viewPath = path.join(srcViews, v);
    if (!await fs.pathExists(viewPath)) continue;
    const template = await fs.readFile(viewPath, 'utf8');

    // Data mínimo para render (evita fallas si controller no está disponible en build)
    const data = { estadisticas: {
      ventasDiarias: [], ventasMensuales: [], ventasAnuales: [], productosPopulares: [], totalVentas:0, ingresoTotal:0, ventasHoy:0
    }};

    const html = ejs.render(template, data, {async:false, views: [srcViews]});
    const outFile = path.join(out, v.replace('.ejs', '.html'));
    await fs.outputFile(outFile, html, 'utf8');
  }

  console.log('Renderer build complete. Output:', out);
})();
