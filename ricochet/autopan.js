/* Диаграмма «LFO против Ricochet» для секции #problem.

   Жила в ricochet/script.js — файле, который НИКУДА не подключён: на странице
   стоит только общий /script.js. То есть канвас был пуст на всех ширинах,
   включая десктоп, а не «иногда на мобилке». Остальное содержимое того файла —
   устаревшая копия общего скрипта (свой чекаут, свой buybar); подключать его
   целиком нельзя: получились бы двойные обработчики отправки формы и
   повторное объявление const dialog, которое роняет оба скрипта.
   Поэтому сюда вынесен только канвас, в своей области видимости. */
(function () {
const canvas = document.getElementById('autopan-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const CSS_W = 560;
  const CSS_H = 360;

  canvas.width = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  ctx.scale(dpr, dpr);

  const W = CSS_W;
  const H = CSS_H;
  const PADDING = 32;
  const TRANSIENT_X = W * 0.52;
  const LOOP_MS = 4200;

  const colors = {
    bg: '#131619',
    text: '#f0f2f4',
    muted: '#a4acb4',
    bad: '#ff6b6b',
    good: '#5ee7b3',
    grid: '#23282c'
  };

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function drawText(text, x, y, size, color, weight, align = 'left') {
    ctx.fillStyle = color;
    ctx.font = `${weight || 500} ${size}px 'Golos Text', -apple-system, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function drawScenario(baseY, isRicochet, t) {
    const name = isRicochet ? 'Ricochet' : 'Обычный автопан';
    const sub = isRicochet ? 'переход заранее' : 'переход накрывает атаку';
    const accent = isRicochet ? colors.good : colors.bad;

    drawText(name, PADDING, baseY - 52, 14, colors.text, 600);
    drawText(sub, PADDING, baseY - 34, 12, accent, 500);

    // L / R axis
    drawText('R', PADDING - 10, baseY - 20, 11, colors.muted, 500);
    drawText('L', PADDING - 10, baseY + 20, 11, colors.muted, 500);

    // Baseline grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, baseY);
    ctx.lineTo(W - PADDING, baseY);
    ctx.stroke();

    // Transient spike
    const spikeW = 22;
    const spikeH = 64;
    ctx.strokeStyle = colors.muted;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(PADDING, baseY);
    ctx.lineTo(TRANSIENT_X - spikeW / 2, baseY);
    ctx.lineTo(TRANSIENT_X, baseY - spikeH);
    ctx.lineTo(TRANSIENT_X + spikeW / 2, baseY);
    ctx.lineTo(W - PADDING, baseY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Pan position line
    ctx.strokeStyle = accent;
    ctx.lineWidth = isRicochet ? 3 : 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (isRicochet) {
      // Step at the pre-transient point
      const stepX = TRANSIENT_X - 48;
      ctx.moveTo(PADDING, baseY + 20);
      ctx.lineTo(stepX, baseY + 20);
      ctx.lineTo(stepX, baseY - 20);
      ctx.lineTo(W - PADDING, baseY - 20);
    } else {
      // Smooth curve crossing the transient
      ctx.moveTo(PADDING, baseY + 20);
      const cp1x = TRANSIENT_X - 60;
      const cp1y = baseY + 20;
      const cp2x = TRANSIENT_X + 30;
      const cp2y = baseY - 20;
      const endX = W - PADDING;
      const endY = baseY - 20;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    }
    ctx.stroke();

    // Playhead
    const playheadX = PADDING + easeOutCubic(t) * (W - PADDING * 2);
    ctx.strokeStyle = isRicochet ? 'rgba(94, 231, 179, 0.25)' : 'rgba(255, 107, 107, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(playheadX, baseY - 70);
    ctx.lineTo(playheadX, baseY + 70);
    ctx.stroke();
    ctx.setLineDash([]);

    // Transient hit effect
    if (playheadX >= TRANSIENT_X) {
      const hitT = Math.min(1, (playheadX - TRANSIENT_X) / 40);
      const glow = Math.max(0, 1 - hitT);

      if (glow > 0) {
        const radius = 18 + (1 - glow) * 24;
        const alpha = glow * 0.35;
        ctx.fillStyle = isRicochet ? `rgba(94, 231, 179, ${alpha})` : `rgba(255, 107, 107, ${alpha})`;
        ctx.beginPath();
        ctx.arc(TRANSIENT_X, baseY - spikeH / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outcome label to the right of the spike, clear of other elements
      const label = isRicochet ? 'переход закончен' : 'атака размазана';
      const labelX = TRANSIENT_X + 52;
      const labelY = baseY - spikeH / 2;

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(TRANSIENT_X + 14, labelY);
      ctx.lineTo(labelX - 8, labelY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(labelX - 4, labelY, 2, 0, Math.PI * 2);
      ctx.fill();

      drawText(label, labelX, labelY, 12, accent, 500, 'left');
    }
  }

  function render() {
    const now = performance.now();
    const t = (now % LOOP_MS) / LOOP_MS;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    drawScenario(120, false, t);
    drawScenario(260, true, t);

    requestAnimationFrame(render);
  }

  function drawStatic() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);
    drawScenario(120, false, 1);
    drawScenario(260, true, 1);
  }

  // Анимация — улучшение, а не содержание: статичный кадр показывает оба
  // исхода целиком, поэтому смысл секции доходит и без неё. Цикл крутим
  // только там, где он не стоит батареи: на широком экране и без запрета
  // на движение. Пустым канвас не остаётся ни в одном из случаев.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 679px)').matches) {
    drawStatic();
  } else {
    render();
  }
}

})();
