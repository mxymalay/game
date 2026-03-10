/* =========================================================
   小鸡下蛋 - 游戏逻辑 v2
   ========================================================= */

// ── 小鸡数据（12种）────────────────────────────────────────
const CHICKENS = [
  { id: 'normal',   emoji: '🐔', name: '普通鸡',   color: '#ffcd3c', speed: 600 },
  { id: 'chick',    emoji: '🐤', name: '小黄鸡',   color: '#ffe066', speed: 420 },
  { id: 'rooster',  emoji: '🐓', name: '大公鸡',   color: '#ff7eb3', speed: 750 },
  { id: 'hatching', emoji: '🐣', name: '破壳鸡',   color: '#a0e4b0', speed: 370 },
  { id: 'eagle',    emoji: '🦅', name: '神鹰',     color: '#7ee8fa', speed: 310 },
  { id: 'penguin',  emoji: '🐧', name: '企鹅',     color: '#b094ee', speed: 820 },
  { id: 'owl',      emoji: '🦉', name: '猫头鹰',   color: '#d4a0ff', speed: 680 },
  { id: 'flamingo', emoji: '🦩', name: '火烈鸟',   color: '#ff8fa8', speed: 500 },
  { id: 'parrot',   emoji: '🦜', name: '鹦鹉',     color: '#4de6a8', speed: 350 },
  { id: 'duck',     emoji: '🦆', name: '小鸭子',   color: '#ffe0a0', speed: 560 },
  { id: 'turkey',   emoji: '🦃', name: '火鸡',     color: '#ff9966', speed: 900 },
  { id: 'phoenix',  emoji: '🔥', name: '凤凰',     color: '#ff4444', speed: 220 },
];

// ── 蛋数据（14种）──────────────────────────────────────────
const EGGS = [
  { id: 'egg',        emoji: '🥚', name: '白鸡蛋',   burst: ['✨','💫'],       trail: '✨' },
  { id: 'fried',      emoji: '🍳', name: '荷包蛋',   burst: ['🔥','💥'],       trail: '🌡️' },
  { id: 'dino',       emoji: '🦕', name: '恐龙蛋',   burst: ['🦖','🌿'],       trail: '🌿' },
  { id: 'golden',     emoji: '🌟', name: '金蛋',     burst: ['💰','✨','💎'],   trail: '💫' },
  { id: 'chocolate',  emoji: '🍫', name: '巧克力蛋', burst: ['🍬','❤️'],       trail: '🍬' },
  { id: 'rainbow',    emoji: '🌈', name: '彩虹蛋',   burst: ['🦄','🎆','🌈'], trail: '🌈' },
  { id: 'alien',      emoji: '👽', name: '外星蛋',   burst: ['🛸','⚡','🔮'],  trail: '⚡' },
  { id: 'bomb',       emoji: '💣', name: '炸弹蛋',   burst: ['💥','🔥','💢'],  trail: '💥' },
  { id: 'crystal',    emoji: '💎', name: '水晶蛋',   burst: ['💠','🔷','✨'],  trail: '💠' },
  { id: 'moon',       emoji: '🌙', name: '月亮蛋',   burst: ['⭐','🌟','✨'],  trail: '⭐' },
  { id: 'dragon',     emoji: '🐲', name: '龙蛋',     burst: ['🔥','💥','🐉'],  trail: '🔥' },
  { id: 'poison',     emoji: '☠️', name: '毒蛋',     burst: ['💀','🟢','💚'],  trail: '🟢' },
  { id: 'ice',        emoji: '🧊', name: '冰蛋',     burst: ['❄️','🌨️','💙'], trail: '❄️' },
  { id: 'magic',      emoji: '🔮', name: '魔法蛋',   burst: ['✨','🌀','⚡'],  trail: '🌀' },
];

// ── 连击特效配置 ───────────────────────────────────────────
const COMBO_EFFECTS = [
  { min: 3,  max: 4,  label: (c) => `⚡ x${c}`,       color: '#ffcd3c', size: '1.6rem' },
  { min: 5,  max: 7,  label: (c) => `🔥 FIRE x${c}`,  color: '#ff9944', size: '1.9rem' },
  { min: 8,  max: 11, label: (c) => `💥 BOOM x${c}!`, color: '#ff5599', size: '2.1rem' },
  { min: 12, max: 17, label: (c) => `🌈 FEVER x${c}!!!`, color: '#aa44ff', size: '2.3rem' },
  { min: 18, max: 99, label: (c) => `🚀 GOD MODE x${c}!!!`, color: '#00eeff', size: '2.6rem' },
];

// ── 状态 ─────────────────────────────────────────────────
let selectedChicken = CHICKENS[0];
let selectedEgg     = EGGS[0];
let eggCount        = 0;
let combo           = 1;
let bestCombo       = 1;
let spaceHeld       = false;
let layTimer        = null;
let comboResetTimer = null;
const MAX_BASKET    = 120;
let idleTimer       = null;

