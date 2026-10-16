/**
 * Portfólio da Vynx IA.
 *
 * Enquanto esta lista estiver vazia, a seção Projetos e os links "Projetos" do menu
 * e do rodapé ficam ocultos. Ao incluir o primeiro projeto, tudo aparece sozinho.
 *
 * Modelo de projeto:
 * {
 *   title: "Nome do cliente",
 *   type: "Site institucional",                  // ou "Landing page", "Site para marcas e negócios", "Redesign"
 *   summary: "Uma frase sobre o que foi entregue.",
 *   url: "https://site-do-cliente.com.br",      // opcional, gera o botão "Visitar o site"
 *   frame: "desktop",                           // "desktop": destaque na largura toda, numa janela de navegador
 *                                               // "phone": só o celular; dois seguidos ficam lado a lado
 *   plate: "#e8e4dc",                           // cor da placa atrás do aparelho (use uma cor da marca do cliente)
 *   images: {
 *     desktop: "assets/img/projetos/cliente-desktop.webp",   // 1440×900 recomendado (usado com frame "desktop")
 *     mobile:  "assets/img/projetos/cliente-mobile.webp",    // 390×844 recomendado
 *     alt: "Página inicial do site do cliente",
 *   },
 * }
 */
window.VYNX_PROJECTS = [];
