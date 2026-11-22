// Hero scene: builds the garage door and the drifting parts, lifts the door and moves each depth with the scroll,
// and writes a few moments from a shop's day into the readout. Plain DOM, no libraries. Reduced motion gets a still scene.
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Doorstock's things, drawn on a 100 unit square in currentColor.
const PARTS = {
  spring: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
    <path d="M8 50h8"/><path d="M84 50h8"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${18 + i * 8.4} 26c6 0 6 48 0 48"/>`).join("")}
    <path d="M14 26h72M14 74h72" stroke-width="2" opacity=".35"/></svg>`,
  roller: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5">
    <circle cx="38" cy="50" r="28"/><circle cx="38" cy="50" r="9" fill="currentColor"/><path d="M47 50h46" stroke-linecap="round" stroke-width="7"/></svg>`,
  hinge: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">
    <rect x="12" y="22" width="30" height="56" rx="4"/><rect x="58" y="22" width="30" height="56" rx="4"/>
    <rect x="42" y="40" width="16" height="20" rx="3" fill="currentColor"/><circle cx="27" cy="36" r="4" fill="currentColor"/>
    <circle cx="27" cy="64" r="4" fill="currentColor"/><circle cx="73" cy="36" r="4" fill="currentColor"/><circle cx="73" cy="64" r="4" fill="currentColor"/></svg>`,
  box: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">
    <path d="M50 12 88 30v40L50 88 12 70V30z"/><path d="M12 30l38 18 38-18M50 48v40"/><path d="M31 21l38 18" opacity=".5"/></svg>`,
  cable: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
    <path d="M50 18a30 30 0 1 1-22 9"/><path d="M50 30a18 18 0 1 1-13 6"/><path d="M28 27 14 14"/><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>`,
};

function buildDoor() {
  const ground = document.getElementById("door");
  if (!ground) return null;
  const door = document.createElement("div");
  door.className = "door";
  ["windows", "", "", "handle"].forEach((kind) => {
    const row = document.createElement("div");
    row.className = "door-row" + (kind ? " " + kind : "");
    row.innerHTML = "<i></i>".repeat(5);
    door.appendChild(row);
  });
  ground.appendChild(door);
  return ground;
}

function buildSky() {
  const sky = document.getElementById("sky");
  if (!sky) return [];
  // [kind, x %, y %, size px, rotation, low on stock]
  const depths = {
    far:  { speed: 0.15, items: [["roller", 8, 18, 34, -12], ["hinge", 88, 14, 30, 8], ["box", 22, 62, 30, 4], ["cable", 76, 58, 32, -6]] },
    mid:  { speed: 0.3,  items: [["spring", 4, 40, 70, -8], ["box", 90, 34, 46, 10, true], ["roller", 70, 8, 44, 18], ["hinge", 16, 8, 40, -14]] },
    near: { speed: 0.5,  items: [["spring", 84, 66, 96, 12, true], ["roller", 3, 72, 62, -20], ["cable", 60, 82, 52, 6]] },
  };
  return Object.entries(depths).map(([name, d]) => {
    const layer = document.createElement("div");
    layer.className = "layer " + name;
    d.items.forEach(([kind, x, y, s, r, low], i) => {
      const p = document.createElement("div");
      p.className = "part" + (low ? " low" : "");
      p.style.cssText = `left:${x}%;top:${y}%;--s:${s}px;--r:${r}deg;animation-duration:${5 + i * 1.3}s;animation-delay:${-i * 1.7}s`;
      p.innerHTML = PARTS[kind];
      layer.appendChild(p);
    });
    sky.appendChild(layer);
    return { el: layer, speed: d.speed };
  });
}

const ground = buildDoor();
const layers = buildSky();

// Scroll: the door lifts faster than the page, the parts float up at their own depth.
if (!still) {
  let queued = false;
  const move = () => {
    queued = false;
    const y = Math.min(scrollY, innerHeight * 1.2);
    if (ground) ground.style.transform = `translateY(${-y * 0.55}px)`;
    layers.forEach((l) => (l.el.style.transform = `translateY(${-y * l.speed}px)`));
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(move); } }, { passive: true });
}

// The readout: parts on the shelf, and a line typed out for each thing that happens.
const count = document.getElementById("dCount"), line = document.getElementById("dLine");
if (count && line && !still) {
  const day = [
    { text: "Scanned a box: Cable 8' door. 10 on the shelf.", delta: 0 },
    { text: "Halvorsen residence complete. 2 springs and 2 cables off the shelf.", delta: -4 },
    { text: "Torsion spring .250 x 2\" x 30\" is low. Added to the reorder email.", delta: 0 },
    { text: "Reorder came in: 6 springs back on the shelf.", delta: 6 },
    { text: "Okafor residence complete. One opener off the shelf.", delta: -1 },
  ];
  let stock = 128, i = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  (async function run() {
    for (;;) {
      const step = day[i++ % day.length];
      line.textContent = "";
      for (const ch of step.text) { line.textContent += ch; await wait(28 + Math.random() * 40); }
      for (let k = 0; k < Math.abs(step.delta); k++) { stock += Math.sign(step.delta); count.textContent = stock; await wait(140); }
      await wait(2200);
    }
  })();
}
