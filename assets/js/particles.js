/* Decorative, dependency-free hero artwork. The rest of the page works without it. */
(() => {
  "use strict";

  const canvas = document.getElementById("particle-canvas");
  if (!canvas || !canvas.getContext) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const stage = canvas.closest(".particle-stage") || canvas.parentElement;
  if (!stage) return;
  const toggle = document.getElementById("motion-toggle");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const storageKey = "yee-particle-motion";
  const tau = Math.PI * 2;
  let storedPreference = null;
  try {
    storedPreference = window.sessionStorage.getItem(storageKey);
  } catch (_) { /* Storage may be disabled; the control still works. */ }

  let paused = motionPreference.matches || storedPreference === "paused";
  let visible = true;
  let width = 1;
  let height = 1;
  let radius = 1;
  let animationFrame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let points = [];
  let stars = [];
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // A deterministic field avoids flicker and random rearrangement on resize.
  function random(seed) {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  function buildField() {
    const compact = width < 480;
    const sphereCount = compact ? 260 : 480;
    const ringCount = compact ? 145 : 260;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    points = [];

    for (let i = 0; i < sphereCount; i += 1) {
      const y = 1 - (i / Math.max(1, sphereCount - 1)) * 2;
      const horizontal = Math.sqrt(1 - y * y);
      const angle = goldenAngle * i;
      const shell = 0.91 + random(i + 10) * 0.09;
      points.push({
        x: Math.cos(angle) * horizontal * shell,
        y: y * shell,
        z: Math.sin(angle) * horizontal * shell,
        size: 0.65 + random(i + 21) * 0.85,
        phase: random(i + 81) * tau,
        ring: false,
        bright: i % 13 === 0,
      });
    }

    // A softly scattered ribbon wraps around the particle sphere.
    for (let i = 0; i < ringCount; i += 1) {
      const angle = (i / ringCount) * tau;
      const spread = random(i + 900) - 0.5;
      const distance = 1.3 + spread * 0.31;
      points.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle * 3) * 0.055 + (random(i + 1300) - 0.5) * 0.085,
        z: Math.sin(angle) * distance,
        size: 0.7 + random(i + 1600) * 1.1,
        phase: random(i + 1800) * tau,
        ring: true,
        bright: i % 7 === 0,
      });
    }

    stars = Array.from({ length: compact ? 30 : 55 }, (_, i) => ({
      x: random(i + 3000),
      y: random(i + 4000),
      size: 0.35 + random(i + 5000) * 0.7,
      phase: random(i + 6000) * tau,
    }));
  }

  function render() {
    context.clearRect(0, 0, width, height);
    const centerX = width * 0.5;
    const centerY = height * 0.49;

    const halo = context.createRadialGradient(centerX, centerY, radius * 0.05, centerX, centerY, radius * 1.65);
    halo.addColorStop(0, "rgba(42, 136, 206, 0.045)");
    halo.addColorStop(0.6, "rgba(35, 137, 216, 0.055)");
    halo.addColorStop(1, "rgba(35, 137, 216, 0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, width, height);

    stars.forEach((star) => {
      const alpha = 0.18 + (Math.sin(elapsed * 0.35 + star.phase) + 1) * 0.1;
      context.fillStyle = `rgba(169, 202, 222, ${alpha})`;
      context.beginPath();
      context.arc(star.x * width, star.y * height, star.size, 0, tau);
      context.fill();
    });

    const turn = elapsed * 0.085 + 0.6 + pointer.x * 0.14;
    const pitch = -0.32 + pointer.y * 0.12;
    const roll = -0.38;
    const cosTurn = Math.cos(turn);
    const sinTurn = Math.sin(turn);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);

    const projected = points.map((point) => {
      const pulse = 1 + Math.sin(elapsed * 0.45 + point.phase) * 0.008;
      const turnedX = point.x * cosTurn + point.z * sinTurn;
      const turnedZ = -point.x * sinTurn + point.z * cosTurn;
      const pitchedY = point.y * cosPitch - turnedZ * sinPitch;
      const depth = point.y * sinPitch + turnedZ * cosPitch;
      const screenX = turnedX * cosRoll - pitchedY * sinRoll;
      const screenY = turnedX * sinRoll + pitchedY * cosRoll;
      const perspective = 3.8 / (3.8 - depth * 0.3);
      return {
        x: centerX + screenX * radius * perspective * pulse,
        y: centerY + screenY * radius * perspective * pulse,
        depth,
        size: point.size * perspective * (width < 480 ? 0.85 : 1),
        alpha: (point.ring ? 0.51 : 0.35) + (depth + 1.5) * 0.13,
        bright: point.bright,
        ring: point.ring,
      };
    }).sort((a, b) => a.depth - b.depth);

    context.globalCompositeOperation = "lighter";
    projected.forEach((point) => {
      const alpha = Math.min(0.95, Math.max(0.16, point.alpha));
      if (point.bright && point.depth > -0.4) {
        context.fillStyle = `rgba(71, 185, 236, ${alpha * 0.065})`;
        context.beginPath();
        context.arc(point.x, point.y, point.size * 5.5, 0, tau);
        context.fill();
        context.fillStyle = `rgba(91, 211, 255, ${alpha * 0.14})`;
        context.beginPath();
        context.arc(point.x, point.y, point.size * 2.5, 0, tau);
        context.fill();
      }
      context.fillStyle = point.bright
        ? `rgba(204, 245, 255, ${alpha})`
        : point.ring
          ? `rgba(105, 213, 245, ${alpha})`
          : `rgba(80, 153, 225, ${alpha})`;
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, tau);
      context.fill();
    });
    context.globalCompositeOperation = "source-over";
  }

  function tick(timestamp) {
    animationFrame = 0;
    if (paused || !visible || document.hidden) {
      lastTime = 0;
      return;
    }
    const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
    lastTime = timestamp;
    elapsed += delta;
    const follow = 1 - Math.exp(-delta * 3);
    pointer.x += (pointer.targetX - pointer.x) * follow;
    pointer.y += (pointer.targetY - pointer.y) * follow;
    render();
    animationFrame = window.requestAnimationFrame(tick);
  }

  function syncPlayback() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastTime = 0;
    if (!paused && visible && !document.hidden) {
      animationFrame = window.requestAnimationFrame(tick);
    }
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "开启动效" : "暂停动效");
      toggle.textContent = paused ? "开启动效" : "暂停动效";
    }
  }

  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    radius = Math.min(width * 0.305, height * 0.36);
    buildField();
    render();
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      paused = !paused;
      storedPreference = paused ? "paused" : "playing";
      try {
        window.sessionStorage.setItem(storageKey, storedPreference);
      } catch (_) { /* No persistence is required for the animation. */ }
      syncPlayback();
    });
  }

  stage.addEventListener("pointermove", (event) => {
    if (!precisePointer.matches || paused || event.pointerType === "touch") return;
    const bounds = stage.getBoundingClientRect();
    pointer.targetX = ((event.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5) * 2;
    pointer.targetY = ((event.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5) * 2;
  }, { passive: true });
  stage.addEventListener("pointerleave", () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  }, { passive: true });

  function onMotionChange(event) {
    paused = event.matches || storedPreference === "paused";
    syncPlayback();
    render();
  }
  if (motionPreference.addEventListener) {
    motionPreference.addEventListener("change", onMotionChange);
  } else if (motionPreference.addListener) {
    motionPreference.addListener(onMotionChange);
  }
  document.addEventListener("visibilitychange", syncPlayback);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0 });
    observer.observe(stage);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();
  syncPlayback();
})();
