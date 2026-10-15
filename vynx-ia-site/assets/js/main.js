/* ==========================================================================
   Vynx IA — comportamento do site
   ========================================================================== */
(function () {
  "use strict";

  var config = window.VYNX_CONFIG || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Contato: WhatsApp configurável (com Instagram como alternativa) ---------- */
  function setupContactLinks() {
    var number = String(config.whatsappNumber || "").replace(/\D/g, "");
    var messages = config.messages || {};
    var instagram = config.instagram || "vynxia__";
    var hasWhatsApp = number.length >= 10;

    document.querySelectorAll("[data-contact]").forEach(function (link) {
      var message = messages[link.getAttribute("data-contact")] || messages.projeto || "";
      link.href = hasWhatsApp
        ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message)
        : "https://ig.me/m/" + instagram;
      link.target = "_blank";
      link.rel = "noopener";
      if (!link.querySelector(".visually-hidden")) {
        var hint = document.createElement("span");
        hint.className = "visually-hidden";
        hint.textContent = hasWhatsApp ? " (abre o WhatsApp em nova aba)" : " (abre o Instagram em nova aba)";
        link.appendChild(hint);
      }
    });

    document.querySelectorAll("[data-whatsapp-only]").forEach(function (el) {
      el.hidden = !hasWhatsApp;
    });

    var note = document.querySelector("[data-contact-note]");
    if (note && !hasWhatsApp) {
      note.textContent = "A conversa abre no Direct do Instagram oficial da Vynx IA.";
    }
  }

  /* ---------- Cabeçalho ---------- */
  function setupHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Link ativo de acordo com a seção visível
    var links = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
    if (!("IntersectionObserver" in window) || !links.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Menu mobile ---------- */
  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    var label = document.querySelector("[data-menu-label]");
    var main = document.getElementById("conteudo");
    var footer = document.querySelector(".site-footer");
    if (!toggle || !menu) return;
    var isOpen = false;
    var closeTimer;

    function focusables() {
      return Array.prototype.slice.call(menu.querySelectorAll("a, button")).concat([toggle]);
    }

    function open() {
      isOpen = true;
      clearTimeout(closeTimer);
      menu.hidden = false;
      void menu.offsetWidth; // força o reflow para a transição
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      label.textContent = "Fechar menu";
      document.body.classList.add("menu-open");
      if (main) main.inert = true;
      if (footer) footer.inert = true;
      var first = menu.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }

    function close(returnFocus) {
      if (!isOpen) return;
      isOpen = false;
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      label.textContent = "Abrir menu";
      document.body.classList.remove("menu-open");
      if (main) main.inert = false;
      if (footer) footer.inert = false;
      closeTimer = setTimeout(function () { menu.hidden = true; }, reduceMotion.matches ? 0 : 400);
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () { isOpen ? close(true) : open(); });

    menu.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) close(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!isOpen) return;
      if (event.key === "Escape") { close(true); return; }
      if (event.key === "Tab") {
        var items = focusables();
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    // Fecha ao passar para o layout de computador
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (mq) {
      if (mq.matches) close(false);
    });
  }

  /* ---------- Portfólio ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function buildMini(concept, isPhone) {
    var theme = concept.theme || {};
    var mini = el("div", "mini mini--" + (concept.layout || "split") + (theme.font === "serif" ? " mini--serif" : "") + (isPhone ? " mini--phone" : ""));
    mini.style.setProperty("--mini-bg", theme.bg);
    mini.style.setProperty("--mini-fg", theme.fg);
    mini.style.setProperty("--mini-muted", theme.muted);
    mini.style.setProperty("--mini-accent", theme.accent);

    var nav = el("div", "mini-nav");
    nav.appendChild(el("b", "mini-logo", concept.brand));
    (concept.nav || []).forEach(function (item) { nav.appendChild(el("span", "", item)); });
    mini.appendChild(nav);

    var hero = el("div", "mini-hero");
    var copy = el("div", "mini-copy");
    copy.appendChild(el("span", "mini-eyebrow", concept.eyebrow));
    copy.appendChild(el("b", "mini-h", concept.headline));
    var lines = el("span", "mini-p");
    lines.appendChild(el("i"));
    lines.appendChild(el("i"));
    copy.appendChild(lines);
    copy.appendChild(el("span", "mini-btn", concept.cta));
    hero.appendChild(copy);
    hero.appendChild(el("div", "mini-art art-" + (concept.art || "soft")));
    mini.appendChild(hero);
    return mini;
  }

  function buildScreen(project, isPhone) {
    if (project.images) {
      var img = el("img");
      img.src = isPhone ? project.images.mobile : project.images.desktop;
      img.alt = isPhone ? "" : (project.images.alt || "Site " + project.title);
      img.loading = "lazy";
      img.decoding = "async";
      return img;
    }
    var concept = Object.assign({ brand: project.title }, project.concept);
    return buildMini(concept, isPhone);
  }

  function renderProjects() {
    var list = document.querySelector("[data-projects]");
    var projects = window.VYNX_PROJECTS || [];
    if (!list || !projects.length) return;

    projects.forEach(function (project) {
      var article = el("article", "project");
      article.setAttribute("data-reveal-project", "");

      // Mockups
      var media = el("div", "project-media");
      var devices = el("div", "devices");
      var laptop = el("div", "laptop");
      var screen = el("div", "laptop-screen");
      var display = el("div", "laptop-display");
      display.appendChild(buildScreen(project, false));
      screen.appendChild(display);
      laptop.appendChild(screen);
      laptop.appendChild(el("div", "laptop-base"));
      devices.appendChild(laptop);

      var phone = el("div", "phone");
      var phoneDisplay = el("div", "phone-display");
      phoneDisplay.appendChild(buildScreen(project, true));
      phone.appendChild(phoneDisplay);
      devices.appendChild(phone);
      media.appendChild(devices);

      if (project.demo) {
        media.setAttribute("role", "img");
        media.setAttribute("aria-label", "Mockup demonstrativo do conceito " + project.title + " em computador e celular");
        devices.setAttribute("aria-hidden", "true");
      }

      // Informações
      var info = el("div", "project-info");
      if (project.demo) info.appendChild(el("span", "badge-demo", "Projeto demonstrativo"));
      info.appendChild(el("p", "project-type", project.type));
      info.appendChild(el("h3", "project-title", project.title));
      info.appendChild(el("p", "project-summary", project.summary));
      if (project.url) {
        var link = el("a", "btn btn--ghost btn--small project-link", "Visitar o site");
        link.href = project.url;
        link.target = "_blank";
        link.rel = "noopener";
        info.appendChild(link);
      }

      article.appendChild(media);
      article.appendChild(info);
      list.appendChild(article);
    });
  }

  /* ---------- Animações (GSAP + ScrollTrigger) ---------- */
  function setupMotion() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
      root.classList.remove("motion");
      setupStepsFallback();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var mm = gsap.matchMedia();

    mm.add({
      animate: "(prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 960px)",
    }, function (context) {
      var c = context.conditions;

      if (c.reduce) {
        root.classList.remove("motion");
        gsap.set("[data-steps-progress]", { scaleY: 1 });
        gsap.utils.toArray("[data-step]").forEach(function (s) { s.classList.add("is-active"); });
        return;
      }

      root.classList.add("motion");

      // Hero: sequência única de entrada
      var planes = gsap.utils.toArray("[data-plane]");
      var hero = gsap.timeline({ defaults: { ease: "expo.out" } });
      hero
        .to(".hero-title .line-inner", { y: 0, duration: 1.3, stagger: 0.09 }, 0.15)
        .to("[data-hero-item]", { opacity: 1, duration: 1, stagger: 0.12 }, 0.55)
        .from("[data-hero-item]", { y: 18, duration: 1, stagger: 0.12, clearProps: "transform" }, 0.55)
        .from("[data-hero-visual]", { opacity: 0, duration: 1.4, ease: "power2.out" }, 0.3)
        .fromTo(planes, { "--z": "0px" }, {
          "--z": function (i) { return (i * 70) + "px"; },
          duration: 1.8,
          stagger: 0.08,
        }, 0.5);

      // Respiração discreta das camadas
      gsap.to(planes[2], { "--z": "152px", duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.4 });

      // Profundidade sutil acompanhando o cursor (apenas dispositivos com ponteiro fino)
      var stack = document.querySelector("[data-stack]");
      if (stack && window.matchMedia("(pointer: fine)").matches) {
        gsap.set(stack, { rotationX: 56, rotationZ: -36 });
        var rx = gsap.quickTo(stack, "rotationX", { duration: 1.2, ease: "power3.out" });
        var rz = gsap.quickTo(stack, "rotationZ", { duration: 1.2, ease: "power3.out" });
        var onMove = function (e) {
          var nx = e.clientX / window.innerWidth - 0.5;
          var ny = e.clientY / window.innerHeight - 0.5;
          rx(56 - ny * 8);
          rz(-36 + nx * 10);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        context.add(function () { window.removeEventListener("pointermove", onMove); });
      }

      // Ao rolar, o hero se afasta suavemente
      gsap.to("[data-hero-visual]", {
        yPercent: c.desktop ? 18 : 8,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // Entradas na rolagem
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: function (batch) {
          gsap.fromTo(batch, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform" });
        },
      });

      // Projetos: mockups sobem com leve profundidade
      gsap.utils.toArray("[data-reveal-project]").forEach(function (project) {
        var laptop = project.querySelector(".laptop");
        var phone = project.querySelector(".phone");
        var info = project.querySelector(".project-info");
        var tl = gsap.timeline({ scrollTrigger: { trigger: project, start: "top 80%", once: true } });
        tl.from(laptop, { y: 50, opacity: 0, duration: 1.2, ease: "power3.out" })
          .from(phone, { y: 80, opacity: 0, duration: 1.2, ease: "power3.out" }, 0.15)
          .from(info, { y: 24, opacity: 0, duration: 1, ease: "power3.out" }, 0.25);
        gsap.to(phone, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // Processo: linha de progresso acompanha a leitura
      var steps = gsap.utils.toArray("[data-step]");
      gsap.fromTo("[data-steps-progress]", { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: "[data-steps]", start: "top 65%", end: "bottom 65%", scrub: 0.6 },
      });
      steps.forEach(function (step) {
        ScrollTrigger.create({
          trigger: step,
          start: "top 65%",
          onEnter: function () { step.classList.add("is-active"); },
          onLeaveBack: function () { step.classList.remove("is-active"); },
        });
      });

      // Símbolo da chamada comercial
      gsap.fromTo(".cta-mark", { yPercent: 12, rotation: -4 }, {
        yPercent: -6,
        rotation: 0,
        ease: "none",
        scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true },
      });

      return function () { root.classList.remove("motion"); };
    });

    root.classList.add("motion-ready");

    // Recalcula posições quando as fontes carregam
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  function setupStepsFallback() {
    document.querySelectorAll("[data-step]").forEach(function (s) { s.classList.add("is-active"); });
  }

  /* ---------- Inicialização ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  setupContactLinks();
  setupHeader();
  setupMenu();
  renderProjects();
  setupMotion();
})();
