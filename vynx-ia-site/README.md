# Vynx IA — site oficial

Site institucional da Vynx IA: HTML, CSS e JavaScript estáticos, sem etapa de build. As animações usam GSAP + ScrollTrigger (arquivos em `assets/vendor/`).

## Rodar localmente

```bash
cd vynx-ia-site
python3 -m http.server 8080
# abra http://localhost:8080
```

## Estrutura

O site tem cinco abas, cada uma em uma página própria, com o mesmo cabeçalho e o mesmo rodapé:

```
index.html               Início: topo com o V em 3D, resumo de quem somos, serviços e etapas, chamada comercial
quem-somos.html          Quem somos: por que a Vynx IA existe, no que acredita e para quem faz
servicos.html            Serviços: os quatro formatos em detalhe e o que vem em cada projeto
como-trabalhamos.html    Como trabalhamos: as quatro etapas e as perguntas frequentes
contato.html             Contato: WhatsApp, Instagram e o que acontece depois da mensagem
assets/css/styles.css    Identidade visual (tokens no topo do arquivo), layout e responsividade
assets/js/config.js      WhatsApp, mensagens iniciais e Instagram  ← edite aqui
assets/js/projects.js    Lista de projetos do portfólio             ← adicione projetos aqui
assets/js/main.js        Menu mobile, links de contato, portfólio e animações
assets/vendor/           GSAP 3.13.0 e ScrollTrigger
assets/img/              Favicon, símbolo da marca, ícone Apple e imagem de compartilhamento
```

O cabeçalho e o rodapé se repetem nas cinco páginas. Ao mudar um link ou um texto deles, mude em todas. A aba atual é marcada com `aria-current="page"` no link do menu.

## Configurar o WhatsApp

Em `assets/js/config.js`, preencha `whatsappNumber` com o número comercial (somente dígitos, com 55 e DDD). Todos os botões de conversa passam a abrir `https://wa.me/<número>` com a mensagem inicial já preenchida, e o link "WhatsApp" aparece no rodapé.

Enquanto o número estiver vazio, esses botões abrem o Direct do Instagram oficial (`@vynxia__`), para que nenhum botão fique sem destino.

## Adicionar um projeto ao portfólio

A seção Projetos está pronta, mas fica oculta (junto com os links "Projetos" do menu e do rodapé) enquanto `assets/js/projects.js` estiver vazio. Ao incluir o primeiro projeto, tudo aparece sozinho.

- Salve as capturas de tela em `assets/img/projetos/` (computador 1440×900 e celular 390×844, de preferência em `.webp`).
- Inclua um objeto em `assets/js/projects.js` seguindo o modelo do comentário no topo do arquivo.
- `frame: "desktop"` deixa o projeto em destaque, na largura toda, dentro de uma janela de navegador. `frame: "phone"` mostra só o celular; dois projetos `phone` seguidos ficam lado a lado.
- `plate` é a cor da placa atrás do aparelho. Use uma cor da marca do cliente.
- Com `url`, aparece o botão "Visitar o site".
- Use apenas projetos reais, com autorização do cliente.

## Identidade visual

- Base grafite com cortes em papel (Posicionamento, Chamada comercial e um bloco em cada aba). Para colocar outra seção em papel, adicione a classe `on-paper`; as cores dos textos se ajustam sozinhas.
- Sálvia é o único acento. Sobre papel, use `--sage-ink` (a sálvia clara não tem contraste suficiente ali).
- Montserrat em caixa alta para títulos, Bodoni Moda itálica só em finais de até três palavras (como "à altura." e "melhor.") e nos números, Schibsted Grotesk para leitura.

## Antes de publicar

- Em cada página, troque `og:image` pela URL absoluta do domínio (ex.: `https://seudominio.com.br/assets/img/og-image.png`) e adicione `<link rel="canonical">`.
- Se houver política de privacidade, inclua o link no rodapé.
- Qualquer hospedagem estática funciona (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## Animações 3D

- **Topo:** o V da marca é desenhado em 3D com estilhaços metálicos facetados. Ao abrir a página, os estilhaços se juntam e formam o V; no computador ele acompanha levemente o cursor. Ao rolar, o topo fica fixo por um instante e o V se desfaz em partículas (no celular, o V fica esmaecido atrás do título e se desfaz quando o topo sai da tela).
- **Chamada final (computador):** os estilhaços se juntam de novo e remontam o V conforme a seção entra na tela.
- O 3D só carrega depois da página pronta, com WebGL disponível, sem "movimento reduzido" e sem modo de economia de dados. Em qualquer outro caso fica o símbolo em SVG, e nada muda no conteúdo.
- O arquivo `assets/js/hero3d.js` é gerado a partir de `src/hero3d.js` com o [three.js](https://threejs.org) (licença MIT, aviso no fim do arquivo). Para gerar de novo depois de editar:

```bash
npm i three@0.186.0 esbuild
npx esbuild src/hero3d.js --bundle --format=esm --minify --target=es2019 --legal-comments=eof --outfile=assets/js/hero3d.js
```

## Acessibilidade e movimento

- Além do 3D, o movimento se resume a poucos momentos: os finais em Bodoni dos títulos de Serviços, Processo e Chamada comercial surgem quando o título entra na tela; as etapas do Processo acendem em ordem; e, nos Serviços, as outras linhas recuam sob o cursor. Não há animação em loop nem efeito de entrada em cada bloco.
- Conteúdo visível mesmo sem JavaScript. Se o GSAP demorar mais de 2,5 s para carregar, tudo é revelado e nada volta a se esconder.
- `prefers-reduced-motion` mostra tudo de uma vez, sem animação.
- Menu mobile com `aria-expanded`, foco preso no menu, fechamento com Esc e restante da página `inert` enquanto aberto.
