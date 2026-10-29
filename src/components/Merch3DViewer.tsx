import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Merch3DViewer.css';

export type MerchProduct = 'nit' | 'research' | 'researchhoodie' | 'researchmode';

interface Props {
  product: MerchProduct;
  view?: 'front' | 'back';
  userName?: string;
  nitName?: string;
  batch?: string;
  // Home cards spin on their own and ignore the pointer so the card click still works
  interactive?: boolean;
  autoRotate?: boolean;
}

interface PrintData {
  userName?: string;
  nitName?: string;
  batch?: string;
}

// Garment proportions (world units). Torso is an elliptical cylinder; the print
// canvas wraps around it with the front panel on the left half, back on the right.
const GARMENTS = {
  research: {
    color: '#1b1b22',
    torso: { a: 0.85, b: 0.42, h: 2.2 },
    sleeve: { length: 0.75, rTop: 0.3, rBottom: 0.25, angle: 50, shoulderX: 0.74 },
  },
  researchhoodie: {
    color: '#1b1b22',
    torso: { a: 0.9, b: 0.45, h: 2.3 },
    sleeve: { length: 1.65, rTop: 0.31, rBottom: 0.21, angle: 20, shoulderX: 0.8 },
  },
  nit: {
    color: '#1b1b22',
    torso: { a: 0.85, b: 0.42, h: 2.25 },
    sleeve: { length: 1.55, rTop: 0.29, rBottom: 0.19, angle: 18, shoulderX: 0.74 },
  },
  researchmode: {
    color: '#1b1b22',
    torso: { a: 0.85, b: 0.42, h: 2.25 },
    sleeve: { length: 1.55, rTop: 0.29, rBottom: 0.19, angle: 18, shoulderX: 0.74 },
  },
} as const;

const PRODUCT_LABELS: Record<MerchProduct, string> = {
  nit: 'NIT long-sleeve tee',
  research: 'Research Publish T-shirt',
  researchhoodie: 'Research Publish hoodie',
  researchmode: 'Research Mode long-sleeve tee',
};

// Small four-point sparkle used as decoration around the Research Mode lettering
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// Artwork lifted from the product photo so the 3D back matches it exactly
const RESEARCH_MODE_ART = '/merch/research-mode-print.png';
const artCache = new Map<string, HTMLImageElement>();

function loadArt(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      artCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

const TEX_W = 2048;
const TEX_H = 1024;

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, maxW: number) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px Inter, Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 2;
  } while (s > 12);
  return s;
}

