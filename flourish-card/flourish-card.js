/* Flourish AI card: the cards are hidden until hover (CSS does the rest).
   Without JS, or with reduced motion, the full cover simply shows.
   On touch screens there is no hover, so the cards come in once the card
   is mostly on screen and leave when it scrolls away. */
(function () {
  var cards = document.querySelectorAll('.fl-card');
  if (!cards.length) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var canHover = window.matchMedia && matchMedia('(hover: hover)').matches;
  cards.forEach(function (c) {
    c.classList.add('fl-armed');
    if (canHover || !('IntersectionObserver' in window)) {
      if (!canHover) c.classList.add('fl-in');
      return;
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.intersectionRatio >= 0.6) c.classList.add('fl-in');
        else if (e.intersectionRatio < 0.2) c.classList.remove('fl-in');
      });
    }, { threshold: [0, 0.2, 0.6, 1] }).observe(c);
  });
})();
