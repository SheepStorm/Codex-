(() => {
  const CONFIG = {
    minReward: 5,
    maxReward: 500,
    brushRadius: 28,
    revealThreshold: 0.48,
    settleFadeDuration: 750,
  };

  const card = document.getElementById('scratchCard');
  const canvas = document.getElementById('scratchCanvas');
  const amountNode = document.getElementById('rewardAmount');
  const contentNode = document.getElementById('cardContent');
  const glowNode = document.getElementById('cursorGlow');

  if (!card || !canvas || !amountNode || !contentNode || !glowNode) {
    return;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const state = {
    isScratching: false,
    revealed: false,
    pointerX: 0,
    pointerY: 0,
    rafId: 0,
    settleStart: 0,
  };

  initializeReward();
  resizeCanvas();
  drawMask();
  bindEvents();

  function initializeReward() {
    const value = randomInteger(CONFIG.minReward, CONFIG.maxReward);
    amountNode.textContent = String(value);
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = card.getBoundingClientRect();
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawMask();
  }

  function drawMask() {
    const { width, height } = card.getBoundingClientRect();

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, 'rgba(9, 12, 17, 0.97)');
    base.addColorStop(0.5, 'rgba(6, 8, 12, 0.95)');
    base.addColorStop(1, 'rgba(10, 12, 16, 0.98)');

    ctx.fillStyle = base;
    roundRect(ctx, 0, 0, width, height, 24);
    ctx.fill();

    const sheen = ctx.createLinearGradient(0, 0, width, height * 0.75);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    sheen.addColorStop(0.25, 'rgba(255, 255, 255, 0.05)');
    sheen.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    roundRect(ctx, 0, 0, width, height, 24);
    ctx.fill();

    addMaskTexture(width, height);
  }

  function addMaskTexture(width, height) {
    for (let i = 0; i < 2200; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const alpha = 0.02 + Math.random() * 0.045;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function bindEvents() {
    card.addEventListener('pointerenter', onPointerEnter);
    card.addEventListener('pointerleave', onPointerLeave);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', resizeCanvas);
  }

  function onPointerEnter() {
    glowNode.classList.add('visible');
    card.classList.add('hovering');
  }

  function onPointerLeave() {
    glowNode.classList.remove('visible', 'scratching');
    card.classList.remove('hovering');
    state.isScratching = false;
  }

  function onPointerDown(event) {
    state.isScratching = true;
    glowNode.classList.add('scratching');
    scratchAt(event);
  }

  function onPointerUp() {
    state.isScratching = false;
    glowNode.classList.remove('scratching');
  }

  function onPointerMove(event) {
    updateGlowPosition(event);
    updateCardSurfaceHighlight(event);

    if (state.isScratching && !state.revealed) {
      scratchAt(event);
    }
  }

  function updateGlowPosition(event) {
    const rect = card.getBoundingClientRect();
    state.pointerX = event.clientX - rect.left;
    state.pointerY = event.clientY - rect.top;
    glowNode.style.left = `${state.pointerX}px`;
    glowNode.style.top = `${state.pointerY}px`;
  }

  function updateCardSurfaceHighlight(event) {
    const rect = card.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty('--orb-x', `${nx * -16}px`);
    card.style.setProperty('--orb-y', `${ny * -14}px`);
  }

  function scratchAt(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, CONFIG.brushRadius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.brushRadius, 0, Math.PI * 2);
    ctx.fill();

    requestRevealCheck();
  }

  function requestRevealCheck() {
    if (state.rafId) {
      return;
    }

    state.rafId = requestAnimationFrame(() => {
      state.rafId = 0;
      checkRevealProgress();
    });
  }

  function checkRevealProgress() {
    if (state.revealed) {
      return;
    }

    const { width, height } = card.getBoundingClientRect();
    const sample = ctx.getImageData(0, 0, width, height).data;
    let transparentPixels = 0;

    for (let i = 3; i < sample.length; i += 4) {
      if (sample[i] < 12) {
        transparentPixels += 1;
      }
    }

    const ratio = transparentPixels / (sample.length / 4);

    if (ratio >= CONFIG.revealThreshold) {
      state.revealed = true;
      contentNode.classList.add('revealed');
      settleMaskFade();
    }
  }

  function settleMaskFade() {
    state.settleStart = performance.now();

    const step = (now) => {
      const elapsed = now - state.settleStart;
      const progress = Math.min(elapsed / CONFIG.settleFadeDuration, 1);

      canvas.style.opacity = String(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        canvas.style.pointerEvents = 'none';
      }
    };

    requestAnimationFrame(step);
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);

    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }
})();
