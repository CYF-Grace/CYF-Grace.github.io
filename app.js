// app.js — Refined motion layer for Yifei Chen Portfolio

(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Cursor spotlight ──
  const spotlight = document.createElement("div");
  spotlight.id = "spotlight";
  document.body.appendChild(spotlight);

  const setSpot = (x, y) => {
    spotlight.style.setProperty("--x", `${x}px`);
    spotlight.style.setProperty("--y", `${y}px`);
  };
  setSpot(window.innerWidth * 0.5, window.innerHeight * 0.25);

  // ── Global parallax ──
  const setParallax = (x, y) => {
    const cx = (x - window.innerWidth / 2) * 0.018;
    const cy = (y - window.innerHeight / 2) * 0.018;
    document.documentElement.style.setProperty("--px", `${cx}px`);
    document.documentElement.style.setProperty("--py", `${cy}px`);
  };

  // ── Background blobs ──
  if (!prefersReduced) {
    ["b1", "b2", "b3"].forEach((cls) => {
      const b = document.createElement("div");
      b.className = `bg-blob ${cls}`;
      document.body.appendChild(b);
    });
  }

  // ── Particle canvas ──
  const canvas = document.createElement("canvas");
  canvas.id = "particles";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = 1;

  const resize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const rand = (a, b) => a + Math.random() * (b - a);

  const PARTICLE_COLORS = [
    "rgba(140, 160, 255, 1)",   // soft blue-white
    "rgba(190, 130, 255, 1)",   // violet
    "rgba(100, 180, 255, 1)",   // sky blue
    "rgba(220, 200, 255, 1)",   // pale lavender (bright)
    "rgba(255, 255, 255, 1)",   // pure white star
    "rgba(160, 110, 255, 1)",   // purple
    "rgba(80,  210, 240, 1)",   // cyan
  ];

  const particleCount = prefersReduced ? 0 : Math.max(70, Math.min(140, Math.floor(w / 14)));
  const particles = Array.from({ length: particleCount }, () => ({
    x:  rand(0, w),
    y:  rand(0, h),
    r:  rand(0.8, 2.6),
    vx: rand(-0.12, 0.12),
    vy: rand(-0.10, 0.10),
    a:  rand(0.55, 0.95),   // much brighter than before
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));

  let mouseX = w * 0.5;
  let mouseY = h * 0.35;

  const drawParticles = () => {
    if (prefersReduced) return;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -30) p.x = w + 30;
      if (p.x > w + 30) p.x = -30;
      if (p.y < -30) p.y = h + 30;
      if (p.y > h + 30) p.y = -30;

      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Connection lines near cursor — strong, visible
    const maxDist = 200;
    for (const p of particles) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < maxDist) {
        const strength = 1 - dist / maxDist;
        ctx.globalAlpha = strength * 0.72;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = "rgba(190, 160, 255, 1)";
        ctx.lineWidth = strength * 2.0 + 0.4;
        ctx.stroke();
      }
    }

    // Also draw short lines between nearby particles for a constellation feel
    const pairDist = 90;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < pairDist) {
          ctx.globalAlpha = (1 - dist / pairDist) * 0.28;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = "rgba(170, 140, 255, 1)";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  };
  requestAnimationFrame(drawParticles);

  // ── Card icon badges ──
  const ICONS = [
    "M9 18 3 12l6-6 1.4 1.4L5.8 12l4.6 4.6L9 18Zm6 0-1.4-1.4 4.6-4.6-4.6-4.6L15 6l6 6-6 6Z",
    "M4 19V5h2v14H4Zm6 0V9h2v10h-2Zm6 0v-6h2v6h-2ZM4 21h18v2H2V3h2v18Z",
    "M12 2 3 6.5v11L12 22l9-4.5v-11L12 2Zm0 2.2 6.8 3.4L12 11 5.2 7.6 12 4.2ZM5 9.4l6 3v7.2l-6-3V9.4Zm14 0v7.2l-6 3v-7.2l6-3Z",
    "M12 2l1.2 4.3L17.5 8 13.2 9.2 12 13.5 10.8 9.2 6.5 8l4.3-1.7L12 2Zm7 9 1 3.3L23 15l-3 1.1-1 3.4-1-3.4L15 15l3-1.7 1-3.3Z",
    "M5 3h14v18L12 17 5 21V3Zm2 2v13.1l5-2.7 5 2.7V5H7Z",
  ];

  document.querySelectorAll(".card").forEach((card, idx) => {
    if (card.querySelector(".card-badge")) return;
    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[idx % ICONS.length]}"/></svg>`;
    card.appendChild(badge);
  });

  // ── Hover: 3D tilt + glow hotspot ──
  const attachTilt = (el, maxDeg) => {
    if (!el) return;
    let raf = 0;

    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty("--mx", `${(x / r.width * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(y / r.height * 100).toFixed(1)}%`);

      if (prefersReduced) return;
      const px = (x / r.width) * 2 - 1;
      const py = (y / r.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg) translateY(-3px)`;
      });
    }, { passive: true });

    el.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf);
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
      el.style.setProperty("--mx", "30%");
      el.style.setProperty("--my", "30%");
    }, { passive: true });
  };

  document.querySelectorAll(".card").forEach((c) => attachTilt(c, 5));
  document.querySelectorAll(".btn").forEach((b) => attachTilt(b, 3.5));

  // ── Conveyors ──
  const marqueeList = [];
  let lastT = performance.now();

  const clampMod = (x, m) => { if (m <= 0) return 0; x = x % m; return x < 0 ? x + m : x; };
  const wrapDelta = (from, to, loop) => {
    if (loop <= 0) return to - from;
    let d = (to - from) % loop;
    if (d >  loop / 2) d -= loop;
    if (d < -loop / 2) d += loop;
    return d;
  };

  const arrowSVG = (dir) =>
    dir === "left"
      ? `<svg viewBox="0 0 24 24"><path d="M15.5 19 8.5 12l7-7 1.4 1.4L11.3 12l5.6 5.6L15.5 19Z"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M8.5 19 7.1 17.6 12.7 12 7.1 6.4 8.5 5l7 7-7 7Z"/></svg>`;

  const setupConveyor = (container, itemSelector, opts = {}) => {
    if (!container || prefersReduced) return;
    if (container.dataset.conveyorReady === "1") return;

    const { durationSec = 32, gap = 10, withButtons = false } = opts;
    const items = Array.from(container.querySelectorAll(itemSelector));
    if (items.length < 2) return;

    const track = document.createElement("div");
    track.className = "conveyor-track";
    track.style.setProperty("--gap", `${gap}px`);

    if (withButtons) {
      items.forEach((it) => {
        const wrap = document.createElement("div");
        wrap.className = "conveyor-item";
        wrap.appendChild(it);
        track.appendChild(wrap);
      });
    } else {
      items.forEach((it) => track.appendChild(it));
    }

    container.classList.add("conveyor");
    container.textContent = "";
    container.appendChild(track);

    let btnL = null, btnR = null;
    if (withButtons) {
      btnL = document.createElement("button");
      btnL.type = "button";
      btnL.className = "conveyor-btn left";
      btnL.setAttribute("aria-label", "Scroll left");
      btnL.innerHTML = arrowSVG("left");

      btnR = document.createElement("button");
      btnR.type = "button";
      btnR.className = "conveyor-btn right";
      btnR.setAttribute("aria-label", "Scroll right");
      btnR.innerHTML = arrowSVG("right");

      container.appendChild(btnL);
      container.appendChild(btnR);
    }

    const buildLoop = () => {
      Array.from(track.querySelectorAll("[data-clone='1']")).forEach((n) => n.remove());
      const originals = Array.from(track.children).filter((n) => n.dataset.clone !== "1");
      if (!originals.length) return 0;

      const cw = container.getBoundingClientRect().width;
      const cloneSet = () =>
        originals.forEach((n) => {
          const c = n.cloneNode(true);
          c.dataset.clone = "1";
          track.appendChild(c);
        });

      cloneSet();
      while (track.scrollWidth < cw * 2.4) cloneSet();

      const first = Array.from(track.children).find((n) => n.dataset.clone === "1");
      return first ? first.offsetLeft : Math.max(320, cw);
    };

    let loop = 0;
    const rebuild = () => {
      loop = buildLoop() || loop || 600;
      const speed = loop / durationSec;
      const existing = marqueeList.find((m) => m.container === container);
      if (existing) {
        existing.loop = loop;
        existing.speed = speed;
        existing.x = clampMod(existing.x, loop);
        existing.needsFocus = true;
      } else {
        marqueeList.push({
          container, track, loop, speed, x: 0, paused: false,
          holdDir: 0, hasButtons: !!withButtons, snapActive: false,
          snapTarget: 0, needsFocus: true, centerEl: null,
          // gesture state
          dragActive: false, dragStartX: 0, dragStartConvX: 0,
          momentum: 0, lastDragX: 0, lastDragT: 0,
        });
      }
    };
    rebuild();
    window.addEventListener("resize", rebuild, { passive: true });

    const getM = () => marqueeList.find((mm) => mm.container === container);

    const getCentered = (m) => {
      const cc = m.container.getBoundingClientRect().width / 2;
      let best = null, bestDist = Infinity;
      for (const el of m.track.children) {
        const c = el.offsetLeft + el.getBoundingClientRect().width / 2;
        const d = Math.abs(c - m.x - cc);
        if (d < bestDist) { bestDist = d; best = el; }
      }
      return best;
    };

    const snapToEl = (m, el) => {
      if (!m || !el || m.loop <= 0) return;
      const cc = m.container.getBoundingClientRect().width / 2;
      const ew = el.getBoundingClientRect().width;
      m.snapTarget = clampMod(el.offsetLeft + ew / 2 - cc, m.loop);
      m.snapActive = true;
      m.paused = true;
      m.momentum = 0;
      m.container.classList.add("paused");
    };

    // ── Pause on hover (non-drag) ──
    container.addEventListener("mouseenter", () => {
      const m = getM();
      if (!m || m.dragActive) return;
      m.paused = true;
      m.holdDir = 0;
      container.classList.add("paused");
      if (m.hasButtons) {
        const closest = getCentered(m);
        if (closest) snapToEl(m, closest);
        else m.needsFocus = true;
      }
    }, { passive: true });

    container.addEventListener("mouseleave", () => {
      const m = getM();
      if (!m || m.dragActive) return;
      m.paused = false;
      m.holdDir = 0;
      container.classList.remove("paused");
    }, { passive: true });

    // ── Two-finger trackpad scroll (wheel event with deltaX) ──
    container.addEventListener("wheel", (e) => {
      // Only hijack horizontal scrolling (two-finger swipe left/right on trackpad)
      // If it's mostly vertical scrolling, let the page scroll normally.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 0.4) return;
      e.preventDefault();

      const m = getM();
      if (!m || m.loop <= 0) return;

      // Cancel any ongoing snap/momentum
      m.snapActive = false;
      m.paused = true;
      m.momentum = 0;
      container.classList.add("paused");

      m.x = clampMod(m.x + e.deltaX, m.loop);
      m.track.style.transform = `translateX(${-m.x}px)`;
      updateCenteredFocus(m);

      // After a short idle, snap to nearest card (big belts only) and resume auto-roll
      clearTimeout(container._wheelTimer);
      container._wheelTimer = setTimeout(() => {
        const mm = getM();
        if (!mm) return;
        if (mm.hasButtons) {
          const closest = getCentered(mm);
          if (closest) snapToEl(mm, closest);
        } else {
          mm.paused = false;
          container.classList.remove("paused");
        }
      }, 180);
    }, { passive: false });

    // ── Pointer drag (mouse drag or single-finger touch) ──
    container.addEventListener("pointerdown", (e) => {
      // Ignore button clicks
      if (e.target.closest(".conveyor-btn")) return;
      // Only primary button (left click) or touch
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const m = getM();
      if (!m || m.loop <= 0) return;

      container.setPointerCapture(e.pointerId);
      m.dragActive  = true;
      m.snapActive  = false;
      m.paused      = true;
      m.momentum    = 0;
      m.dragStartX      = e.clientX;
      m.dragStartConvX  = m.x;
      m.lastDragX       = e.clientX;
      m.lastDragT       = performance.now();
      container.classList.add("paused");
      container.style.cursor = "grabbing";
    });

    container.addEventListener("pointermove", (e) => {
      const m = getM();
      if (!m || !m.dragActive) return;

      const dx   = e.clientX - m.dragStartX;
      const now  = performance.now();
      const dt   = now - m.lastDragT;

      // Track velocity for momentum (px/ms → px/s)
      if (dt > 0) {
        m.momentum = ((e.clientX - m.lastDragX) / dt) * 1000 * -1; // negative = drag right moves left
      }
      m.lastDragX = e.clientX;
      m.lastDragT = now;

      m.x = clampMod(m.dragStartConvX - dx, m.loop);
      m.track.style.transform = `translateX(${-m.x}px)`;
      updateCenteredFocus(m);
    }, { passive: true });

    const endDrag = (e) => {
      const m = getM();
      if (!m || !m.dragActive) return;
      m.dragActive = false;
      container.style.cursor = "";

      // Apply momentum: hand off to ticker by setting a flick velocity
      // The ticker will decay it and then snap if needed.
      m.flickVelocity = m.momentum; // px/s, positive = moving right in conveyor coords
      m.flickActive   = Math.abs(m.momentum) > 60; // only flick if fast enough

      if (!m.flickActive) {
        // Slow drag release → snap to nearest card immediately
        if (m.hasButtons) {
          const closest = getCentered(m);
          if (closest) snapToEl(m, closest);
        } else {
          m.paused = false;
          container.classList.remove("paused");
        }
      }
      // If flickActive, the ticker handles deceleration then snap
    };

    container.addEventListener("pointerup",     endDrag);
    container.addEventListener("pointercancel", endDrag);

    // ── Arrow buttons ──
    if (withButtons && btnL && btnR) {
      const step = (dir) => {
        const m = getM();
        if (!m) return;
        const center = getCentered(m) || m.centerEl;
        if (!center) return;
        const next = dir < 0 ? center.previousElementSibling : center.nextElementSibling;
        const el = next || (dir < 0 ? m.track.lastElementChild : m.track.firstElementChild);
        if (el) snapToEl(m, el);
      };
      btnL.addEventListener("click", (e) => { e.preventDefault(); step(-1); });
      btnR.addEventListener("click", (e) => { e.preventDefault(); step(+1); });

      const hold = (dir) => { const m = getM(); if (m) m.holdDir = dir; };
      const releaseHold = () => { const m = getM(); if (m) m.holdDir = 0; };
      btnL.addEventListener("pointerdown", (e) => { e.preventDefault(); hold(+1); });
      btnR.addEventListener("pointerdown", (e) => { e.preventDefault(); hold(-1); });
      [btnL, btnR].forEach((b) => {
        b.addEventListener("pointerup",    releaseHold, { passive: true });
        b.addEventListener("pointerleave", releaseHold, { passive: true });
      });
    }

    container.dataset.conveyorReady = "1";
  };

  const updateCenteredFocus = (m) => {
    if (!m || !m.hasButtons) return;
    const cw = m.container.getBoundingClientRect().width;
    if (!cw) return;
    const cc = cw / 2;
    let best = null, bestDist = Infinity;

    for (const el of m.track.children) {
      const ew = el.getBoundingClientRect().width;
      const c = el.offsetLeft + ew / 2;
      const d = Math.abs(c - m.x - cc);
      if (d < bestDist) { bestDist = d; best = el; }
      const falloff = Math.max(300, Math.min(580, cw * 0.52));
      el.style.setProperty("--focus", Math.max(0, 1 - d / falloff).toFixed(3));
      el.classList.remove("is-center");
    }
    if (best) { best.classList.add("is-center"); best.style.setProperty("--focus", "1"); m.centerEl = best; }
  };

  const tickMarquee = (t) => {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    for (const m of marqueeList) {
      if (m.loop <= 0) continue;

      // ── Snap animation (buttons / slow-drag release) ──
      if (m.hasButtons && m.snapActive) {
        const d = wrapDelta(m.x, m.snapTarget, m.loop);
        m.x = clampMod(m.x + d * (1 - Math.pow(0.001, dt)), m.loop);
        m.track.style.transform = `translateX(${-m.x}px)`;
        if (Math.abs(d) < 0.5) {
          m.x = clampMod(m.snapTarget, m.loop);
          m.track.style.transform = `translateX(${-m.x}px)`;
          m.snapActive = false;
          if (!m.container.matches(":hover") && !m.dragActive) {
            m.paused = false;
            m.container.classList.remove("paused");
          }
        }
        updateCenteredFocus(m);
        continue;
      }

      // ── Flick momentum (fast drag release) ──
      if (m.flickActive) {
        const FRICTION = 4.5; // higher = stops faster
        m.flickVelocity *= Math.pow(Math.E, -FRICTION * dt);
        m.x = clampMod(m.x + m.flickVelocity * dt, m.loop);
        m.track.style.transform = `translateX(${-m.x}px)`;
        updateCenteredFocus(m);

        if (Math.abs(m.flickVelocity) < 40) {
          m.flickActive = false;
          m.flickVelocity = 0;
          // Snap to nearest card on big belts, otherwise resume auto-roll
          if (m.hasButtons) {
            const closest = getCenteredFor(m);
            if (closest) snapToElFor(m, closest);
          } else {
            if (!m.container.matches(":hover")) {
              m.paused = false;
              m.container.classList.remove("paused");
            }
          }
        }
        continue;
      }

      // ── Paused (hover or drag) ──
      if (m.paused) {
        if (m.hasButtons && m.holdDir !== 0) {
          m.x = clampMod(m.x + m.speed * 1.3 * m.holdDir * dt, m.loop);
          m.track.style.transform = `translateX(${-m.x}px)`;
          updateCenteredFocus(m);
        } else if (m.needsFocus) {
          updateCenteredFocus(m);
          m.needsFocus = false;
        }
        continue;
      }

      // ── Default auto-roll ──
      m.x = clampMod(m.x + m.speed * dt, m.loop);
      m.track.style.transform = `translateX(${-m.x}px)`;
      updateCenteredFocus(m);
    }

    requestAnimationFrame(tickMarquee);
  };
  requestAnimationFrame(tickMarquee);

  // Helpers accessible from within ticker (need m directly, not via closure)
  const getCenteredFor = (m) => {
    const cc = m.container.getBoundingClientRect().width / 2;
    let best = null, bestDist = Infinity;
    for (const el of m.track.children) {
      const c = el.offsetLeft + el.getBoundingClientRect().width / 2;
      const d = Math.abs(c - m.x - cc);
      if (d < bestDist) { bestDist = d; best = el; }
    }
    return best;
  };
  const snapToElFor = (m, el) => {
    if (!m || !el || m.loop <= 0) return;
    const cc = m.container.getBoundingClientRect().width / 2;
    const ew = el.getBoundingClientRect().width;
    m.snapTarget = clampMod(el.offsetLeft + ew / 2 - cc, m.loop);
    m.snapActive = true;
    m.paused = true;
    m.momentum = 0;
    m.container.classList.add("paused");
  };

  // ── Apply conveyors ──
  const SPEED = 34;

  document.querySelectorAll(".tags").forEach((el) =>
    setupConveyor(el, ".tag", { durationSec: SPEED, gap: 8, withButtons: false })
  );

  const path = (location.pathname || "").toLowerCase();
  if (path.endsWith("projects.html") || path.endsWith("gallery.html") || path.endsWith("resume.html")) {
    document.querySelectorAll(".grid").forEach((grid) => {
      if (grid.querySelectorAll(".card").length <= 2) return;
      setupConveyor(grid, ".card", { durationSec: SPEED, gap: 16, withButtons: true });
    });
  }

  // ── Scroll reveal (staggered) ──
  const targets = Array.from(document.querySelectorAll(".hero, .kicker, .card, .footer"));
  targets.forEach((el) => el.classList.add("reveal"));

  if (prefersReduced) {
    targets.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
    );
    targets.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 0.04, 0.32)}s`;
      io.observe(el);
    });
  }

  // ── Global pointer ──
  if (!prefersReduced) {
    window.addEventListener("pointermove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setSpot(mouseX, mouseY);
      setParallax(mouseX, mouseY);
    }, { passive: true });
  } else {
    spotlight.style.opacity = "0";
  }
})();