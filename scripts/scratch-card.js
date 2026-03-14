(() => {
  const CONFIG = {
    brushRadius: 31,
    revealThreshold: 0.5,
    settleFadeDuration: 650,
    cornerRadius: 34,
    miraclePool: [
      '✈ PRIVATE JET',
      '🚀 ROCKET',
      '🐳 GIANT WHALE',
      '🏝 PRIVATE ISLAND',
      '🐉 DRAGON',
      '🏎 SUPERCAR',
      '🛸 UFO',
      '🌋 VOLCANO',
      '🪐 PLANET',
      '🏰 CASTLE',
    ],
  };

  const card = document.getElementById('scratchCard');
  const canvas = document.getElementById('scratchCanvas');
  const rewardNode = document.getElementById('miracleReward');
  const contentNode = document.getElementById('cardContent');
  const glowNode = document.getElementById('cursorGlow');

  if (!card || !canvas || !rewardNode || !contentNode || !glowNode) {
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
    const randomIndex = Math.floor(Math.random() * CONFIG.miraclePool.length);
    rewardNode.textContent = CONFIG.miraclePool[randomIndex];
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

    const kevlarBase = ctx.createLinearGradient(0, 0, width, height);
    kevlarBase.addColorStop(0, '#171b20');
    kevlarBase.addColorStop(0.45, '#242b34');
    kevlarBase.addColorStop(1, '#111419');
    ctx.fillStyle = kevlarBase;
    roundRect(ctx, 0, 0, width, height, CONFIG.cornerRadius);
    ctx.fill();

    drawKevlarWeave(width, height);

    const sheen = ctx.createLinearGradient(0, 0, width, height * 0.9);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.19)');
    sheen.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
    sheen.addColorStop(0.75, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    roundRect(ctx, 0, 0, width, height, CONFIG.cornerRadius);
    ctx.fill();

    addMaskParticles(width, height);
  }

  function drawKevlarWeave(width, height) {
    ctx.save();
    ctx.strokeStyle = 'rgba(206, 217, 229, 0.09)';
    ctx.lineWidth = 1;

    for (let x = -height; x < width + height; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(184, 195, 206, 0.07)';
    for (let x = -height; x < width + height; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x + height, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  function addMaskParticles(width, height) {
    for (let i = 0; i < 2600; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const alpha = 0.018 + Math.random() * 0.08;
      const tone = 160 + Math.floor(Math.random() * 70);
      ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha})`;
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

    card.style.setProperty('--orb-x', `${nx * -17}px`);
    card.style.setProperty('--orb-y', `${ny * -15}px`);
  }

  function scratchAt(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, CONFIG.brushRadius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
    gradient.addColorStop(0.56, 'rgba(0, 0, 0, 0.52)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.brushRadius, 0, Math.PI * 2);
    ctx.fill();

    scratchDust(x, y);
    requestRevealCheck();
  }

  function scratchDust(x, y) {
    for (let i = 0; i < 6; i += 1) {
      const offsetX = (Math.random() - 0.5) * CONFIG.brushRadius;
      const offsetY = (Math.random() - 0.5) * CONFIG.brushRadius;
      const radius = 1 + Math.random() * 2;

      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
      ctx.fill();
    }
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
      if (pixels[i] < 15) {
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
