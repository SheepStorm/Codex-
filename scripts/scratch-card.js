(() => {
  const CONFIG = {
    rewardValue: 5,
    brushRadius: 30,
    revealThreshold: 0.5,
    settleFadeDuration: 620,
    cornerRadius: 32,
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
    rafId: 0,
    settleStart: 0,
  };

  initializeReward();
  resizeCanvas();
  bindEvents();

  function initializeReward() {
    amountNode.textContent = String(CONFIG.rewardValue);
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
    base.addColorStop(0, '#47166c');
    base.addColorStop(0.45, '#3d1f6a');
    base.addColorStop(1, '#20345b');

    ctx.fillStyle = base;
    roundRect(ctx, 0, 0, width, height, CONFIG.cornerRadius);
    ctx.fill();

    const stickerSheen = ctx.createLinearGradient(0, 0, width, height * 0.78);
    stickerSheen.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
    stickerSheen.addColorStop(0.36, 'rgba(255, 255, 255, 0.12)');
    stickerSheen.addColorStop(0.75, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = stickerSheen;
    roundRect(ctx, 0, 0, width, height, CONFIG.cornerRadius);
    ctx.fill();

    addMaskTexture(width, height);
    addSparkleStamps(width, height);
  }

  function addMaskTexture(width, height) {
    for (let i = 0; i < 2400; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const alpha = 0.03 + Math.random() * 0.07;
      const tone = 210 + Math.floor(Math.random() * 45);
      ctx.fillStyle = `rgba(${tone}, ${tone}, 255, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function addSparkleStamps(width, height) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 244, 170, 0.35)';
    ctx.lineWidth = 1.4;

    for (let i = 0; i < 18; i += 1) {
      const x = 24 + Math.random() * (width - 48);
      const y = 20 + Math.random() * (height - 40);
      drawSparkle(x, y, 6 + Math.random() * 4);
    }

    ctx.restore();
  }

  function drawSparkle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
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

  function onPointerMove(event) {
    updateGlowPosition(event);
    updateCardSurfaceHighlight(event);

    if (state.isScratching && !state.revealed) {
      scratchAt(event);
    }
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

  function updateGlowPosition(event) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    glowNode.style.left = `${x}px`;
    glowNode.style.top = `${y}px`;
  }

  function updateCardSurfaceHighlight(event) {
    const rect = card.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty('--orb-x', `${nx * -18}px`);
    card.style.setProperty('--orb-y', `${ny * -15}px`);
  }

  function scratchAt(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, CONFIG.brushRadius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
    gradient.addColorStop(0.62, 'rgba(0, 0, 0, 0.45)');
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
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 14) {
        transparentPixels += 1;
      }
    }

    const revealedRatio = transparentPixels / (pixels.length / 4);

    if (revealedRatio >= CONFIG.revealThreshold) {
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
