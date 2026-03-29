/**
 * WireframeGeometry — Canvas 2D wireframe geometric effect
 * Extracted & de-minified from p__index.async.js (class "ue")
 *
 * Features:
 *   - 3 shape modes: nested cubes, depth-stacked cubes, nested diamonds
 *   - Chromatic aberration (RGB channel split)
 *   - Mouse-reactive rotation & dashed tracking line
 *   - Cross-shaped "star" decorations with CA offset
 *   - Central radial-gradient glow dot
 *
 * Usage:
 *   const container = document.getElementById('my-container');
 *   const effect = new WireframeGeometry(container);
 *   effect.init();
 *   effect.start();
 *   // effect.setMode(0 | 1 | 2);
 *   // effect.dispose();
 */

class WireframeGeometry {
  constructor(container) {
    // ── DOM / canvas ──────────────────────────────────────────
    this.container = container;
    this.canvas    = undefined;
    this.ctx       = undefined;
    this.dpr       = Math.min(window.devicePixelRatio, 2);

    // ── Dimensions ────────────────────────────────────────────
    this.W  = 0;
    this.H  = 0;
    this.cx = 0;   // centre X
    this.cy = 0;   // centre Y

    // ── Geometry: cube (8 verts, 12 edges) ────────────────────
    this.cubeVerts = [
      [-1, -1, -1],
      [ 1, -1, -1],
      [ 1,  1, -1],
      [-1,  1, -1],
      [-1, -1,  1],
      [ 1, -1,  1],
      [ 1,  1,  1],
      [-1,  1,  1],
    ];

    this.cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],   // back face
      [4, 5], [5, 6], [6, 7], [7, 4],   // front face
      [0, 4], [1, 5], [2, 6], [3, 7],   // connecting edges
    ];

    // ── Geometry: diamond / octahedron (6 verts, 12 edges) ────
    this.diamondVerts = [
      [ 0,  1.4,  0],   // top
      [ 1,  0,    0],   // right
      [ 0,  0,    1],   // front
      [-1,  0,    0],   // left
      [ 0,  0,   -1],   // back
      [ 0, -1.4,  0],   // bottom
    ];

    this.diamondEdges = [
      [0, 1], [0, 2], [0, 3], [0, 4],   // top → equator
      [5, 1], [5, 2], [5, 3], [5, 4],   // bottom → equator
      [1, 2], [2, 3], [3, 4], [4, 1],   // equator ring
    ];

    // ── Active shape (switches between cube/diamond) ──────────
    this.activeVerts = this.cubeVerts;
    this.activeEdges = this.cubeEdges;

    // ── Mode system ───────────────────────────────────────────
    this.cubeMode       = 0;      // current mode index
    this.modeTransition = 0;      // 0→1 transition progress

    /**
     * modeConfigs — each mode has a shape type and up to 5 layers.
     *   s     = scale multiplier for the shape
     *   op    = opacity
     *   zOff  = z-axis offset (used in mode 1 for depth stacking)
     */
    this.modeConfigs = [
      // Mode 0 — nested cubes (concentric, increasing size)
      {
        shape: 'cube',
        layers: [
          { s:  40, op: 1    },
          { s:  65, op: 0.7  },
          { s:  95, op: 0.45 },
          { s: 130, op: 0.25 },
          { s: 170, op: 0.12 },
        ],
      },
      // Mode 1 — depth-stacked cubes (same size, spaced along Z)
      {
        shape: 'cube',
        layers: [
          { s: 55, op: 1,   zOff: -80 },
          { s: 55, op: 0.8, zOff: -40 },
          { s: 55, op: 0.6, zOff:   0 },
          { s: 55, op: 0.4, zOff:  40 },
          { s: 55, op: 0.2, zOff:  80 },
        ],
      },
      // Mode 2 — nested diamonds (last layer hidden)
      {
        shape: 'diamond',
        layers: [
          { s:  50, op: 1    },
          { s:  80, op: 0.6  },
          { s: 115, op: 0.35 },
          { s: 155, op: 0.15 },
          { s:   0, op: 0    },   // hidden 5th layer
        ],
      },
    ];

    // ── Per-layer runtime state (lerped toward target) ────────
    this.cubes = [];

    // ── Decorative star positions ─────────────────────────────
    this.stars = [];

    // ── Mouse state ───────────────────────────────────────────
    this.mx          = 0.5;    // normalised mouse X (0-1)
    this.my          = 0.5;    // normalised mouse Y (0-1)
    this.mouseInside = false;
    this.mousePixelX = 0;      // pixel mouse X relative to canvas
    this.mousePixelY = 0;      // pixel mouse Y relative to canvas

    // ── Rotation (current / target) ───────────────────────────
    this.rX = 0.5;    // current rotation X
    this.rY = 0.8;    // current rotation Y
    this.rZ = 0.15;   // current rotation Z
    this.tX = 0.5;    // target rotation X
    this.tY = 0.8;    // target rotation Y

    // ── Time & animation ──────────────────────────────────────
    this.time    = 0;
    this.CA      = 1.5;     // chromatic aberration pixel offset
    this.rafId   = null;
    this.running = false;

    // ── Bound handlers (for cleanup) ──────────────────────────
    this.handleMouseMove  = undefined;
    this.handleMouseLeave = undefined;
    this.handleResize     = undefined;

    // ── Animation loop (arrow fn to preserve `this`) ──────────
    this.animate = () => {
      if (!this.running) return;
      this.time += 0.016;                 // ~60 fps delta
      if (!this.mouseInside) {
        this.tY += 0.003;                 // slow auto-rotate when idle
      }
      this.draw();
      this.rafId = requestAnimationFrame(this.animate);
    };

    // ── Event handler definitions ─────────────────────────────
    this.handleMouseMove = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mx          = (evt.clientX - rect.left) / rect.width;
      this.my          = (evt.clientY - rect.top)  / rect.height;
      this.mousePixelX = evt.clientX - rect.left;
      this.mousePixelY = evt.clientY - rect.top;
      this.mouseInside = true;
    };

    this.handleMouseLeave = () => {
      this.mouseInside = false;
    };

    this.handleResize = () => {
      this.resize();
    };
  }

  // ════════════════════════════════════════════════════════════
  //  Lifecycle
  // ════════════════════════════════════════════════════════════

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Initialise 5 layer states from mode 0
    this.cubes = [];
    for (let i = 0; i < 5; i++) {
      const layer = this.modeConfigs[0].layers[i];
      this.cubes.push({ s: layer.s, op: layer.op, zOff: 0 });
    }

    // Generate 7 random star positions
    this.stars = [];
    for (let i = 0; i < 7; i++) {
      this.stars.push({
        x:     Math.random(),
        y:     Math.random(),
        size:  4 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.resize();

    // Attach events
    this.container.addEventListener('mousemove',  this.handleMouseMove);
    this.container.addEventListener('mouseleave', this.handleMouseLeave);
    window.addEventListener('resize', this.handleResize);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.animate();
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  dispose() {
    this.stop();
    this.container.removeEventListener('mousemove',  this.handleMouseMove);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('resize', this.handleResize);
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  setMode(mode) {
    if (mode !== this.cubeMode && mode >= 0 && mode < this.modeConfigs.length) {
      this.cubeMode       = mode;
      this.modeTransition = 0;
    }
  }

  // ════════════════════════════════════════════════════════════
  //  Canvas helpers
  // ════════════════════════════════════════════════════════════

  resize() {
    this.W = this.container.offsetWidth  || 600;
    this.H = this.container.offsetHeight || 480;

    this.canvas.width  = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width  = this.W + 'px';
    this.canvas.style.height = this.H + 'px';

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    this.cx = this.W * 0.5;
    this.cy = this.H * 0.5;
  }

  // ════════════════════════════════════════════════════════════
  //  3-D math
  // ════════════════════════════════════════════════════════════

  rotX(v, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
  }

  rotY(v, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
  }

  rotZ(v, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
  }

  /**
   * Perspective projection.
   * focalLength = 800; returns screen {x, y, d} where d is depth scale.
   */
  project(v) {
    const focalLength = 800;
    const scale = focalLength / (focalLength + v[2]);
    return {
      x: this.cx + v[0] * scale,
      y: this.cy + v[1] * scale,
      d: scale,
    };
  }

  // ════════════════════════════════════════════════════════════
  //  Interpolation
  // ════════════════════════════════════════════════════════════

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // ════════════════════════════════════════════════════════════
  //  Drawing primitives
  // ════════════════════════════════════════════════════════════

  /**
   * Draw a single line segment.
   * @param {number} x1, y1   — start
   * @param {number} x2, y2   — end
   * @param {string} color    — CSS colour string
   * @param {number} alpha    — globalAlpha
   * @param {number} width    — lineWidth (default 1)
   */
  drawLine(x1, y1, x2, y2, color, alpha, width = 1) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth   = width;
    ctx.stroke();
  }

  /**
   * Draw a cross-shaped "star" with chromatic aberration.
   * Three colour channels (R, G, B) are offset, then a white core.
   */
  drawStar(x, y, size, phase) {
    const ctx = this.ctx;
    const pulse    = 0.7 + 0.3 * Math.sin(phase);   // pulsing 0.7–1.0
    const alpha    = 0.4 * pulse;
    const caOffset = 1.2;                             // CA pixel shift

    ctx.lineWidth = 1;

    // Red channel (offset top-left)
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = '#ff3333';
    ctx.beginPath();
    ctx.moveTo(x - size - caOffset, y - caOffset);
    ctx.lineTo(x + size - caOffset, y - caOffset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - caOffset, y - size - caOffset);
    ctx.lineTo(x - caOffset, y + size - caOffset);
    ctx.stroke();

    // Green channel (centred)
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = '#33ff66';
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();

    // Blue channel (offset bottom-right)
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = '#3366ff';
    ctx.beginPath();
    ctx.moveTo(x - size + caOffset, y + caOffset);
    ctx.lineTo(x + size + caOffset, y + caOffset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + caOffset, y - size + caOffset);
    ctx.lineTo(x + caOffset, y + size + caOffset);
    ctx.stroke();

    // White core (half-size cross)
    ctx.globalAlpha = alpha;          // slightly brighter than channels
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y);
    ctx.lineTo(x + size * 0.5, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x, y + size * 0.5);
    ctx.stroke();
  }

  // ════════════════════════════════════════════════════════════
  //  Main draw loop
  // ════════════════════════════════════════════════════════════

  draw() {
    const ctx = this.ctx;

    // ── Clear & background ──────────────────────────────────
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0b0f1a';
    ctx.fillRect(0, 0, this.W, this.H);

    // ── Mode transition ─────────────────────────────────────
    if (this.modeTransition < 1) {
      this.modeTransition = Math.min(1, this.modeTransition + 0.025);
    }

    const config = this.modeConfigs[this.cubeMode];
    const layers = config.layers;

    // Switch active geometry
    this.activeVerts = config.shape === 'diamond' ? this.diamondVerts : this.cubeVerts;
    this.activeEdges = config.shape === 'diamond' ? this.diamondEdges : this.cubeEdges;

    // ── Lerp each layer toward its target ───────────────────
    for (let i = 0; i < 5; i++) {
      const target = i < layers.length ? layers[i] : { s: 0, op: 0, zOff: 0 };
      this.cubes[i].s    = this.lerp(this.cubes[i].s,    target.s    || 0, 0.06);
      this.cubes[i].op   = this.lerp(this.cubes[i].op,   target.op   || 0, 0.06);
      this.cubes[i].zOff = this.lerp(this.cubes[i].zOff, target.zOff || 0, 0.06);
    }

    // ── Mouse → rotation target ─────────────────────────────
    this.tX = 0.5 + (this.my - 0.5) * 0.6;
    this.tY = 0.8 + (this.mx - 0.5) * 1;

    // Smooth follow
    this.rX += (this.tX - this.rX) * 0.04;
    this.rY += (this.tY - this.rY) * 0.04;

    // ── Time-based auto-rotation ────────────────────────────
    const autoSpin = this.time * 0.15;
    const spinScale = this.cubeMode === 1 ? 1.5
                    : this.cubeMode === 2 ? 0.8
                    : 1;

    // ── Draw layers (back to front) ─────────────────────────
    for (let i = 4; i >= 0; i--) {
      const cube = this.cubes[i];
      if (cube.op < 0.01) continue;        // skip invisible layers

      const scale = cube.s;
      const opacity = cube.op;
      const zOff = cube.zOff;

      // Transform vertices
      const projected = [];
      for (let v = 0; v < this.activeVerts.length; v++) {
        let pt = [
          this.activeVerts[v][0] * scale,
          this.activeVerts[v][1] * scale,
          this.activeVerts[v][2] * scale + zOff,
        ];
        pt = this.rotX(pt, this.rX);
        pt = this.rotY(pt, this.rY + autoSpin * spinScale);
        pt = this.rotZ(pt, this.rZ);
        projected.push(this.project(pt));
      }

      // Draw edges with chromatic aberration
      for (let e = 0; e < this.activeEdges.length; e++) {
        const a = projected[this.activeEdges[e][0]];
        const b = projected[this.activeEdges[e][1]];
        const lineW = 1 + (i === 0 ? 0.5 : 0);   // innermost layer slightly thicker

        // Red channel (offset top-left by CA)
        this.drawLine(
          a.x - this.CA, a.y - this.CA,
          b.x - this.CA, b.y - this.CA,
          '#ff2244', opacity * 0.5, lineW
        );
        // Green channel (centred)
        this.drawLine(
          a.x, a.y,
          b.x, b.y,
          '#22ff66', opacity * 0.4, lineW
        );
        // Blue channel (offset bottom-right by CA)
        this.drawLine(
          a.x + this.CA, a.y + this.CA,
          b.x + this.CA, b.y + this.CA,
          '#4466ff', opacity * 0.5, lineW
        );
        // White composite (on top)
        this.drawLine(
          a.x, a.y,
          b.x, b.y,
          '#ffffff', opacity * 0.35, lineW
        );
      }
    }

    // ── Central glow dot ────────────────────────────────────
    const cx = this.cx;
    const cy = this.cy;

    // Outer soft glow
    const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    outerGlow.addColorStop(0,   'rgba(255, 255, 255, 0.9)');
    outerGlow.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)');
    outerGlow.addColorStop(0.6, 'rgba(67, 98, 255, 0.15)');
    outerGlow.addColorStop(1,   'rgba(67, 98, 255, 0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    const coreGlow = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 14);
    coreGlow.addColorStop(0,   '#ffffff');
    coreGlow.addColorStop(0.5, '#c8e0ff');
    coreGlow.addColorStop(1,   '#4362ff');
    ctx.globalAlpha = 1;
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // ── Mouse tracking line (dashed, CA-split) ──────────────
    if (this.mouseInside) {
      ctx.setLineDash([4, 6]);
      ctx.lineWidth   = 1;
      ctx.globalAlpha = 0.4;

      // Red channel (offset -1, -1)
      ctx.strokeStyle = '#ff2244';
      ctx.beginPath();
      ctx.moveTo(cx - 1, cy - 1);
      ctx.lineTo(this.mousePixelX - 1, this.mousePixelY - 1);
      ctx.stroke();

      // Green channel (centred)
      ctx.strokeStyle = '#22ff66';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(this.mousePixelX, this.mousePixelY);
      ctx.stroke();

      // Blue channel (offset +1, +1)
      ctx.strokeStyle = '#4466ff';
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy + 1);
      ctx.lineTo(this.mousePixelX + 1, this.mousePixelY + 1);
      ctx.stroke();

      // White composite
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(this.mousePixelX, this.mousePixelY);
      ctx.stroke();

      ctx.setLineDash([]);   // reset dash

      // Star at cursor position
      this.drawStar(this.mousePixelX, this.mousePixelY, 10, this.time * 3);
    }

    // ── Background stars ────────────────────────────────────
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      let sx = star.x * this.W;
      let sy = star.y * this.H;
      // Slight parallax from mouse
      sx += (this.mx - 0.5) * 15;
      sy += (this.my - 0.5) * 15;
      this.drawStar(sx, sy, star.size, this.time * 2 + star.phase);
    }

    ctx.globalAlpha = 1;
  }
}

