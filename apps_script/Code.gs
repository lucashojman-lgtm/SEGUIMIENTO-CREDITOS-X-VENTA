/************************************************************************
 * GENERADOR AUTOMÁTICO DEL DASHBOARD — World Salud
 * ----------------------------------------------------------------------
 * Este script vive DENTRO de la planilla (Extensiones > Apps Script).
 * Corre solo todos los VIERNES a las 19 hs y crea en Google Drive un
 * archivo  DSH_SEGUIMIENTO_CLIENTES_WS_<fecha>.html  con los datos al día.
 *
 * INSTALACIÓN (una sola vez): ver README, sección "Carga automática".
 ************************************************************************/

// ====================== CONFIGURACIÓN ======================
// ID del archivo plantilla_dashboard.html subido a tu Google Drive.
// (Abrí la plantilla en Drive, "Compartir > Copiar vínculo": el ID es el
//  texto largo entre /d/ y /view).
var TEMPLATE_FILE_ID = 'PEGAR_AQUI_EL_ID_DE_plantilla_dashboard.html';

// Carpeta de Drive donde guardar los dashboards generados.
// Dejar '' para usar la misma carpeta donde está la planilla.
var OUTPUT_FOLDER_ID = '1VQPKig0A1YeBppDXYOYcvJWgfxIa5oax';

var TZ = 'America/Argentina/Buenos_Aires';
var MES_ABR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
// ===========================================================


/** Crea el disparador semanal: viernes 19 hs. Ejecutar UNA vez a mano. */
function instalarDisparadorSemanal() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'generarDashboard') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('generarDashboard')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(19)
    .nearMinute(0)
    .create();
  SpreadsheetApp.getActive().toast('Disparador instalado: viernes 19 hs');
}


/** Función principal (la que dispara el trigger). */
function generarDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tb = ss.getSheetByName('Tableros').getDataRange().getValues();
  var fc = ss.getSheetByName('Factura a cobrar').getDataRange().getValues();

  var fact = parseFacturacion(tb);
  var meses = fact.meses;
  var cobr = parseIngresos(tb, meses);
  var antic = parseAnticuacion(tb);
  var pend = parsePendientes(fc);

  var hoy = new Date();
  var datos = construirDatos(meses, fact.data, cobr, antic, pend.lista, pend.proj, hoy);

  var plantilla = DriveApp.getFileById(TEMPLATE_FILE_ID).getBlob().getDataAsString('UTF-8');
  var html = plantilla.replace('/*__DATOS_AUTOGENERADOS__*/', datos);

  var nombre = 'DSH_SEGUIMIENTO_CLIENTES_WS_' + Utilities.formatDate(hoy, TZ, 'ddMMyyyy') + '.html';
  var carpeta = OUTPUT_FOLDER_ID
    ? DriveApp.getFolderById(OUTPUT_FOLDER_ID)
    : DriveApp.getFileById(ss.getId()).getParents().next();

  // si ya existe uno con el mismo nombre (mismo día), reemplazarlo
  var existentes = carpeta.getFilesByName(nombre);
  while (existentes.hasNext()) existentes.next().setTrashed(true);

  carpeta.createFile(nombre, html, MimeType.HTML);
  Logger.log('Generado: ' + nombre + ' en ' + carpeta.getName());
}


// ====================== PARSERS ======================
function esFecha(v) { return Object.prototype.toString.call(v) === '[object Date]'; }
function num(v) { return (typeof v === 'number') ? v : 0; }
function r2(n) { return Math.round(n * 100) / 100; }

function parseFacturacion(V) {
  var hdr = -1;
  for (var r = 0; r < V.length; r++) if (String(V[r][0]).trim() === 'Tipo de Servicio') { hdr = r; break; }
  var cols = [], totalCol = -1;
  for (var c = 2; c < V[hdr].length; c++) {
    if (esFecha(V[hdr][c])) cols.push({ c: c, m: V[hdr][c].getMonth() + 1 });
    else if (String(V[hdr][c]).trim().indexOf('Suma total') === 0) totalCol = c;
  }
  var meses = cols.map(function (x) { return MES_ABR[x.m - 1]; });
  var data = {};
  for (var r = hdr + 1; r < V.length; r++) {
    var a = String(V[r][0] || '').trim(), b = String(V[r][1] || '').trim();
    if (a.indexOf('Suma total') === 0) break;
    if (!b) continue;
    var vals = cols.map(function (x) { return r2(num(V[r][x.c])); });
    if (totalCol >= 0 && vals.length) {
      var resid = r2(num(V[r][totalCol]) - vals.reduce(function (s, n) { return s + n; }, 0));
      if (Math.abs(resid) > 1) vals[vals.length - 1] = r2(vals[vals.length - 1] + resid);
    }
    data[b] = vals;
  }
  return { meses: meses, data: data };
}

