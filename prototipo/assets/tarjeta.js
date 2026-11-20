/* Tarjeta virtual PROINVERSIÓN — comportamiento de la vista pública. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var D = JSON.parse($('#datos-tarjeta').textContent);
  var params = new URLSearchParams(location.search);
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───── Modo vista previa (solo prototipo): el panel de administración entrega los datos ─────
     ?previa=<slug> lee la tarjeta guardada por el panel; además escucha cambios en vivo por postMessage. */
  var previa = params.get('previa');
  function combinar(comunes, t) {
    var url = 'https://www.investinperu.pe/tarjeta/' + t.slug + '/';
    return Object.assign({}, comunes, t, { url_tarjeta: url, url_qr: url });
  }
  if (previa) {
    try {
      var est = JSON.parse(localStorage.getItem('proto-admin-v1'));
      var tp = est && est.tarjetas.filter(function (x) { return x.slug === previa; })[0];
      if (tp) D = combinar(est.comunes, tp);
    } catch (e) {}
  }

  /* ───── Textos de la interfaz ───── */
  var TXT = {
    es: {
      llamar: 'Llamar', whatsapp: 'WhatsApp', correo: 'Correo', ubicacion: 'Ubicación',
      perfil: 'Perfil', contacto: 'Contacto', enlaces: 'Enlaces destacados', redes: 'Síguenos',
      celular: 'Celular', telefono: 'Teléfono', anexo: 'anexo', email: 'Correo electrónico', direccion: 'Dirección', web: 'Sitio web',
      guardar: 'Guardar contacto', qr: 'Ver código QR', compartir: 'Compartir', cerrar: 'Cerrar',
      qrTitulo: 'Escanea y guarda el contacto', qrSub: 'Apunta la cámara de otro celular al código',
      descargarQR: 'Descargar QR', copiar: 'Copiar enlace', copiado: 'Enlace copiado', copiadoDato: 'Copiado',
      guardado: 'Contacto descargado', qrDescargado: 'QR descargado',
      escritorioTitulo: 'Llévalo a tu celular', escritorioSub: 'Escanea el código con la cámara de tu celular y guarda el contacto en un toque.',
      compartirTexto: 'Tarjeta de contacto de',
      inactivaTitulo: 'Esta tarjeta ya no está activa', inactivaTexto: 'Para comunicarte con PROINVERSIÓN usa nuestros canales institucionales.', central: 'Central telefónica'
    },
    en: {
      llamar: 'Call', whatsapp: 'WhatsApp', correo: 'Email', ubicacion: 'Location',
      perfil: 'Profile', contacto: 'Contact', enlaces: 'Featured links', redes: 'Follow us',
      celular: 'Mobile', telefono: 'Phone', anexo: 'ext.', email: 'Email', direccion: 'Address', web: 'Website',
      guardar: 'Save contact', qr: 'Show QR code', compartir: 'Share', cerrar: 'Close',
      qrTitulo: 'Scan to save the contact', qrSub: "Point another phone's camera at the code",
      descargarQR: 'Download QR', copiar: 'Copy link', copiado: 'Link copied', copiadoDato: 'Copied',
      guardado: 'Contact downloaded', qrDescargado: 'QR downloaded',
      escritorioTitulo: 'Take it to your phone', escritorioSub: "Scan the code with your phone's camera and save the contact in one tap.",
      compartirTexto: 'Contact card of',
      inactivaTitulo: 'This card is no longer active', inactivaTexto: 'To contact PROINVERSIÓN, please use our institutional channels.', central: 'Main phone line'
    }
  };

  /* ───── Íconos (trazos propios, 24×24) ───── */
  var I = {
    phone: '<path d="M5.2 3.8h3.4l1.7 4.4-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2 4.4 1.7v3.4a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 3.2 5.9a2 2 0 0 1 2-2.1z"/>',
    mobile: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.8"/><path d="M10.5 18.3h3"/>',
    whatsapp: '<path d="M20.4 11.7a8.4 8.4 0 0 1-12.4 7.4l-4.4 1.3 1.4-4.2a8.4 8.4 0 1 1 15.4-4.5z"/><path d="M9.2 8.2c-.4 2.9 3.4 6.7 6.6 6.5l.9-1.6-2-1.1-1 .8a4.6 4.6 0 0 1-2.4-2.4l.8-1-1.1-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.8"/><path d="m3.6 7.2 8.4 6 8.4-6"/>',
    pin: '<path d="M12 21.2s-7-6.1-7-11.6a7 7 0 0 1 14 0c0 5.5-7 11.6-7 11.6z"/><circle cx="12" cy="9.6" r="2.6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3.2 12h17.6M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
    link: '<path d="M10 14a4.4 4.4 0 0 0 6.3 0l3-3a4.4 4.4 0 0 0-6.3-6.3l-1 1"/><path d="M14 10a4.4 4.4 0 0 0-6.3 0l-3 3a4.4 4.4 0 0 0 6.3 6.3l1-1"/>',
    doc: '<path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8z"/><path d="M14 3v5h5M9 13h6M9 16.5h4"/>',
    qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5"/><path d="M14 14h2.8v2.8H14zM20.5 14v.1M17 20.5h3.5V17M14 20.5v.1"/>',
    share: '<path d="M12 3.5v11M7.8 7.6 12 3.5l4.2 4.1"/><path d="M8 10.5H6.5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16"/>',
    userplus: '<circle cx="10" cy="8" r="4"/><path d="M3 20.2a7 7 0 0 1 14 0M19.5 8v6M16.5 11h6"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
    download: '<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 20h14"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    linkedin: '<path fill="currentColor" stroke="none" d="M4.5 9h3.1v10.5H4.5zM6 4.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10 9h3v1.5c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.1 3.9 4.9v5.8h-3.1v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8v5.3H10z"/>',
    x: '<path fill="currentColor" stroke="none" d="M17.3 3.5h3.1l-6.7 7.6 7.9 9.4h-6.2l-4.8-6.1-5.5 6.1H2l7.1-8.1L1.6 3.5h6.3l4.4 5.7zm-1.1 15.2h1.7L7.4 5.2H5.6z"/>',
    facebook: '<path fill="currentColor" stroke="none" d="M13.4 21v-7.6H16l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.1H7.7v3h2.6V21z"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/>',
    youtube: '<path fill="currentColor" stroke="none" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.8A27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3z"/>'
  };
  I.tiktok = '<path fill="currentColor" stroke="none" d="M16.6 3c.35 2.25 1.75 3.75 4 3.95v3.15a7.7 7.7 0 0 1-3.95-1.2v6.35A6.25 6.25 0 1 1 10.4 9h.65v3.3h-.6a2.95 2.95 0 1 0 2.95 2.95V3z"/>';
  var NOMBRES_RED = { linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' };
  function ico(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || '') + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ───── Idioma ───── */
  var lang = 'es';
  try { lang = params.get('lang') || localStorage.getItem('tarjeta-idioma') || 'es'; } catch (e) { lang = params.get('lang') || 'es'; }
  if (!TXT[lang]) lang = 'es';
  function t(k) { return TXT[lang][k] || k; }
  function v(x) { return x && typeof x === 'object' ? (x[lang] || x.es || '') : (x || ''); }
  function soloDigitos(s) { return String(s || '').replace(/[^\d+]/g, ''); }

  /* ───── Seguimiento (en producción: navigator.sendBeacon('/tarjeta/api/evento', …)) ───── */
  function registrar(evento, detalle) {
    if (previa) return;
    var datos = { tarjeta: D.slug, evento: evento, detalle: detalle || null, origen: params.get('src') || 'directo', idioma: lang };
    if (window.console) console.info('[estadística]', datos);
  }

  /* ───── Pintado de datos ───── */
  function pintar() {
    document.documentElement.lang = lang;
    $$('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    $$('.idioma button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });

    var nombre = (D.nombres + ' ' + D.apellidos).trim();
    $('#nombre').innerHTML = [D.nombres, D.apellidos].filter(Boolean)
      .map(function (p) { return '<span class="linea"><span>' + esc(p) + '</span></span>'; }).join('');
    $('#nombre').setAttribute('aria-label', nombre);
    $('#cargo').textContent = v(D.cargo); $('#cargo').hidden = !v(D.cargo);
    $('#area').textContent = v(D.area); $('#area').hidden = !v(D.area);
    $('#iniciales').textContent = (D.nombres.charAt(0) + D.apellidos.charAt(0)).toUpperCase();
    $('#entidad').textContent = v(D.entidad);
    $('#hojaNombre').textContent = nombre;
    $('#hojaCargo').textContent = v(D.cargo);
    $('#bio').textContent = v(D.bio);
    $('#secPerfil').hidden = !v(D.bio);

    // Acciones rápidas: solo las que tienen dato
    var acc = [];
    if (D.celular || D.telefono) acc.push({ k: 'llamar', i: 'phone', href: 'tel:' + soloDigitos(D.celular || D.telefono) });
    if (D.celular && D.whatsapp) acc.push({ k: 'whatsapp', i: 'whatsapp', href: 'https://wa.me/' + soloDigitos(D.celular).replace('+', ''), ext: true });
    if (D.correo) acc.push({ k: 'correo', i: 'mail', href: 'mailto:' + D.correo });
    if (D.direccion && D.direccion.mapa) acc.push({ k: 'ubicacion', i: 'pin', href: D.direccion.mapa, ext: true });
    $('#acciones').innerHTML = acc.map(function (a) {
      return '<a class="accion" data-evento="' + a.k + '" href="' + esc(a.href) + '"' + (a.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<span class="accion-ico">' + ico(a.i) + '</span>' + esc(t(a.k)) + '</a>';
    }).join('');
    $('#acciones').hidden = !acc.length;

    // Filas de contacto
    var f = [];
    if (D.celular) f.push({ i: 'mobile', etq: t('celular'), val: esc(D.celular), href: 'tel:' + soloDigitos(D.celular), copiar: D.celular, ev: 'llamar' });
    if (D.telefono) f.push({ i: 'phone', etq: t('telefono'), val: esc(D.telefono) + (D.anexo ? ' <small>' + esc(t('anexo')) + ' ' + esc(D.anexo) + '</small>' : ''), href: 'tel:' + soloDigitos(D.telefono) + (D.anexo ? ',' + soloDigitos(D.anexo) : ''), copiar: D.telefono + (D.anexo ? ' ' + t('anexo') + ' ' + D.anexo : ''), ev: 'llamar' });
    if (D.correo) f.push({ i: 'mail', etq: t('email'), val: esc(D.correo), href: 'mailto:' + D.correo, copiar: D.correo, ev: 'correo' });
    if (D.direccion && D.direccion.calle) f.push({ i: 'pin', etq: t('direccion'), val: esc(D.direccion.calle) + '<br><small>' + esc([D.direccion.distrito, D.direccion.ciudad, v(D.direccion.pais)].filter(Boolean).join(', ')) + '</small>', href: D.direccion.mapa, ext: true, ev: 'ubicacion' });
    if (D.web) f.push({ i: 'globe', etq: t('web'), val: esc(D.web.replace(/^https?:\/\/(www\.)?/, '')), href: D.web, ext: true, ev: 'web' });
    $('#filas').innerHTML = f.map(function (x) {
      return '<li><a class="fila" data-evento="' + x.ev + '" href="' + esc(x.href) + '"' + (x.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<span class="fila-ico">' + ico(x.i) + '</span>' +
        '<span class="fila-txt"><span class="fila-etq">' + esc(x.etq) + '</span><span class="fila-val">' + x.val + '</span></span>' +
        (x.copiar ? '<button type="button" class="fila-copiar" data-copiar="' + esc(x.copiar) + '" aria-label="' + esc(t('copiadoDato') === 'Copied' ? 'Copy' : 'Copiar') + ' ' + esc(x.etq) + '">' + ico('copy') + '</button>' : '<span></span>') +
        '</a></li>';
    }).join('');
    $('#secContacto').hidden = !f.length;

    // Enlaces destacados
    var e = (D.enlaces || []).filter(function (x) { return x.url && v(x.titulo); });
    $('#enlaces').innerHTML = e.map(function (x, n) {
      return '<a class="enlace" data-evento="enlace" data-detalle="' + n + '" href="' + esc(x.url) + '" target="_blank" rel="noopener">' +
        '<span class="enlace-ico">' + ico(x.icono || 'link') + '</span>' +
        '<span><span class="enlace-tit">' + esc(v(x.titulo)) + '</span>' + (v(x.sub) ? '<span class="enlace-sub">' + esc(v(x.sub)) + '</span>' : '') + '</span>' +
        '<span class="enlace-flecha">' + ico('arrow') + '</span></a>';
    }).join('');
    $('#secEnlaces').hidden = !e.length;

    // Redes institucionales
    var r = (D.redes || []).filter(function (x) { return x.url && I[x.red]; });
    $('#redes').innerHTML = r.map(function (x) {
      return '<a class="red" data-evento="red" data-detalle="' + x.red + '" href="' + esc(x.url) + '" target="_blank" rel="noopener" aria-label="' + NOMBRES_RED[x.red] + '">' + ico(x.red) + '</a>';
    }).join('');
    $('#secRedes').hidden = !r.length;

    // Botones con ícono
    $('#btnQR').innerHTML = ico('qr') + '<span class="sr">' + esc(t('qr')) + '</span>';
    $('#btnQR').setAttribute('aria-label', t('qr'));
    $('#btnCompartir').innerHTML = ico('share') + '<span class="sr">' + esc(t('compartir')) + '</span>';
    $('#btnCompartir').setAttribute('aria-label', t('compartir'));
    $('#btnGuardar').innerHTML = ico('userplus') + '<span>' + esc(t('guardar')) + '</span>';
    $('#btnDescargarQR').innerHTML = ico('download') + '<span>' + esc(t('descargarQR')) + '</span>';
    $('#btnCopiar').innerHTML = ico('link') + '<span>' + esc(t('copiar')) + '</span>';
    $('.hoja-cerrar').innerHTML = ico('close');
    $('.hoja-cerrar').setAttribute('aria-label', t('cerrar'));
    document.title = (D.nombres + ' ' + D.apellidos) + ' · PROINVERSIÓN';

    // Tarjeta desactivada: el enlace y el QR siguen funcionando, pero solo muestran los canales institucionales
    var inactiva = D.estado === 'desactivada';
    document.body.classList.toggle('inactiva', inactiva);
    var av = $('#avisoInactiva');
    av.hidden = !inactiva;
    if (inactiva) {
      av.innerHTML = '<h2>' + esc(t('inactivaTitulo')) + '</h2><p>' + esc(t('inactivaTexto')) + '</p>' +
        '<div class="inactiva-botones">' +
        (D.telefono ? '<a class="btn-sec" href="tel:' + esc(soloDigitos(D.telefono)) + '">' + ico('phone') + '<span>' + esc(t('central')) + '</span></a>' : '') +
        (D.web ? '<a class="btn-sec" href="' + esc(D.web) + '" target="_blank" rel="noopener">' + ico('globe') + '<span>' + esc(D.web.replace(/^https?:\/\/(www\.)?/, '')) + '</span></a>' : '') +
        '</div>';
    }
  }

  if (previa) window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.tipo !== 'tarjeta-previa') return;
    D = e.data.datos;
    pintar();
    $$('.nombre .linea > span').forEach(function (s) { s.style.transform = 'none'; });
    ponerFoto(D.foto);
    fotoDataURL = null;
    if (D.foto) fotoParaContacto(D.foto).then(function (u) { fotoDataURL = u; });
    if (window.tarjetaQRListo) window.tarjetaQRListo();
  });

  /* ───── Foto ───── */
  var fotoDataURL = null;
  function ponerFoto(src) {
    var img = $('#foto');
    if (!src) { img.hidden = true; $('#hero').classList.remove('con-foto'); return; }
    img.style.objectPosition = D.foto_posicion || '';
    img.onload = function () { img.hidden = false; $('#hero').classList.add('con-foto'); };
    if (img.getAttribute('src') === src && img.complete && img.naturalWidth) { img.onload(); return; }
    img.src = src;
    img.alt = (D.nombres + ' ' + D.apellidos);
  }

  /* ───── QR con la barra de la marca al centro ───── */
  function qrSVG(texto, oscuro) {
    if (typeof window.qrcode !== 'function') return '<p style="color:#9FA1A2;font-size:.8rem">QR</p>';
    var q = window.qrcode(0, 'H'); q.addData(texto); q.make();
    var n = q.getModuleCount(), m = 3, tam = n + m * 2;
    var hueco = Math.round(n * 0.24); if ((n - hueco) % 2) hueco++;
    var h0 = (n - hueco) / 2, h1 = h0 + hueco;
    var color = oscuro || '#161A1D';
    function enBuscador(r, c) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); }
    var d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!q.isDark(r, c) || enBuscador(r, c)) continue;
      if (r >= h0 - 0.5 && r < h1 && c >= h0 - 0.5 && c < h1) continue;
      d += 'M' + (c + m + .08) + ' ' + (r + m + .08) + 'h.84v.84h-.84z';
    }
    function buscador(x, y) {
      return '<rect x="' + (x + .5) + '" y="' + (y + .5) + '" width="6" height="6" rx="1.7" fill="none" stroke="' + color + '" stroke-width="1"/>' +
             '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" rx=".8" fill="#E1261D"/>';
    }
    var cx = m + h0, ancho = hueco;
    var acento = 'M' + (cx + ancho * .55) + ' ' + (m + h0 + ancho * .2) + 'h' + (ancho * .28) + 'l' + (-ancho * .41) + ' ' + (ancho * .6) + 'h' + (-ancho * .28) + 'z';
    return '<svg viewBox="0 0 ' + tam + ' ' + tam + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QR">' +
      '<rect width="' + tam + '" height="' + tam + '" fill="#fff"/>' +
      '<path d="' + d + '" fill="' + color + '" shape-rendering="crispEdges"/>' +
      buscador(m, m) + buscador(m + n - 7, m) + buscador(m, m + n - 7) +
      '<rect x="' + (cx + .3) + '" y="' + (m + h0 + .3) + '" width="' + (ancho - .6) + '" height="' + (ancho - .6) + '" rx="1.2" fill="#fff" stroke="#DADAD8" stroke-width=".25"/>' +
      '<path d="' + acento + '" fill="#E1261D"/>' +
      '</svg>';
  }

  /* ───── Contacto (vCard 3.0) ───── */
  function vEsc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
  function plegar(linea) {
    var out = [], i = 0;
    while (i < linea.length) { out.push((i ? ' ' : '') + linea.substr(i, i ? 74 : 75)); i += i ? 74 : 75; }
    return out.join('\r\n');
  }
  function vcard() {
    var L = ['BEGIN:VCARD', 'VERSION:3.0',
      'N:' + vEsc(D.apellidos) + ';' + vEsc(D.nombres) + ';;;',
      'FN:' + vEsc(D.nombres + ' ' + D.apellidos),
      'ORG:PROINVERSIÓN' + (v(D.area) ? ';' + vEsc(v(D.area)) : '')];
    if (v(D.cargo)) L.push('TITLE:' + vEsc(v(D.cargo)));
    if (D.celular) L.push('TEL;TYPE=CELL,VOICE:' + soloDigitos(D.celular));
    if (D.telefono) L.push('TEL;TYPE=WORK,VOICE:' + soloDigitos(D.telefono) + (D.anexo ? ',' + soloDigitos(D.anexo) : ''));
    if (D.correo) L.push('EMAIL;TYPE=INTERNET,WORK:' + D.correo);
    if (D.direccion && D.direccion.calle) L.push('ADR;TYPE=WORK:;;' + vEsc(D.direccion.calle) + ';' + vEsc(D.direccion.distrito) + ';' + vEsc(D.direccion.ciudad) + ';' + vEsc(D.direccion.cp) + ';' + vEsc(v(D.direccion.pais)));
    if (D.web) L.push('URL;TYPE=WORK:' + D.web);
    L.push('URL:' + D.url_tarjeta);
    if (v(D.bio)) L.push(plegar('NOTE:' + vEsc(v(D.bio))));
    if (fotoDataURL) L.push(plegar('PHOTO;ENCODING=b;TYPE=JPEG:' + fotoDataURL.split(',')[1]));
    L.push('END:VCARD');
    return L.join('\r\n') + '\r\n';
  }
  function fotoParaContacto(src) {
    // Reduce la foto a 400 px en JPEG para incrustarla en el contacto
    return new Promise(function (ok) {
      if (!src) return ok(null);
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () {
        var s = 400, cv = document.createElement('canvas'); cv.width = cv.height = s;
        var lado = Math.min(im.naturalWidth, im.naturalHeight);
        var pos = String(D.foto_posicion || '50% 22%').split(/\s+/).map(function (p) { return (parseFloat(p) || 0) / 100; });
        var sx = (im.naturalWidth - lado) * pos[0], sy = (im.naturalHeight - lado) * (pos[1] == null ? 0.22 : pos[1]);
        cv.getContext('2d').drawImage(im, sx, sy, lado, lado, 0, 0, s, s);
        try { ok(cv.toDataURL('image/jpeg', 0.82)); } catch (e) { ok(null); }
      };
      im.onerror = function () { ok(null); };
      im.src = src;
    });
  }
  function descargar(blob, nombre) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function guardarContacto() {
    // En producción: enlace directo a /tarjeta/{slug}/contacto.vcf (el servidor cuenta la descarga)
    var blob = new Blob([vcard()], { type: 'text/vcard;charset=utf-8' });
    descargar(blob, D.slug + '.vcf');
    registrar('guardar_contacto');
    aviso(t('guardado'));
  }

  /* ───── Hoja del QR ───── */
  var hoja = $('#hojaQR'), ultimoFoco = null;
  function abrirQR() {
    ultimoFoco = document.activeElement;
    $('#qrGrande').innerHTML = qrSVG(D.url_qr + '?src=qr');
    hoja.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { hoja.classList.add('abierta'); $('.hoja-panel').focus(); }); });
    document.body.style.overflow = 'hidden';
    registrar('ver_qr');
  }
  function cerrarQR() {
    hoja.classList.remove('abierta');
    document.body.style.overflow = '';
    setTimeout(function () { hoja.hidden = true; }, reducido ? 0 : 450);
    if (ultimoFoco) ultimoFoco.focus();
  }
  function descargarQR() {
    var svg = qrSVG(D.url_qr + '?src=qr');
    var im = new Image();
    im.onload = function () {
      var s = 1200, cv = document.createElement('canvas'); cv.width = cv.height = s;
      var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, s, s); cx.drawImage(im, 0, 0, s, s);
      cv.toBlob(function (b) { descargar(b, 'QR-' + D.slug + '.png'); aviso(t('qrDescargado')); }, 'image/png');
    };
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    registrar('descargar_qr');
  }

  /* ───── Compartir / copiar ───── */
  function copiar(texto, msj) {
    var hecho = function () { aviso(msj); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(hecho, function () { copiarViejo(texto); hecho(); });
    else { copiarViejo(texto); hecho(); }
  }
  function copiarViejo(texto) {
    var ta = document.createElement('textarea'); ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }
  function compartir() {
    var url = D.url_tarjeta + '?src=compartido';
    var datos = { title: D.nombres + ' ' + D.apellidos + ' · PROINVERSIÓN', text: t('compartirTexto') + ' ' + D.nombres + ' ' + D.apellidos + ' — ' + v(D.cargo), url: url };
    registrar('compartir');
    if (navigator.share) navigator.share(datos).catch(function () {});
    else copiar(url, t('copiado'));
  }

  /* ───── Aviso flotante ───── */
  var tAviso;
  function aviso(msj) {
    var el = $('#aviso');
    el.innerHTML = ico('check') + '<span>' + esc(msj) + '</span>';
    el.classList.add('visible');
    clearTimeout(tAviso); tAviso = setTimeout(function () { el.classList.remove('visible'); }, 2200);
  }

  /* ───── Onda al tocar ───── */
  function onda(e) {
    var b = e.target.closest('.accion, .btn-ico, .btn-principal, .btn-sec, .fila, .enlace');
    if (!b || reducido) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
    var s = document.createElement('span'); s.className = 'onda';
    s.style.width = s.style.height = d + 'px';
    s.style.left = (e.clientX - r.left - d / 2) + 'px'; s.style.top = (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
  }

  /* ───── Eventos ───── */
  document.addEventListener('pointerdown', onda);
  document.addEventListener('click', function (e) {
    var cp = e.target.closest('[data-copiar]');
    if (cp) { e.preventDefault(); e.stopPropagation(); copiar(cp.getAttribute('data-copiar'), t('copiadoDato')); registrar('copiar', cp.getAttribute('data-copiar')); return; }
    var ev = e.target.closest('[data-evento]');
    if (ev) registrar(ev.getAttribute('data-evento'), ev.getAttribute('data-detalle'));
    if (e.target.closest('[data-cerrar]')) cerrarQR();
  });
  $$('.idioma button').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang;
      try { localStorage.setItem('tarjeta-idioma', lang); } catch (e) {}
      pintar(); $$('.nombre .linea > span').forEach(function (s) { s.style.transform = 'none'; });
      $('#panelQRCodigo').innerHTML = qrSVG(D.url_qr + '?src=qr');
      registrar('idioma', lang);
    });
  });
  $('#btnQR').addEventListener('click', abrirQR);
  $('#btnCompartir').addEventListener('click', compartir);
  $('#btnGuardar').addEventListener('click', guardarContacto);
  $('#btnDescargarQR').addEventListener('click', descargarQR);
  $('#btnCopiar').addEventListener('click', function () { copiar(D.url_tarjeta, t('copiado')); registrar('copiar_enlace'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !hoja.hidden) cerrarQR(); });

  /* Parallax suave de la foto: solo en la vista de una columna (celular vertical), donde el encabezado
     sube con la página. En escritorio y horizontal la columna izquierda queda fija y la foto no se mueve. */
  var heroFoto = $('#heroFoto'), pendiente = false;
  var dosColumnas = window.matchMedia('(min-width: 960px), (orientation: landscape) and (min-width: 640px) and (max-height: 560px)');
  function moverFoto() {
    pendiente = false;
    if (dosColumnas.matches) { heroFoto.style.transform = ''; return; }
    heroFoto.style.transform = 'translateY(' + (Math.min(window.scrollY, 700) * 0.3) + 'px)';
  }
  if (!reducido) {
    window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(moverFoto); } }, { passive: true });
    if (dosColumnas.addEventListener) dosColumnas.addEventListener('change', moverFoto); else dosColumnas.addListener(moverFoto);
  }

  /* Aparición de secciones */
  if ('IntersectionObserver' in window && !reducido) {
    var t0 = Date.now(), lote = 0;
    var io = new IntersectionObserver(function (ents) {
      // Durante la entrada esperan a que termine la animación del encabezado; después aparecen al instante
      var espera = Math.max(0, 1.15 - (Date.now() - t0) / 1000);
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.transitionDelay = (espera + (lote++ % 4) * 0.07) + 's';
        en.target.classList.add('visible'); io.unobserve(en.target);
      });
      lote = 0;
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    $$('.revelar').forEach(function (el) { io.observe(el); });
  } else $$('.revelar').forEach(function (el) { el.classList.add('visible'); });

  /* ───── Inicio ───── */
  pintar();
  ponerFoto(D.foto);
  if (D.foto) fotoParaContacto(D.foto).then(function (u) { fotoDataURL = u; });
  window.tarjetaQRListo = function () {
    $('#panelQRCodigo').innerHTML = qrSVG(D.url_qr + '?src=qr');
    if (!hoja.hidden) $('#qrGrande').innerHTML = qrSVG(D.url_qr + '?src=qr');
  };
  if (typeof window.qrcode === 'function') window.tarjetaQRListo();
  registrar('vista');
  var arrancar = function () { document.body.classList.remove('cargando'); document.body.classList.add('listo'); };
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 900); })]).then(arrancar);
  else arrancar();

  /* ───── Panel de pruebas del prototipo (?demo=1) ───── */
  if (params.get('demo') === '1') {
    var p = document.createElement('div'); p.className = 'demo';
    p.innerHTML = '<label>Probar con foto<input type="file" accept="image/*"></label><button type="button" data-d="min">Datos mínimos</button><button type="button" data-d="full">Datos completos</button>';
    document.body.appendChild(p);
    var completo = JSON.parse(JSON.stringify(D));
    $('input', p).addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { ponerFoto(rd.result); fotoParaContacto(rd.result).then(function (u) { fotoDataURL = u; }); };
      rd.readAsDataURL(f);
    });
    p.addEventListener('click', function (e) {
      var b = e.target.closest('[data-d]'); if (!b) return;
      if (b.dataset.d === 'min') { D.celular = ''; D.whatsapp = false; D.anexo = ''; D.bio = null; D.enlaces = []; }
      else D = JSON.parse(JSON.stringify(completo));
      pintar(); $$('.nombre .linea > span').forEach(function (s) { s.style.transform = 'none'; });
    });
  }
})();
