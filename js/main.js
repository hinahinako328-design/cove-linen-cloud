/* ==========================================================================
   LINEN CLOUD — main.js
   Lenis(慣性スクロール) + GSAP ScrollTrigger
   9セクションそれぞれに別技法を割り当て(使い回し禁止の方針に基づく)
   ========================================================================== */

gsap.registerPlugin(ScrollTrigger);

/* ---------- ヘッダーのスクロール状態トグル ---------- */
ScrollTrigger.create({
  start: 40,
  onUpdate: (self) => {
    document.querySelector(".site-header").classList.toggle("is-scrolled", self.scroll() > 40);
  },
});

/* ---------- Lenis セットアップ(scrollerProxy不要、READMEのLenis優先方針) ---------- */
const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis;
if (!isReducedMotion) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ---------- 文字単位spanへの分解ユーティリティ(SplitText原理の自前実装) ---------- */
function splitChars(el) {
  const text = el.textContent;
  el.innerHTML = "";
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch === " " ? " " : ch;
    frag.appendChild(span);
  });
  el.appendChild(frag);
  return el.querySelectorAll(".char");
}

/* Heroの見出し行を内側spanでラップ(外側overflow:hiddenがマスク、内側がtranslateY) */
function wrapLines(el) {
  return [...el.querySelectorAll(".split-line")].map((line) => {
    const inner = document.createElement("span");
    inner.className = "split-line__inner";
    inner.style.display = "inline-block";
    inner.style.willChange = "transform";
    inner.innerHTML = line.innerHTML;
    line.innerHTML = "";
    line.appendChild(inner);
    return inner;
  });
}

/* ==========================================================================
   01. HERO — GSAP画像レイヤー(技法A原理) + 見出しscale-down + line reveal
   ========================================================================== */
(function heroInit() {
  const lines = wrapLines(document.getElementById("heroTitle"));
  gsap.set(lines, { y: "110%" });
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(lines, { y: "0%", duration: 1.1, stagger: 0.12, delay: 0.15 })
    .to(".reveal-fade", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, "-=0.6");

  // hero-heading-scale-down原理: 見出し全体をわずかに大きい状態から1.0へ
  gsap.fromTo("#heroTitle", { scale: 1.055 }, { scale: 1, duration: 1.3, ease: "power2.out", delay: 0.1 });

  // 技法A原理: リネン布画像がスクロールで位置・角度・サイズを変えながら「移動」する
  ScrollTrigger.matchMedia({
    "(min-width: 901px)": function () {
      gsap.timeline({
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
      })
        .to("#heroFabric", { top: "-4%", right: "2%", width: "38vw", rotate: 3, ease: "none" }, 0)
        .to("#heroButton", { top: "20%", right: "8%", rotate: 140, ease: "none" }, 0);
    },
  });
})();

/* ==========================================================================
   02. COLLECTION — staggered fade reveal(200ms刻み、こびとの森歯科原理)
   ========================================================================== */
ScrollTrigger.batch(".collection .stagger-item", {
  start: "top 88%",
  onEnter: (batch) =>
    gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.2 }),
  once: true,
});

/* ==========================================================================
   03. CRAFT / STORY — desaturate→color reveal + 多層scrubパララックス
   ========================================================================== */
gsap.timeline({
  scrollTrigger: { trigger: ".craft", start: "top bottom", end: "bottom top", scrub: 1 },
}).fromTo("#craftBg",
  { filter: "grayscale(1) blur(4px) brightness(0.72)", yPercent: -6 },
  { filter: "grayscale(0.08) blur(0px) brightness(0.9)", yPercent: 6, ease: "none" }
);

gsap.timeline({
  scrollTrigger: { trigger: ".craft", start: "top 70%", end: "bottom top", scrub: 1.6 },
}).fromTo("[data-parallax='text']",
  { y: 60, opacity: 0.4 },
  { y: -20, opacity: 1, ease: "none", stagger: 0.15 }
);

/* ==========================================================================
   04. DETAILS — pinned circle → fullbleed reveal(Pretty Patty原理)
   ========================================================================== */
