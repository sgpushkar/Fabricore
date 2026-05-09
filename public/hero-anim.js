/* ============================================================
   HERO FRAME-SEQUENCE CANVAS DRIVER
   ─────────────────────────────────────────────────────────────
   - Listens for the `heroCanvasReady` event from textile-site.js
   - Preloads JPG frames from /hero-frames/ezgif-frame-001.jpg ... 240.jpg
   - Renders the frame matched to window.heroScrollProgress
   - Uses requestAnimationFrame and devicePixelRatio for crispness
============================================================ */
(function () {
  const TOTAL_FRAMES = 240;
  const FRAME_PATH = (i) => `/hero-frames/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;

  function init(detail) {
    const { canvasLayer, pinWrapper } = detail ?? {};
    if (!canvasLayer || !pinWrapper || canvasLayer.querySelector("canvas[data-hero-anim]")) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.dataset.heroAnim = "true";
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: "0",
      transition: "opacity 0.8s ease",
      pointerEvents: "none",
    });
    canvasLayer.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const frames = new Array(TOTAL_FRAMES);
    let loaded = 0;
    let currentFrame = -1;
    let pendingDraw = false;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = pinWrapper.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      currentFrame = -1;
      schedule();
    }

    function drawFrame(img) {
      if (!img || !img.complete || !img.naturalWidth) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;

      let dw;
      let dh;
      let dx;
      let dy;

      if (cr > ir) {
        dw = cw;
        dh = cw / ir;
        dx = 0;
        dy = (ch - dh) / 2;
      } else {
        dh = ch;
        dw = ch * ir;
        dx = (cw - dw) / 2;
        dy = 0;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    let interpolatedProgress = 0;
    let targetProgress = 0;

    function render() {
      // 1. Update target from global scroll state
      targetProgress = Math.max(0, Math.min(1, window.heroScrollProgress || 0));

      // 2. Linear interpolation (Lerp) for smoothness
      const lerpFactor = 0.08;
      const delta = targetProgress - interpolatedProgress;
      
      if (Math.abs(delta) > 0.0001) {
        interpolatedProgress += delta * lerpFactor;
      } else {
        interpolatedProgress = targetProgress;
        pendingDraw = false;
        // Stop the loop when settled
        return; 
      }

      // 3. Map interpolated progress to frame index
      const targetFrameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(interpolatedProgress * (TOTAL_FRAMES - 1)));

      if (targetFrameIdx !== currentFrame) {
        let idx = targetFrameIdx;
        while (idx >= 0 && (!frames[idx] || !frames[idx].complete || !frames[idx].naturalWidth)) {
          idx -= 1;
        }

        if (idx >= 0) {
          drawFrame(frames[idx]);
          currentFrame = targetFrameIdx;
        }
      }

      // 4. Continue the loop
      requestAnimationFrame(render);
    }

    function schedule() {
      if (pendingDraw) return;
      pendingDraw = true;
      requestAnimationFrame(render);
    }

    function preload() {
      const first = new Image();
      first.decoding = "async";
      first.onload = () => {
        frames[0] = first;
        loaded += 1;
        canvas.style.opacity = "1";
        schedule();

        let next = 1;
        const batchSize = 8;

        function loadNextBatch() {
          for (let i = 0; i < batchSize && next < TOTAL_FRAMES; i += 1, next += 1) {
            const idx = next;
            const img = new Image();
            img.decoding = "async";
            img.onload = () => {
              frames[idx] = img;
              loaded += 1;

              const desired = Math.floor((window.heroScrollProgress || 0) * (TOTAL_FRAMES - 1));
              if (idx === desired) {
                schedule();
              }

              if (loaded === TOTAL_FRAMES) {
                document.dispatchEvent(new CustomEvent("heroFramesLoaded"));
              }
            };
            img.onerror = () => {
              loaded += 1;
            };
            img.src = FRAME_PATH(idx + 1);
          }

          if (next < TOTAL_FRAMES) {
            setTimeout(loadNextBatch, 30);
          }
        }

        loadNextBatch();
      };
      first.onerror = () => {};
      first.src = FRAME_PATH(1);
    }

    resize();
    preload();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
  }

  document.addEventListener("heroCanvasReady", (event) => init(event.detail));

  if (document.getElementById("hero-canvas-layer") && document.getElementById("hero-pin-wrapper")) {
    setTimeout(() => {
      const layer = document.getElementById("hero-canvas-layer");
      const pinWrapper = document.getElementById("hero-pin-wrapper");

      if (layer && pinWrapper && !layer.querySelector("canvas[data-hero-anim]")) {
        init({ canvasLayer: layer, pinWrapper });
      }
    }, 100);
  }
})();
