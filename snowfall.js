(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Unable to initialize the snowfall canvas.");

  canvas.className = "snowfall-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let flakes = [];
  let frameId = 0;
  let previousTime = 0;

  function createFlake(randomY = false) {
    const radius = Math.random() * 2.2 + 0.7;
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -radius,
      radius,
      speed: 18 + Math.random() * 44,
      sway: 8 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.24 + Math.random() * 0.58,
    };
  }

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const flakeCount = Math.min(110, Math.max(35, Math.round((width * height) / 14000)));
    flakes = Array.from({ length: flakeCount }, () => createFlake(true));
  }

  function drawFrame(time) {
    const delta = Math.min((time - previousTime) / 1000 || 0, 0.05);
    previousTime = time;
    context.clearRect(0, 0, width, height);

    for (const flake of flakes) {
      flake.phase += delta * 0.7;
      flake.x += (Math.sin(flake.phase) * flake.sway + 7) * delta;
      flake.y += flake.speed * delta;

      if (flake.y > height + flake.radius) {
        Object.assign(flake, createFlake());
      } else if (flake.x > width + flake.radius) {
        flake.x = -flake.radius;
      }

      context.beginPath();
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(235, 246, 255, ${flake.opacity})`;
      context.fill();
    }

    frameId = window.requestAnimationFrame(drawFrame);
  }

  function pause() {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function resume() {
    if (frameId || document.hidden || reducedMotion.matches) return;
    previousTime = 0;
    frameId = window.requestAnimationFrame(drawFrame);
  }

  function handleMotionPreference() {
    if (reducedMotion.matches) {
      pause();
      canvas.remove();
      return;
    }
    if (!canvas.isConnected) document.body.append(canvas);
    resizeCanvas();
    resume();
  }

  resizeCanvas();
  resume();
  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else resume();
  });
  reducedMotion.addEventListener("change", handleMotionPreference);
})();