ScrollTrigger.matchMedia({
  "(min-width: 701px)": function () {
    gsap.timeline({
      scrollTrigger: { trigger: ".details", start: "top top", end: "+=180%", scrub: 1, pin: ".details__pin" },
    }).to(".details__circle-wrap", {
      width: "100vw",
      height: "100vh",
      maxWidth: "100vw",
      "--circle-r": 150, // 単位なし数値でtween(CSS側でcalc(var(--circle-r)*1%))。150%まで拡大し矩形化後の四隅の丸み残りを防ぐ

      ease: "none",
    }, 0)
     .to(".details__img", { scale: 1.15, ease: "none" }, 0)
     .to([".details__pin .section-eyebrow", ".details__pin .section-title"], { opacity: 0, y: -30, ease: "none" }, 0.05)
     .to(".details__caption", { opacity: 0, ease: "none" }, 0.05);
  },
  "(max-width: 700px)": function () {
    // モバイルはシンプルな静止表示にフォールバック(READMEの原則通り)
    gsap.set(".details__circle-wrap", { clipPath: "circle(50% at 50% 50%)" });
  },
});

/* ==========================================================================
   05. GALLERY — cursor-following label pill(Maria João Abrantes原理)
   ========================================================================== */
(function galleryCursor() {
  const pill = document.getElementById("cursorPill");
  const items = document.querySelectorAll(".gallery__item");
  if (!window.matchMedia("(hover: hover)").matches) return;

  let mx = 0, my = 0, px = 0, py = 0, active = false;
  window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });

  function raf() {
    px += (mx - px) * 0.15;
    py += (my - py) * 0.15;
    pill.style.transform = `translate(${px}px, ${py}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  }
  raf();

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      pill.querySelector("span").textContent = item.dataset.cursorLabel || "見る";
      pill.style.opacity = 1;
      active = true;
    });
    item.addEventListener("mouseleave", () => {
      pill.style.opacity = 0;
      active = false;
    });
  });
})();

/* ==========================================================================
   06. TESTIMONIAL — 文字単位クロスフェード + 控えめstagger
   ========================================================================== */
(function testimonialInit() {
  const heading = document.querySelector(".testimonial .split-chars");
  const chars = splitChars(heading);
  ScrollTrigger.create({
    trigger: heading,
    start: "top 85%",
    end: "bottom 55%",
    scrub: 0.6,
    onUpdate: (self) => {
      const lit = Math.floor(self.progress * chars.length);
      chars.forEach((c, i) => c.classList.toggle("is-lit", i <= lit));
    },
  });

  ScrollTrigger.batch(".testimonial .stagger-item", {
    start: "top 90%",
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" }),
    once: true,
  });
})();

/* ==========================================================================
   07. STOCKISTS — CSSマーキー(低強度)。reduced-motionのみ制御
   ========================================================================== */
if (isReducedMotion) {
  document.querySelector(".stockists__track").style.animationPlayState = "paused";
}

/* ==========================================================================
   09. FOOTER — SVG line-draw on scroll-into-view(il Colorista Salon原理を転用)
   ========================================================================== */
gsap.timeline({
  scrollTrigger: { trigger: ".site-footer", start: "top 75%", once: true },
}).to("#logoPathCloud", { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
  .to("#logoPathThread", { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, "-=0.7")
  .from(".site-footer__grid", { opacity: 0, y: 24, duration: 0.8, ease: "power2.out" }, "-=0.6");

/* ==========================================================================
   固定サイドレールナビ — スクロール進捗 + アクティブセクション
   ========================================================================== */
(function railInit() {
  const sections = [...document.querySelectorAll("main > section, #site-footer")];
  const fill = document.getElementById("railFill");
  const current = document.getElementById("railCurrent");
  const railLinks = document.querySelectorAll(".rail__list a");

  function pad(n) { return n.toString().padStart(2, "0"); }

  sections.forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (self.isActive) {
          current.textContent = pad(i + 1);
          railLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.rail == i + 1));
        }
      },
    });
  });

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => { fill.style.height = `${self.progress * 100}%`; },
  });
})();
