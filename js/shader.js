/* ─────────────────────────────────────────────
   buyXall digital — WebGL Shader Gradient
   Animated flowing gradient: cream + orange + soft warm tones
───────────────────────────────────────────── */

(function () {
  const canvas = document.getElementById('shaderCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    // Fallback: CSS gradient
    canvas.style.background = 'linear-gradient(135deg, #FFFFF0 0%, #FFE8DC 50%, #FFFFF0 100%)';
    return;
  }

  // Vertex shader — simple fullscreen quad
  const vsSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader — animated organic gradient
  const fsSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_resolution;

    // Smooth noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p  = p * 2.0 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      uv.y = 1.0 - uv.y;

      float t = u_time * 0.18;

      // Warp coordinates for fluid look
      vec2 q = vec2(fbm(uv + t * 0.4), fbm(uv + vec2(1.0)));
      vec2 r = vec2(
        fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t),
        fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t)
      );
      float f = fbm(uv + r);

      // Brand colors
      vec3 cream     = vec3(1.0,    1.0,   0.941); // #FFFFF0
      vec3 orangeSoft= vec3(1.0,    0.878, 0.773); // #FEE0C5
      vec3 orangeMid = vec3(1.0,    0.741, 0.612); // #FFBD9C
      vec3 creamDark = vec3(0.973,  0.953, 0.882); // #F8F3E1

      // Mix
      vec3 col = mix(cream, orangeSoft, clamp(f * f * 4.0, 0.0, 1.0));
      col = mix(col, orangeMid, clamp(length(q), 0.0, 1.0));
      col = mix(col, creamDark, clamp(length(r.x), 0.0, 1.0));

      // Add subtle vignette
      float vig = 1.0 - 0.25 * length(uv - 0.5) * 2.0;
      col *= vig;

      // Boost brightness slightly
      col = clamp(col * 1.05, 0.0, 1.0);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Shader link error:', gl.getProgramInfoLog(program));
    return;
  }

  // Fullscreen quad
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1,  1,
    -1,  1,  1, -1,   1,  1,
  ]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const timeLoc = gl.getUniformLocation(program, 'u_time');
  const resLoc = gl.getUniformLocation(program, 'u_resolution');

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  let startTime = performance.now();
  let animId;

  function render() {
    resize();
    const t = (performance.now() - startTime) / 1000;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(timeLoc, t);
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animId = requestAnimationFrame(render);
  }

  render();

  // Pause when tab is hidden for performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      startTime = performance.now() - startTime; // keep continuity
      startTime = performance.now();
      render();
    }
  });
})();
