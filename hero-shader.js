/*
  Hero: концентрические линии на фрагментном шейдере (полноэкранный квад).
  Чистый WebGL без three.js — геометрия здесь ровно два треугольника.
  Цвета уводим в палитру сайта: янтарь Faraway и зелёный Ricochet.
*/
(function () {
  var canvas = document.querySelector('[data-hero-shader]');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false
  });
  if (!gl) { canvas.hidden = true; return; }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var VERT = [
    'attribute vec2 position;',
    'void main() { gl_Position = vec4(position, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2 resolution;',
    'uniform float time;',
    // 0 — нормировка по короткой стороне (как было), 1 — по длинной.
    // Зачем это вообще: яркость кольца падает как 1/length(uv), поэтому кольца
    // живут там, где length(uv) около единицы. На вытянутом вверх канвасе
    // телефона деление на короткую сторону (ширину) уводит uv.y далеко за ±1,
    // и от всей картины остаётся горизонтальная полоска по центру, а выше и
    // ниже — чёрное поле. По длинной стороне кольца заполняют экран целиком.
    // Значение ставится в resize() по фактическим пропорциям канваса, поэтому
    // десктоп (широкий канвас) продолжает считаться ровно как раньше.
    'uniform float longSide;',
    '',
    'float random(in float x) { return fract(sin(x) * 1e4); }',
    '',
    'void main(void) {',
    '  float base = mix(min(resolution.x, resolution.y), max(resolution.x, resolution.y), longSide);',
    '  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / base;',
    '',
    // мозаичное квантование: из-за него кольца распадаются на ступенчатые штрихи
    '  vec2 mosaic = vec2(4.0, 2.0);',
    '  vec2 cells = vec2(256.0, 256.0);',
    '  uv.x = floor(uv.x * cells.x / mosaic.x) / (cells.x / mosaic.x);',
    '  uv.y = floor(uv.y * cells.y / mosaic.y) / (cells.y / mosaic.y);',
    '',
    '  float t = time * 0.06 + random(uv.x) * 0.4;',
    '  float lineWidth = 0.0008;',
    '',
    '  vec3 layers = vec3(0.0);',
    '  for (int j = 0; j < 3; j++) {',
    '    for (int i = 0; i < 5; i++) {',
    // разнос слоёв больше исходного 0.01: иначе коралл и кислотный складываются в жёлтый
    '      layers[j] += lineWidth * float(i * i) / abs(fract(t - 0.08 * float(j) + float(i) * 0.01) - length(uv));',
    '    }',
    '  }',
    '',
    // Цвета плагинов: янтарь Faraway #F08A35 и мята Ricochet #5EE7B3.
    // Каждое кольцо перетекает из одного в другой по радиусу, слои сдвинуты по фазе,
    // поэтому два цвета переплетаются, а не делят картинку пополам.
    '  vec3 amber = vec3(0.94, 0.54, 0.21);',
    '  vec3 mint = vec3(0.37, 0.91, 0.70);',
    // Верхняя половина — Faraway, нижняя — Ricochet, со стыком по центру.
    // uv.y растёт вверх, поэтому янтарь стоит на конце шкалы.
    '  float side = smoothstep(-0.34, 0.34, uv.y);',
    '  vec3 tint = mix(mint, amber, side);',
    '  vec3 color = (layers.x + layers.y + layers.z) * tint;',
    // гамма вместо простого затемнения: полутона садятся, яркие ядра колец остаются
    // резкими, поэтому картинка тише, но не превращается в дымку
    '  color = pow(clamp(color, 0.0, 1.0), vec3(1.45));',
    '',
    // непрозрачный вывод как в оригинале; на страницу канвас кладётся через mix-blend-mode: screen
    '  gl_FragColor = vec4(color, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('hero-shader:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.hidden = true; return; }

  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('hero-shader:', gl.getProgramInfoLog(program));
    canvas.hidden = true;
    return;
  }
  gl.useProgram(program);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uResolution = gl.getUniformLocation(program, 'resolution');
  var uTime = gl.getUniformLocation(program, 'time');
  var uLongSide = gl.getUniformLocation(program, 'longSide');

  var running = false, rafId = 0, time = 20;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uResolution, w, h);
    // Канвас выше, чем шире — телефон: нормируем по длинной стороне,
    // иначе кольца схлопываются в полоску по центру. См. uniform longSide.
    gl.uniform1f(uLongSide, h > w ? 1 : 0);
  }

  function draw() {
    gl.uniform1f(uTime, time);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame() {
    time += 0.05;
    draw();
    if (running) rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced.matches || gl.isContextLost()) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  resize();
  draw();

  if (window.ResizeObserver) {
    new ResizeObserver(function () { resize(); if (!running) draw(); }).observe(canvas);
  } else {
    window.addEventListener('resize', function () { resize(); if (!running) draw(); });
  }

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.05 }).observe(canvas);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); });
  canvas.addEventListener('webglcontextrestored', function () { canvas.hidden = true; });

  reduced.addEventListener('change', function () {
    if (reduced.matches) { stop(); draw(); } else { start(); }
  });
})();
