/* Airbnb case study card: hover animation.
   Usage: include the CSS + this file, then any element with class "cs-card"
   is set up automatically. Call window.AirbnbCaseCard.init(el) for cards
   added later (for example after a client-side route change). */
(function () {
  // timeline, in milliseconds
  var T = { icon: 700, policy: 900, done: 1000, exit: 330, line2: 110 };

  function placeDot(card) {
    var i = card.querySelector('.cs-i');
    if (!i) return;
    var st = getComputedStyle(i);
    var fs = parseFloat(st.fontSize);
    if (!fs) return;
    var font = st.fontStyle + ' ' + st.fontWeight + ' ' + fs + 'px ' + st.fontFamily;
    var W = Math.ceil(fs * 2), H = Math.ceil(fs * 2);
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d');
    x.font = font; x.textBaseline = 'alphabetic'; x.fillStyle = '#000';
    var ox = Math.round(fs * 0.5), base = Math.round(fs * 1.4);
    x.fillText('i', ox, base);
    var d = x.getImageData(0, 0, W, H).data, top = -1, bot = -1, minx = W, maxx = -1;
    // the tittle is the first run of inked rows from the top
    for (var y = 0; y < H; y++) {
      var rmin = W, rmax = -1;
      for (var xx = 0; xx < W; xx++) {
        if (d[(y * W + xx) * 4 + 3] > 110) { if (xx < rmin) rmin = xx; rmax = xx; }
      }
      if (rmax >= 0) {
        if (top < 0) top = y;
        if (rmin < minx) minx = rmin;
        if (rmax > maxx) maxx = rmax;
      } else if (top >= 0) { bot = y - 1; break; }
    }
    if (top < 0 || bot < 0) return;
    var m = x.measureText('ı');
    var A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent;
    if (!A) { A = fs * 0.97; D = fs * 0.24; }
    var lh = parseFloat(st.lineHeight) || fs;
    var baselineFromTop = (lh - (A + D)) / 2 + A;
    var size = (bot - top + 1) * 1.08;
    var centerY = baselineFromTop - (base - (top + bot) / 2);
    var dx = ((minx + maxx) / 2 - ox) - m.width / 2;
    i.style.setProperty('--dot-size', size + 'px');
    i.style.setProperty('--dot-top', (centerY - size / 2) + 'px');
    var dot = i.querySelector('.cs-dot');
    if (dot) dot.style.transform = 'translateX(' + dx + 'px)';
  }

  function init(card) {
    if (card.__csReady) return; card.__csReady = true;
    var cls = card.classList, timers = [], state = 'rest';
    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function cut(fn) { cls.add('cs-cut'); fn(); void card.offsetWidth; cls.remove('cs-cut'); }

    cut(function () { cls.add('cs-t1', 'cs-t2'); });

    function play() {
      if (state === 'playing') return;
      clear(); state = 'playing';
      cut(function () {
        cls.remove('cs-t1', 'cs-t2', 'cs-exit', 'cs-phone-on', 'cs-policy-on', 'cs-done-on');
        cls.add('cs-icon-on');
      });
      later(T.icon, function () { cls.add('cs-phone-on'); });
      later(T.icon + T.policy, function () { cls.add('cs-policy-on'); });
      later(T.icon + T.policy + T.done, function () { cls.add('cs-done-on'); });
    }

    function reverse() {
      if (state !== 'playing') return;
      clear(); state = 'exiting';
      cls.add('cs-exit'); cls.remove('cs-icon-on');
      later(T.exit, function () {
        cut(function () { cls.remove('cs-phone-on', 'cs-policy-on', 'cs-done-on', 'cs-exit'); });
        cls.add('cs-t1');
        later(T.line2, function () { cls.add('cs-t2'); state = 'rest'; });
      });
    }

    /* Plays on its own, on a loop, while the card is on screen:
       title → animation → hold → drop out → title → again. Pauses off screen. */
    var HOLD_END = 2600, HOLD_TITLE = 1600;
    var PLAY_LEN = T.icon + T.policy + T.done + 600;
    var EXIT_LEN = T.exit + T.line2 + 500;
    var loopTimer = null, visible = false;
    function cycle() {
      play();
      loopTimer = setTimeout(function () {
        reverse();
        loopTimer = setTimeout(function () { if (visible) cycle(); else loopTimer = null; }, EXIT_LEN + HOLD_TITLE);
      }, PLAY_LEN + HOLD_END);
    }
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            visible = e.isIntersecting;
            if (visible && !loopTimer) loopTimer = setTimeout(cycle, 500);
          });
        }, { threshold: 0.3 }).observe(card);
      } else {
        visible = true; cycle();
      }
    }

    var redo = function () { placeDot(card); };
    redo();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redo);
    if ('ResizeObserver' in window) new ResizeObserver(redo).observe(card);
  }

  function initAll() { document.querySelectorAll('.cs-card').forEach(init); }
  window.AirbnbCaseCard = { init: init, initAll: initAll };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
