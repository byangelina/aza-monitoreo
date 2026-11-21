const fs = require('node:fs');
const path = require('node:path');
const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const map = createCoverageMap({});
let count = 0;
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.name === 'coverage.json') { map.merge(JSON.parse(fs.readFileSync(file, 'utf8'))); count++; }
  }
}
visit(path.resolve('test-results'));
// Vite serves CSS through JavaScript wrappers; those are not JavaScript source coverage.
map.filter(file => /\.[cm]?[jt]sx?$/.test(file));
if (!count || !map.files().length) throw Error('No se encontró cobertura real del navegador.');
const context = createContext({ dir: 'coverage/browser', coverageMap: map });
reports.create('lcovonly').execute(context);
reports.create('text-summary').execute(context);
console.log(`Cobertura combinada de ${count} pruebas; ${map.files().length} archivos.`);