// ══════════════════════════════════════════════════════════════
//  Standalone usage example (uncomment to test)
// ══════════════════════════════════════════════════════════════
//
// <div id="wireframe-container" style="width:100%;height:100vh;"></div>
// <script>
//   const container = document.getElementById('wireframe-container');
//   const effect = new WireframeGeometry(container);
//   effect.init();
//   effect.start();
//
//   // Switch modes with buttons:
//   // effect.setMode(0);  // nested cubes
//   // effect.setMode(1);  // depth-stacked cubes
//   // effect.setMode(2);  // nested diamonds
// </script>
//
// ── React integration (matches original p__index.async.js usage) ──
//
// function WireframeSection() {
//   const [mode, setMode] = useState(0);
//   const containerRef = useRef(null);
//   const effectRef = useRef(null);
//
//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;
//
//     const fx = new WireframeGeometry(el);
//     fx.init();
//     effectRef.current = fx;
//
//     // Only animate when visible (IntersectionObserver)
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         entry.isIntersecting ? fx.start() : fx.stop();
//       },
//       { threshold: 0.05 }
//     );
//     observer.observe(el);
//
//     return () => {
//       fx.dispose();
//       observer.disconnect();
//     };
//   }, []);
//
//   useEffect(() => {
//     effectRef.current?.setMode(mode);
//   }, [mode]);
//
//   return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
// }

export default WireframeGeometry;