function parseIngresos(V, meses) {
  var hdr = -1;
  for (var r = 0; r < V.length; r++)
    if (String(V[r][0]).trim() === 'Cliente' && String(V[r][1] || '').trim().indexOf('N') === 0) { hdr = r; break; }
  var cols = [];
  for (var c = 2; c < V[hdr].length; c++) if (esFecha(V[hdr][c])) cols.push({ c: c, m: V[hdr][c].getMonth() + 1 });
  var data = {};
  for (var r = hdr + 1; r < V.length; r++) {
    var a = String(V[r][0] || '').trim();
    if (a.indexOf('Suma total') === 0) break;
    if (!a) continue;
    var cli = a.indexOf('Total ') === 0 ? a.substring(6) : a;
    var arr = []; for (var i = 0; i < meses.length; i++) arr.push(0);
    cols.forEach(function (x) {
      var lab = MES_ABR[x.m - 1], idx = meses.indexOf(lab);
      if (idx >= 0) arr[idx] = r2(num(V[r][x.c]));
    });
    data[cli] = arr;
  }
  return data;
}

function parseAnticuacion(V) {
  var hdr = -1;
  for (var r = 0; r < V.length; r++)
    if (String(V[r][2]).trim() === '1-30' && String(V[r][3]).trim() === 'Corriente') { hdr = r; break; }
  var data = {}, cli = null;
  for (var r = hdr + 1; r < V.length; r++) {
    var a = String(V[r][0] || '').trim();
    if (a.indexOf('Suma total') === 0) break;
    if (a) cli = a;
    if (!cli) continue;
    if (!data[cli]) data[cli] = { corr: 0, b1_30: 0 };
    data[cli].b1_30 += num(V[r][2]);
    data[cli].corr += num(V[r][3]);
  }
  var out = {};
  for (var k in data) if (data[k].corr || data[k].b1_30) out[k] = { corr: r2(data[k].corr), b1_30: r2(data[k].b1_30) };
  return out;
}

function parsePendientes(V) {
  var lista = [], proj = [];
  for (var r = 1; r < V.length; r++) {
    var a = String(V[r][0] || '').trim();
    if (a.indexOf('Semana') === 0) { proj.push({ sem: a.replace('Semana', '').replace('de ', '').trim(), val: r2(num(V[r][1])) }); continue; }
    if (!a || a.indexOf('Total') === 0) continue;
    if (typeof V[r][2] !== 'number') continue;
    lista.push({
      cli: a,
      fc: String(V[r][1] || '').trim(),
      sin: r2(num(V[r][2])), iva: r2(num(V[r][3])), total: r2(num(V[r][4])),
      venc: esFecha(V[r][5]) ? V[r][5] : null,
      est: r2(num(V[r][6])),
      prob: esFecha(V[r][7]) ? V[r][7] : null,
      pct: r2(num(V[r][8]) * 100),
      mail: String(V[r][9] || '').trim()
    });
  }
  return { lista: lista, proj: proj };
}


// ====================== EMISIÓN DEL BLOQUE JS ======================
function jsDate(d) {
  if (!d || d.getFullYear() < 2000) return 'null';
  return 'new Date(' + d.getFullYear() + ',' + d.getMonth() + ',' + d.getDate() + ')';
}
function jsStr(s) { return JSON.stringify(String(s)); }

function construirDatos(meses, fact, cobr, antic, pend, proj, fecha) {
  function dictArr(o) {
    var p = []; for (var k in o) p.push('  ' + jsStr(k) + ': ' + JSON.stringify(o[k]));
    return '{\n' + p.join(',\n') + '\n}';
  }
  function pendStr(arr) {
    return '[\n' + arr.map(function (p) {
      var prob = (!p.prob || p.prob.getFullYear() < 2000) ? '—'
        : Utilities.formatDate(p.prob, TZ, 'dd/MM/yy');
      return '  {cli:' + jsStr(p.cli) + ', fc:' + jsStr(p.fc) + ', sin:' + p.sin + ', iva:' + p.iva +
        ', total:' + p.total + ', venc:' + jsDate(p.venc) + ', est:' + p.est +
        ', prob:' + jsStr(prob) + ', pct:' + p.pct + ', mail:' + jsStr(p.mail) + '}';
    }).join(',\n') + '\n]';
  }
  function anticStr(o) {
    var p = []; for (var k in o) p.push('  ' + jsStr(k) + ': {corr:' + o[k].corr + ', b1_30:' + o[k].b1_30 + '}');
    return '{\n' + p.join(',\n') + '\n}';
  }
  return 'const REPORT_DATE = new Date(' + fecha.getFullYear() + ',' + fecha.getMonth() + ',' + fecha.getDate() + ');\n' +
    'const MESES = ' + JSON.stringify(meses) + ';\n' +
    'const FACT = ' + dictArr(fact) + ';\n' +
    'const COBR = ' + dictArr(cobr) + ';\n' +
    'const PENDING = ' + pendStr(pend) + ';\n' +
    'const ANTIC = ' + anticStr(antic) + ';\n' +
    'const PROJ = ' + JSON.stringify(proj) + ';';
}
