// app.js — Global motion + interactive hover + conveyors (buttons only for big-card belts)

(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Cursor spotlight =====
  const spotlight = document.createElement("div");
  spotlight.id = "spotlight";
  document.body.appendChild(spotlight);

  const setSpot = (x, y) => {
    spotlight.style.setProperty("--x", `${x}px`);
    spotlight.style.setProperty("--y", `${y}px`);
  };
  setSpot(window.innerWidth * 0.5, window.innerHeight * 0.25);

  // ===== Global parallax variables =====
  const setParallax = (x, y) => {
    const cx = x - window.innerWidth / 2;
    const cy = y - window.innerHeight / 2;
    document.documentElement.style.setProperty("--px", `${cx * 0.02}px`);
    document.documentElement.style.setProperty("--py", `${cy * 0.02}px`);
  };

  // ===== Background blobs =====
  if (!prefersReduced) {
    const b1 = document.createElement("div");
    const b2 = document.createElement("div");
    const b3 = document.createElement("div");
    b1.className = "bg-blob b1";
    b2.className = "bg-blob b2";
    b3.className = "bg-blob b3";
    document.body.appendChild(b1);
    document.body.appendChild(b2);
    document.body.appendChild(b3);
  }

  // ===== Particle canvas =====
  const canvas = document.createElement("canvas");
  canvas.id = "particles";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = 1;

  const resize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const rand = (a, b) => a + Math.random() * (b - a);

  const particleCount = prefersReduced ? 0 : Math.max(28, Math.min(70, Math.floor(w / 24)));
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.0),
      vx: rand(-0.18, 0.18),
      vy: rand(-0.14, 0.14),
      a: rand(0.12, 0.40),
    });
  }

  let mouseX = w * 0.5;
  let mouseY = h * 0.35;

  const drawParticles = () => {
    if (prefersReduced) return;

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -40) p.x = w + 40;
      if (p.x > w + 40) p.x = -40;
      if (p.y < -40) p.y = h + 40;
      if (p.y > h + 40) p.y = -40;

      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,1)";
      ctx.fill();
    }

    const maxDist = 140;
    for (const p of particles) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < maxDist) {
        ctx.globalAlpha = (1 - dist / maxDist) * 0.14;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    requestAnimationFrame(drawParticles);
  };
  requestAnimationFrame(drawParticles);

  // ===== Icon badges injected into each .card =====
  const ICONS = [
    "M9 18 3 12l6-6 1.4 1.4L5.8 12l4.6 4.6L9 18Zm6 0-1.4-1.4 4.6-4.6-4.6-4.6L15 6l6 6-6 6Z",
    "M4 19V5h2v14H4Zm6 0V9h2v10h-2Zm6 0v-6h2v6h-2ZM4 21h18v2H2V3h2v18Z",
    "M9 3v2H7v2H5v2H3v6h2v2h2v2h2v2h6v-2h2v-2h2v-2h2V9h-2V7h-2V5h-2V3H9Zm-4 8h14v6H5v-6Zm2 2v2h10v-2H7Z",
    "M12 2 3 6.5v11L12 22l9-4.5v-11L12 2Zm0 2.2 6.8 3.4L12 11 5.2 7.6 12 4.2ZM5 9.4l6 3v7.2l-6-3V9.4Zm14 0v7.2l-6 3v-7.2l6-3Z",
    "M12 2l1.2 4.3L17.5 8 13.2 9.2 12 13.5 10.8 9.2 6.5 8l4.3-1.7L12 2Zm7 9 1 3.3L23 15l-3 1.1-1 3.4-1-3.4L15 15l3-1.7 1-3.3Z",
  ];

  const makeBadge = (pathD) => {
    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${pathD}"></path></svg>`;
    return badge;
  };

  document.querySelectorAll(".card").forEach((card, idx) => {
    if (card.querySelector(".card-badge")) return;
    card.appendChild(makeBadge(ICONS[idx % ICONS.length]));
  });

  // ===== Hover interactions: glow hotspot + 3D tilt =====
  const attachInteractiveTilt = (el, maxTiltDeg) => {
    if (!el) return;

    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const mx = (x / r.width) * 100;
      const my = (y / r.height) * 100;
      el.style.setProperty("--mx", `${mx}%`);
      el.style.setProperty("--my", `${my}%`);

      if (prefersReduced) return;

      const px = (x / r.width) * 2 - 1;
      const py = (y / r.height) * 2 - 1;
      const rx = (-py * maxTiltDeg).toFixed(2);
      const ry = (px * maxTiltDeg).toFixed(2);

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
      el.style.setProperty("--mx", `20%`);
      el.style.setProperty("--my", `20%`);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
  };

  document.querySelectorAll(".card").forEach((card) => attachInteractiveTilt(card, 6));
  document.querySelectorAll(".btn").forEach((btn) => attachInteractiveTilt(btn, 4));

  // ===== Conveyors (JS-driven marquee) =====
  const marqueeList = [];
  let lastT = performance.now();

  const clampMod = (x, m) => {
    if (m <= 0) return 0;
    x = x % m;
    return x < 0 ? x + m : x;
  };

  const arrowSVG = (dir) => {
    return dir === "left"
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 19 8.5 12l7-7 1.4 1.4L11.3 12l5.6 5.6L15.5 19Z"/></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 19 7.1 17.6 12.7 12 7.1 6.4 8.5 5l7 7-7 7Z"/></svg>`;
  };

  const setupConveyor = (container, itemSelector, opts = {}) => {
    if (!container || prefersReduced) return;
    if (container.dataset.conveyorReady === "1") return;

    const {
      durationSec = 30,   // unified slow speed
      gap = 10,
      withButtons = false
    } = opts;

    const items = Array.from(container.querySelectorAll(itemSelector));
    if (items.length < 2) return;

    const track = document.createElement("div");
    track.className = "conveyor-track";
    track.style.setProperty("--gap", `${gap}px`);

    items.forEach((it) => track.appendChild(it));

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
      if (originals.length === 0) return 0;

      const containerW = container.getBoundingClientRect().width;

      const cloneSet = () => {
        originals.forEach((n) => {
          const c = n.cloneNode(true);
          c.dataset.clone = "1";
          track.appendChild(c);
        });
      };

      cloneSet();
      while (track.scrollWidth < containerW * 2.2) cloneSet();

      const firstClone = Array.from(track.children).find((n) => n.dataset.clone === "1");
      return firstClone ? firstClone.offsetLeft : Math.max(320, containerW);
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
      } else {
        marqueeList.push({
          container,
          track,
          loop,
          speed,
          x: 0,
          paused: false,
          holdDir: 0, // only used when buttons exist
          hasButtons: !!withButtons
        });
      }
    };

    rebuild();
    window.addEventListener("resize", rebuild, { passive: true });

    // Pause on hover
    container.addEventListener("mouseenter", () => {
      const m = marqueeList.find((mm) => mm.container === container);
      if (m) m.paused = true;
      container.classList.add("paused");
    }, { passive: true });

    container.addEventListener("mouseleave", () => {
      const m = marqueeList.find((mm) => mm.container === container);
      if (m) {
        m.paused = false;
        m.holdDir = 0;
      }
      container.classList.remove("paused");
    }, { passive: true });

    // Buttons: only for big-card belts
    if (withButtons && btnL && btnR) {
      const getM = () => marqueeList.find((mm) => mm.container === container);

      // Default motion is right->left (content moves left), which means x increases.
      // Left button: scroll content left (same direction as default) => +x
      // Right button: scroll content right => -x
      const nudge = (dx) => {
        const m = getM();
        if (!m) return;
        m.x = clampMod(m.x + dx, m.loop);
        m.track.style.transform = `translateX(${-m.x}px)`;
      };

      btnL.addEventListener("click", (e) => { e.preventDefault(); nudge(+140); });
      btnR.addEventListener("click", (e) => { e.preventDefault(); nudge(-140); });

      const hold = (dir) => {
        const m = getM();
        if (!m) return;
        m.holdDir = dir; // +1 means move left faster, -1 means move right
      };
      const releaseHold = () => {
        const m = getM();
        if (!m) return;
        m.holdDir = 0;
      };

      btnL.addEventListener("pointerdown", (e) => { e.preventDefault(); hold(+1); });
      btnR.addEventListener("pointerdown", (e) => { e.preventDefault(); hold(-1); });

      btnL.addEventListener("pointerup", releaseHold, { passive: true });
      btnR.addEventListener("pointerup", releaseHold, { passive: true });
      btnL.addEventListener("pointerleave", releaseHold, { passive: true });
      btnR.addEventListener("pointerleave", releaseHold, { passive: true });
    }

    container.dataset.conveyorReady = "1";
  };

  // Single RAF loop for all conveyors
  const tickMarquee = (t) => {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    for (const m of marqueeList) {
      if (m.loop <= 0) continue;

      // Hover paused (but allow button-hold for big belts)
      if (m.paused) {
        if (m.hasButtons && m.holdDir !== 0) {
          const v = m.speed * 1.25 * m.holdDir;
          m.x = clampMod(m.x + v * dt, m.loop);
          m.track.style.transform = `translateX(${-m.x}px)`;
        }
        continue;
      }

      // Default: right -> left (content moves left) => x increases
      m.x = clampMod(m.x + (m.speed * -1) * dt, m.loop);
      m.track.style.transform = `translateX(${-m.x}px)`;
    }

    requestAnimationFrame(tickMarquee);
  };
  requestAnimationFrame(tickMarquee);

  // ===== Apply conveyors =====
  const SPEED_SEC = 30; // unified slow speed

  // 1) Skills belts (NO buttons)
  document.querySelectorAll(".tags").forEach((tagsEl) => {
    setupConveyor(tagsEl, ".tag", { durationSec: SPEED_SEC, gap: 10, withButtons: false });
  });

  // 2) Big cards belts (Projects + Gallery + Resume only)
  const path = (location.pathname || "").toLowerCase();
  const isProjects = path.endsWith("projects.html");
  const isGallery = path.endsWith("gallery.html");
  const isResume = path.endsWith("resume.html");

  if (isProjects || isGallery || isResume) {
    document.querySelectorAll(".grid").forEach((gridEl) => {
      const cards = gridEl.querySelectorAll(".card");

      // ✅ THRESHOLD: roll ONLY if there are MORE than 2 cards
      if (cards.length <= 2) return;

      gridEl.classList.add("conveyor"); // for mask/overflow
      gridEl.classList.add("grid");
      gridEl.classList.add("conveyor"); // ensures .grid.conveyor styling
      setupConveyor(gridEl, ".card", { durationSec: SPEED_SEC, gap: 14, withButtons: true });
      gridEl.classList.add("conveyor"); // keep layout override .grid.conveyor
    });
  }

  // ===== Scroll reveal =====
  const targets = Array.from(document.querySelectorAll(".hero, .kicker, .card, .footer"));
  targets.forEach((el) => el.classList.add("reveal"));

  if (prefersReduced) {
    targets.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  }

  // ===== Pointer move global hooks =====
  if (!prefersReduced) {
    window.addEventListener(
      "pointermove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        setSpot(mouseX, mouseY);
        setParallax(mouseX, mouseY);
      },
      { passive: true }
    );
  } else {
    spotlight.style.opacity = "0";
  }
})();
