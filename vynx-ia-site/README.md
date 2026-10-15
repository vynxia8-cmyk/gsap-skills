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

Inclua um objeto em `assets/js/projects.js` (o comentário no topo do arquivo traz o modelo completo).

- `frame: "desktop"` deixa o projeto em destaque, na largura toda, dentro de uma janela de navegador. `frame: "phone"` mostra só o celular; dois projetos `phone` seguidos ficam lado a lado.
- `plate` é a cor da placa atrás do aparelho. Use uma cor da marca do próprio projeto.
- Projeto real: `demo: false` e as capturas em `images.desktop`, `images.mobile` e `images.alt`. Com `url`, aparece o botão "Visitar o site".
- Os três projetos atuais são demonstrativos (marcas fictícias) e aparecem com a legenda "Projeto demonstrativo · <tipo>". Quando entrar o primeiro projeto real, reescreva também o parágrafo de introdução da seção Projetos no `index.html`.
- Cada demonstrativo usa a própria fonte (`concept.theme.font`: `garamond`, `syne` ou `nunito`), carregada só com os caracteres usados. Se mudar nomes ou títulos desses mockups com letras novas, confira o parâmetro `text=` do segundo link de fontes no `index.html`.

## Identidade visual

- Base grafite com dois cortes em papel: Posicionamento e Chamada comercial. Para colocar outra seção em papel, adicione a classe `on-paper`; as cores dos textos se ajustam sozinhas.
- Sálvia é o único acento. Sobre papel, use `--sage-ink` (a sálvia clara não tem contraste suficiente ali).
- Montserrat em caixa alta para títulos, Bodoni Moda itálica só em finais de até três palavras (como "à altura." e "melhor.") e nos números, Schibsted Grotesk para leitura.

## Antes de publicar

- Troque `og:image` em `index.html` pela URL absoluta do domínio (ex.: `https://seudominio.com.br/assets/img/og-image.png`) e adicione `<link rel="canonical">`.
- Se houver política de privacidade, inclua o link no rodapé.
- Qualquer hospedagem estática funciona (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## Acessibilidade e movimento

- O movimento se resume a quatro momentos: o V do topo se monta e "à altura." aparece; os finais em Bodoni dos títulos de Serviços, Processo e Chamada comercial surgem quando o título entra na tela; as etapas do Processo acendem em ordem; e, nos Serviços, as outras linhas recuam sob o cursor. Não há animação em loop, parallax ou efeito de entrada em cada bloco.
- Conteúdo visível mesmo sem JavaScript. Se o GSAP demorar mais de 2,5 s para carregar, tudo é revelado e nada volta a se esconder.
- `prefers-reduced-motion` mostra tudo de uma vez, sem animação.
- Menu mobile com `aria-expanded`, foco preso no menu, fechamento com Esc e restante da página `inert` enquanto aberto.
