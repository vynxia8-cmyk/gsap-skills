/* ==========================================================================
   Vynx IA — V em 3D do topo da página
   Os dois traços do símbolo viram estilhaços metálicos facetados. Ao carregar,
   os estilhaços se juntam e formam o V; com a rolagem, ele se desfaz em partículas.

   Este arquivo é a fonte. O site usa a versão empacotada em assets/js/hero3d.js.
   Para gerar de novo depois de editar (veja o README):
     npm i three@0.186.0 esbuild
     npx esbuild src/hero3d.js --bundle --format=esm --minify --target=es2019 \
       --legal-comments=eof --outfile=assets/js/hero3d.js
   ========================================================================== */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BufferGeometry, BufferAttribute,
  MeshStandardMaterial, DirectionalLight, PMREMGenerator, ACESFilmicToneMapping, Color,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Geometria do símbolo (mesmo desenho do SVG, viewBox 0 0 360 378)
const STROKE_A = [[2, 2], [115, 2], [242, 375], [138, 375]]; // traço claro
const STROKE_B = [[180, 88], [358, 88], [242, 375], [138, 375]]; // traço sálvia
const VIEW_W = 360;
const VIEW_H = 378;
const UNIT = 2 / VIEW_H; // o V tem 2 unidades de altura

// Gerador pseudoaleatório com semente: o V sai sempre igual
function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function toWorld(pt) {
  return [(pt[0] - VIEW_W / 2) * UNIT, -(pt[1] - VIEW_H / 2) * UNIT];
}

/* Divide um traço (quadrilátero) em facetas planas grandes (cada uma com inclinação própria,
   o que cria o reflexo metálico) e subdivide cada faceta em estilhaços menores.
   Cada estilhaço vira um prisma; juntos formam o V, separados viram partículas. */
function buildStroke(quad, opts) {
  const rand = rng(opts.seed);
  const cc = opts.facetCols;
  const cr = opts.facetRows;
  const depth = opts.depth;
  const [p0, p1, p2, p3] = quad.map(toWorld);

  // vértices das facetas (u ao longo da largura, v ao longo da altura), com altura de relevo
  const grid = [];
  for (let j = 0; j <= cr; j++) {
    for (let i = 0; i <= cc; i++) {
      let u = i / cc;
      let v = j / cr;
      const edgeU = i === 0 || i === cc;
      const edgeV = j === 0 || j === cr;
      if (!edgeV) v += (rand() - 0.5) * 0.6 / cr;
      if (!edgeU && !edgeV) u += (rand() - 0.5) * 0.5 / cc;
      const top = [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u];
      const bot = [p3[0] + (p2[0] - p3[0]) * u, p3[1] + (p2[1] - p3[1]) * u];
      grid.push({
        x: top[0] + (bot[0] - top[0]) * v,
        y: top[1] + (bot[1] - top[1]) * v,
        h: rand() * opts.relief,
      });
    }
  }
  const at = (i, j) => grid[j * (cc + 1) + i];

  const facets = [];
  for (let j = 0; j < cr; j++) {
    for (let i = 0; i < cc; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
      if (rand() > 0.5) { facets.push([a, b, c], [a, c, d]); }
      else { facets.push([a, b, d], [b, c, d]); }
    }
  }

  // subdivisão pelos pontos médios: os estilhaços continuam no mesmo plano da faceta
  const mid = (m, n) => ({ x: (m.x + n.x) / 2, y: (m.y + n.y) / 2, h: (m.h + n.h) / 2 });
  let tris = facets;
  for (let l = 0; l < opts.levels; l++) {
    const next = [];
    tris.forEach((t) => {
      const ab = mid(t[0], t[1]), bc = mid(t[1], t[2]), ca = mid(t[2], t[0]);
      next.push([t[0], ab, ca], [ab, t[1], bc], [ca, bc, t[2]], [ab, bc, ca]);
    });
    tris = next;
  }

  const positions = [];
  const centroids = [];
  const dirs = [];
  const rands = [];
  const delays = [];
  const zFront = depth / 2 + opts.z;
  const zBack = -depth / 2 + opts.z;

  tris.forEach((tri) => {
    // garante a orientação anti-horária: a face da frente precisa apontar para a câmera
    const area = (tri[1].x - tri[0].x) * (tri[2].y - tri[0].y) - (tri[2].x - tri[0].x) * (tri[1].y - tri[0].y);
    const t = area < 0 ? [tri[0], tri[2], tri[1]] : tri;
    const cx = (t[0].x + t[1].x + t[2].x) / 3;
    const cy = (t[0].y + t[1].y + t[2].y) / 3;
    const cz = opts.z;
    const f = t.map((p) => [p.x, p.y, zFront + p.h]);
    const k = t.map((p) => [p.x, p.y, zBack]);
    const faces = [
      [f[0], f[1], f[2]], // frente
      [k[0], k[2], k[1]], // fundo
    ];
    for (let e = 0; e < 3; e++) {
      const n = (e + 1) % 3;
      faces.push([f[e], k[e], k[n]], [f[e], k[n], f[n]]); // laterais
    }

    // direção de dispersão: para a direita e para o fundo, longe do texto à esquerda
    let dx = 0.55 + cx * 0.5 + (rand() - 0.3) * 0.9;
    let dy = cy * 0.45 + (rand() - 0.5) * 1.1 + 0.2;
    let dz = -0.4 - rand() * 1.8;
    const len = Math.hypot(dx, dy, dz) || 1;
    const power = 0.7 + rand() * 0.9;
    dx = dx / len * power; dy = dy / len * power; dz = dz / len * power;
    const r = [rand() * 2 - 1, rand() * 2 - 1, rand()];
    // a montagem acontece de baixo para cima, como o traço sendo desenhado
    const delay = Math.min(1, Math.max(0, (1 - (cy + 1) / 2) * 0.75 + rand() * 0.25));

    faces.forEach((face) => {
      face.forEach((p) => {
        positions.push(p[0], p[1], p[2]);
        centroids.push(cx, cy, cz);
        dirs.push(dx, dy, dz);
        rands.push(r[0], r[1], r[2]);
        delays.push(delay);
      });
    });
  });

  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("aCentroid", new BufferAttribute(new Float32Array(centroids), 3));
  geo.setAttribute("aDir", new BufferAttribute(new Float32Array(dirs), 3));
  geo.setAttribute("aRand", new BufferAttribute(new Float32Array(rands), 3));
  geo.setAttribute("aDelay", new BufferAttribute(new Float32Array(delays), 1));
  geo.computeBoundingSphere();
  geo.boundingSphere.radius += 6; // os estilhaços se afastam: evita que sumam por recorte
  return geo;
}

