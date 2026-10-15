/**
 * Portfólio da Vynx IA.
 *
 * Para adicionar um projeto, inclua um novo objeto nesta lista.
 *
 * Projeto real (com capturas de tela):
 * {
 *   demo: false,
 *   title: "Nome do cliente",
 *   type: "Site institucional",
 *   summary: "Uma frase sobre o que foi entregue.",
 *   url: "https://site-do-cliente.com.br",      // opcional
 *   images: {
 *     desktop: "assets/img/projetos/cliente-desktop.webp",   // 1440×900 recomendado
 *     mobile:  "assets/img/projetos/cliente-mobile.webp",    // 390×844 recomendado
 *     alt: "Página inicial do site do cliente em computador e celular",
 *   },
 * }
 *
 * Projeto demonstrativo (conceito desenhado em código, sem cliente real):
 * use `demo: true` e o bloco `concept` como nos exemplos abaixo.
 */
window.VYNX_PROJECTS = [
  {
    demo: true,
    title: "Atelier Norte",
    type: "Site institucional",
    summary:
      "Conceito de site para um escritório de arquitetura: portfólio em destaque, apresentação do estúdio e contato direto.",
    concept: {
      theme: { bg: "#ecebe6", fg: "#1d1f1c", muted: "#6c6f69", accent: "#b9a88e", font: "serif" },
      nav: ["Projetos", "Estúdio", "Contato"],
      eyebrow: "Arquitetura residencial",
      headline: "Espaços pensados para durar.",
      cta: "Agendar uma visita",
      layout: "split",
      art: "arch",
    },
  },
  {
    demo: true,
    title: "Maré Studio",
    type: "Landing page",
    summary:
      "Conceito de landing page para o lançamento de uma coleção: oferta clara, galeria de peças e um único botão de compra.",
    concept: {
      theme: { bg: "#1f2a2e", fg: "#f3efe7", muted: "#a9b4b3", accent: "#e3b98c", font: "sans" },
      nav: ["Coleção", "Tamanhos", "Comprar"],
      eyebrow: "Coleção Verão",
      headline: "Leveza para os dias longos.",
      cta: "Ver a coleção",
      layout: "center",
      art: "waves",
    },
  },
  {
    demo: true,
    title: "Sereno Odontologia",
    type: "Site para negócio local",
    summary:
      "Conceito de site para uma clínica: tratamentos explicados com clareza, equipe, localização e agendamento pelo WhatsApp.",
    concept: {
      theme: { bg: "#f7f8f6", fg: "#18302b", muted: "#5d6f6a", accent: "#3f7d6c", font: "sans" },
      nav: ["Tratamentos", "Equipe", "Agendar"],
      eyebrow: "Clínica odontológica",
      headline: "Cuidado que começa na primeira conversa.",
      cta: "Agendar avaliação",
      layout: "split",
      art: "soft",
    },
  },
];