// ── DOM refs ─────────────────────────────────────────────
const chickenEmoji  = document.getElementById('chicken-emoji');
const chickenDisp   = document.getElementById('chicken-display');
const eggCountEl    = document.getElementById('egg-count');
const comboEl       = document.getElementById('combo');
const bestComboEl   = document.getElementById('best-combo');
const speedLabel    = document.getElementById('speed-label');
const statusMsg     = document.getElementById('status-msg');
const basket        = document.getElementById('basket');
const basketCount   = document.getElementById('basket-count');
const flashOverlay  = document.getElementById('flash-overlay');

// ── Build Selection UI ────────────────────────────────────
function buildGrid(items, containerId, type) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'sel-btn' + (i === 0 ? ' active' : '');
    btn.dataset.id = item.id;
    btn.innerHTML = `<span class="icon">${item.emoji}</span><span>${item.name}</span>`;
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.sel-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (type === 'chicken') {
        selectedChicken = item;
        chickenEmoji.textContent = item.emoji;
        chickenEmoji.style.filter = `drop-shadow(0 12px 32px ${item.color}55)`;
        speedLabel.textContent = msToLabel(item.speed);
        // restart timer if currently laying
        if (spaceHeld) {
          clearInterval(layTimer);
          layTimer = setInterval(layEgg, selectedChicken.speed);
        }
      } else {
        selectedEgg = item;
      }
    });
    grid.appendChild(btn);
  });
}

buildGrid(CHICKENS, 'chicken-grid', 'chicken');
buildGrid(EGGS,     'egg-grid',     'egg');
speedLabel.textContent = msToLabel(selectedChicken.speed);

function msToLabel(ms) {
  if (ms <= 300) return '极快';
  if (ms <= 450) return '很快';
  if (ms <= 600) return '普通';
  if (ms <= 750) return '慢';
  return '很慢';
}

// ── Core: Lay Egg ─────────────────────────────────────────
function layEgg() {
  eggCount++;
  eggCountEl.textContent = eggCount;

  // combo
  clearTimeout(comboResetTimer);
  comboResetTimer = setTimeout(resetCombo, 2000);
  if (combo < 30) combo++;
  if (combo > bestCombo) { bestCombo = combo; bestComboEl.textContent = `x${bestCombo}`; }
  comboEl.textContent = `x${combo}`;
  bumpCombo();

  // status msg
  const msgs = ['咕咕咕！', '下蛋啦～', '好厉害！', '继续！继续！',
    `连击 x${combo}！`, '哗！', '加油！', '💪 真棒！', '嘎嘎嘎！'];
  statusMsg.textContent = msgs[Math.floor(Math.random() * msgs.length)];

  // visual effects
  triggerAnim(chickenDisp, 'squeezing');
  spawnFlyingEgg();
  spawnBurst();
  spawnTrail();

  // combo-level effects
  const eff = getComboEffect(combo);
  if (eff) spawnComboText(eff);
  if (combo >= 5)  spawnRing();
  if (combo >= 10) spawnStarBurst();
  if (combo >= 15) screenFlash();
  if (combo >= 18) spawnMegaText();
  if (combo >= 5)  spawnArcEggs();

  addToBasket();
}

function resetCombo() {
  combo = 1;
  comboEl.textContent = 'x1';
}

function bumpCombo() {
  comboEl.classList.remove('bump');
  void comboEl.offsetWidth;
  comboEl.classList.add('bump');
  comboEl.addEventListener('transitionend', () => comboEl.classList.remove('bump'), { once: true });
}

function getComboEffect(c) {
  return COMBO_EFFECTS.find(e => c >= e.min && c <= e.max) || null;
}

// ── Animation helpers ─────────────────────────────────────
function triggerAnim(el, cls) {
  el.classList.remove('idle', cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', () => {
    el.classList.remove(cls);
    if (!spaceHeld) el.classList.add('idle');
  }, { once: true });
}

function getChickenCenter() {
  const rect = chickenEmoji.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.82 };
}

// Main downward flying egg
function spawnFlyingEgg() {
  const { x, y } = getChickenCenter();
  const el = document.createElement('div');
  el.className = 'flying-egg';
  el.textContent = selectedEgg.emoji;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// Side-arc eggs for higher combos
function spawnArcEggs() {
  const { x, y } = getChickenCenter();
  const count = combo >= 15 ? 3 : combo >= 10 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'arc-egg';
      const angle = 120 + i * 60;
      const dist  = 160 + Math.random() * 80;
      const tx = Math.cos(angle * Math.PI / 180) * dist;
      const ty = Math.sin(angle * Math.PI / 180) * dist + 60;
      const rot = (Math.random() - 0.5) * 720;
      el.style.cssText = `left:${x}px; top:${y}px; --tx:${tx}px; --ty:${ty}px; --rot:${rot}deg;`;
      el.textContent = selectedEgg.emoji;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 60);
  }
}

