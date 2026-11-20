/* Panel de administración — Tarjetas virtuales PROINVERSIÓN (prototipo).
   En producción los datos vienen del servidor (PHP + MySQL). Aquí se guardan en el navegador
   (localStorage) y las estadísticas se SIMULAN para poder ver la interfaz. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CLAVE = 'proto-admin-v1';
  const RAIZ = '../';
  const URL_BASE = 'https://www.investinperu.pe/tarjeta/';
  const DIA = 864e5;
  const HOY = new Date(); HOY.setHours(0, 0, 0, 0);
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('es-PE');
  const pct = (a, b) => b ? (a / b * 100) : 0;
  const fmtPct = n => n.toLocaleString('es-PE', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' %';
  const fmtFecha = d => { d = new Date(d); return d.getDate() + ' ' + MESES[d.getMonth()]; };
  const fmtFechaHora = d => { d = new Date(d); return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear() + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const nombreDe = t => (t.nombres + ' ' + t.apellidos).trim();
  const corto = t => (t.nombres.split(' ')[0] + ' ' + t.apellidos.split(' ')[0]).trim();
  const iniciales = t => ((t.nombres || ' ')[0] + (t.apellidos || ' ')[0]).toUpperCase();
  const fotoSrc = t => !t.foto ? '' : (t.foto.startsWith('data:') ? t.foto : RAIZ + t.foto);
  const v = x => (x && typeof x === 'object') ? (x.es || '') : (x || '');

  /* ───── Íconos ───── */
  const I = {
    ojo: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    lapiz: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    grafico: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5"/><path d="M14 14h2.8v2.8H14zM20.5 14v.1M17 20.5h3.5V17M14 20.5v.1"/>',
    mas: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    copiar: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
    duplicar: '<rect x="8" y="8" width="12.5" height="12.5" rx="2.5"/><path d="M14.25 11.5v5.5M11.5 14.25H17M16 8V6a2.5 2.5 0 0 0-2.5-2.5h-7A2.5 2.5 0 0 0 4 6v7a2.5 2.5 0 0 0 2.5 2.5H8"/>',
    apagar: '<path d="M12 3v8M6.3 6.8a8 8 0 1 0 11.4 0"/>',
    encender: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    descargar: '<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14"/>',
    flecha: '<path d="M15 6l-6 6 6 6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    mas2: '<path d="M12 5v14M5 12h14"/>',
    basura: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    subir: '<path d="M12 16V5m-4.5 4.5L12 5l4.5 4.5M5 20h14"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    edificio: '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
    foto: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>',
    tel: '<path d="M5.2 3.8h3.4l1.7 4.4-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2 4.4 1.7v3.4a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 3.2 5.9a2 2 0 0 1 2-2.1z"/>',
    wa: '<path d="M20.4 11.7a8.4 8.4 0 0 1-12.4 7.4l-4.4 1.3 1.4-4.2a8.4 8.4 0 1 1 15.4-4.5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.8"/><path d="m3.6 7.2 8.4 6 8.4-6"/>',
    pin: '<path d="M12 21.2s-7-6.1-7-11.6a7 7 0 0 1 14 0c0 5.5-7 11.6-7 11.6z"/><circle cx="12" cy="9.6" r="2.6"/>',
    link: '<path d="M10 14a4.4 4.4 0 0 0 6.3 0l3-3a4.4 4.4 0 0 0-6.3-6.3l-1 1"/><path d="M14 10a4.4 4.4 0 0 0-6.3 0l-3 3a4.4 4.4 0 0 0 6.3 6.3l1-1"/>',
    compartir: '<path d="M12 3.5v11M7.8 7.6 12 3.5l4.2 4.1"/><path d="M8 10.5H6.5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16"/>',
    guardar: '<circle cx="10" cy="8" r="4"/><path d="M3 20.2a7 7 0 0 1 14 0M19.5 8v6M16.5 11h6"/>',
    movil: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.8"/><path d="M10.5 18.3h3"/>',
    pc: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
    globo: '<circle cx="12" cy="12" r="9"/><path d="M3.2 12h17.6M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
    excel: '<path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z"/><path d="M14 3v5h5M9 12l4 5M13 12l-4 5"/>'
  };
  const ico = n => '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>';

  /* ───── Datos iniciales ───── */
  const COMUNES0 = {
    entidad: { es: 'Agencia de Promoción de la Inversión Privada – PROINVERSIÓN', en: 'Private Investment Promotion Agency – PROINVERSIÓN' },
    telefono: '+51 1 200 1200',
    direccion: { calle: 'Calle Manuel Gonzales Olaechea 177', distrito: 'San Isidro', ciudad: 'Lima', cp: '15047', pais: { es: 'Perú', en: 'Peru' }, mapa: 'https://www.google.com/maps/search/?api=1&query=Calle+Manuel+Gonzales+Olaechea+177,+San+Isidro,+Lima' },
    web: 'https://www.investinperu.pe',
    enlaces: [
      { icono: 'doc', titulo: { es: 'Portafolio de proyectos APP y PA 2026–2028', en: 'PPP & AP Project Portfolio 2026–2028' }, sub: { es: 'Publicación digital', en: 'Digital publication' }, url: 'https://online.fliphtml5.com/qmskz/safo/' },
      { icono: 'globe', titulo: { es: 'Invest in Peru', en: 'Invest in Peru' }, sub: { es: 'Oportunidades de inversión en el Perú', en: 'Investment opportunities in Peru' }, url: 'https://www.investinperu.pe' },
      { icono: 'link', titulo: { es: 'PROINVERSIÓN en gob.pe', en: 'PROINVERSIÓN on gob.pe' }, sub: { es: 'Información institucional', en: 'Institutional information' }, url: 'https://www.gob.pe/proinversion' }
    ],
    redes: [
      { red: 'linkedin', url: 'https://www.linkedin.com/company/proinversionpe' },
      { red: 'x', url: 'https://x.com/ProInversionPe' },
      { red: 'facebook', url: 'https://www.facebook.com/proinversionpe' },
      { red: 'instagram', url: 'https://www.instagram.com/proInversionperu/' },
      { red: 'youtube', url: 'https://www.youtube.com/user/ProInversionPe' },
      { red: 'tiktok', url: 'https://www.tiktok.com/@proinversionperu' }
    ]
  };
  const ej = (slug, nombres, apellidos, cargoEs, cargoEn, areaEs, areaEn, extra) => Object.assign({
    slug, nombres, apellidos, correo: slug.replace('-', '.') + '@ejemplo.gob.pe',
    cargo: { es: cargoEs, en: cargoEn }, area: { es: areaEs, en: areaEn },
    bio: { es: '', en: '' }, celular: '+51 900 000 0' + String(slug.length).padStart(2, '0'), whatsapp: true, anexo: '',
    foto: '', foto_posicion: '50% 22%', estado: 'activa', ejemplo: true
  }, extra || {});
  const TARJETAS0 = [
    {
      slug: 'mirtha-razuri', nombres: 'Mirtha Agustina', apellidos: 'Rázuri Alpiste', correo: 'mrazuri@proinversion.gob.pe',
      cargo: { es: 'Gerenta General', en: 'General Manager' }, area: { es: 'Gerencia General', en: 'General Management' },
      bio: {
        es: 'Gerenta General de PROINVERSIÓN. Abogada por la UNMSM y magíster en Gestión Pública por la Universidad del Pacífico, con más de 20 años de experiencia en regulación, contratación pública y alta dirección en el Estado.',
        en: "General Manager of PROINVERSIÓN. A lawyer from UNMSM with a master's degree in Public Management from Universidad del Pacífico, with more than 20 years of experience in regulation, public procurement, and senior government leadership."
      },
      celular: '+51 943 680 655', whatsapp: true, anexo: '1205',
      foto: 'assets/fotos/mrazuri.jpg', foto_posicion: '33% 22%', estado: 'activa', codigo: 'R4ZQ7', popularidad: 42
    },
    ej('carlos-mendoza', 'Carlos Alberto', 'Mendoza Paredes', 'Director de Proyectos', 'Projects Director', 'Dirección de Proyectos', 'Projects Division', { anexo: '1310', popularidad: 26 }),
    ej('lucia-castro', 'Lucía Fernanda', 'Castro Ibáñez', 'Directora de Promoción de Inversiones', 'Investment Promotion Director', 'Dirección de Promoción de Inversiones', 'Investment Promotion Division', { popularidad: 31 }),
    ej('ana-torres', 'Ana Sofía', 'Torres Villanueva', 'Directora de Portafolio de Proyectos', 'Project Portfolio Director', 'Dirección de Portafolio de Proyectos', 'Project Portfolio Division', { popularidad: 18 }),
    ej('ricardo-huaman', 'Ricardo Manuel', 'Huamán Quispe', 'Director de Inversiones Descentralizadas', 'Decentralized Investment Director', 'Dirección de Inversiones Descentralizadas', 'Decentralized Investment Division', { popularidad: 14 }),
    ej('jorge-salazar', 'Jorge Luis', 'Salazar Ríos', 'Jefe de Comunicaciones', 'Head of Communications', 'Oficina de Comunicaciones e Imagen Institucional', 'Communications Office', { popularidad: 9 }),
    ej('miguel-rojas', 'Miguel Ángel', 'Rojas Díaz', 'Especialista en APP', 'PPP Specialist', 'Dirección de Proyectos', 'Projects Division', { celular: '', whatsapp: false, popularidad: 6 }),
    ej('patricia-leon', 'Patricia Elena', 'León Gamarra', 'Asesora de Gerencia General', 'Advisor to the General Manager', 'Gerencia General', 'General Management', { estado: 'desactivada', desactivadaHace: 24, popularidad: 12 })
  ].map((t, i) => Object.assign({ codigo: 'X' + (1000 + i * 37).toString(36).toUpperCase(), creada: new Date(HOY - (i === 0 ? 1 : 100 + i * 9) * DIA).toISOString() }, t));
  const HISTORIAL0 = [
    { fecha: new Date(HOY - 1 * DIA + 16.7 * 36e5).toISOString(), tipo: 'crear', slug: 'mirtha-razuri', texto: 'Creó la tarjeta', detalle: 'Mirtha Agustina Rázuri Alpiste' },
    { fecha: new Date(HOY - 1 * DIA + 17.2 * 36e5).toISOString(), tipo: 'foto', slug: 'mirtha-razuri', texto: 'Actualizó la foto y su encuadre', detalle: 'Mirtha Agustina Rázuri Alpiste' },
    { fecha: new Date(HOY - 1 * DIA + 17.6 * 36e5).toISOString(), tipo: 'comunes', texto: 'Actualizó los datos comunes', detalle: 'Dirección, redes institucionales (se agregó TikTok)' },
    { fecha: new Date(HOY - 24 * DIA + 10.1 * 36e5).toISOString(), tipo: 'desactivar', slug: 'patricia-leon', texto: 'Desactivó la tarjeta', detalle: 'Patricia Elena León Gamarra · ejemplo' },
    { fecha: new Date(HOY - 40 * DIA + 9.5 * 36e5).toISOString(), tipo: 'editar', slug: 'lucia-castro', texto: 'Editó la tarjeta', detalle: 'Lucía Fernanda Castro Ibáñez · cargo (inglés) · ejemplo' }
  ];

  let E;
  function cargar() {
    try { E = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { E = null; }
    if (!E || !E.tarjetas) restablecer(false);
  }
  function guardarEstado() { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) { aviso('No se pudo guardar en este navegador (¿foto muy pesada?)'); } }
  function restablecer(pintar) {
    E = { comunes: JSON.parse(JSON.stringify(COMUNES0)), tarjetas: JSON.parse(JSON.stringify(TARJETAS0)), historial: JSON.parse(JSON.stringify(HISTORIAL0)) };
    Object.keys(cacheStats).forEach(k => delete cacheStats[k]);
    guardarEstado();
    if (pintar) { aviso('Datos de prueba restablecidos'); ruta(); }
  }
  function registrarCambio(tipo, texto, t, detalle) {
    E.historial.unshift({ fecha: new Date().toISOString(), tipo, slug: t ? t.slug : null, texto, detalle: detalle || (t ? nombreDe(t) : '') });
  }

  /* ───── Estadísticas simuladas (deterministas por tarjeta) ───── */
  const HISTORIA = 180;
  const cacheStats = {};
  function semilla(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function azar(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function statsDe(t) {
    if (cacheStats[t.slug]) return cacheStats[t.slug];
    const r = azar(semilla(t.slug)), pop = t.popularidad || 0, conv = .17 + r() * .13, dias = [];
    for (let i = HISTORIA - 1; i >= 0; i--) {
      const f = new Date(HOY - i * DIA), fin = (f.getDay() === 0 || f.getDay() === 6) ? .42 : 1;
      let vis = pop ? Math.round(pop * fin * (.62 + .55 * (HISTORIA - i) / HISTORIA) * (.55 + r() * .9)) : 0;
      if (t.estado === 'desactivada' && i < (t.desactivadaHace || 0)) vis = Math.round(vis * .12);
      const g = t.estado === 'desactivada' && i < (t.desactivadaHace || 0) ? 0 : Math.round(vis * conv * (.7 + r() * .6));
      const qr = Math.round(vis * (.38 + r() * .14)), comp = Math.round(vis * (.11 + r() * .08));
      const k = x => Math.round(vis * x * (.5 + r()));
      dias.push({ t: f.getTime(), v: vis, u: Math.round(vis * (.72 + r() * .1)), g, qr, comp, dir: Math.max(0, vis - qr - comp),
        llamar: k(.07), wa: t.whatsapp && t.celular ? k(.1) : 0, correo: k(.05), ubic: k(.02), enl: k(.08), red: k(.04), share: k(.03), dqr: k(.02) });
    }
    const a = .42 + r() * .1, b = .32 + r() * .1, c = .17 + r() * .06, s = a + b + c;
    const pe = .72 + r() * .1, us = .05 + r() * .03, es = .03 + r() * .02, cl = .025 + r() * .015, cn = .02 + r() * .02;
    return (cacheStats[t.slug] = { dias, disp: [['Android', a / s], ['iPhone', b / s], ['Computadora', c / s]], paises: [['Perú', pe], ['Estados Unidos', us], ['España', es], ['Chile', cl], ['China', cn], ['Otros', Math.max(0, 1 - pe - us - es - cl - cn)]] });
  }
  function agregar(tarjetas, dias, desplaz) {
    const tot = { v: 0, u: 0, g: 0, qr: 0, comp: 0, dir: 0, llamar: 0, wa: 0, correo: 0, ubic: 0, enl: 0, red: 0, share: 0, dqr: 0 };
    const serie = []; const disp = {}; const paises = {};
    for (let i = 0; i < dias; i++) serie.push({ t: HOY - (dias - 1 - i + desplaz) * DIA, v: 0, g: 0, qr: 0 });
    tarjetas.forEach(t => {
      const s = statsDe(t), n = s.dias.length;
      let vt = 0;
      for (let i = 0; i < dias; i++) {
        const d = s.dias[n - dias - desplaz + i]; if (!d) continue;
        Object.keys(tot).forEach(k => { tot[k] += d[k]; });
        serie[i].v += d.v; serie[i].g += d.g; serie[i].qr += d.qr; vt += d.v;
      }
      s.disp.forEach(([k, p]) => { disp[k] = (disp[k] || 0) + vt * p; });
      s.paises.forEach(([k, p]) => { paises[k] = (paises[k] || 0) + vt * p; });
    });
    return { tot, serie, disp, paises };
  }

  /* ───── Utilidades de interfaz ───── */
  let tAviso;
  function aviso(msj) {
    const el = $('#aviso'); el.innerHTML = ico('check') + '<span></span>'; el.lastChild.textContent = msj;
    el.classList.add('visible'); clearTimeout(tAviso); tAviso = setTimeout(() => el.classList.remove('visible'), 2600);
  }
  function modal(titulo, cuerpoHTML, botones) {
    const m = $('#modal'); $('#modalTitulo').textContent = titulo; $('#modalCuerpo').innerHTML = cuerpoHTML;
    const cont = $('#modalBotones'); cont.innerHTML = '';
    botones.forEach(b => {
      const el = document.createElement('button'); el.type = 'button'; el.className = 'btn ' + (b.clase || 'btn-sec'); el.innerHTML = b.html || esc(b.texto);
      el.addEventListener('click', () => { if (b.accion) b.accion(); if (!b.mantener) cerrarModal(); });
      cont.appendChild(el);
    });
    m.hidden = false; const ultimo = cont.lastChild; if (ultimo) ultimo.focus();
  }
  function cerrarModal() { $('#modal').hidden = true; }
  function copiar(texto, msj) {
    const hecho = () => aviso(msj || 'Copiado');
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(hecho, hecho);
    else { const ta = document.createElement('textarea'); ta.value = texto; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { } ta.remove(); hecho(); }
  }
  function descargar(blob, nombre) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  const avatarHTML = (t, cls) => '<span class="' + (cls || 'avatar') + '">' + (t.foto ? '<img src="' + esc(fotoSrc(t)) + '" alt="" style="object-position:' + esc(t.foto_posicion || '50% 22%') + '">' : esc(iniciales(t))) + '</span>';
  const etiquetaEstado = t => '<span class="etiqueta ' + (t.estado === 'desactivada' ? 'desactivada">Desactivada' : 'activa">Activa') + '</span>';
  const buscarTarjeta = slug => E.tarjetas.find(t => t.slug === slug);
  function deltaHTML(act, ant, menosEsMejor) {
    if (!ant && !act) return '<span class="delta igual">—</span>';
    if (!ant) return '<span class="delta sube">nuevo</span>';
    const d = (act - ant) / ant * 100, signo = d > 0.5 ? 'sube' : d < -0.5 ? 'baja' : 'igual';
    const cls = menosEsMejor ? (signo === 'sube' ? 'baja' : signo === 'baja' ? 'sube' : 'igual') : signo;
    return '<span class="delta ' + cls + '">' + (d > 0.5 ? '▲' : d < -0.5 ? '▼' : '■') + ' ' + Math.abs(d).toLocaleString('es-PE', { maximumFractionDigits: 0 }) + ' %</span>';
  }

  /* Tooltip compartido: barras y celdas con data-tip-valor / data-tip-etq (se escribe con textContent) */
  const tip = $('#tooltip');
  function mostrarTip(x, y, valor, etq) {
    tip.innerHTML = '<strong></strong><span></span>'; tip.firstChild.textContent = valor; tip.lastChild.textContent = etq;
    tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.hidden = false;
  }
  function ocultarTip() { tip.hidden = true; }
  document.addEventListener('pointerover', e => {
    const el = e.target.closest('[data-tip-valor]'); if (!el) return;
    const r = el.getBoundingClientRect(); mostrarTip(r.left + r.width / 2, r.top, el.dataset.tipValor, el.dataset.tipEtq);
  });
  document.addEventListener('pointerout', e => { if (e.target.closest('[data-tip-valor]')) ocultarTip(); });
  document.addEventListener('focusin', e => {
    const el = e.target.closest('[data-tip-valor]'); if (!el) return;
    const r = el.getBoundingClientRect(); mostrarTip(r.left + r.width / 2, r.top, el.dataset.tipValor, el.dataset.tipEtq);
  });
  document.addEventListener('focusout', ocultarTip);

  /* ───── Gráficos ───── */
  function maxBonito(x) { const p = Math.pow(10, Math.floor(Math.log10(Math.max(x, 1)))); for (const f of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (f * p >= x) return f * p; return 10 * p; }
  function graficoArea(cont, serie, clave, nombre) {
    const W = Math.max(cont.clientWidth, 280), H = cont.clientHeight || 260, m = { l: 44, r: 14, t: 14, b: 28 };
    const n = serie.length, max = maxBonito(Math.max(1, ...serie.map(p => p[clave])));
    const x = i => m.l + (n === 1 ? 0 : i * (W - m.l - m.r) / (n - 1));
    const y = val => m.t + (H - m.t - m.b) * (1 - val / max);
    let grid = '', ejes = '';
    for (let k = 0; k <= 4; k++) { const val = max * k / 4, yy = y(val); grid += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '"/>'; ejes += '<text x="' + (m.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + fmt(val) + '</text>'; }
    const pasos = Math.min(6, n); for (let k = 0; k < pasos; k++) { const i = Math.round(k * (n - 1) / Math.max(1, pasos - 1)); ejes += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="' + (k === 0 ? 'start' : k === pasos - 1 ? 'end' : 'middle') + '">' + fmtFecha(serie[i].t) + '</text>'; }
    const pts = serie.map((p, i) => x(i).toFixed(1) + ',' + y(p[clave]).toFixed(1));
    const linea = 'M' + pts.join('L'), area = linea + 'L' + x(n - 1) + ',' + y(0) + 'L' + x(0) + ',' + y(0) + 'Z';
    cont.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(nombre) + ' por día">' +
      '<defs><linearGradient id="degradeArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E1261D" stop-opacity=".16"/><stop offset="1" stop-color="#E1261D" stop-opacity="0"/></linearGradient></defs>' +
      '<g class="rejilla">' + grid + '</g><g class="ejes">' + ejes + '</g>' +
      '<path class="area" d="' + area + '"/><path class="linea" d="' + linea + '"/>' +
      '<line class="cruz" y1="' + m.t + '" y2="' + y(0) + '" x1="-10" x2="-10"/><circle class="punto" r="5" cx="-10" cy="-10"/>' +
      '<rect class="capa" tabindex="0" aria-label="Recorre los días con las flechas" x="' + m.l + '" y="0" width="' + (W - m.l - m.r) + '" height="' + H + '"/></svg>';
    const svg = cont.firstChild, cruz = $('.cruz', svg), punto = $('.punto', svg), capa = $('.capa', svg);
    let idx = n - 1;
    const marcar = i => {
      idx = Math.max(0, Math.min(n - 1, i)); const px = x(idx), py = y(serie[idx][clave]);
      cont.classList.add('marcando');
      cruz.setAttribute('x1', px); cruz.setAttribute('x2', px); punto.setAttribute('cx', px); punto.setAttribute('cy', py);
      const r = svg.getBoundingClientRect(), esc2 = r.width / W;
      const d = new Date(serie[idx].t);
      mostrarTip(r.left + px * esc2, r.top + py * esc2, fmt(serie[idx][clave]) + ' ' + nombre.toLowerCase(), ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()] + ' ' + fmtFecha(d));
    };
    capa.addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(); marcar(Math.round(((e.clientX - r.left) * W / r.width - m.l) / ((W - m.l - m.r) / Math.max(1, n - 1)))); });
    const soltar = () => { ocultarTip(); cont.classList.remove('marcando'); };
    capa.addEventListener('pointerleave', soltar);
    capa.addEventListener('focus', () => marcar(idx));
    capa.addEventListener('blur', soltar);
    capa.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { marcar(idx - 1); e.preventDefault(); } if (e.key === 'ArrowRight') { marcar(idx + 1); e.preventDefault(); } });
  }
  function barrasHTML(items, opts) {
    opts = opts || {};
    const total = items.reduce((s, it) => s + it.valor, 0), max = Math.max(1, ...items.map(it => it.valor));
    if (!total) return '<p class="campo-ayuda">Sin datos en este período.</p>';
    return '<ul class="barras">' + items.map(it => {
      const p = pct(it.valor, total);
      return '<li class="barra-fila" tabindex="0" data-tip-valor="' + esc(fmt(it.valor) + (opts.unidad ? ' ' + opts.unidad : '') + ' · ' + fmtPct(p)) + '" data-tip-etq="' + esc(it.etq) + '">' +
        '<span class="barra-etq">' + (it.ico ? ico(it.ico) : '') + '<span>' + esc(it.etq) + '</span></span>' +
        '<span class="barra-val">' + fmt(it.valor) + '<small>' + fmtPct(p) + '</small></span>' +
        '<span class="barra-pista"><span class="barra-relleno' + (opts.gris ? ' gris' : '') + '" style="width:' + (it.valor / max * 100).toFixed(1) + '%"></span></span></li>';
    }).join('') + '</ul>';
  }
  function chispa(serie) {
    const grupos = 12, tam = Math.max(1, Math.floor(serie.length / grupos)), puntos = [];
    for (let i = 0; i < serie.length; i += tam) puntos.push(serie.slice(i, i + tam).reduce((s, p) => s + p.v, 0));
    const max = Math.max(1, ...puntos), w = 90, h = 26;
    const xy = puntos.map((p, i) => [(i * (w - 4) / Math.max(1, puntos.length - 1) + 2).toFixed(1), (h - 3 - (p / max) * (h - 6)).toFixed(1)]);
    const u = xy[xy.length - 1];
    return '<svg class="chispa" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + xy.map(p => p.join(',')).join(' ') + '"/><circle r="2.6" cx="' + u[0] + '" cy="' + u[1] + '"/></svg>';
  }

  /* ───── QR ───── */
  function qrSVG(texto) {
    if (typeof window.qrcode !== 'function') return null;
    const q = window.qrcode(0, 'H'); q.addData(texto); q.make();
    const n = q.getModuleCount(), m = 3, tam = n + m * 2;
    let hueco = Math.round(n * .24); if ((n - hueco) % 2) hueco++;
    const h0 = (n - hueco) / 2, h1 = h0 + hueco;
    const buscador = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!q.isDark(r, c) || buscador(r, c) || (r >= h0 - .5 && r < h1 && c >= h0 - .5 && c < h1)) continue;
      d += 'M' + (c + m + .08) + ' ' + (r + m + .08) + 'h.84v.84h-.84z';
    }
    const bus = (x, y) => '<rect x="' + (x + .5) + '" y="' + (y + .5) + '" width="6" height="6" rx="1.7" fill="none" stroke="#161A1D" stroke-width="1"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" rx=".8" fill="#E1261D"/>';
    const cx = m + h0, a = hueco;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + tam + ' ' + tam + '"><rect width="' + tam + '" height="' + tam + '" fill="#fff"/><path d="' + d + '" fill="#161A1D" shape-rendering="crispEdges"/>' +
      bus(m, m) + bus(m + n - 7, m) + bus(m, m + n - 7) +
      '<rect x="' + (cx + .3) + '" y="' + (m + h0 + .3) + '" width="' + (a - .6) + '" height="' + (a - .6) + '" rx="1.2" fill="#fff" stroke="#DADAD8" stroke-width=".25"/>' +
      '<path d="M' + (cx + a * .55) + ' ' + (m + h0 + a * .2) + 'h' + (a * .28) + 'l' + (-a * .41) + ' ' + (a * .6) + 'h' + (-a * .28) + 'z" fill="#E1261D"/></svg>';
  }
  function urlTarjeta(t) { return URL_BASE + t.slug + '/'; }
  function abrirQR(t) {
    const svg = qrSVG(urlTarjeta(t));
    if (!svg) { aviso('El generador de QR aún está cargando; inténtalo en un momento'); return; }
    modal('Código QR de ' + corto(t),
      '<div class="qr-modal"><div class="qr-caja">' + svg + '</div><p class="campo-ayuda" style="text-align:center">' + esc(urlTarjeta(t)) + '<br>SVG para imprenta (vectorial) · PNG para presentaciones y correo</p></div>',
      [
        { texto: 'Cerrar' },
        { html: ico('descargar') + 'SVG', mantener: true, accion: () => { descargar(new Blob([svg], { type: 'image/svg+xml' }), 'QR-' + t.slug + '.svg'); registrarCambio('qr', 'Descargó el QR (SVG)', t); guardarEstado(); } },
        { html: ico('descargar') + 'PNG', clase: 'btn-primario', mantener: true, accion: () => {
          const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'); cv.width = cv.height = 1600; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 1600, 1600); c.drawImage(im, 0, 0, 1600, 1600); cv.toBlob(b => descargar(b, 'QR-' + t.slug + '.png')); };
          im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); registrarCambio('qr', 'Descargó el QR (PNG)', t); guardarEstado();
        } }
      ]);
  }

  /* ───── Acciones sobre tarjetas ───── */
  function desactivar(t, luego) {
    modal('¿Desactivar la tarjeta de ' + corto(t) + '?',
      '<p>La tarjeta no se borra. Al desactivarla:</p><ul>' +
      '<li>El enlace y los QR ya impresos <strong>siguen funcionando</strong>, pero muestran el aviso «Esta tarjeta ya no está activa» con la central telefónica y la web institucional.</li>' +
      '<li>Dejan de mostrarse el celular, el correo y el botón Guardar contacto.</li>' +
      '<li>Las estadísticas se conservan y puedes reactivarla cuando quieras.</li></ul>',
      [{ texto: 'Cancelar' }, { html: ico('apagar') + 'Desactivar', clase: 'btn-peligro', accion: () => {
        t.estado = 'desactivada'; t.actualizada = new Date().toISOString(); registrarCambio('desactivar', 'Desactivó la tarjeta', t); guardarEstado(); aviso('Tarjeta desactivada'); (luego || ruta)();
      } }]);
  }
  function reactivar(t, luego) {
    t.estado = 'activa'; t.actualizada = new Date().toISOString(); registrarCambio('reactivar', 'Reactivó la tarjeta', t); guardarEstado(); aviso('Tarjeta reactivada'); (luego || ruta)();
  }

  /* ───── Enrutador ───── */
  const cont = $('#contenido');
  let rango = 30, metrica = 'v', filtroEstado = 'todas', textoBusqueda = '';
  function ruta() {
    ocultarTip();
    const h = (location.hash || '#/panel').slice(2).split('/');
    const r = h[0] || 'panel', p = decodeURIComponent(h[1] || '');
    const mapa = { estadisticas: 'tarjetas', editar: 'tarjetas', duplicar: 'nueva' };
    $$('.menu-nav a').forEach(a => a.classList.toggle('activo', a.dataset.ruta === (mapa[r] || r)));
    cont.innerHTML = '';
    ({ panel: () => vistaPanel(null), tarjetas: vistaTarjetas, nueva: () => vistaEditor(null), editar: () => vistaEditor(p), duplicar: () => vistaEditor(p, true), estadisticas: () => vistaPanel(p), carga: vistaCarga, comunes: vistaComunes, historial: vistaHistorial }[r] || (() => vistaPanel(null)))();
    cont.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', ruta);
  window.addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(() => { const g = $('#grafico'); if (g && g.__pintar) g.__pintar(); }, 150); });

  /* ───── Vista: Panel (general o de una tarjeta) ───── */
  function vistaPanel(slug) {
    const t = slug ? buscarTarjeta(slug) : null;
    if (slug && !t) { location.hash = '#/tarjetas'; return; }
    const lista = t ? [t] : E.tarjetas;
    const act = agregar(lista, rango, 0), ant = agregar(lista, rango, rango), T = act.tot, A = ant.tot;
    const activas = E.tarjetas.filter(x => x.estado !== 'desactivada').length;
    const cab = t
      ? '<a class="miga" href="#/tarjetas">' + ico('flecha') + 'Tarjetas</a><div class="cabecera"><div style="display:flex;gap:14px;align-items:center">' + avatarHTML(t, 'avatar" style="width:56px;height:56px;border-radius:16px') +
        '<div><h1>' + esc(nombreDe(t)) + '</h1><p>' + esc(v(t.cargo)) + ' · ' + etiquetaEstado(t) + '</p></div></div><div class="cabecera-acciones">' +
        '<a class="btn btn-sec" href="' + RAIZ + 'index.html?previa=' + encodeURIComponent(t.slug) + '" target="_blank" rel="noopener">' + ico('ojo') + 'Ver tarjeta</a>' +
        '<a class="btn btn-sec" href="#/editar/' + encodeURIComponent(t.slug) + '">' + ico('lapiz') + 'Editar</a>' +
        '<button class="btn btn-primario" id="btnQRCab" type="button">' + ico('qr') + 'Código QR</button></div></div>'
      : '<div class="cabecera"><div><h1>Panel</h1><p>Cómo se usan las tarjetas virtuales de PROINVERSIÓN.</p></div><div class="cabecera-acciones"><span class="chip-proto">Prototipo · estadísticas simuladas</span><a class="btn btn-primario" href="#/nueva">' + ico('mas2') + 'Nueva tarjeta</a></div></div>';
    cont.innerHTML = '<div class="vista">' + cab +
      '<div class="filtros"><div class="segmentos" role="group" aria-label="Período">' + [7, 30, 90].map(d => '<button type="button" data-rango="' + d + '" aria-pressed="' + (rango === d) + '">' + d + ' días</button>').join('') + '</div>' +
      (t ? '' : '<select id="selTarjeta" aria-label="Filtrar por tarjeta"><option value="">Todas las tarjetas</option>' + E.tarjetas.map(x => '<option value="' + esc(x.slug) + '">' + esc(nombreDe(x)) + '</option>').join('') + '</select>') +
      '<span class="espaciador"></span><button type="button" class="btn btn-sec" id="btnCSV">' + ico('descargar') + 'Exportar a Excel (CSV)</button></div>' +
      '<div class="kpis">' +
        (t ? kpi('Estado', t.estado === 'desactivada' ? 'Desactivada' : 'Activa', t.estado === 'desactivada' ? 'El enlace muestra el aviso institucional' : 'Visible para el público')
           : kpi('Tarjetas activas', fmt(activas) + ' <small>de ' + fmt(E.tarjetas.length) + '</small>', fmt(E.tarjetas.length - activas) + ' desactivada' + (E.tarjetas.length - activas === 1 ? '' : 's'))) +
        kpi('Vistas', fmt(T.v), deltaHTML(T.v, A.v) + ' vs. ' + rango + ' días previos', fmt(T.u) + ' visitantes únicos') +
        kpi('Contactos guardados', fmt(T.g), deltaHTML(T.g, A.g) + ' vs. período previo') +
        kpi('Tasa de conversión', fmtPct(pct(T.g, T.v)), 'Período previo: ' + fmtPct(pct(A.g, A.v)), 'Guardados ÷ vistas') +
        kpi('Escaneos de QR', fmt(T.qr), fmtPct(pct(T.qr, T.v)) + ' de las vistas') +
      '</div>' +
      '<div class="caja"><div class="caja-cab"><div><h2>Evolución diaria</h2><p>Pasa el cursor (o usa las flechas) para ver cada día.</p></div>' +
      '<div class="pestanas" role="tablist">' + [['v', 'Vistas'], ['g', 'Contactos guardados'], ['qr', 'Escaneos de QR']].map(([k, n]) => '<button type="button" role="tab" data-metrica="' + k + '" aria-selected="' + (metrica === k) + '">' + n + '</button>').join('') + '</div></div>' +
      '<div class="grafico" id="grafico"></div></div>' +
      '<div class="rejilla-3">' +
        '<div class="caja"><div class="caja-cab"><div><h2>Origen de las visitas</h2><p>Cómo llegaron a la tarjeta</p></div></div>' + barrasHTML([{ etq: 'Escaneo del QR', valor: T.qr, ico: 'qr' }, { etq: 'Enlace directo', valor: T.dir, ico: 'link' }, { etq: 'Compartido', valor: T.comp, ico: 'compartir' }], { unidad: 'vistas' }) + '</div>' +
        '<div class="caja"><div class="caja-cab"><div><h2>Acciones en la tarjeta</h2><p>Clics en cada botón</p></div></div>' + barrasHTML([{ etq: 'Guardar contacto', valor: T.g, ico: 'guardar' }, { etq: 'WhatsApp', valor: T.wa, ico: 'wa' }, { etq: 'Enlaces destacados', valor: T.enl, ico: 'link' }, { etq: 'Llamar', valor: T.llamar, ico: 'tel' }, { etq: 'Correo', valor: T.correo, ico: 'mail' }, { etq: 'Redes sociales', valor: T.red, ico: 'globo' }, { etq: 'Compartir', valor: T.share, ico: 'compartir' }, { etq: 'Ubicación', valor: T.ubic, ico: 'pin' }].sort((a, b) => b.valor - a.valor), { unidad: 'clics' }) + '</div>' +
        '<div class="caja"><div class="caja-cab"><div><h2>Dispositivos</h2><p>Desde dónde la abrieron</p></div></div>' + barrasHTML(Object.entries(act.disp).map(([k, val]) => ({ etq: k, valor: Math.round(val), ico: k === 'Computadora' ? 'pc' : 'movil' })), { unidad: 'vistas', gris: true }) +
          '<div class="caja-cab" style="margin-top:22px"><div><h2>Países</h2><p>Ubicación aproximada</p></div></div>' + barrasHTML(Object.entries(act.paises).map(([k, val]) => ({ etq: k, valor: Math.round(val) })), { unidad: 'vistas', gris: true }) + '</div>' +
      '</div>' +
      (t ? '' : '<div class="caja" style="margin-top:14px"><div class="caja-cab"><div><h2>Ranking de tarjetas</h2><p>Últimos ' + rango + ' días · clic en una fila para ver su detalle</p></div></div><div class="tabla-env"><table><thead><tr><th>Tarjeta</th><th>Estado</th><th class="num">Vistas</th><th class="num">Guardados</th><th class="num">Conversión</th><th class="num">Escaneos QR</th><th>Tendencia</th></tr></thead><tbody>' +
        E.tarjetas.map(x => ({ x, a: agregar([x], rango, 0) })).sort((p, q) => q.a.tot.v - p.a.tot.v).map(({ x, a }) =>
          '<tr class="clic" data-ir="#/estadisticas/' + encodeURIComponent(x.slug) + '"><td><div class="persona">' + avatarHTML(x) + '<div><strong>' + esc(nombreDe(x)) + '</strong><small>' + esc(v(x.cargo)) + '</small></div></div></td><td>' + etiquetaEstado(x) + (x.ejemplo ? ' <span class="etiqueta ejemplo">Ejemplo</span>' : '') + '</td>' +
          '<td class="num">' + fmt(a.tot.v) + '</td><td class="num">' + fmt(a.tot.g) + '</td><td class="num">' + fmtPct(pct(a.tot.g, a.tot.v)) + '</td><td class="num">' + fmt(a.tot.qr) + '</td><td>' + chispa(a.serie) + '</td></tr>').join('') +
        '</tbody></table></div></div>') +
      '</div>';
    const g = $('#grafico');
    g.__pintar = () => graficoArea(g, act.serie, metrica, { v: 'Vistas', g: 'Contactos guardados', qr: 'Escaneos de QR' }[metrica]);
    g.__pintar();
    $$('[data-rango]', cont).forEach(b => b.addEventListener('click', () => { rango = +b.dataset.rango; ruta(); }));
    $$('[data-metrica]', cont).forEach(b => b.addEventListener('click', () => { metrica = b.dataset.metrica; $$('[data-metrica]', cont).forEach(x => x.setAttribute('aria-selected', String(x === b))); g.__pintar(); }));
    $$('tr[data-ir]', cont).forEach(tr => tr.addEventListener('click', () => { location.hash = tr.dataset.ir; }));
    const sel = $('#selTarjeta'); if (sel) sel.addEventListener('change', () => { if (sel.value) location.hash = '#/estadisticas/' + encodeURIComponent(sel.value); });
    const bq = $('#btnQRCab'); if (bq) bq.addEventListener('click', () => abrirQR(t));
    $('#btnCSV').addEventListener('click', () => exportarCSV(lista, t));
  }
  function kpi(etq, valor, pie, sub) {
    return '<div class="kpi"><div class="kpi-etq">' + esc(etq) + '</div><div class="kpi-valor">' + valor + '</div><div class="kpi-pie">' + pie + '</div>' + (sub ? '<div class="kpi-pie">' + esc(sub) + '</div>' : '') + '</div>';
  }
  function exportarCSV(lista, t) {
    const sep = ';', filas = [];
    if (t) {
      const s = agregar([t], rango, 0);
      filas.push(['Fecha', 'Vistas', 'Contactos guardados', 'Escaneos QR']);
      s.serie.forEach(p => filas.push([new Date(p.t).toISOString().slice(0, 10), p.v, p.g, p.qr]));
    } else {
      filas.push(['Tarjeta', 'Correo', 'Estado', 'Vistas', 'Visitantes únicos', 'Contactos guardados', 'Conversión %', 'Escaneos QR', 'Enlace directo', 'Compartido', 'Llamar', 'WhatsApp', 'Correo (clics)', 'Ubicación', 'Enlaces', 'Redes']);
      lista.forEach(x => { const a = agregar([x], rango, 0).tot; filas.push([nombreDe(x), x.correo, x.estado, a.v, a.u, a.g, pct(a.g, a.v).toFixed(1).replace('.', ','), a.qr, a.dir, a.comp, a.llamar, a.wa, a.correo, a.ubic, a.enl, a.red]); });
    }
    const csv = '﻿' + filas.map(f => f.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(sep)).join('\r\n');
    descargar(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'estadisticas-' + (t ? t.slug : 'tarjetas') + '-' + rango + 'd.csv');
    aviso('Archivo CSV descargado (se abre en Excel)');
  }

  /* ───── Vista: Tarjetas ───── */
  function vistaTarjetas() {
    const n = { todas: E.tarjetas.length, activas: E.tarjetas.filter(t => t.estado !== 'desactivada').length };
    n.desactivadas = n.todas - n.activas;
    cont.innerHTML = '<div class="vista"><div class="cabecera"><div><h1>Tarjetas</h1><p>' + fmt(n.todas) + ' tarjetas · ' + fmt(n.activas) + ' activas · ' + fmt(n.desactivadas) + ' desactivadas</p></div>' +
      '<div class="cabecera-acciones"><a class="btn btn-sec" href="#/carga">' + ico('excel') + 'Cargar desde Excel</a><a class="btn btn-primario" href="#/nueva">' + ico('mas2') + 'Nueva tarjeta</a></div></div>' +
      '<div class="filtros"><label class="buscador">' + ico('buscar') + '<span class="sr">Buscar</span><input type="search" id="buscar" placeholder="Buscar por nombre, cargo o correo" value="' + esc(textoBusqueda) + '"></label>' +
      '<div class="segmentos" role="group" aria-label="Estado">' + [['todas', 'Todas'], ['activas', 'Activas'], ['desactivadas', 'Desactivadas']].map(([k, et]) => '<button type="button" data-estado="' + k + '" aria-pressed="' + (filtroEstado === k) + '">' + et + ' (' + n[k] + ')</button>').join('') + '</div></div>' +
      '<div class="lista" id="lista"></div></div>';
    const pintarLista = () => {
      const q = textoBusqueda.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const vis = E.tarjetas.filter(t => (filtroEstado === 'todas' || (filtroEstado === 'activas') === (t.estado !== 'desactivada')) &&
        (!q || (nombreDe(t) + ' ' + v(t.cargo) + ' ' + t.correo + ' ' + v(t.area)).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
      $('#lista').innerHTML = vis.length ? vis.map(t => {
        const a = agregar([t], 30, 0).tot, off = t.estado === 'desactivada';
        return '<article class="ficha' + (off ? ' apagada' : '') + '" data-slug="' + esc(t.slug) + '">' +
          '<div class="ficha-foto">' + (t.foto ? '<img src="' + esc(fotoSrc(t)) + '" alt="" style="object-position:' + esc(t.foto_posicion || '50% 22%') + '">' : '<span class="iniciales">' + esc(iniciales(t)) + '</span>') +
          '<div class="ficha-estado">' + etiquetaEstado(t) + (t.ejemplo ? '<span class="etiqueta ejemplo">Ejemplo</span>' : '') + '</div></div>' +
          '<div class="ficha-cuerpo"><h3>' + esc(nombreDe(t)) + '</h3><p>' + esc(v(t.cargo)) + '</p>' +
          '<div class="ficha-metricas"><div><strong>' + fmt(a.v) + '</strong><span>vistas · 30 d</span></div><div><strong>' + fmt(a.g) + '</strong><span>guardados</span></div><div><strong>' + fmt(a.qr) + '</strong><span>escaneos QR</span></div></div></div>' +
          '<div class="ficha-acciones">' +
            '<a class="btn btn-fantasma btn-ico" href="' + RAIZ + 'index.html?previa=' + encodeURIComponent(t.slug) + '" target="_blank" rel="noopener" title="Ver tarjeta pública" aria-label="Ver tarjeta pública">' + ico('ojo') + '</a>' +
            '<a class="btn btn-fantasma btn-ico" href="#/editar/' + encodeURIComponent(t.slug) + '" title="Editar" aria-label="Editar">' + ico('lapiz') + '</a>' +
            '<a class="btn btn-fantasma btn-ico" href="#/estadisticas/' + encodeURIComponent(t.slug) + '" title="Estadísticas" aria-label="Estadísticas">' + ico('grafico') + '</a>' +
            '<button class="btn btn-fantasma btn-ico" type="button" data-acc="qr" title="Código QR" aria-label="Código QR">' + ico('qr') + '</button>' +
            '<span class="espaciador"></span>' +
            (off ? '<button class="btn btn-sec btn-chico" type="button" data-acc="reactivar">' + ico('encender') + 'Reactivar</button>'
                 : '<button class="btn btn-fantasma btn-chico" type="button" data-acc="desactivar">' + ico('apagar') + 'Desactivar</button>') +
            '<div class="desplegable"><button class="btn btn-fantasma btn-ico" type="button" data-acc="menu" aria-label="Más acciones" aria-haspopup="true">' + ico('mas') + '</button></div>' +
          '</div></article>';
      }).join('') : '<div class="vacio">No hay tarjetas que coincidan con la búsqueda.</div>';
    };
    pintarLista();
    $('#buscar').addEventListener('input', e => { textoBusqueda = e.target.value; pintarLista(); });
    $$('[data-estado]', cont).forEach(b => b.addEventListener('click', () => { filtroEstado = b.dataset.estado; $$('[data-estado]', cont).forEach(x => x.setAttribute('aria-pressed', String(x === b))); pintarLista(); }));
    $('#lista').addEventListener('click', e => {
      const b = e.target.closest('[data-acc]'); if (!b) return;
      const t = buscarTarjeta(b.closest('[data-slug]').dataset.slug), acc = b.dataset.acc;
      if (acc === 'qr') abrirQR(t);
      if (acc === 'desactivar') desactivar(t);
      if (acc === 'reactivar') reactivar(t);
      if (acc === 'menu') {
        const previo = $('.desplegable-menu'); if (previo) { const mismo = previo.parentNode === b.parentNode; previo.remove(); if (mismo) return; }
        const m = document.createElement('div'); m.className = 'desplegable-menu'; m.setAttribute('role', 'menu');
        m.innerHTML = '<button type="button" data-m="copiar">' + ico('copiar') + 'Copiar enlace público</button><button type="button" data-m="duplicar">' + ico('duplicar') + 'Duplicar como base</button><hr>' +
          '<button type="button" data-m="estado" class="' + (t.estado === 'desactivada' ? '' : 'peligro') + '">' + ico(t.estado === 'desactivada' ? 'encender' : 'apagar') + (t.estado === 'desactivada' ? 'Reactivar' : 'Desactivar') + '</button>';
        b.parentNode.appendChild(m);
        m.addEventListener('click', ev => {
          const o = ev.target.closest('[data-m]'); if (!o) return; m.remove();
          if (o.dataset.m === 'copiar') copiar(urlTarjeta(t), 'Enlace copiado');
          if (o.dataset.m === 'duplicar') location.hash = '#/duplicar/' + encodeURIComponent(t.slug);
          if (o.dataset.m === 'estado') (t.estado === 'desactivada' ? reactivar : desactivar)(t);
        });
      }
    });
  }
  document.addEventListener('click', e => { if (!e.target.closest('.desplegable')) { const m = $('.desplegable-menu'); if (m) m.remove(); } });

  /* ───── Vista: Editor ───── */
  const aSlug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  function vistaEditor(slug, duplicar) {
    const orig = slug ? buscarTarjeta(slug) : null;
    if (slug && !orig) { location.hash = '#/tarjetas'; return; }
    const nueva = !orig || duplicar;
    const B = orig ? JSON.parse(JSON.stringify(orig)) : { slug: '', nombres: '', apellidos: '', correo: '', cargo: { es: '', en: '' }, area: { es: '', en: '' }, bio: { es: '', en: '' }, celular: '', whatsapp: true, anexo: '', foto: '', foto_posicion: '50% 22%', estado: 'activa' };
    if (duplicar) { Object.assign(B, { nombres: '', apellidos: '', correo: '', celular: '', anexo: '', foto: '', foto_posicion: '50% 22%', bio: { es: '', en: '' }, slug: '', estado: 'activa' }); delete B.ejemplo; delete B.popularidad; delete B.codigo; }
    let slugManual = !nueva;
    const campo = (id, etq, valor, opts) => { opts = opts || {};
      const ctl = opts.area ? '<textarea id="' + id + '" maxlength="' + (opts.max || 600) + '" placeholder="' + esc(opts.ph || '') + '">' + esc(valor) + '</textarea>' : '<input id="' + id + '" type="' + (opts.tipo || 'text') + '" value="' + esc(valor) + '" placeholder="' + esc(opts.ph || '') + '"' + (opts.modo ? ' inputmode="' + opts.modo + '"' : '') + '>';
      return '<label class="campo" data-campo="' + id + '"><span>' + etq + (opts.req ? ' <em>*</em>' : '') + '</span>' + ctl + '<span class="campo-ayuda"><span class="msj">' + esc(opts.ayuda || '') + '</span>' + (opts.max ? '<span class="cuenta"></span>' : '') + '</span></label>';
    };
    cont.innerHTML = '<div class="vista"><a class="miga" href="#/tarjetas">' + ico('flecha') + 'Tarjetas</a>' +
      '<div class="cabecera"><div><h1>' + (nueva ? (duplicar ? 'Nueva tarjeta (basada en ' + esc(corto(orig)) + ')' : 'Nueva tarjeta') : 'Editar tarjeta') + '</h1><p>' + (nueva ? 'Completa los datos; la vista previa se actualiza mientras escribes.' : esc(nombreDe(orig)) + ' · ' + (orig.estado === 'desactivada' ? 'desactivada' : 'activa')) + '</p></div></div>' +
      '<div class="editor"><form class="editor-form" id="formTarjeta" novalidate>' +
        '<section class="seccion"><h2>Identidad</h2><p>Tal como debe aparecer en la tarjeta y en el contacto del teléfono.</p>' +
          '<div class="fila-campos">' + campo('nombres', 'Nombres', B.nombres, { req: 1, ph: 'Ej. María Fernanda' }) + campo('apellidos', 'Apellidos', B.apellidos, { req: 1, ph: 'Ej. Quispe Rojas' }) + '</div>' +
          '<div class="fila-campos">' + campo('correo', 'Correo institucional', B.correo, { req: 1, tipo: 'email', ph: 'usuario@proinversion.gob.pe' }) +
            '<label class="campo" data-campo="slug"><span>Dirección de la tarjeta <em>*</em></span><input id="slug" value="' + esc(B.slug) + '" placeholder="nombre-apellido"><span class="campo-ayuda"><span class="msj">Solo minúsculas, números y guiones</span></span></label></div>' +
          '<p class="url-previa" id="urlPrevia"></p></section>' +
        '<section class="seccion"><h2>Cargo y área</h2><p>Si dejas vacío el inglés, la vista en inglés muestra el texto en español.</p>' +
          '<div class="fila-campos">' + campo('cargo_es', 'Cargo (español)', B.cargo.es, { req: 1 }) + campo('cargo_en', 'Cargo (inglés)', B.cargo.en) + '</div>' +
          '<div class="fila-campos">' + campo('area_es', 'Área / Dirección (español)', B.area.es) + campo('area_en', 'Área / Dirección (inglés)', B.area.en) + '</div></section>' +
        '<section class="seccion"><h2>Contacto</h2><p>Lo que quede vacío no se muestra. La central, la dirección y la web se toman de «Datos comunes».</p>' +
          '<div class="fila-campos tres">' + campo('celular', 'Celular', B.celular, { tipo: 'tel', modo: 'tel', ph: '+51 9xx xxx xxx' }) + campo('anexo', 'Anexo', B.anexo, { modo: 'numeric', ph: 'Ej. 1205', ayuda: 'Solo números' }) +
          '<div class="campo"><span>WhatsApp</span><label class="interruptor" style="height:42px"><input type="checkbox" id="whatsapp"' + (B.whatsapp ? ' checked' : '') + '> El celular tiene WhatsApp</label></div></div></section>' +
        '<section class="seccion"><h2>Biografía corta</h2><p>De 2 a 4 líneas, en tercera persona.</p>' +
          '<div class="fila-campos">' + campo('bio_es', 'Español', B.bio.es, { area: 1, max: 450 }) + campo('bio_en', 'Inglés', B.bio.en, { area: 1, max: 450 }) + '</div></section>' +
        '<section class="seccion"><h2>Foto</h2><p>Haz clic sobre la foto para marcar el rostro: así se encuadra en la tarjeta y en el contacto.</p>' +
          '<div class="foto-zona"><div class="foto-marco" id="fotoMarco" tabindex="0" role="button" aria-label="Subir o encuadrar foto"></div>' +
          '<div class="foto-info"><div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn-sec">' + ico('subir') + 'Subir foto<input type="file" id="fotoArchivo" accept="image/jpeg,image/png,image/webp" hidden></label><button type="button" class="btn btn-fantasma" id="fotoQuitar">' + ico('basura') + 'Quitar</button></div>' +
          '<ul><li>JPG o PNG, de preferencia vertical y de al menos 1000 px.</li><li>El sistema la reduce y comprime sola.</li><li>Sin foto, la tarjeta muestra las iniciales.</li></ul><p class="campo-ayuda" id="fotoPos"></p></div></div></section>' +
        '<div class="barra-guardar">' + (!nueva ? (orig.estado === 'desactivada' ? '<button type="button" class="btn btn-sec" id="btnEstado">' + ico('encender') + 'Reactivar</button>' : '<button type="button" class="btn btn-fantasma" id="btnEstado">' + ico('apagar') + 'Desactivar</button>') : '') +
          '<span class="espaciador"></span><span class="estado-guardado" id="estadoGuardado"></span><a class="btn btn-sec" href="#/tarjetas">Cancelar</a><button type="submit" class="btn btn-primario">' + ico('check') + (nueva ? 'Crear tarjeta' : 'Guardar cambios') + '</button></div>' +
      '</form>' +
      '<aside class="editor-previa"><div class="telefono"><div class="telefono-pantalla"><iframe id="previa" title="Vista previa de la tarjeta" src="' + RAIZ + 'index.html?previa=' + encodeURIComponent(orig && !duplicar ? orig.slug : '__borrador') + '"></iframe></div></div>' +
      '<small>Vista previa en vivo · puedes tocar los botones y cambiar el idioma dentro del teléfono</small></aside></div></div>';

    const form = $('#formTarjeta'), ifr = $('#previa');
    const leer = () => {
      const g = id => $('#' + id).value.trim();
      B.nombres = g('nombres'); B.apellidos = g('apellidos'); B.correo = g('correo');
      if (!slugManual) $('#slug').value = aSlug((B.nombres.split(' ')[0] || '') + ' ' + (B.apellidos.split(' ')[0] || ''));
      B.slug = aSlug($('#slug').value);
      B.cargo = { es: g('cargo_es'), en: g('cargo_en') }; B.area = { es: g('area_es'), en: g('area_en') };
      B.celular = g('celular'); B.anexo = g('anexo'); B.whatsapp = $('#whatsapp').checked;
      B.bio = { es: g('bio_es'), en: g('bio_en') };
      $('#urlPrevia').innerHTML = 'Enlace público: <strong>' + esc(URL_BASE + (B.slug || '…') + '/') + '</strong>';
      $$('.campo .cuenta', form).forEach(c => { const ta = c.closest('.campo').querySelector('textarea'); c.textContent = ta.value.length + ' / 450'; });
    };
    const enviarPrevia = () => {
      const datos = Object.assign({}, E.comunes, JSON.parse(JSON.stringify(B)));
      if (!datos.nombres) datos.nombres = 'Nombres'; if (!datos.apellidos) datos.apellidos = 'Apellidos';
      datos.url_tarjeta = datos.url_qr = URL_BASE + (B.slug || 'nueva') + '/';
      if (datos.foto && !datos.foto.startsWith('data:')) datos.foto = datos.foto; // ruta relativa a la tarjeta
      try { ifr.contentWindow.postMessage({ tipo: 'tarjeta-previa', datos }, location.origin); } catch (e) { }
    };
    let tPrev; const programarPrevia = () => { clearTimeout(tPrev); tPrev = setTimeout(enviarPrevia, 140); };
    ifr.addEventListener('load', () => setTimeout(enviarPrevia, 60));
    form.addEventListener('input', e => { if (e.target.id === 'slug') slugManual = true; leer(); limpiarError(e.target.closest('[data-campo]')); programarPrevia(); $('#estadoGuardado').textContent = 'Cambios sin guardar'; });
    form.addEventListener('change', () => { leer(); programarPrevia(); });

    // Foto
    const marco = $('#fotoMarco');
    const pintarFoto = () => {
      if (B.foto) {
        const [px, py] = (B.foto_posicion || '50% 22%').split(' ');
        marco.className = 'foto-marco con-foto';
        marco.innerHTML = '<img src="' + esc(fotoSrc(B)) + '" alt="Foto" style="object-position:' + esc(B.foto_posicion) + '"><span class="foto-mira" style="left:' + esc(px) + ';top:' + esc(py) + '"></span>';
        $('#fotoPos').textContent = 'Punto de enfoque: ' + B.foto_posicion + ' (horizontal, vertical)';
      } else {
        marco.className = 'foto-marco';
        marco.innerHTML = '<div>' + ico('foto') + '<br>Arrastra una foto aquí<br>o haz clic para subirla</div>';
        $('#fotoPos').textContent = '';
      }
    };
    const procesar = file => {
      if (!file || !/^image\//.test(file.type)) { aviso('El archivo debe ser una imagen JPG o PNG'); return; }
      const rd = new FileReader();
      rd.onload = () => { const im = new Image(); im.onload = () => {
        const lado = 1200, k = Math.min(1, lado / Math.max(im.naturalWidth, im.naturalHeight));
        const cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        B.foto = cv.toDataURL('image/jpeg', .8); B.foto_posicion = '50% 22%';
        pintarFoto(); programarPrevia(); $('#estadoGuardado').textContent = 'Cambios sin guardar';
        aviso('Foto lista (' + Math.round(B.foto.length * .75 / 1024) + ' KB). Haz clic en el rostro para encuadrar.');
      }; im.src = rd.result; };
      rd.readAsDataURL(file);
    };
    marco.addEventListener('click', e => {
      if (!B.foto) { $('#fotoArchivo').click(); return; }
      const r = marco.getBoundingClientRect();
      B.foto_posicion = Math.round((e.clientX - r.left) / r.width * 100) + '% ' + Math.round((e.clientY - r.top) / r.height * 100) + '%';
      pintarFoto(); programarPrevia(); $('#estadoGuardado').textContent = 'Cambios sin guardar';
    });
    marco.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !B.foto) { e.preventDefault(); $('#fotoArchivo').click(); } });
    ['dragenter', 'dragover'].forEach(ev => marco.addEventListener(ev, e => { e.preventDefault(); marco.classList.add('arrastrando'); }));
    ['dragleave', 'drop'].forEach(ev => marco.addEventListener(ev, e => { e.preventDefault(); marco.classList.remove('arrastrando'); }));
    marco.addEventListener('drop', e => procesar(e.dataTransfer.files[0]));
    $('#fotoArchivo').addEventListener('change', e => procesar(e.target.files[0]));
    $('#fotoQuitar').addEventListener('click', () => { B.foto = ''; pintarFoto(); programarPrevia(); });

    // Validación
    function limpiarError(c) { if (c) { c.classList.remove('error'); const m = $('.msj', c); if (m && m.dataset.orig != null) m.textContent = m.dataset.orig; } }
    function error(id, msj) { const c = $('[data-campo="' + id + '"]', form); if (!c) return; c.classList.add('error'); const m = $('.msj', c); if (m.dataset.orig == null) m.dataset.orig = m.textContent; m.textContent = msj; }
    form.addEventListener('submit', e => {
      e.preventDefault(); leer();
      const errores = [];
      const req = (id, val, msj) => { if (!val) { error(id, msj || 'Campo obligatorio'); errores.push(id); } };
      req('nombres', B.nombres); req('apellidos', B.apellidos); req('cargo_es', B.cargo.es);
      if (!B.correo) req('correo', '', 'Campo obligatorio');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(B.correo)) { error('correo', 'Correo no válido'); errores.push('correo'); }
      if (!B.slug) { error('slug', 'Campo obligatorio'); errores.push('slug'); }
      else if (E.tarjetas.some(t => t.slug === B.slug && (nueva || t !== orig))) { error('slug', 'Ya existe una tarjeta con esta dirección'); errores.push('slug'); }
      if (B.celular && !/^\+?[\d\s-]{7,}$/.test(B.celular)) { error('celular', 'Usa el formato +51 9xx xxx xxx'); errores.push('celular'); }
      if (B.anexo && !/^\d{1,6}$/.test(B.anexo)) { error('anexo', 'Escribe solo números (ej. 1205)'); errores.push('anexo'); }
      if (errores.length) { const p = $('[data-campo="' + errores[0] + '"] input, [data-campo="' + errores[0] + '"] textarea', form); if (p) p.focus(); aviso('Revisa los campos marcados'); return; }
      const ahora = new Date().toISOString();
      if (nueva) {
        const t = Object.assign({}, B, { estado: 'activa', creada: ahora, actualizada: ahora, codigo: Math.random().toString(36).slice(2, 7).toUpperCase() });
        E.tarjetas.unshift(t); registrarCambio('crear', 'Creó la tarjeta', t);
        guardarEstado(); aviso('Tarjeta creada: ' + URL_BASE + t.slug + '/'); location.hash = '#/tarjetas';
      } else {
        const cambios = [];
        const etiquetas = { nombres: 'nombres', apellidos: 'apellidos', correo: 'correo', slug: 'dirección', cargo: 'cargo', area: 'área', celular: 'celular', anexo: 'anexo', whatsapp: 'WhatsApp', bio: 'biografía', foto: 'foto', foto_posicion: 'encuadre de foto' };
        Object.keys(etiquetas).forEach(k => { if (JSON.stringify(orig[k]) !== JSON.stringify(B[k])) cambios.push(etiquetas[k]); });
        if (!cambios.length) { aviso('No hay cambios que guardar'); return; }
        delete cacheStats[orig.slug];
        Object.assign(orig, B, { actualizada: ahora });
        registrarCambio(cambios.includes('foto') ? 'foto' : 'editar', 'Editó la tarjeta', orig, nombreDe(orig) + ' · ' + cambios.join(', '));
        guardarEstado(); aviso('Cambios guardados'); location.hash = '#/tarjetas';
      }
    });
    const be = $('#btnEstado');
    if (be) be.addEventListener('click', () => orig.estado === 'desactivada' ? reactivar(orig, () => vistaEditor(orig.slug)) : desactivar(orig, () => vistaEditor(orig.slug)));
    leer(); pintarFoto();
  }

  /* ───── Vista: Datos comunes ───── */
  const REDES = [['linkedin', 'LinkedIn'], ['x', 'X (Twitter)'], ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok']];
  function vistaComunes() {
    const C = JSON.parse(JSON.stringify(E.comunes));
    const inp = (id, etq, val) => '<label class="campo"><span>' + esc(etq) + '</span><input id="' + id + '" value="' + esc(val) + '"></label>';
    const pintarEnlaces = () => C.enlaces.map((e2, i) => '<div class="item-editable" data-i="' + i + '">' +
      '<label class="campo"><span>Título (español)</span><input data-k="titulo.es" value="' + esc(e2.titulo.es) + '"></label>' +
      '<label class="campo"><span>Título (inglés)</span><input data-k="titulo.en" value="' + esc(e2.titulo.en) + '"></label>' +
      '<label class="campo"><span>Enlace (URL)</span><input data-k="url" value="' + esc(e2.url) + '" placeholder="https://"></label>' +
      '<button type="button" class="btn btn-fantasma btn-ico" data-quitar="' + i + '" aria-label="Quitar enlace">' + ico('basura') + '</button></div>').join('');
    cont.innerHTML = '<div class="vista"><div class="cabecera"><div><h1>Datos comunes</h1><p>Se configuran una vez y se aplican a las ' + E.tarjetas.length + ' tarjetas.</p></div></div>' +
      '<form id="formComunes" class="editor-form" style="max-width:980px">' +
      '<section class="seccion"><h2>Institución</h2><p>Aparece al pie de cada tarjeta y en el contacto guardado.</p>' +
        '<div class="fila-campos">' + inp('ent_es', 'Entidad (español)', C.entidad.es) + inp('ent_en', 'Entidad (inglés)', C.entidad.en) + '</div>' +
        '<div class="fila-campos">' + inp('telefono', 'Teléfono central (se combina con el anexo)', C.telefono) + inp('web', 'Sitio web', C.web) + '</div></section>' +
      '<section class="seccion"><h2>Dirección</h2><p>Se usa en la tarjeta, en el botón Ubicación y en el contacto.</p>' +
        '<div class="fila-campos">' + inp('calle', 'Calle y número', C.direccion.calle) + inp('distrito', 'Distrito', C.direccion.distrito) + '</div>' +
        '<div class="fila-campos">' + inp('ciudad', 'Ciudad', C.direccion.ciudad) + inp('cp', 'Código postal', C.direccion.cp) + '</div></section>' +
      '<section class="seccion"><h2>Enlaces destacados</h2><p>Se muestran en todas las tarjetas, en este orden.</p><div class="lista-editable" id="enlacesC">' + pintarEnlaces() + '</div>' +
        '<button type="button" class="btn btn-sec" id="agregarEnlace" style="margin-top:12px">' + ico('mas2') + 'Agregar enlace</button></section>' +
      '<section class="seccion"><h2>Redes institucionales</h2><p>Deja vacía una red para ocultarla.</p><div class="lista-editable">' +
        REDES.map(([k, n]) => { const r = C.redes.find(x => x.red === k); return '<div class="item-editable red"><span style="align-self:center;font-weight:500">' + n + '</span><label class="campo"><span class="sr">' + n + '</span><input data-red="' + k + '" value="' + esc(r ? r.url : '') + '" placeholder="https://"></label></div>'; }).join('') +
      '</div></section>' +
      '<div class="barra-guardar"><span class="espaciador"></span><button type="submit" class="btn btn-primario">' + ico('check') + 'Guardar y aplicar a todas</button></div></form></div>';
    const lee = () => {
      $$('#enlacesC .item-editable').forEach(it => { const e2 = C.enlaces[+it.dataset.i]; $$('[data-k]', it).forEach(i => { const [a, b] = i.dataset.k.split('.'); if (b) e2[a][b] = i.value.trim(); else e2[a] = i.value.trim(); }); });
    };
    $('#agregarEnlace').addEventListener('click', () => { lee(); C.enlaces.push({ icono: 'link', titulo: { es: '', en: '' }, sub: { es: '', en: '' }, url: '' }); $('#enlacesC').innerHTML = pintarEnlaces(); });
    $('#enlacesC').addEventListener('click', e => { const b = e.target.closest('[data-quitar]'); if (!b) return; lee(); C.enlaces.splice(+b.dataset.quitar, 1); $('#enlacesC').innerHTML = pintarEnlaces(); });
    $('#formComunes').addEventListener('submit', e => {
      e.preventDefault(); lee();
      const g = id => $('#' + id).value.trim();
      C.entidad = { es: g('ent_es'), en: g('ent_en') }; C.telefono = g('telefono'); C.web = g('web');
      Object.assign(C.direccion, { calle: g('calle'), distrito: g('distrito'), ciudad: g('ciudad'), cp: g('cp') });
      C.direccion.mapa = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([C.direccion.calle, C.direccion.distrito, C.direccion.ciudad].join(', '));
      C.enlaces = C.enlaces.filter(x => x.url && x.titulo.es);
      C.redes = REDES.map(([k]) => ({ red: k, url: $('[data-red="' + k + '"]').value.trim() })).filter(x => x.url);
      E.comunes = C; registrarCambio('comunes', 'Actualizó los datos comunes', null, 'Aplicado a ' + E.tarjetas.length + ' tarjetas'); guardarEstado();
      aviso('Datos comunes aplicados a ' + E.tarjetas.length + ' tarjetas');
    });
  }

  /* ───── Vista: Carga desde Excel (fase 2) ───── */
  function vistaCarga() {
    const mir = buscarTarjeta('mirtha-razuri');
    cont.innerHTML = '<div class="vista"><div class="cabecera"><div><h1>Carga desde Excel</h1><p>Crea varias tarjetas a la vez con la plantilla y las fotos.</p></div><span class="chip-proto">Fase 2 · vista de demostración</span></div>' +
      '<div class="pasos"><div class="paso"><b>1</b>Llena <strong>plantilla-tarjetas.xlsx</strong>: una fila por funcionario. La última columna te dice cómo nombrar cada foto.</div>' +
      '<div class="paso"><b>2</b>Nombra cada foto con el usuario del correo: <strong>mrazuri@proinversion.gob.pe → mrazuri.jpg</strong>.</div>' +
      '<div class="paso"><b>3</b>Arrastra el Excel y las fotos juntos (o un ZIP). Revisa el resultado antes de crear las tarjetas.</div></div>' +
      '<div class="zona-carga" id="zonaCarga">' + ico('subir') + '<strong>Arrastra aquí el Excel y las fotos</strong><span>o</span><button type="button" class="btn btn-sec" id="verEjemplo">Ver un ejemplo de revisión</button></div>' +
      '<div id="revision"></div></div>';
    const zona = $('#zonaCarga');
    ['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.style.borderColor = '#E1261D'; }));
    ['dragleave', 'drop'].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.style.borderColor = ''; }));
    zona.addEventListener('drop', () => { aviso('En el prototipo se muestra un ejemplo; la lectura real del Excel llega en la fase 2'); mostrar(); });
    $('#verEjemplo').addEventListener('click', mostrar);
    function mostrar() {
      const filas = [
        { n: 2, t: mir, foto: 'mrazuri.jpg', r: 'ok', msj: 'Lista para crear · foto encontrada' },
        { n: 3, t: { nombres: 'Jorge Luis', apellidos: 'Salazar Ríos', cargo: { es: 'Jefe de Comunicaciones' }, correo: 'jsalazar@ejemplo.gob.pe' }, foto: '—', r: 'aviso-r', msj: 'Sin foto jsalazar.jpg: se creará con iniciales' },
        { n: 4, t: { nombres: 'Ana Sofía', apellidos: 'Torres Villanueva', cargo: { es: 'Directora de Portafolio' }, correo: 'atorres@ejemplo.gob.pe' }, foto: 'atorres.jpg', r: 'error', msj: 'Anexo «+2001205 X1205» no válido: escribe solo números (ej. 1205)' },
        { n: 5, t: { nombres: 'Mirtha', apellidos: 'Rázuri', cargo: { es: 'Gerenta General' }, correo: 'mrazuri@proinversion.gob.pe' }, foto: 'mrazuri.jpg', r: 'error', msj: 'Correo repetido: ya existe una tarjeta con mrazuri@proinversion.gob.pe' }
      ];
      $('#revision').innerHTML = '<div class="caja" style="margin-top:16px"><div class="caja-cab"><div><h2>Revisión antes de crear</h2><p>plantilla-tarjetas.xlsx · 4 filas · 3 fotos</p></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><span class="resultado ok">' + ico('check') + '1 lista</span><span class="resultado aviso-r">● 1 con aviso</span><span class="resultado error">● 2 con errores</span></div></div>' +
        '<div class="tabla-env"><table><thead><tr><th>Fila</th><th>Funcionario</th><th>Foto</th><th>Resultado</th></tr></thead><tbody>' +
        filas.map(f => '<tr><td>' + f.n + '</td><td><div class="persona">' + (f.t.foto ? avatarHTML(f.t) : '<span class="avatar">' + esc(iniciales(f.t)) + '</span>') + '<div><strong>' + esc(nombreDe(f.t)) + '</strong><small>' + esc(f.t.correo) + '</small></div></div></td><td>' + esc(f.foto) + '</td><td><span class="resultado ' + f.r + '">' + (f.r === 'ok' ? ico('check') : '●') + esc(f.msj) + '</span></td></tr>').join('') +
        '</tbody></table></div></div>' +
        '<div class="barra-guardar"><button type="button" class="btn btn-sec" id="informe">' + ico('descargar') + 'Descargar informe de errores</button><span class="espaciador"></span><span class="estado-guardado">Corrige el Excel y vuelve a cargarlo, o crea solo las válidas</span><button type="button" class="btn btn-primario" disabled>Crear 2 tarjetas válidas</button></div>';
      $('#informe').addEventListener('click', () => {
        const csv = '﻿"Fila";"Correo";"Resultado"\r\n' + filas.filter(f => f.r !== 'ok').map(f => '"' + f.n + '";"' + f.t.correo + '";"' + f.msj.replace(/"/g, '""') + '"').join('\r\n');
        descargar(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'informe-carga.csv');
      });
    }
  }

  /* ───── Vista: Historial ───── */
  function vistaHistorial() {
    const icoTipo = { crear: ['mas2', 1], editar: ['lapiz'], foto: ['foto'], desactivar: ['apagar', 1], reactivar: ['encender'], comunes: ['edificio'], qr: ['qr'] };
    cont.innerHTML = '<div class="vista"><div class="cabecera"><div><h1>Historial de cambios</h1><p>Quién cambió qué y cuándo. Se conserva aunque una tarjeta se desactive.</p></div></div>' +
      '<div class="caja"><ul class="linea-tiempo">' + E.historial.map(h => { const [ic, rojo] = icoTipo[h.tipo] || ['lapiz'];
        return '<li><span class="lt-ico' + (rojo ? ' rojo' : '') + '">' + ico(ic) + '</span><div><strong>' + esc(h.texto) + '</strong><small>' + esc(h.detalle || '') + ' · Administrador</small></div><time datetime="' + esc(h.fecha) + '">' + esc(fmtFechaHora(h.fecha)) + '</time></li>'; }).join('') +
      '</ul></div></div>';
  }

  /* ───── Acceso y arranque ───── */
  function entrar() { $('#acceso').hidden = true; $('#app').hidden = false; ruta(); }
  $('#formAcceso').addEventListener('submit', e => { e.preventDefault(); try { sessionStorage.setItem('proto-admin-sesion', '1'); } catch (x) { } entrar(); });
  $('#btnSalir').addEventListener('click', () => { try { sessionStorage.removeItem('proto-admin-sesion'); } catch (x) { } $('#app').hidden = true; $('#acceso').hidden = false; });
  $('#btnRestablecer').addEventListener('click', () => modal('¿Restablecer los datos de prueba?', '<p>Se borran las tarjetas y cambios hechos en este navegador y vuelven los datos iniciales del prototipo.</p>', [{ texto: 'Cancelar' }, { texto: 'Restablecer', clase: 'btn-peligro', accion: () => restablecer(true) }]));
  $('#modal').addEventListener('click', e => { if (e.target.closest('[data-cerrar-modal]')) cerrarModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) cerrarModal(); });

  cargar();
  let sesion = new URLSearchParams(location.search).get('entrar') === '1'; // atajo del prototipo para capturas
  try { sesion = sesion || sessionStorage.getItem('proto-admin-sesion') === '1'; } catch (x) { }
  if (sesion) entrar(); else $('#acceso').hidden = false;
})();
