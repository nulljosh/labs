// Footer band: Horula's things in a row (the mark, world, bell, stopwatch, hourglass, moon), cut like a line
// engraving in plain 2D canvas. Same method as Hermes' footer band. Faint rules run across the band; inside the glyphs they thicken, and thicken again on
// the edge facing away from the light, so the glyphs look cut into the page. Drawn once per size and theme.
// ponytail: static on purpose, a drifting light shader rendered as a black box on iPhone in Hermes.
(function () {
  var band = document.querySelector('.word-band'), canvas = band && band.querySelector('canvas');
  if (!canvas) return;

  var mark = new Image(), tints = {};
  mark.src = 'mark.svg';

  // Each glyph is drawn white on a 100 unit square.
  var GLYPHS = [
    function (c) { // the brand mark itself
      if (!mark.complete || !mark.naturalWidth) return;
      var key = c.fillStyle;
      if (!tints[key]) {
        var t = document.createElement('canvas'); t.width = t.height = 400;
        var tc = t.getContext('2d'); tc.drawImage(mark, 0, 0, 400, 400);
        tc.globalCompositeOperation = 'source-in'; tc.fillStyle = key; tc.fillRect(0, 0, 400, 400);
        tints[key] = t;
      }
      c.drawImage(tints[key], -6, -6, 112, 112);
    },
    function (c) { // world
      c.beginPath(); c.arc(50, 50, 38, 0, 7); c.fill();
      c.globalCompositeOperation = 'destination-out'; c.lineWidth = 4.5;
      c.beginPath(); c.ellipse(50, 50, 16, 38, 0, 0, 7); c.stroke();
      c.fillRect(48, 12, 4.5, 76);
      [32, 50, 68].forEach(function (y) { c.fillRect(14, y - 2.25, 72, 4.5); });
      c.globalCompositeOperation = 'source-over';
    },
    function (c) { // alarm bell
      c.beginPath(); c.moveTo(18, 74); c.bezierCurveTo(28, 68, 30, 58, 30, 44); c.arc(50, 44, 20, Math.PI, 0);
      c.bezierCurveTo(70, 58, 72, 68, 82, 74); c.closePath(); c.fill();
      c.beginPath(); c.arc(50, 22, 5, 0, 7); c.fill();
      c.beginPath(); c.ellipse(50, 82, 9, 7, 0, 0, Math.PI); c.fill();
    },
    function (c) { // stopwatch
      c.lineWidth = 9; c.lineCap = 'round';
      c.beginPath(); c.arc(50, 58, 32, 0, 7); c.stroke();
      c.fillRect(41, 8, 18, 8); c.fillRect(47, 14, 6, 12);
      c.lineWidth = 8; c.beginPath(); c.moveTo(50, 58); c.lineTo(67, 40); c.stroke();
      c.beginPath(); c.arc(50, 58, 7, 0, 7); c.fill();
    },
    function (c) { // hourglass
      c.fillRect(20, 8, 60, 8); c.fillRect(20, 84, 60, 8);
      c.beginPath(); c.moveTo(27, 16); c.lineTo(73, 16);
      c.bezierCurveTo(73, 38, 53, 43, 53, 50); c.bezierCurveTo(53, 57, 73, 62, 73, 84);
      c.lineTo(27, 84); c.bezierCurveTo(27, 62, 47, 57, 47, 50); c.bezierCurveTo(47, 43, 27, 38, 27, 16); c.fill();
    },
    function (c) { // moon
      c.beginPath(); c.arc(46, 50, 36, 0, 7); c.fill();
      c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(63, 40, 31, 0, 7); c.fill();
      c.globalCompositeOperation = 'source-over';
      [[80, 20, 4], [88, 46, 3], [72, 70, 3.5]].forEach(function (s) { c.beginPath(); c.arc(s[0], s[1], s[2], 0, 7); c.fill(); });
    }
  ];
  // Lays the glyphs out evenly across a w by h 2D context, in the given colour: one row, or two on a narrow band.
  function grid(w, h) {
    var n = GLYPHS.length, rows = w < h * 3 ? 2 : 1, per = Math.ceil(n / rows);
    return { rows: rows, per: per, cell: Math.min(h / rows * 0.86, w / per) };
  }
  function paint(c, w, h, colour) {
    var g = grid(w, h), gap = (w - g.cell * g.per) / g.per, rowH = h / g.rows;
    GLYPHS.forEach(function (draw, i) {
      var col = i % g.per, row = Math.floor(i / g.per);
      c.save(); c.translate(gap / 2 + col * (g.cell + gap), row * rowH + (rowH - g.cell) / 2 + rowH * 0.04); c.scale(g.cell / 100, g.cell / 100);
      c.fillStyle = c.strokeStyle = colour; draw(c); c.restore();
    });
  }

  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  function layer(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  // Horizontal rules `t` px thick, one every `pitch` px, kept only where `mask` is drawn (everywhere when null).
  function rules(w, h, pitch, t, colour, mask) {
    var c = layer(w, h), x = c.getContext('2d');
    x.fillStyle = colour;
    for (var y = 0; y < h; y += pitch) x.fillRect(0, Math.round(y + (pitch - t) / 2), w, Math.max(1, Math.round(t)));
    if (mask) { x.globalCompositeOperation = 'destination-in'; x.drawImage(mask, 0, 0); }
    return c;
  }
  var drawnW = 0;
  function draw() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h) return;
    drawnW = w; canvas.width = w; canvas.height = h;
    var colour = getComputedStyle(band).color, pitch = Math.min(5 * dpr, Math.max(3 * dpr, grid(w, h).cell / 22)), s = Math.max(2, h * 0.014);
    var glyphs = layer(w, h); paint(glyphs.getContext('2d'), w, h, '#fff');
    // the shadow side: glyph pixels whose neighbour down and right is outside the glyph (light from the top left)
    var shade = layer(w, h), sc = shade.getContext('2d');
    sc.drawImage(glyphs, 0, 0); sc.globalCompositeOperation = 'destination-out'; sc.drawImage(glyphs, -s, -s);
    ctx.globalAlpha = 0.28; ctx.drawImage(rules(w, h, pitch, dpr * 0.75, colour, null), 0, 0);
    ctx.globalAlpha = 1; ctx.drawImage(rules(w, h, pitch, pitch * 0.32, colour, glyphs), 0, 0);
    ctx.drawImage(rules(w, h, pitch, pitch * 0.6, colour, shade), 0, 0);
    // fade out toward the legal line
    var g = ctx.createLinearGradient(0, h * 0.88, 0, h);
    g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }
  band.classList.add('live');
  draw();
  mark.addEventListener('load', draw);
  // iOS fires resize as the toolbar slides; only a width change needs a redraw
  window.addEventListener('resize', function () { if (Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)) !== drawnW) draw(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
})();
