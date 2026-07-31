/* Looping carousel for [data-auto] conveyors.

   The track is cloned end to end and translated by exactly one set width, so
   when the animation restarts the clone is sitting where the original began
   and the seam never shows. Progressive enhancement: without this script the
   conveyor is still a normal scrollable track, so every card stays reachable.

   It does not run for readers who have asked for reduced motion, and it does
   not run on touch, where a thumb is a better control than an animation. */
(function () {
  var SPEED = 40;                                     /* pixels a second */
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var touch = window.matchMedia('(max-width: 760px)');

  function build(conv) {
    var track = conv.querySelector('.conv-track');
    if (!track) return;

    /* remember the authored cards once, so re-measuring never compounds */
    if (!track._cards) track._cards = [].slice.call(track.children);
    var cards = track._cards;

    /* start from a clean track every time: resize changes the card width */
    [].slice.call(track.children).forEach(function (c) {
      if (c.hasAttribute('data-clone')) track.removeChild(c);
    });
    conv.classList.remove('rolling');
    track.style.removeProperty('--shift');
    track.style.removeProperty('--dur');

    if (still.matches || touch.matches || cards.length === 0) return;

    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var shift = 0;
    cards.forEach(function (c) { shift += c.getBoundingClientRect().width + gap; });
    if (shift < 1) return;

    /* one clone set is enough only if a set is wider than the viewport;
       otherwise the tail runs out mid-loop and the track shows a gap */
    var sets = Math.max(2, Math.ceil(conv.clientWidth / shift) + 1);
    var frag = document.createDocumentFragment();
    for (var s = 1; s < sets; s++) {
      cards.forEach(function (c) {
        var k = c.cloneNode(true);
        k.setAttribute('data-clone', '');
        k.setAttribute('aria-hidden', 'true');
        k.setAttribute('tabindex', '-1');       /* clones are decoration, not stops */
        frag.appendChild(k);
      });
    }
    track.appendChild(frag);

    track.style.setProperty('--shift', shift + 'px');
    track.style.setProperty('--dur', (shift / SPEED) + 's');
    conv.classList.add('rolling');
  }

  var convs = [].slice.call(document.querySelectorAll('.conveyor[data-auto]'));
  if (!convs.length) return;

  function buildAll() { convs.forEach(build); }
  buildAll();

  /* card width is a clamp on vw, so a resize changes the loop distance */
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(buildAll, 200);
  });
  if (still.addEventListener) {
    still.addEventListener('change', buildAll);
    touch.addEventListener('change', buildAll);
  }

  /* nothing should animate while it is off screen */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('inview', e.isIntersecting); });
    }, { rootMargin: '80px' });
    convs.forEach(function (c) { io.observe(c); });
  } else {
    convs.forEach(function (c) { c.classList.add('inview'); });
  }
})();