// Burst icon particles
function spawnBurst() {
  const { x, y } = getChickenCenter();
  const icons = selectedEgg.burst;
  const count = combo >= 10 ? 10 : combo >= 5 ? 7 : 5;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'burst';
    const angle = (i / count) * 360 + Math.random() * 20;
    const dist  = 55 + Math.random() * 50;
    const dx = Math.cos(angle * Math.PI / 180) * dist;
    const dy = Math.sin(angle * Math.PI / 180) * dist;
    el.style.cssText = `left:${x}px; top:${y}px; --dx:${dx}px; --dy:${dy}px;`;
    el.textContent = icons[i % icons.length];
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// Trail drop below egg
function spawnTrail() {
  if (combo < 3) return;
  const { x, y } = getChickenCenter();
  const el = document.createElement('div');
  el.className = 'burst';
  el.style.cssText = `left:${x + (Math.random()-0.5)*60}px; top:${y+30}px; --dx:${(Math.random()-0.5)*30}px; --dy:${40+Math.random()*40}px; font-size:1rem;`;
  el.textContent = selectedEgg.trail;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// Expanding ring
function spawnRing() {
  const { x, y } = getChickenCenter();
  const ringCount = combo >= 15 ? 3 : combo >= 10 ? 2 : 1;
  for (let i = 0; i < ringCount; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'ring-effect';
      el.style.cssText = `left:${x}px; top:${y}px; border-color: ${selectedChicken.color};`;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 120);
  }
}

// Radial star burst
function spawnStarBurst() {
  const { x, y } = getChickenCenter();
  const stars = ['⭐','💫','✨','🌟'];
  const count = combo >= 18 ? 14 : 8;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'star-burst';
    const angle = (i / count) * 360;
    const dist  = 80 + Math.random() * 60;
    const dx = Math.cos(angle * Math.PI / 180) * dist;
    const dy = Math.sin(angle * Math.PI / 180) * dist;
    const rot = (Math.random() - 0.5) * 360;
    const dur = 0.6 + Math.random() * 0.4;
    el.style.cssText = `left:${x}px; top:${y}px; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg; --dur:${dur}s;`;
    el.textContent = stars[i % stars.length];
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// Screen color flash
function screenFlash() {
  const colors = ['rgba(255,205,60,0.12)', 'rgba(255,100,180,0.12)', 'rgba(100,220,255,0.12)'];
  flashOverlay.style.background = colors[Math.floor(Math.random() * colors.length)];
  flashOverlay.style.opacity = '1';
  setTimeout(() => { flashOverlay.style.opacity = '0'; }, 80);
}

// Combo floating text
function spawnComboText(eff) {
  const { x, y } = getChickenCenter();
  const el = document.createElement('div');
  el.className = 'combo-flash';
  el.textContent = eff.label(combo);
  el.style.cssText = `left:${x}px; top:${y - 30}px; color:${eff.color}; font-size:${eff.size}; text-shadow: 0 0 24px ${eff.color}99;`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// Mega center text for very high combos
function spawnMegaText() {
  const vw = window.innerWidth / 2;
  const vh = window.innerHeight / 2;
  const el = document.createElement('div');
  el.className = 'combo-mega';
  el.style.cssText = `left:${vw}px; top:${vh}px; background: linear-gradient(135deg,#ffcd3c,#ff7eb3); -webkit-background-clip:text; -webkit-text-fill-color:transparent;`;
  const texts = ['✨ 神级 ✨', '🔥 无敌 🔥', '🚀 疯狂 🚀', '👑 王者 👑'];
  el.textContent = texts[Math.floor(Math.random() * texts.length)];
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function addToBasket() {
  while (basket.children.length >= MAX_BASKET) basket.removeChild(basket.firstChild);
  const span = document.createElement('span');
  span.className = 'basket-egg';
  span.textContent = selectedEgg.emoji;
  span.title = selectedEgg.name;
  basket.appendChild(span);
  basketCount.textContent = `(${eggCount})`;
}

// ── Space key hold logic ──────────────────────────────────
function startLaying() {
  if (spaceHeld) return;
  spaceHeld = true;
  clearTimeout(idleTimer);
  chickenDisp.classList.remove('idle');
  statusMsg.textContent = '用力！用力！';
  layEgg();
  layTimer = setInterval(layEgg, selectedChicken.speed);
}

function stopLaying() {
  if (!spaceHeld) return;
  spaceHeld = false;
  clearInterval(layTimer);
  layTimer = null;
  statusMsg.textContent = '按住空格键继续下蛋！';
  triggerAnim(chickenDisp, 'wiggling');
  idleTimer = setTimeout(() => chickenDisp.classList.add('idle'), 400);
}

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); startLaying(); }
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') stopLaying();
});

// Touch / mouse on game area
const gameArea = document.getElementById('game-area');
gameArea.addEventListener('touchstart',  (e) => { e.preventDefault(); startLaying(); }, { passive: false });
gameArea.addEventListener('touchend',    (e) => { e.preventDefault(); stopLaying();  }, { passive: false });
gameArea.addEventListener('mousedown',   (e) => { e.preventDefault(); startLaying(); });
document.addEventListener('mouseup',     stopLaying);