function drawPrints(canvas: HTMLCanvasElement, product: MerchProduct, data: PrintData) {
  const ctx = canvas.getContext('2d')!;
  const g = GARMENTS[product];
  ctx.fillStyle = g.color;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Side seams
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 3;
  for (const x of [2, TEX_W / 2, TEX_W - 2]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TEX_H);
    ctx.stroke();
  }

  // The front of an elliptical cylinder stretches the texture horizontally;
  // squeeze the artwork so lettering keeps its proportions on the model.
  const squeeze = (TEX_W / (2 * Math.PI * g.torso.a)) / (TEX_H / g.torso.h);
  const maxW = 440;

  const panel = (cx: number, draw: () => void) => {
    ctx.save();
    ctx.translate(cx, 0);
    ctx.scale(squeeze, 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    draw();
    ctx.restore();
  };

  const line = (text: string, y: number, size: number, color = '#fff', weight = 800) => {
    fitFont(ctx, text, weight, size, maxW);
    ctx.fillStyle = color;
    ctx.fillText(text, 0, y);
  };

  const front = TEX_W / 4;
  const back = (TEX_W * 3) / 4;

  if (product === 'research') {
    panel(front, () => {
      line('THINK', 250, 74);
      line('RESEARCH', 330, 74, '#e53935');
      line('PUBLISH', 410, 74);
      line(data.userName || '{YOUR NAME}', 520, 40);
    });
    panel(back, () => {
      line('THINK', 230, 80);
      line('LIKE A', 315, 80);
      line('RESEARCHER', 400, 80);
      line('Evidence over assumptions.', 520, 32, '#fff', 500);
      line('krishnamahawar.in', 565, 24, 'rgba(255,255,255,0.7)', 500);
    });
    // Hem stitch
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(0, TEX_H - 30);
    ctx.lineTo(TEX_W, TEX_H - 30);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (product === 'researchhoodie') {
    panel(front, () => {
      line('THINK', 330, 62);
      line('RESEARCH', 400, 78, '#e53935');
      line('PUBLISH', 470, 62);
      fitFont(ctx, data.userName || 'NAME', 800, 34, 380);
      ctx.fillStyle = '#fff';
      ctx.fillText(data.userName || 'NAME', 0, 580);
      // Kangaroo pocket
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 3;
      ctx.setLineDash([9, 7]);
      ctx.beginPath();
      ctx.moveTo(-230, 900);
      ctx.lineTo(-170, 670);
      ctx.lineTo(170, 670);
      ctx.lineTo(230, 900);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    });
    panel(back, () => {
      line('THINK LIKE A', 330, 40);
      line('RESEARCHER', 395, 84);
      line('Evidence over', 690, 40, '#fff', 500);
      line('Assumptions', 745, 40, '#fff', 500);
      line('krishnamahawar.in', 790, 18, 'rgba(255,255,255,0.7)', 600);
    });
    // Ribbed waistband
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, TEX_H - 80, TEX_W, 80);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    for (let x = 0; x < TEX_W; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, TEX_H - 80);
      ctx.lineTo(x, TEX_H);
      ctx.stroke();
    }
  } else if (product === 'researchmode') {
    panel(front, () => {
      // Left-chest style placement: NIT name with the batch tucked under its right edge
      const nit = data.nitName?.toUpperCase() || '{NIT NAME}';
      fitFont(ctx, nit, 800, 58, 360);
      const nitW = ctx.measureText(nit).width;
      ctx.fillStyle = '#fff';
      ctx.fillText(nit, 40, 290);
      ctx.textAlign = 'right';
      fitFont(ctx, data.batch || '{BATCH}', 700, 30, 200);
      ctx.fillText(data.batch || '{BATCH}', 40 + nitW / 2, 345);
      ctx.textAlign = 'center';
      fitFont(ctx, data.userName || '{YOUR NAME}', 700, 36, 380);
      ctx.fillText(data.userName || '{YOUR NAME}', -10, 820);
    });
    panel(back, () => {
      const art = artCache.get(RESEARCH_MODE_ART);
      if (art) {
        ctx.drawImage(art, -210, 200, 420, 420);
        return;
      }
      // Fallback until the artwork loads: tall condensed "RESEARCH" over a bold purple "MODE"
      ctx.save();
      // Squash horizontally, stretch vertically for tall condensed letters
      ctx.scale(0.46, 2.85);
      fitFont(ctx, 'RESEARCH', 900, 110, 650);
      const grad = ctx.createLinearGradient(0, 85, 0, 165);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#c9b8ff');
      ctx.textBaseline = 'alphabetic';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#5b3fd6';
      ctx.strokeText('RESEARCH', 0, 165);
      ctx.fillStyle = grad;
      ctx.fillText('RESEARCH', 0, 165);
      ctx.restore();
      line('MODE', 545, 110, '#7c4dff', 900);
      sparkle(ctx, -185, 230, 22, '#a085ff');
      sparkle(ctx, 180, 215, 16, '#c9b8ff');
      sparkle(ctx, -150, 545, 14, '#c9b8ff');
      sparkle(ctx, 165, 560, 20, '#a085ff');
    });
    // Hem stitch
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(0, TEX_H - 30);
    ctx.lineTo(TEX_W, TEX_H - 30);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    panel(front, () => {
      line('nit.', 400, 150);
    });
    panel(back, () => {
      line(data.nitName?.toUpperCase() || 'YOUR NIT', 250, 48, '#a085ff');
      line(data.userName || 'YOUR NAME', 345, 96);
      if (data.batch) line(`Class of ${data.batch}`, 440, 40, '#9997B8', 600);
    });
    // Hem stitch
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(0, TEX_H - 30);
    ctx.lineTo(TEX_W, TEX_H - 30);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function buildGarment(product: MerchProduct, texture: THREE.Texture) {
  const g = GARMENTS[product];
  const { a, b, h } = g.torso;
  const group = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: g.color, roughness: 0.92, metalness: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: '#07070a', roughness: 1, side: THREE.DoubleSide });

  // Torso: thetaStart -PI/2 puts u=0.25 at the front centre and u=0.75 at the back
  const torsoGeo = new THREE.CylinderGeometry(1, 1, h, 96, 1, true, -Math.PI / 2);
  const torso = new THREE.Mesh(
    torsoGeo,
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0, side: THREE.DoubleSide }),
  );
  torso.scale.set(a, 1, b);
  group.add(torso);

  // Rounded shoulders
  const domeH = 0.28;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2), fabric);
  dome.scale.set(a, domeH, b);
  dome.position.y = h / 2;
  group.add(dome);

  // Collar + neck opening
  const neckY = h / 2 + domeH - 0.04;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, product === 'researchhoodie' ? 0.07 : 0.035, 16, 48), fabric);
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1.05, 0.6, 1);
  collar.position.y = neckY;
  group.add(collar);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.28, 48), dark);
  hole.rotation.x = -Math.PI / 2;
  hole.scale.set(1.05, 0.6, 1);
  hole.position.y = neckY + 0.005;
  group.add(hole);

  // Bottom opening so the hem doesn't look hollow from below
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(1, 64), dark);
  bottom.rotation.x = Math.PI / 2;
  bottom.scale.set(a * 0.99, b * 0.99, 1);
  bottom.position.y = -h / 2 + 0.01;
  group.add(bottom);

  // Sleeves
  const s = g.sleeve;
  const shoulderY = h / 2 - 0.12;
  for (const side of [1, -1]) {
    const sleeve = new THREE.Group();
    sleeve.position.set(side * s.shoulderX, shoulderY, 0);
    sleeve.rotation.z = side * THREE.MathUtils.degToRad(s.angle);
    sleeve.scale.z = 0.75;

    const joint = new THREE.Mesh(new THREE.SphereGeometry(s.rTop, 32, 16), fabric);
    sleeve.add(joint);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(s.rTop, s.rBottom, s.length, 48, 1, true), fabric);
    arm.material = fabric.clone();
    (arm.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    arm.position.y = -s.length / 2;
    sleeve.add(arm);

    // Full-sleeve garments get ribbed cuffs; the short-sleeve tee ends open
    const cuffed = product !== 'research';
    if (cuffed) {
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(s.rBottom * 1.02, s.rBottom * 0.98, 0.16, 32, 1, true), fabric);
      cuff.position.y = -s.length - 0.08;
      sleeve.add(cuff);
    }
    const end = new THREE.Mesh(new THREE.CircleGeometry(s.rBottom * 0.97, 32), dark);
    end.rotation.x = Math.PI / 2;
    end.position.y = -s.length - (cuffed ? 0.15 : 0);
    sleeve.add(end);

    group.add(sleeve);
  }

  if (product === 'researchhoodie') {
    // Hood resting behind the neck
    const hood = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), fabric);
    hood.scale.set(0.5, 0.46, 0.4);
    hood.position.set(0, neckY + 0.12, -0.24);
    group.add(hood);

    // Drawstrings with aglets
    const stringMat = new THREE.MeshStandardMaterial({ color: '#2a2a33', roughness: 0.7 });
    const frontZ = (x: number) => b * Math.sqrt(1 - (x / a) ** 2) + 0.012;
    for (const x of [-0.13, 0.13]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, neckY, 0.17),
        new THREE.Vector3(x, h / 2 + 0.1, 0.36),
        new THREE.Vector3(x, h / 2 - 0.15, frontZ(x)),
        new THREE.Vector3(x * 1.1, h / 2 - 0.5, frontZ(x)),
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.016, 8), stringMat));
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 12), stringMat);
      tip.position.set(x * 1.1, h / 2 - 0.54, frontZ(x));
      group.add(tip);
    }
  }

  // Soft contact shadow
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext('2d')!;
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.1),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -h / 2 - 0.15;

  return { group, shadow };
}

