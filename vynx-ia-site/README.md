# Vynx IA — site oficial

Site institucional da Vynx IA: HTML, CSS e JavaScript estáticos, sem etapa de build. As animações usam GSAP + ScrollTrigger (arquivos em `assets/vendor/`).

## Rodar localmente

```bash
cd vynx-ia-site
python3 -m http.server 8080
# abra http://localhost:8080
```

## Estrutura

```
index.html               Conteúdo e estrutura das 8 seções
assets/css/styles.css    Identidade visual (tokens no topo do arquivo), layout e responsividade
assets/js/config.js      WhatsApp, mensagens iniciais e Instagram  ← edite aqui
assets/js/projects.js    Lista de projetos do portfólio             ← adicione projetos aqui
assets/js/main.js        Menu mobile, links de contato, portfólio e animações
assets/vendor/           GSAP 3.13.0 e ScrollTrigger
assets/img/              Favicon, símbolo da marca, ícone Apple e imagem de compartilhamento
```

## Configurar o WhatsApp

Em `assets/js/config.js`, preencha `whatsappNumber` com o número comercial (somente dígitos, com 55 e DDD). Todos os botões de conversa passam a abrir `https://wa.me/<número>` com a mensagem inicial já preenchida, e o link "WhatsApp" aparece no rodapé.

Enquanto o número estiver vazio, esses botões abrem o Direct do Instagram oficial (`@vynxia__`), para que nenhum botão fique sem destino.

## Adicionar um projeto ao portfólio

Inclua um objeto em `assets/js/projects.js`. Para um projeto real, use `demo: false` e informe as capturas de tela (`images.desktop`, `images.mobile` e o texto alternativo); elas são exibidas automaticamente dentro dos mockups de computador e celular. Os três projetos atuais são demonstrativos e aparecem com o selo "Projeto demonstrativo".

## Antes de publicar

- Troque `og:image` em `index.html` pela URL absoluta do domínio (ex.: `https://seudominio.com.br/assets/img/og-image.png`) e adicione `<link rel="canonical">`.
- Se houver política de privacidade, inclua o link no rodapé.
- Qualquer hospedagem estática funciona (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## Acessibilidade e movimento

- Conteúdo visível mesmo sem JavaScript; as animações só escondem elementos quando o GSAP carrega.
- `prefers-reduced-motion` desativa as animações de entrada, de rolagem e de profundidade.
- Menu mobile com `aria-expanded`, foco preso no menu, fechamento com Esc e restante da página `inert` enquanto aberto.
