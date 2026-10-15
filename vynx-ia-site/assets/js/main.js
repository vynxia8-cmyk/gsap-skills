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
    var waLabel = document.querySelector("[data-whatsapp-label]");
    if (waLabel && hasWhatsApp) {
      var m = number.replace(/^55/, "").match(/^(\d{2})(\d{4,5})(\d{4})$/);
      if (m) waLabel.textContent = "(" + m[1] + ") " + m[2] + "-" + m[3];
    }

    var note = document.querySelector("[data-contact-note]");
    if (note && !hasWhatsApp) {
      note.textContent = "Abre o Direct do @vynxia__ no Instagram.";
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
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
        var link = map[entry.target.id];
        if (link) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    // Todas as seções, inclusive as sem link no menu, para limpar o destaque quando o visitante sai delas
    document.querySelectorAll("main > section[id]").forEach(function (section) { observer.observe(section); });
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

  /* Cada conceito demonstrativo tem a própria estrutura de página (concept.layout):
     "split" e "center": abertura clássica com título, texto e botão;
     "lookbook": marca grande e uma grade de peças, como numa vitrine de moda;
     "list": a lista de serviços vem primeiro e o agendamento vira uma barra de largura total. */
  function buildMini(concept, isPhone) {
    var theme = concept.theme || {};
    var layout = concept.layout || "split";
    var mini = el("div", "mini mini--" + layout + (theme.font ? " mini--font-" + theme.font : "") + (isPhone ? " mini--phone" : ""));
    mini.style.setProperty("--mini-bg", theme.bg);
    mini.style.setProperty("--mini-fg", theme.fg);
    mini.style.setProperty("--mini-muted", theme.muted);
    mini.style.setProperty("--mini-accent", theme.accent);

    var nav = el("div", "mini-nav");
    nav.appendChild(el("b", "mini-logo", concept.brand));
    (concept.nav || []).forEach(function (item) { nav.appendChild(el("span", "", item)); });
    mini.appendChild(nav);

    if (layout === "lookbook") {
      mini.appendChild(el("b", "mini-h", concept.headline));
      var grid = el("div", "mini-pieces");
      (concept.pieces || []).forEach(function (piece) {
        var tile = el("span", "mini-piece");
        tile.style.setProperty("--tone", piece.tone);
        tile.appendChild(el("span", "", piece.name));
        grid.appendChild(tile);
      });
      mini.appendChild(grid);
      mini.appendChild(el("span", "mini-btn", concept.cta));
      return mini;
    }

    if (layout === "list") {
      mini.appendChild(el("b", "mini-h", concept.headline));
      var ul = el("ul", "mini-list");
      (concept.list || []).forEach(function (item) { ul.appendChild(el("li", "", item)); });
      mini.appendChild(ul);
      if (concept.text) mini.appendChild(el("span", "mini-text", concept.text));
      mini.appendChild(el("span", "mini-bar", concept.cta));
      return mini;
    }

    var hero = el("div", "mini-hero");
    var copy = el("div", "mini-copy");
    if (concept.eyebrow) copy.appendChild(el("span", "mini-eyebrow", concept.eyebrow));
    copy.appendChild(el("b", "mini-h", concept.headline));
    if (concept.text) copy.appendChild(el("span", "mini-text", concept.text));
    copy.appendChild(el("span", concept.ctaStyle === "link" ? "mini-link" : "mini-btn", concept.cta));
    hero.appendChild(copy);
    hero.appendChild(el("div", "mini-art art-" + (concept.art || "arch")));
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

  function buildBrowser(project) {
    var browser = el("div", "browser");
    // A barra nunca mostra um domínio: os demonstrativos não estão publicados
    browser.appendChild(el("div", "browser-bar", project.title + (project.demo ? " · conceito demonstrativo" : "")));
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

  function renderProjects() {
    var list = document.querySelector("[data-projects]");
    var projects = window.VYNX_PROJECTS || [];
    if (!list || !projects.length) return;

    projects.forEach(function (project) {
      var wide = project.frame === "desktop";
      var article = el("article", "project project--" + (wide ? "feature" : "phone"));

      var media = el("div", "project-media");
      media.style.setProperty("--plate", project.plate || "#1c201e");
      if (wide) media.appendChild(buildBrowser(project));
      media.appendChild(buildPhone(project));
      if (project.demo) {
        media.setAttribute("role", "img");
        media.setAttribute("aria-label", "Projeto demonstrativo " + project.title + ": prévia da página inicial");
        Array.prototype.forEach.call(media.children, function (child) { child.setAttribute("aria-hidden", "true"); });
      }

      var info = el("div", "project-info");
      var meta = el("p", "project-meta");
      if (project.demo) {
        meta.appendChild(el("span", "project-demo", "Projeto demonstrativo"));
        meta.appendChild(el("span", "project-sep", " · "));
      }
      meta.appendChild(document.createTextNode(project.type));
      info.appendChild(meta);
      info.appendChild(el("h3", "project-title", project.title));
      info.appendChild(el("p", "project-summary", project.summary));
      if (project.url) {
        var link = el("a", "btn btn--ghost btn--small project-link", project.demo ? "Abrir o conceito demonstrativo" : "Visitar o site");
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

  /* ---------- Movimento (GSAP + ScrollTrigger) ----------
     Quatro momentos, todos tirados do vídeo da marca:
     1. o V se monta e "à altura." pousa (só CSS, no styles.css);
     2. os finais em Bodoni dos títulos pousam quando o título entra na tela;
     3. as etapas do Processo acendem em ordem;
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

      if (c.desktop) {
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
})();