/* Material metálico com a animação dos estilhaços feita na placa de vídeo */
function shardMaterial(params, uniforms) {
  const mat = new MeshStandardMaterial(Object.assign({ flatShading: true }, params));
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uAssemble = uniforms.uAssemble;
    shader.uniforms.uScatter = uniforms.uScatter;
    shader.uniforms.uSpread = uniforms.uSpread;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
        uniform float uAssemble;
        uniform float uScatter;
        uniform float uSpread;
        attribute vec3 aCentroid;
        attribute vec3 aDir;
        attribute vec3 aRand;
        attribute float aDelay;
        vec3 vxRotate(vec3 v, vec3 axis, float a) {
          float c = cos(a), s = sin(a);
          return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
        }`)
      .replace("#include <begin_vertex>", `vec3 transformed = vec3(position);
        float local = clamp((uAssemble - aDelay * 0.55) / 0.45, 0.0, 1.0);
        local = 1.0 - pow(1.0 - local, 3.0);
        float p = max(1.0 - local, uScatter * (0.55 + 0.45 * aRand.z));
        vec3 rel = transformed - aCentroid;
        rel = vxRotate(rel, normalize(vec3(aRand.xy, 0.6)), p * (2.5 + aRand.z * 4.0));
        rel *= mix(1.0, 0.32, p);
        transformed = aCentroid + rel + aDir * (p * p * 0.6 + p * 0.4) * uSpread;`);
  };
  return mat;
}

/* Opções:
   - layout: "hero" (grande, à direita, cortado pela borda), "hero-mobile" (no alto, atrás do título)
             ou "fit" (centralizado no espaço do container);
   - palette: "dark" (sobre grafite: traço claro + sálvia) ou "paper" (sobre papel: traço grafite + sálvia);
   - assemble: "intro" (monta sozinho ao carregar) ou "scroll" (a montagem segue setAssemble). */
export function mountV(container, options) {
  const opts = Object.assign({ layout: "hero", palette: "dark", assemble: "intro", onReady: null }, options);
  opts.mobile = opts.layout === "hero-mobile";
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.75));

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  scene.environmentIntensity = 0.55; // reflexo mais contido: as facetas ganham contraste
  envScene.dispose();
  pmrem.dispose();

  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const rim = new DirectionalLight(new Color("#a9b8ad"), 1.6);
  rim.position.set(4, -2, -4);
  scene.add(rim);

  const camera = new PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const uniforms = {
    uAssemble: { value: 0 },
    uScatter: { value: 0 },
    uSpread: { value: 3.2 },
  };
  const detail = opts.mobile
    ? { facetCols: 2, facetRows: 6, levels: 2 }
    : { facetCols: 2, facetRows: 8, levels: 2 };
  const geoA = buildStroke(STROKE_A, Object.assign({ seed: 7, depth: 0.2, relief: 0.16, z: 0 }, detail));
  const geoB = buildStroke(STROKE_B, Object.assign({ seed: 19, depth: 0.2, relief: 0.16, z: 0.1 }, detail));
  const paper = opts.palette === "paper";
  const matA = shardMaterial(paper
    ? { color: new Color("#3a3f3b"), metalness: 0.85, roughness: 0.3 }
    : { color: new Color("#e4e3dd"), metalness: 0.92, roughness: 0.24 }, uniforms);
  const matB = shardMaterial(paper
    ? { color: new Color("#6f7a72"), metalness: 0.85, roughness: 0.3 }
    : { color: new Color("#8a988d"), metalness: 0.9, roughness: 0.28 }, uniforms);

  const group = new Group();
  const pivot = new Group(); // gira em torno do centro do V
  pivot.add(new Mesh(geoA, matA), new Mesh(geoB, matB));
  group.add(pivot);
  scene.add(group);

  // Pose base e movimento leve acompanhando o cursor
  const base = { x: 0.05, y: -0.34 };
  const rot = { x: base.x, y: base.y };
  const target = { x: base.x, y: base.y };
  let visible = true;
  let raf = 0;
  let introStart = 0;
  const INTRO = 1900;
  let lastScatter = -1;
  let readyFired = false;

  function layout() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const visW = visH * camera.aspect;
    if (opts.layout === "fit") {
      const s = Math.min((visH * 0.86) / 2, (visW * 0.86) / 1.9);
      group.scale.setScalar(s);
      group.position.set(0, 0, 0);
    } else if (opts.mobile) {
      // celular: no alto, à direita, atrás do título (o canvas fica esmaecido pelo CSS)
      const s = Math.min((visH * 0.5) / 2, (visW * 0.62) / 1.9);
      group.scale.setScalar(s);
      group.position.set(visW / 2 - 0.62 * s, visH / 2 - 1.15 * s - visH * 0.1, 0);
    } else {
      // computador: grande, à direita, cortado pela borda (como o símbolo no vídeo)
      const s = Math.min((visH * 0.92) / 2, (visW * 0.42) / 1.9);
      group.scale.setScalar(s);
      group.position.set(visW / 2 - 0.62 * s, -visH * 0.07, 0);
    }
  }

  function frame(now) {
    raf = 0;
    let t = 1;
    if (opts.assemble === "intro") {
      if (!introStart) introStart = now;
      t = Math.min(1, (now - introStart) / INTRO);
      uniforms.uAssemble.value = t;
    }

    rot.x += (target.x - rot.x) * 0.06;
    rot.y += (target.y - rot.y) * 0.06;
    const sc = uniforms.uScatter.value;
    pivot.rotation.set(rot.x + sc * 0.35, rot.y - sc * 0.9, sc * 0.12);
    group.position.z = -sc * 1.2;

    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      if (opts.onReady) opts.onReady();
    }
    const settling = Math.abs(target.x - rot.x) > 0.0005 || Math.abs(target.y - rot.y) > 0.0005;
    if (visible && (t < 1 || settling || sc !== lastScatter)) request();
    lastScatter = sc;
  }

  function request() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  function onPointer(e) {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    target.y = base.y + nx * 0.32;
    target.x = base.x + ny * 0.16;
    request();
  }
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

  const ro = new ResizeObserver(() => { layout(); request(); });
  ro.observe(container);
  // Usa sempre a leitura mais recente: ao fixar o topo na rolagem, o elemento muda de lugar
  // no HTML e o observador pode entregar "fora" e "dentro" no mesmo lote.
  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) request();
  });
  io.observe(container);

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    container.classList.add("is-lost");
  });

  layout();
  request();

  return {
    setAssemble(p) {
      uniforms.uAssemble.value = Math.max(0, Math.min(1, p));
      visible = true;
      request();
    },
    setScatter(p) {
      uniforms.uScatter.value = Math.max(0, Math.min(1, p));
      visible = true; // rolagem acontecendo: o topo está na tela
      request();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (finePointer) window.removeEventListener("pointermove", onPointer);
      geoA.dispose(); geoB.dispose(); matA.dispose(); matB.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
