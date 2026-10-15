/**
 * Portfólio da Vynx IA.
 *
 * Para adicionar um projeto, inclua um novo objeto nesta lista.
 *
 * Campos de apresentação:
 *   frame: "desktop" → projeto em destaque, ocupa a largura toda e aparece numa janela de navegador
 *                      (no celular, mostra a versão mobile);
 *          "phone"   → aparece só no celular. Dois projetos "phone" seguidos ficam lado a lado.
 *   plate: cor da placa atrás do aparelho (use uma cor da própria marca do projeto).
 *
 * Projeto real (com capturas de tela):
 * {
 *   demo: false,
 *   title: "Nome do cliente",
 *   type: "Site institucional",
 *   summary: "Uma frase sobre o que foi entregue.",
 *   url: "https://site-do-cliente.com.br",      // opcional, gera o botão "Visitar o site"
 *   frame: "desktop",
 *   plate: "#e8e4dc",
 *   images: {
 *     desktop: "assets/img/projetos/cliente-desktop.webp",   // 1440×900 recomendado
 *     mobile:  "assets/img/projetos/cliente-mobile.webp",    // 390×844 recomendado
 *     alt: "Página inicial do site do cliente",
 *   },
 * }
 *
 * Projeto demonstrativo (desenhado em código, sem cliente real):
 * use `demo: true` e o bloco `concept`, como nos exemplos abaixo.
 *   concept.theme.font: "garamond" | "syne" | "nunito" (cada marca fictícia com a própria letra;
 *                       ao mudar textos, confira se o parâmetro text= das fontes no index.html cobre os caracteres)
 *   concept.text: frase de apoio · concept.list: lista opcional exibida no lugar da imagem
 * Os demonstrativos aparecem com a legenda "Projeto demonstrativo · <tipo>".
 */
window.VYNX_PROJECTS = [
  {
    demo: true,
    title: "Atelier Norte",
    frame: "desktop",
    plate: "#d9d4ca",
    type: "Site institucional",
    summary: "Escritório de arquitetura. Os projetos abrem a página e o pedido de visita fica a um toque.",
    concept: {
      theme: { bg: "#ecebe6", fg: "#1d1f1c", muted: "#6c6f69", accent: "#9a8a70", font: "garamond" },
      nav: ["Projetos", "Estúdio", "Contato"],
      eyebrow: "Arquitetura residencial",
      headline: "Espaços pensados para durar.",
      text: "Projetos residenciais do estudo inicial ao acompanhamento da obra.",
      cta: "Agendar uma visita",
      layout: "split",
      art: "arch",
    },
  },
  {
    demo: true,
    title: "Maré Studio",
    frame: "phone",
    plate: "#2c3a3f",
    type: "Landing page",
    summary: "Lançamento da coleção de verão de uma marca de roupas. Tudo em uma página só, até o botão de compra.",
    concept: {
      theme: { bg: "#1f2a2e", fg: "#f3efe7", muted: "#a9b4b3", accent: "#e3b98c", font: "syne" },
      nav: ["Coleção", "Tamanhos", "Comprar"],
      eyebrow: "Coleção Verão",
      headline: "Leveza para os dias longos.",
      text: "Peças em linho e algodão, em tiragens pequenas.",
      cta: "Ver a coleção",
      layout: "center",
      art: "waves",
    },
  },
  {
    demo: true,
    title: "Sereno Odontologia",
    frame: "phone",
    plate: "#dfe7e2",
    type: "Site para marcas e negócios",
    summary: "Clínica odontológica. Cada tratamento explicado sem termo técnico, e a consulta marcada pelo WhatsApp.",
    concept: {
      theme: { bg: "#f7f8f6", fg: "#18302b", muted: "#5d6f6a", accent: "#3f7d6c", font: "nunito" },
      nav: ["Tratamentos", "Equipe", "Agendar"],
      eyebrow: "Clínica odontológica",
      headline: "Sua consulta marcada pelo WhatsApp.",
      text: "Avaliação completa e atendimento de segunda a sábado.",
      list: ["Clareamento", "Ortodontia", "Implantes", "Limpeza e prevenção"],
      cta: "Agendar avaliação",
      layout: "split",
      art: "list",
    },
  },
];
