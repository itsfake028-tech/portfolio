/* Scroll position is the source of truth; links and content also work without JS. */
(() => {
  'use strict';
  const story = document.querySelector('.journey-story');
  if (!story) return;
  const chapters = [...story.querySelectorAll('.journey-chapter')];
  if (!chapters.length) return;
  const line = story.querySelector('.journey-line');
  const rail = story.querySelector('.journey-rail');
  const clock = story.querySelector('.journey-clock');
  const year = story.querySelector('.journey-year');
  const date = story.querySelector('.journey-date');
  const count = story.querySelector('.journey-count');
  const total = story.querySelector('.journey-total');
  const previous = story.querySelector('.journey-prev');
  const next = story.querySelector('.journey-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1;
  let frame = 0;
  let markerOffsets = [];
  let lineTop = 0;
  let railLength = 0;

  const digits = [...chapters[0].dataset.year].map(number => {
    const digit = document.createElement('span');
    digit.className = 'journey-digit';
    const strip = document.createElement('span');
    strip.className = 'journey-digit-strip';
    strip.style.setProperty('--digit', number);
    for (let value = 0; value < 10; value++) {
      const glyph = document.createElement('span');
      glyph.textContent = value;
      strip.append(glyph);
    }
    digit.append(strip);
    return digit;
  });
  year.replaceChildren(...digits);
  total.textContent = `/ ${String(chapters.length).padStart(2, '0')}`;
  story.querySelector('.journey-controls').hidden = false;
  story.classList.add('journey-enhanced');

  function setActive(index) {
    if (current === index) return;
    current = index;
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle('is-active', i === index);
      if (i === index) chapter.setAttribute('aria-current', 'step');
      else chapter.removeAttribute('aria-current');
    });
    [...chapters[index].dataset.year].forEach((value, i) => digits[i].firstElementChild.style.setProperty('--digit', value));
    date.textContent = chapters[index].dataset.date;
    count.textContent = String(index + 1).padStart(2, '0');
    previous.disabled = index === 0;
    next.disabled = index === chapters.length - 1;
  }

  function activationY() {
    // On narrow screens, keep the active chapter below the compact sticky clock.
    if (window.innerWidth <= 640) return Math.min(window.innerHeight * .72, clock.getBoundingClientRect().bottom + 85);
    return Math.max(175, Math.min(window.innerHeight * .43, 400));
  }

  function measure() {
    lineTop = line.getBoundingClientRect().top + window.scrollY;
    markerOffsets = chapters.map(chapter => {
      const markerTop = parseFloat(getComputedStyle(chapter, '::before').top) || 32;
      return chapter.offsetTop + markerTop + 5.5;
    });
    railLength = Math.max(1, markerOffsets.at(-1) - markerOffsets[0]);
    rail.style.top = `${markerOffsets[0]}px`;
    rail.style.height = `${railLength}px`;
    rail.style.bottom = 'auto';
    // Leave enough room for the clock at the final milestone, even if its
    // accompanying text is shorter than the clock at a particular viewport.
    const clockTop = parseFloat(getComputedStyle(clock).top) || 0;
    const lastChapter = chapters.at(-1);
    const lastMarkerTop = markerOffsets.at(-1) - lastChapter.offsetTop;
    const belowLastMarker = lastChapter.offsetHeight - lastMarkerTop;
    const tailSpace = Math.max(0, Math.ceil(clockTop + clock.offsetHeight - activationY() - belowLastMarker + 24));
    story.style.setProperty('--journey-tail-space', `${tailSpace}px`);
    queueUpdate();
  }

  function update() {
    frame = 0;
    const position = window.scrollY + activationY() - lineTop;
    const distance = Math.max(0, Math.min(railLength, position - markerOffsets[0]));
    const progress = distance / railLength;
    story.style.setProperty('--journey-progress', `${(progress * 100).toFixed(3)}%`);
    story.style.setProperty('--journey-rail-progress', `${distance.toFixed(2)}px`);
    story.style.setProperty('--journey-rotation', `${(-progress * 65).toFixed(2)}deg`);
    // Absolute scroll-linked rotation naturally reverses when scrolling back.
    story.style.setProperty('--journey-arrow-rotation', `${(-progress * 720).toFixed(2)}deg`);
    let active = 0;
    for (let index = 1; index < markerOffsets.length; index++) {
      if (position >= markerOffsets[index] - 30) active = index;
    }
    setActive(active);
  }

  function queueUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function goTo(index) {
    if (index < 0 || index >= chapters.length) return;
    const target = chapters[index];
    const targetTop = lineTop + markerOffsets[index] - activationY() + 4;
    window.scrollTo({ top: targetTop, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', `#${target.id}`);
  }

  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  if (document.fonts) document.fonts.ready.then(measure);
  if ('ResizeObserver' in window) {
    // Also catches the preserved paper-tear animation moving this section.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(line);
  }
  measure();
})();
