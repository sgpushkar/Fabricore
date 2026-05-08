(function () {
  /* ============================================================
       HERO SCROLL ANIMATION ARCHITECTURE
       ─────────────────────────────────────────────────────────────
       This module handles:
       1. Pinned hero scroll tracking
       2. Progress export (window.heroScrollProgress) for future canvas frames
       3. Hero content fade-out during scroll
       4. Scroll indicator visibility
       5. Smooth transition into main content

       FUTURE CANVAS INTEGRATION:
       ─────────────────────────────────────────────────────────────
       In your separate animation JS file, read:
         window.heroScrollProgress  → float 0.0 to 1.0
         window.heroIsActive        → bool (true while hero is pinned)
       
       Example canvas frame driver:
         function onScroll() {
           if (!window.heroIsActive) return;
           const frame = Math.floor(window.heroScrollProgress * (TOTAL_FRAMES - 1));
           drawFrame(frame);
         }
         window.addEventListener('scroll', onScroll, { passive: true });
    ============================================================ */

  const heroScrollZone = document.getElementById("hero-scroll-zone");
  const heroPinWrapper = document.getElementById("hero-pin-wrapper");
  const heroContentLayer = document.getElementById("hero-content-layer");
  const heroDecoLayer = document.getElementById("hero-deco-layer");
  const heroScrollInd = document.getElementById("hero-scroll-indicator");
  const progressBar = document.getElementById("hero-progress-bar");

  // Exported globals for canvas animation driver
  window.heroScrollProgress = 0;
  window.heroIsActive = true;

  function updateHeroScroll() {
    const zoneRect = heroScrollZone.getBoundingClientRect();
    const zoneH = heroScrollZone.offsetHeight;
    const viewH = window.innerHeight;

    // How far we've scrolled into the zone (past first viewport)
    const scrolled = -zoneRect.top; // 0 at start
    const available = zoneH - viewH; // total scrollable distance
    const progress = Math.max(0, Math.min(1, scrolled / available));

    window.heroScrollProgress = progress;
    window.heroIsActive = progress < 1;

    // ── Progress bar ──
    if (progress > 0 && progress < 1) {
      progressBar.style.opacity = "1";
      progressBar.style.width = progress * 100 + "%";
    } else {
      progressBar.style.opacity = "0";
    }

    // ── Hero content fade & scale during scroll ──
    if (progress < 0.6) {
      const p = progress / 0.6;
      heroContentLayer.style.opacity = 1 - p * 0.85;
      heroContentLayer.style.transform = `translateY(${-p * 40}px) scale(${1 - p * 0.04})`;
    } else {
      heroContentLayer.style.opacity = "0";
      heroContentLayer.style.transform = "translateY(-40px) scale(0.96)";
    }

    // ── Deco layer subtle parallax ──
    if (heroDecoLayer) {
      heroDecoLayer.style.transform = `translateY(${progress * 60}px)`;
      heroDecoLayer.style.opacity = 1 - progress * 1.5;
    }

    // ── Scroll indicator fade ──
    heroScrollInd.style.opacity = Math.max(0, 1 - progress * 6);

    // ── Background shapes subtle movement ──
    const shapes = document.querySelectorAll(".hero-bg-shape");
    shapes.forEach((shape, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      shape.style.transform = `translateY(${progress * dir * 30}px)`;
    });
  }

  /* ============================================================
       NAVBAR SCROLL BEHAVIOR
    ============================================================ */
  const navbar = document.getElementById("navbar");

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  /* ============================================================
       SCROLL TO TOP BUTTON
    ============================================================ */
  const scrollTopBtn = document.getElementById("scroll-top-btn");

  function updateScrollTopBtn() {
    if (window.scrollY > 600) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ============================================================
       SCROLL PAST HERO (from indicator click)
    ============================================================ */
  function scrollPastHero() {
    const targetY = heroScrollZone.offsetHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  /* ============================================================
       SCROLL REVEAL — INTERSECTION OBSERVER
    ============================================================ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
  });

  /* ============================================================
       MASTER SCROLL HANDLER
    ============================================================ */
  function onScroll() {
    updateHeroScroll();
    updateNavbar();
    updateScrollTopBtn();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // Run once on load

  /* ============================================================
       MOBILE NAV
    ============================================================ */
  const hamburger = document.getElementById("navHamburger");
  const mobileNav = document.getElementById("navMobile");
  const mobileClose = document.getElementById("navMobileClose");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileNav.classList.toggle("open");
    document.body.style.overflow = mobileNav.classList.contains("open") ? "hidden" : "";
  });

  mobileClose.addEventListener("click", closeMobileNav);

  function closeMobileNav() {
    hamburger.classList.remove("open");
    mobileNav.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ============================================================
       ACTIVE NAV LINK
    ============================================================ */
  const sections = document.querySelectorAll("section[id], div[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    { threshold: 0.4 },
  );

  document.querySelectorAll("#bundles, #collections, #fabrics, #about, #contact").forEach((s) => {
    if (s) activeObserver.observe(s);
  });

  /* ============================================================
       CONTACT FORM HANDLER
    ============================================================ */
  function handleFormSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector(".form-submit-btn");
    btn.textContent = "Sending...";
    btn.disabled = true;

    // Simulate async submission
    setTimeout(() => {
      document.getElementById("contactFormWrapper").style.display = "none";
      document.getElementById("formSuccess").classList.add("show");
    }, 1200);
  }

  function resetForm() {
    document.getElementById("contactForm").reset();
    document.getElementById("contactFormWrapper").style.display = "block";
    document.getElementById("formSuccess").classList.remove("show");
    const btn = document.querySelector(".form-submit-btn");
    btn.textContent = "Send Message";
    btn.disabled = false;
  }

  /* ============================================================
       SMOOTH SCROLL — ALL ANCHOR LINKS
    ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ============================================================
       SUBTLE PARALLAX — COLLECTION IMAGES
    ============================================================ */
  function onMouseMove(e) {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;

    document.querySelectorAll(".hero-deco-swatch").forEach((el, i) => {
      const depth = (i + 1) * 4;
      el.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
    });
  }

  window.addEventListener("mousemove", onMouseMove, { passive: true });

  /* ============================================================
       FABRIC CATEGORY MODAL SYSTEM
    ============================================================ */
  const categoryData = {
    cotton: {
      title: "🧶 Cotton Varieties",
      varieties: [
        {
          name: "Organic Cotton",
          desc: "100% organic, pesticide-free",
          url: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Combed Cotton",
          desc: "Fine, smooth texture",
          url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Pima Cotton",
          desc: "Premium long staple",
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Jersey Cotton",
          desc: "Soft knit fabric",
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Flannel Cotton",
          desc: "Warm, brushed surface",
          url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Oxford Cotton",
          desc: "Crisp weave fabric",
          url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
    linen: {
      title: "🌿 Linen Varieties",
      varieties: [
        {
          name: "Pure Linen",
          desc: "100% natural linen",
          url: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Linen Blend",
          desc: "Linen + cotton mix",
          url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Irish Linen",
          desc: "Premium quality linen",
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Lightweight Linen",
          desc: "Perfect for summer",
          url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Slub Linen",
          desc: "Textured finish",
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Dyed Linen",
          desc: "Pre-dyed colors",
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
    denim: {
      title: "👖 Denim Varieties",
      varieties: [
        {
          name: "Raw Denim",
          desc: "Unwashed, deep indigo",
          url: "https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          name: "Stretch Denim",
          desc: "Comfort & flexibility",
          url: "https://images.pexels.com/photos/6765164/pexels-photo-6765164.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          name: "Light Wash",
          desc: "Faded, casual look",
          url: "https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=400&q=80",
        },
        {
          name: "Black Denim",
          desc: "Deep black finish",
          url: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          name: "Corduroy",
          desc: "Ribbed texture",
          url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Chambray",
          desc: "Light blue weave",
          url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
    rayon: {
      title: "🌊 Rayon Varieties",
      varieties: [
        {
          name: "Viscose Rayon",
          desc: "Silky smooth texture",
          url: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Modal Rayon",
          desc: "Breathable & soft",
          url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Lyocell",
          desc: "Eco-friendly rayon",
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Challis Rayon",
          desc: "Lightweight drape",
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Rayon Blend",
          desc: "Mixed fiber content",
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Rayon Jersey",
          desc: "Knit rayon fabric",
          url: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
    polyester: {
      title: "🔮 Polyester Varieties",
      varieties: [
        {
          name: "Polyester Crepe",
          desc: "Crinkled texture",
          url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Polyester Taffeta",
          desc: "Crisp, lustrous finish",
          url: "https://images.unsplash.com/photo-1490481651971-daf3dd327c36?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Fleece",
          desc: "Warm, soft polyester",
          url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Microfiber",
          desc: "Wrinkle-resistant",
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Polyester Mesh",
          desc: "Breathable knit",
          url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Poly Satin",
          desc: "Shiny, smooth",
          url: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
    printed: {
      title: "🎨 Printed Fabrics",
      varieties: [
        {
          name: "Digital Prints",
          desc: "High-resolution designs",
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Screen Printed",
          desc: "Bold, vibrant colors",
          url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Floral Prints",
          desc: "Beautiful patterns",
          url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Geometric",
          desc: "Modern patterns",
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Batik",
          desc: "Traditional wax resist",
          url: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Animal Prints",
          desc: "Leopard & zebra",
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
    uniform: {
      title: "🏭 Uniform Fabrics",
      varieties: [
        {
          name: "Twill",
          desc: "Durable diagonal weave",
          url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Canvas",
          desc: "Heavy-duty fabric",
          url: "https://images.unsplash.com/photo-1524634126267-deb657db12cb?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Work Cotton",
          desc: "Industrial strength",
          url: "https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=500",
        },
        {
          name: "Polyester Blend",
          desc: "Easy care",
          url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "FR Fabric",
          desc: "Fire resistant",
          url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Moisture Wicking",
          desc: "Breathable tech",
          url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
    silk: {
      title: "✨ Silk Blend Varieties",
      varieties: [
        {
          name: "Pure Silk",
          desc: "Luxurious 100% silk",
          url: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Silk Charmeuse",
          desc: "Soft, lustrous",
          url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Silk Crepe",
          desc: "Elegant texture",
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Silk Cotton",
          desc: "Blend of both",
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Silk Twill",
          desc: "Structured drape",
          url: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=500&q=80",
        },
        {
          name: "Silk Taffeta",
          desc: "Crisp sheen",
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
        },
      ],
    },
  };

  window.openCategoryModal = function (category) {
    const modal = document.getElementById("categoryModal");
    const data = categoryData[category];

    if (!data) return;

    document.getElementById("modalTitle").textContent = data.title;
    const grid = document.getElementById("varietiesGrid");
    grid.innerHTML = "";

    data.varieties.forEach((variety) => {
      const card = document.createElement("div");
      card.className = "variety-card";
      card.innerHTML = `
        <img src="${variety.url}" alt="${variety.name}" class="variety-image" />
        <div class="variety-info">
          <div class="variety-name">${variety.name}</div>
          <div class="variety-desc">${variety.desc}</div>
          <div class="variety-badge">In Stock</div>
        </div>
      `;
      grid.appendChild(card);
    });

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  window.closeCategoryModal = function () {
    const modal = document.getElementById("categoryModal");
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  window.contactUs = function () {
    closeCategoryModal();
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  };

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCategoryModal();
    }
  });

  /* ============================================================
       PAGE LOAD ANIMATION
    ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "0";
    setTimeout(() => {
      document.body.style.transition = "opacity 0.6s ease";
      document.body.style.opacity = "1";
    }, 100);
  });

  /* ============================================================
       FABRIC FILTER SYSTEM
    ============================================================ */
  window.filterFabrics = function (category, btn) {
    // Update active button state
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const grid = document.getElementById("fabricsGrid");
    if (!grid) return;
    
    const cards = grid.querySelectorAll(".fabric-card");

    cards.forEach((card) => {
      const cardCat = card.getAttribute("data-category");
      if (category === "all" || cardCat === category) {
        card.style.display = "flex";
        card.classList.remove("hide-filter");
        // Re-trigger reveal animation logic
        setTimeout(() => {
          card.classList.add("revealed");
        }, 10);
      } else {
        card.classList.add("hide-filter");
        setTimeout(() => {
          card.style.display = "none";
        }, 400); // Match CSS transition
      }
    });
  };

  /* ============================================================
       CANVAS READY SIGNAL
       ─────────────────────────────────────────────────────────────
       Dispatched when the hero scroll zone is initialized.
       Your canvas animation script can listen for this event.

       Usage in your animation file:
         document.addEventListener('heroCanvasReady', (e) => {
           const { canvasLayer, pinWrapper } = e.detail;
           // Insert and init your canvas here
           const canvas = document.createElement('canvas');
           canvasLayer.prepend(canvas);
           initFrameAnimation(canvas);
         });
    ============================================================ */
  document.dispatchEvent(
    new CustomEvent("heroCanvasReady", {
      detail: {
        canvasLayer: document.getElementById("hero-canvas-layer"),
        pinWrapper: document.getElementById("hero-pin-wrapper"),
        scrollZone: heroScrollZone,
        getProgress: () => window.heroScrollProgress,
        isActive: () => window.heroIsActive,
      },
    }),
  );
})();