export default function Merch3DViewer({
  product,
  view = 'front',
  userName,
  nitName,
  batch,
  interactive = true,
  autoRotate = false,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const targetRef = useRef<number | null>(null);
  const rotYRef = useRef(0);
  const printRef = useRef<PrintData>({ userName, nitName, batch });
  useEffect(() => {
    printRef.current = { userName, nitName, batch };
  }, [userName, nitName, batch]);

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 1.1, 8.2);
    camera.lookAt(0, 0.15, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a24, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8b72f5, 2.2);
    rim.position.set(-4, 2, -4);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(-4, 0, 3);
    scene.add(fill);

    const printCanvas = document.createElement('canvas');
    printCanvas.width = TEX_W;
    printCanvas.height = TEX_H;
    drawPrints(printCanvas, product, printRef.current);
    const texture = new THREE.CanvasTexture(printCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    canvasRef.current = printCanvas;
    textureRef.current = texture;

    // Redraw once web fonts are in so lettering uses Inter, not the fallback
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      drawPrints(printCanvas, product, printRef.current);
      texture.needsUpdate = true;
    });
    if (product === 'researchmode' && !artCache.has(RESEARCH_MODE_ART)) {
      loadArt(RESEARCH_MODE_ART).then(() => {
        if (disposed) return;
        drawPrints(printCanvas, product, printRef.current);
        texture.needsUpdate = true;
      }).catch(() => { /* keep the drawn fallback */ });
    }

    const { group, shadow } = buildGarment(product, texture);
    scene.add(group, shadow);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the whole garment in frame on narrow containers
      camera.position.z = w / h < 0.9 ? 8.2 / (w / h / 0.9) : 8.2;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    // Drag-to-rotate with inertia
    let rotX = 0;
    let velY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastInteraction = autoRotate ? -Infinity : performance.now();

    const onDown = (e: PointerEvent) => {
      dragging = true;
      targetRef.current = null;
      lastX = e.clientX;
      lastY = e.clientY;
      velY = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
      mount.classList.add('is-dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velY = dx * 0.01;
      rotYRef.current += velY;
      rotX = THREE.MathUtils.clamp(rotX + dy * 0.004, -0.3, 0.35);
      lastInteraction = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      lastInteraction = performance.now();
      mount.classList.remove('is-dragging');
      if (renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
    };
    if (interactive) {
      renderer.domElement.addEventListener('pointerdown', onDown);
      renderer.domElement.addEventListener('pointermove', onMove);
      renderer.domElement.addEventListener('pointerup', onUp);
      renderer.domElement.addEventListener('pointercancel', onUp);
    }

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 16.67, 3);
      prev = now;
      if (!dragging) {
        if (targetRef.current !== null) {
          const diff = targetRef.current - rotYRef.current;
          rotYRef.current += diff * 0.12 * dt;
          if (Math.abs(diff) < 0.001) targetRef.current = null;
          velY = 0;
        } else if (Math.abs(velY) > 0.0005) {
          rotYRef.current += velY * dt;
          velY *= Math.pow(0.93, dt);
        } else if (autoRotate && now - lastInteraction > 2500) {
          rotYRef.current += 0.006 * dt;
        }
        rotX += (0 - rotX) * 0.04 * dt;
      }
      group.rotation.y = rotYRef.current;
      group.rotation.x = rotX;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(m => {
            (m as THREE.MeshStandardMaterial).map?.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      textureRef.current = null;
    };
  }, [product, interactive, autoRotate]);

  // Live-update the print as the customer types
  useEffect(() => {
    if (!canvasRef.current || !textureRef.current) return;
    drawPrints(canvasRef.current, product, { userName, nitName, batch });
    textureRef.current.needsUpdate = true;
  }, [product, userName, nitName, batch]);

  // Turn to face the requested side along the shortest path
  useEffect(() => {
    const base = view === 'front' ? 0 : Math.PI;
    const cur = rotYRef.current;
    const turns = Math.round((cur - base) / (Math.PI * 2));
    targetRef.current = base + turns * Math.PI * 2;
  }, [view]);

  return (
    <div
      ref={mountRef}
      className={`merch-3d ${interactive ? 'is-interactive' : ''}`}
      aria-label={`3D preview of the ${PRODUCT_LABELS[product]}`}
      role="img"
    >
      {interactive && <div className="merch-3d-hint">Drag to rotate</div>}
    </div>
  );
}
