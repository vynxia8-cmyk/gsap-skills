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

    // Número visível no rodapé, gerado a partir do config.js para nunca divergir do link
    var m = number.replace(/^55/, "").match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (m && hasWhatsApp) {
      document.querySelectorAll("[data-whatsapp-label]").forEach(function (waLabel) {
        waLabel.textContent = "(" + m[1] + ") " + m[2] + "-" + m[3];
      });
    }

    var note = document.querySelector("[data-contact-note]");
    if (note && !hasWhatsApp) {
      note.textContent = "Abre o Direct do @vynxia__ no Instagram.";
    }
  }

  /* ---------- Cabeçalho ----------
     A aba atual já vem marcada no HTML (aria-current="page"); aqui só o fundo ao rolar. */
  function setupHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    var label = document.querySelector("[data-menu-label]");
    var main = document.getElementById("conteudo");
    var footer = document.querySelector(".site-footer");
    var outside = [document.querySelector(".skip-link"), document.querySelector(".site-header .brand")].filter(Boolean);
    if (!toggle || !menu) return;
    var isOpen = false;
    var closeTimer;

    // Ordem de tabulação real: o botão vem antes do menu no HTML
    function focusables() {
      return [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a, button")));
    }
    function setOutsideInert(value) {
      if (main) main.inert = value;
      if (footer) footer.inert = value;
      outside.forEach(function (el) { el.inert = value; });
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
      setOutsideInert(true);
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
      setOutsideInert(false);
      closeTimer = setTimeout(function () { menu.hidden = true; }, reduceMotion.matches ? 0 : 250);
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

  function buildScreen(project, isPhone) {
    var img = el("img");
    img.src = isPhone ? project.images.mobile : project.images.desktop;
    img.alt = isPhone ? "" : (project.images.alt || "Site " + project.title);
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  function buildBrowser(project) {
    var browser = el("div", "browser");
    browser.setAttribute("aria-hidden", "true");
    browser.appendChild(el("div", "browser-bar", project.title));
    var view = el("div", "browser-view");
    view.appendChild(buildScreen(project, false));
    browser.appendChild(view);
    return browser;
  }

  function buildPhone(project) {
    var phone = el("div", "phone");
    var display = el("div", "phone-display");
    display.appendChild(buildScreen(project, true));
    phone.appendChild(display);
    return phone;
  }

  // A seção e os links "Projetos" só aparecem quando há pelo menos um projeto em projects.js
  function renderProjects() {
    var list = document.querySelector("[data-projects]");
    var projects = (window.VYNX_PROJECTS || []).filter(function (p) { return p && p.images; });
    if (!list || !projects.length) return;

    projects.forEach(function (project) {
      var wide = project.frame === "desktop";
      var article = el("article", "project project--" + (wide ? "feature" : "phone"));

      var media = el("div", "project-media");
      media.style.setProperty("--plate", project.plate || "#1c201e");
      if (wide) media.appendChild(buildBrowser(project));
      var phone = buildPhone(project);
      if (wide) phone.setAttribute("aria-hidden", "true");
      media.appendChild(phone);

      var info = el("div", "project-info");
      info.appendChild(el("p", "project-meta", project.type));
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

    document.querySelectorAll("[data-projects-section], [data-projects-link]").forEach(function (node) { node.hidden = false; });
  }

  /* ---------- Movimento (GSAP + ScrollTrigger) ----------
     Quatro momentos, todos tirados do vídeo da marca:
     1. o V se monta e "à altura." pousa (só CSS, no styles.css);
     2. os finais em Bodoni dos títulos pousam quando o título entra na tela;
     3. as etapas de "Como trabalhamos" acendem em ordem;
     4. nos Serviços, as outras linhas recuam sob o cursor (só CSS).
     Nada mais se move: sem fade-up na rolagem, sem parallax, sem loops. */
  function setupMotion() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var steps = Array.prototype.slice.call(document.querySelectorAll("[data-step]"));
    var progress = document.querySelector("[data-steps-progress]");
    // Se a rede atrasou e a rede de segurança já revelou tudo, não esconde nada de novo
    var late = !root.classList.contains("motion");

    function showAll() {
      root.classList.remove("motion");
      steps.forEach(function (s) { s.classList.add("is-active"); });
      if (progress) progress.style.transform = "none";
    }

    if (!gsap || !ScrollTrigger || late) { showAll(); return; }
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power2.out", duration: 0.6 });

    // O callback só roda quando alguma condição é verdadeira: "motion" garante que rode também no celular
    gsap.matchMedia().add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 960px)",
    }, function (context) {
      var c = context.conditions;
      if (c.reduce) { showAll(); return; }

      gsap.utils.toArray("[data-tail]").forEach(function (tail) {
        // Só opacidade: o final continua no texto lido por leitores de tela
        gsap.fromTo(tail, { opacity: 0, y: "0.12em" }, {
          opacity: 1,
          y: 0,
          scrollTrigger: { trigger: tail.closest("h2"), start: "top 85%", once: true },
        });
      });

      if (!steps.length) return;
      if (c.desktop && progress) {
        gsap.set(progress, { scaleX: 0 });
        var tl = gsap.timeline({ scrollTrigger: { trigger: "[data-steps]", start: "top 75%", once: true } });
        tl.to(progress, { scaleX: 1, duration: 1.2, ease: "none" }, 0);
        steps.forEach(function (step, i) {
          tl.call(function () { step.classList.add("is-active"); }, null, i * 0.3);
        });
      } else {
        steps.forEach(function (step) {
          ScrollTrigger.create({
            trigger: step,
            start: "top 85%",
            once: true,
            onEnter: function () { step.classList.add("is-active"); },
          });
        });
      }

      return function () { steps.forEach(function (s) { s.classList.remove("is-active"); }); };
    });

    root.classList.add("motion-ready");

    // Recalcula posições quando as fontes carregam
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  /* ---------- V em 3D no topo ----------
     Só carrega depois da página, com WebGL disponível, sem "movimento reduzido" e sem economia de dados.
     Sem isso, fica o símbolo em SVG. */
  function canUse3D() {
    if (reduceMotion.matches) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    try {
      var c = document.createElement("canvas");
      return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch (e) {
      return false;
    }
  }

  function setup3D() {
    var holder = document.querySelector("[data-hero-3d]");
    var hero = document.querySelector(".hero");
    if (!holder || !hero || !canUse3D()) return;
    var mobile = !window.matchMedia("(min-width: 960px)").matches;
    var url = new URL("assets/js/hero3d.js", document.baseURI).href;

    import(url).then(function (mod) {
      var ctrl = mod.mountV(holder, {
        layout: mobile ? "hero-mobile" : "hero",
        onReady: function () {
          holder.classList.add("is-ready");
          hero.classList.add("has-3d");
        },
      });

      // Com a rolagem, o V se desfaz em partículas. No computador o topo fica fixo enquanto isso,
      // mas só se o visitante ainda estiver no topo (evita um salto na página).
      var gsap = window.gsap;
      var ScrollTrigger = window.ScrollTrigger;
      if (!gsap || !ScrollTrigger) return;
      var state = { p: 0 };
      var pin = !mobile && window.scrollY < 40;
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: function () {
          ctrl.setScatter(state.p);
          // no computador, as partículas esmaecem enquanto se afastam
          if (!mobile) holder.style.opacity = String(1 - state.p * 0.65);
        },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: pin ? "+=70%" : "bottom top",
          pin: pin,
          scrub: 0.6,
        },
      });
      if (pin) ScrollTrigger.refresh();

      // Fecho da página: na chamada final, os estilhaços se juntam de novo (só no computador)
      var ctaHolder = document.querySelector("[data-cta-3d]");
      if (!mobile && ctaHolder) {
        var cta = mod.mountV(ctaHolder, {
          layout: "fit",
          palette: "paper",
          assemble: "scroll",
          onReady: function () { ctaHolder.classList.add("is-ready"); },
        });
        var back = { p: 0 };
        gsap.to(back, {
          p: 1,
          ease: "none",
          onUpdate: function () { cta.setAssemble(back.p); },
          scrollTrigger: { trigger: "#contato", start: "top 85%", end: "top 15%", scrub: 0.6 },
        });
      }
    }).catch(function () { /* sem 3D: o SVG continua no lugar */ });
  }

  function schedule3D() {
    var run = function () { (window.requestIdleCallback || setTimeout)(setup3D, { timeout: 1500 }); };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  }

  /* ---------- Inicialização ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  setupContactLinks();
  setupHeader();
  setupMenu();
  renderProjects();
  // O main.js carrega antes do GSAP; o DOMContentLoaded só dispara depois de todos os scripts "defer"
  if (window.gsap && window.ScrollTrigger) setupMotion();
  else document.addEventListener("DOMContentLoaded", setupMotion, { once: true });
  schedule3D();
})();
