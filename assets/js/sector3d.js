// Real 3D objects that float over the laptop in the sector showcase, one per
// sector, built from three.js primitives (no model files). home.js sends
// `sector:update` events with { index, local } as the visitor scrolls; the
// active object flies in, turns and drifts with the scroll, then spins out.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('.sector-3d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canvas && innerWidth > 860) init();

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 22);

  // Soft studio light
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d4ea, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(-6, 2, -4);
  scene.add(rim);

  const mat = (color, opts = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3, ...opts });
  const lathe = (pts, m, seg = 48) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), m);
  const box = (w, h, d, m, r = 0) => new THREE.Mesh(r ? roundedBox(w, h, d, r) : new THREE.BoxGeometry(w, h, d), m);

  // ---------- The six objects ----------
  const objects = [
    sprayBottle(), house(), coffeeCup(), scissors(), toolbox(), bouquet(),
  ];
  objects.forEach(o => { o.visible = false; o.scale.setScalar(0.001); scene.add(o); });

  // Fake contact shadow under the active object
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.3, 48), new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false, opacity: 0.35 }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  function sprayBottle() {
    const g = new THREE.Group();
    const blue = mat(0x58a6ff, { transmission: 0.25, thickness: 0.6, roughness: 0.18 });
    const body = lathe([[0, -1.6], [0.78, -1.6], [0.86, -1.4], [0.86, 0.5], [0.62, 0.95], [0.34, 1.2], [0.34, 1.45], [0, 1.45]], blue);
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.875, 0.875, 1.1, 48, 1, true), mat(0xffffff, { side: THREE.DoubleSide }));
    label.position.y = -0.5;
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.18, 48, 1, true), mat(0xfff04d, { side: THREE.DoubleSide }));
    stripe.position.y = -0.2;
    const head = box(0.62, 0.55, 1.3, mat(0x1a1a1f), 0.12); head.position.set(0, 1.72, 0.25);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 24), mat(0x1a1a1f)); nozzle.rotation.x = Math.PI / 2; nozzle.position.set(0, 1.74, 1.02);
    const trigger = box(0.2, 0.75, 0.22, mat(0xfff04d), 0.08); trigger.position.set(0, 1.18, 0.62); trigger.rotation.x = 0.35;
    g.add(body, label, stripe, head, nozzle, trigger);
    g.userData.spin = 1;
    return g;
  }

  function house() {
    const g = new THREE.Group();
    const walls = box(2.2, 1.6, 1.8, mat(0xffffff), 0.08); walls.position.y = -0.4;
    const roofShape = new THREE.Shape(); roofShape.moveTo(-1.35, 0); roofShape.lineTo(0, 1.15); roofShape.lineTo(1.35, 0); roofShape.lineTo(-1.35, 0);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape, { depth: 2.05, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 }), mat(0x14b8a6));
    roof.position.set(0, 0.38, -1.02);
    const door = box(0.48, 0.8, 0.08, mat(0xffb547), 0.04); door.position.set(0, -0.8, 0.92);
    const winM = mat(0x7fd0ff, { roughness: 0.1 });
    const w1 = box(0.42, 0.42, 0.08, winM, 0.04); w1.position.set(-0.68, -0.3, 0.92);
    const w2 = w1.clone(); w2.position.x = 0.68;
    const chimney = box(0.3, 0.6, 0.3, mat(0xf2f2ef), 0.04); chimney.position.set(0.62, 1.15, -0.2);
    const pin = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 32), mat(0x0f766e));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 32), mat(0x0f766e)); tip.rotation.x = Math.PI; tip.position.y = -0.38;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), mat(0xffffff)); dot.position.z = 0.28;
    pin.add(ball, tip, dot); pin.position.set(0, 2.45, 0);
    g.add(walls, roof, door, w1, w2, chimney, pin);
    g.userData.bob = pin;
    return g;
  }

  function coffeeCup() {
    const g = new THREE.Group();
    const white = mat(0xffffff);
    const cup = lathe([[0, -0.9], [0.75, -0.9], [0.95, -0.6], [1.08, 0.6], [1.0, 0.62], [0.88, -0.5], [0, -0.55]], white);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.98, 48), mat(0x6b3a1e, { roughness: 0.2 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.45;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.11, 16, 48, Math.PI * 1.2), white); handle.position.set(1.12, 0, 0); handle.rotation.z = -Math.PI * 0.6;
    const saucer = lathe([[0, -1.0], [1.7, -1.0], [1.8, -0.88], [1.5, -0.92], [0, -0.92]], white);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 0.93, 0.5, 48, 1, true), mat(0xb45309, { side: THREE.DoubleSide })); sleeve.position.y = -0.05;
    const beans = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), mat(0x4a2511)); b.scale.set(1, 0.7, 1.4);
      b.position.set(Math.cos(i * 1.7) * 2, 0.6 + (i % 2) * 0.7, Math.sin(i * 1.7) * 1.2); beans.add(b);
    }
    g.add(saucer, cup, coffee, handle, sleeve, beans);
    g.userData.orbit = beans;
    return g;
  }

  function scissors() {
    const g = new THREE.Group();
    const steel = mat(0xe6e6ea, { metalness: 0.9, roughness: 0.22, clearcoat: 1 });
    const pink = mat(0xec4899);
    const blade = sign => {
      const b = new THREE.Group();
      const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.22, 0.1); s.lineTo(0.06, 2.6); s.lineTo(-0.06, 2.4); s.lineTo(0, 0);
      const edge = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), steel);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.12, 20, 48), pink); ring.position.set(0.1, -0.75, 0.03);
      const arm = box(0.16, 0.5, 0.1, pink, 0.04); arm.position.set(0.1, -0.25, 0.03);
      b.add(edge, ring, arm);
      b.scale.x = sign;
      return b;
    };
    const a = blade(1), b = blade(-1);
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 24), steel); pivot.rotation.x = Math.PI / 2;
    g.add(a, b, pivot);
    g.position.y = -0.4;
    g.userData.blades = [a, b];
    return g;
  }

  function toolbox() {
    const g = new THREE.Group();
    const orange = mat(0xf97316);
    const dark = mat(0x2b2b30);
    const base = box(2.6, 1.2, 1.4, orange, 0.1); base.position.y = -0.5;
    const lid = box(2.7, 0.35, 1.5, mat(0xea580c), 0.1); lid.position.y = 0.25;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.1, 16, 48, Math.PI), dark); handle.position.y = 0.42;
    const latchL = box(0.25, 0.35, 0.08, dark, 0.03); latchL.position.set(-0.8, 0.08, 0.77);
    const latchR = latchL.clone(); latchR.position.x = 0.8;
    const wrench = new THREE.Group();
    const shaft = box(0.22, 1.9, 0.12, mat(0xd4d4d8, { metalness: 0.8, roughness: 0.25 }), 0.05);
    const jaw = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.12, 16, 32, Math.PI * 1.5), mat(0xd4d4d8, { metalness: 0.8, roughness: 0.25 })); jaw.position.y = 1.05; jaw.rotation.z = Math.PI * 0.25;
    wrench.add(shaft, jaw); wrench.position.set(1.7, 1.2, 0.3); wrench.rotation.z = -0.6;
    g.add(base, lid, handle, latchL, latchR, wrench);
    g.userData.bob = wrench;
    return g;
  }

  function bouquet() {
    const g = new THREE.Group();
    const wrap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 40, 1, true), mat(0xf3ecff, { side: THREE.DoubleSide })); wrap.rotation.x = Math.PI; wrap.position.y = -0.9;
    const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 16, 40), mat(0x7c3aed)); ribbon.rotation.x = Math.PI / 2; ribbon.position.y = -1.1;
    const cols = [0xff7ab8, 0xffb547, 0xb388ff, 0x7fd0ff, 0xff9ed2, 0xfff04d, 0xff7ab8];
    const flowers = new THREE.Group();
    cols.forEach((c, i) => {
      const f = new THREE.Group();
      const a = (i / cols.length) * Math.PI * 2;
      for (let k = 0; k < 6; k++) {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), mat(c)); petal.scale.set(1, 0.45, 1.6);
        const pa = (k / 6) * Math.PI * 2; petal.position.set(Math.cos(pa) * 0.26, 0, Math.sin(pa) * 0.26); petal.rotation.y = -pa;
        f.add(petal);
      }
      const centre = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), mat(0xffd84d)); centre.position.y = 0.06; f.add(centre);
      const r = i === cols.length - 1 ? 0 : 0.7;
      f.position.set(Math.cos(a) * r, 0.45 + (i % 3) * 0.18, Math.sin(a) * r);
      f.rotation.x = 0.5 + (i % 2) * 0.3; f.rotation.z = Math.cos(a) * 0.4;
      flowers.add(f);
    });
    const leafM = mat(0x4c9a5a);
    for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), leafM); l.scale.set(0.5, 0.15, 1.5); const a = k * 1.6; l.position.set(Math.cos(a) * 0.9, 0.1, Math.sin(a) * 0.9); l.rotation.y = -a; l.rotation.x = 0.6; flowers.add(l); }
    g.add(wrap, ribbon, flowers);
    g.userData.bob = flowers;
    return g;
  }

  // ---------- Layout + loop ----------
  let active = -1, local = 0, visible = false, t = 0;
  const target = { index: 0, local: 0 };
  const size = () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  };
  size();
  addEventListener('resize', size);

  const show = i => {
    if (i === active) return;
    const prev = objects[active], next = objects[i];
    if (prev && window.gsap) {
      gsap.to(prev.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.45, ease: 'back.in(2)', onComplete: () => { prev.visible = false; } });
      gsap.to(prev.rotation, { y: prev.rotation.y + Math.PI, duration: 0.45, ease: 'power2.in' });
    } else if (prev) prev.visible = false;
    active = i;
    next.visible = true;
    if (window.gsap && !reduce) {
      gsap.fromTo(next.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1, 0.55)', delay: 0.15 });
      gsap.fromTo(next.rotation, { y: -Math.PI }, { y: 0, duration: 1.2, ease: 'expo.out', delay: 0.15 });
    } else next.scale.setScalar(1);
  };

  addEventListener('sector:update', e => { target.index = e.detail.index; target.local = e.detail.local; show(e.detail.index); });
  show(0);

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    local += (target.local - local) * 0.08;
    const o = objects[active];
    if (o) {
      // Drift down the right edge of the laptop as the concept site scrolls
      // x/y in world units: the right edge of the laptop sits around x = 5
      const x = 4.5 - local * 0.5;
      const y = 2.2 - local * 3.4 + Math.sin(t * 1.4) * 0.12;
      o.position.set(x, y, 0);
      o.rotation.x = 0.18 + Math.sin(t * 0.8) * 0.05;
      if (!reduce) o.rotation.y += ((local * Math.PI * 1.6 - 0.4) - o.rotation.y) * 0.06;
      o.rotation.z = Math.sin(t * 0.9) * 0.06 - 0.12;
      shadow.position.set(x, y - 2.1, -0.5);
      shadow.scale.setScalar(0.9 + Math.sin(t * 1.4) * 0.04);
      if (o.userData.bob) o.userData.bob.position.y += Math.sin(t * 2.2) * 0.004;
      if (o.userData.orbit) o.userData.orbit.rotation.y = t * 0.6;
      if (o.userData.blades) { const a = Math.sin(t * 5) * 0.18 + 0.18; o.userData.blades[0].rotation.z = a; o.userData.blades[1].rotation.z = -a; }
    }
    renderer.render(scene, camera);
  });

  function roundedBox(w, h, d, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const geo = new THREE.ExtrudeGeometry(s, { depth: d - r * 2, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 4, curveSegments: 6 });
    geo.translate(0, 0, -(d - r * 2) / 2);
    return geo;
  }
  function radialTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(20,20,40,0.9)'); gr.addColorStop(1, 'rgba(20,20,40,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
}
