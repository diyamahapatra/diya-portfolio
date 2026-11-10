/* Flourish AI card: the cards play in once on arrival, then only on hover (CSS does the motion).
   Without JS, or with reduced motion, the full cover simply shows.
   On touch screens there is no hover, so the cards come in once the card
   is mostly on screen and leave when it scrolls away. */
(function () {
  var cards = document.querySelectorAll('.fl-card');
  if (!cards.length) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var canHover = window.matchMedia && matchMedia('(hover: hover)').matches;
  cards.forEach(function (c) {
    if (c.classList.contains('fl-live')) return;   // the live card runs its own intro (index.html)
    c.classList.add('fl-armed');
    if (canHover) {
      /* one intro on arrival: the cards slide in, hold, and slide back out;
         after that they only come in on hover */
      var introDone = false;
      var playIntro = function () {
        if (introDone) return; introDone = true;
        c.classList.add('fl-in');
        setTimeout(function () { c.classList.remove('fl-in'); }, 2600);
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.intersectionRatio >= 0.35) { playIntro(); io.disconnect(); } });
        }, { threshold: [0, 0.35] });
        io.observe(c);
      } else playIntro();
      return;
    }
    if (!('IntersectionObserver' in window)) { c.classList.add('fl-in'); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.intersectionRatio >= 0.6) c.classList.add('fl-in');
        else if (e.intersectionRatio < 0.2) c.classList.remove('fl-in');
      });
    }, { threshold: [0, 0.2, 0.6, 1] }).observe(c);
  });
})();
