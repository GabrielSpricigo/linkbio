(() => {
  const canvas = document.getElementById("space");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let w = 0, h = 0;
  let stars = [];
  const STAR_COUNT = 70; // 40–80 é o sweet spot

  const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let prefersReduced = motionQuery?.matches ?? false;
  let rafId = null;

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.6, 1.8),          // tamanho
      a: rand(0.25, 0.95),        // alpha base
      tw: rand(0.002, 0.01),      // velocidade do twinkle (bem lento)
      ph: rand(0, Math.PI * 2),   // fase do twinkle
      vx: rand(-0.015, 0.015),    // drift bem sutil
      vy: rand(-0.01, 0.01)
    }));
  }

  function draw(t = 0) {
    // fundo transparente; o gradiente fica no CSS
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      // drift
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      if (s.y < -10) s.y = h + 10;
      if (s.y > h + 10) s.y = -10;

      // twinkle (brilho alternando)
      const twinkle = prefersReduced ? 1 : (0.65 + 0.35 * Math.sin(s.ph + t * s.tw));
      const alpha = Math.min(1, Math.max(0, s.a * twinkle));

      // estrela: pontinho + glow leve
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();

      // glow muito leve (evita peso)
      if (s.r > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120,180,255,${alpha * 0.08})`;
        ctx.fill();
      }
    }

    if (!prefersReduced) rafId = requestAnimationFrame(draw);
  }

  resize();
  makeStars();
  if (prefersReduced) {
    draw(0);
  } else {
    rafId = requestAnimationFrame(draw);
  }

  motionQuery?.addEventListener?.("change", (event) => {
    prefersReduced = event.matches;
    if (prefersReduced) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      draw(0);
    } else {
      if (!rafId) rafId = requestAnimationFrame(draw);
    }
  });

  window.addEventListener("resize", () => {
    resize();
    makeStars();
  }, { passive: true });
})();
