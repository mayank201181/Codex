import * as THREE from "three";

const COLORS = [
  ["Red", "#ff3b30"], ["Orange", "#ff9500"], ["Yellow", "#ffd60a"], ["Green", "#34c759"],
  ["Blue", "#0a84ff"], ["Indigo", "#5856d6"], ["Violet", "#af52de"], ["Pink", "#ff4fb3"]
];

const storeKey = "pastel-3d-pen-studio";
const defaultState = { username: "", friends: [], backpack: [], trades: [] };
const appState = loadState();
const studio = {
  mode: "solo",
  collabFriends: [],
  colorName: COLORS[0][0],
  color: COLORS[0][1],
  speed: "slow",
  power: true,
  drawing: false,
  strokes: 0,
  selectedTradeFriend: "",
  selectedTradeItem: "",
  collabRoom: "",
  collabSeen: 0,
  collabIds: new Set(),
  collabTimer: null
};

let scene;
let camera;
let renderer;
let board;
let penMesh;
let raycaster;
let pointer;
let lastPoint = null;
let animationStarted = false;
let boardReady = false;

const els = {
  screens: {
    home: document.querySelector("#homeScreen"),
    color: document.querySelector("#colorScreen"),
    collab: document.querySelector("#collabScreen"),
    trade: document.querySelector("#tradeScreen"),
    studio: document.querySelector("#studioScreen")
  },
  usernameInput: document.querySelector("#usernameInput"),
  friendInput: document.querySelector("#friendInput"),
  welcomeText: document.querySelector("#welcomeText"),
  friendsList: document.querySelector("#friendsList"),
  friendCount: document.querySelector("#friendCount"),
  backpackList: document.querySelector("#backpackList"),
  backpackCount: document.querySelector("#backpackCount"),
  colorChoices: document.querySelector("#colorChoices"),
  collabFriendList: document.querySelector("#collabFriendList"),
  tradeFriendList: document.querySelector("#tradeFriendList"),
  tradeItemList: document.querySelector("#tradeItemList"),
  tradeStatus: document.querySelector("#tradeStatus"),
  canvas: document.querySelector("#sceneCanvas"),
  activeColorName: document.querySelector("#activeColorName"),
  penNib: document.querySelector("#penNib"),
  miniColors: document.querySelector("#miniColors"),
  powerBtn: document.querySelector("#powerBtn"),
  slowBtn: document.querySelector("#slowBtn"),
  fastBtn: document.querySelector("#fastBtn"),
  studioMode: document.querySelector("#studioMode"),
  studioTitle: document.querySelector("#studioTitle"),
  collabPanel: document.querySelector("#collabPanel"),
  activeCollabList: document.querySelector("#activeCollabList")
};

boot();

function boot() {
  els.usernameInput.value = appState.username;
  renderHome();
  renderColors();
  bindControls();
  updatePenUi();
}

function bindControls() {
  document.querySelector("#saveUserBtn").addEventListener("click", saveUsername);
  document.querySelector("#addFriendBtn").addEventListener("click", addFriend);
  document.querySelector("#startBtn").addEventListener("click", () => {
    studio.mode = "solo";
    studio.collabFriends = [];
    showScreen("color");
  });
  document.querySelector("#collabBtn").addEventListener("click", openCollab);
  document.querySelector("#tradeBtn").addEventListener("click", openTrade);
  document.querySelector("#startCollabBtn").addEventListener("click", startCollab);
  document.querySelector("#confirmTradeBtn").addEventListener("click", confirmTrade);
  document.querySelector("#saveBuildBtn").addEventListener("click", saveBuild);
  document.querySelector("#clearBoardBtn").addEventListener("click", clearBoard);
  document.querySelectorAll("[data-go-home]").forEach((button) => button.addEventListener("click", () => showScreen("home")));
  els.powerBtn.addEventListener("click", togglePower);
  els.slowBtn.addEventListener("click", () => setSpeed("slow"));
  els.fastBtn.addEventListener("click", () => setSpeed("fast"));
  document.querySelectorAll("[data-shape]").forEach((button) => {
    button.addEventListener("click", () => addHelperShape(button.dataset.shape));
  });
  window.addEventListener("resize", resizeRenderer);
  els.canvas.addEventListener("pointerdown", startDrawing);
  els.canvas.addEventListener("pointermove", draw);
  els.canvas.addEventListener("pointerup", stopDrawing);
  els.canvas.addEventListener("pointerleave", stopDrawing);
}

function showScreen(name) {
  if (name !== "studio") stopCollabSync();
  Object.values(els.screens).forEach((screen) => screen.classList.add("hidden"));
  els.screens[name].classList.remove("hidden");
  if (name === "home") renderHome();
  if (name === "studio") {
    setupScene();
    resizeRenderer();
  }
}

function renderHome() {
  els.welcomeText.textContent = appState.username ? `Welcome back, ${appState.username}. Your builds are saved in this browser.` : "Choose a username to start saving your creations.";
  els.friendCount.textContent = `${appState.friends.length} friend${appState.friends.length === 1 ? "" : "s"}`;
  els.friendsList.innerHTML = appState.friends.length ? appState.friends.map((friend) => `<span class="chip">${friend}</span>`).join("") : `<span class="muted">No friends yet.</span>`;
  els.backpackCount.textContent = `${appState.backpack.length} saved`;
  els.backpackList.innerHTML = appState.backpack.length ? appState.backpack.map((item) => `
    <article class="backpack-item">
      <span class="mini-thumb" style="--thumb:${item.color}"></span>
      <div><strong>${item.name}</strong><span>${item.parts} pieces · ${item.mode}</span></div>
    </article>
  `).join("") : `<p class="muted">Saved 3D pen builds will appear here.</p>`;
}

function renderColors() {
  const buttons = COLORS.map(([name, color]) => `
    <button class="color-card" style="--card-color:${color}" type="button" data-color="${color}" data-name="${name}">
      <strong>${name}</strong>
      <span>3D pen plastic</span>
    </button>
  `).join("");
  els.colorChoices.innerHTML = buttons;
  els.miniColors.innerHTML = COLORS.map(([name, color]) => `
    <button class="mini-color" style="--mini-color:${color}" type="button" aria-label="${name}" data-color="${color}" data-name="${name}"></button>
  `).join("");
  document.querySelectorAll("[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      studio.color = button.dataset.color;
      studio.colorName = button.dataset.name;
      updatePenUi();
      if (button.classList.contains("color-card")) startStudio();
    });
  });
}

function saveUsername() {
  const username = cleanName(els.usernameInput.value);
  if (!username) return;
  appState.username = username;
  saveState();
  renderHome();
}

function addFriend() {
  const friend = cleanName(els.friendInput.value);
  if (!friend || appState.friends.includes(friend) || friend === appState.username) return;
  appState.friends.push(friend);
  els.friendInput.value = "";
  saveState();
  renderHome();
}

function openCollab() {
  els.collabFriendList.innerHTML = appState.friends.length ? appState.friends.map((friend) => `
    <label class="choice"><span>${friend}</span><input type="checkbox" value="${friend}" /></label>
  `).join("") : `<p class="muted">Add friends first, then invite them to a collab board.</p>`;
  showScreen("collab");
}

function startCollab() {
  studio.collabFriends = Array.from(els.collabFriendList.querySelectorAll("input:checked")).map((input) => input.value);
  if (!studio.collabFriends.length) return;
  studio.mode = "collab";
  studio.collabRoom = makeCollabRoom();
  showScreen("color");
}

function openTrade() {
  studio.selectedTradeFriend = "";
  studio.selectedTradeItem = "";
  els.tradeStatus.textContent = "";
  els.tradeFriendList.innerHTML = appState.friends.length ? appState.friends.map((friend) => `<button class="choice" data-trade-friend="${friend}" type="button">${friend}</button>`).join("") : `<p class="muted">Add a friend before trading.</p>`;
  els.tradeItemList.innerHTML = appState.backpack.length ? appState.backpack.map((item) => `<button class="choice" data-trade-item="${item.id}" type="button">${item.name}<span>${item.parts} pieces</span></button>`).join("") : `<p class="muted">Save a build to your backpack before trading.</p>`;
  els.tradeFriendList.querySelectorAll("[data-trade-friend]").forEach((button) => button.addEventListener("click", () => selectTradeFriend(button)));
  els.tradeItemList.querySelectorAll("[data-trade-item]").forEach((button) => button.addEventListener("click", () => selectTradeItem(button)));
  showScreen("trade");
}

function selectTradeFriend(button) {
  studio.selectedTradeFriend = button.dataset.tradeFriend;
  els.tradeFriendList.querySelectorAll(".choice").forEach((choice) => choice.classList.toggle("active", choice === button));
}

function selectTradeItem(button) {
  studio.selectedTradeItem = button.dataset.tradeItem;
  els.tradeItemList.querySelectorAll(".choice").forEach((choice) => choice.classList.toggle("active", choice === button));
}

function confirmTrade() {
  if (!studio.selectedTradeFriend || !studio.selectedTradeItem) {
    els.tradeStatus.textContent = "Choose a friend and a backpack build first.";
    return;
  }
  const item = appState.backpack.find((build) => build.id === studio.selectedTradeItem);
  appState.trades.push({ friend: studio.selectedTradeFriend, item: item.name, at: new Date().toISOString() });
  saveState();
  els.tradeStatus.textContent = `Trade confirmed: ${item.name} sent to ${studio.selectedTradeFriend}.`;
}

function startStudio() {
  showScreen("studio");
  newBoard();
  if (studio.mode === "collab") startCollabSync();
}

function setupScene() {
  if (scene) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffe2f0");
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 6.7, 8.4);
  camera.lookAt(0, 0, 0);
  renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const hemi = new THREE.HemisphereLight("#ffffff", "#f5b6d3", 2.4);
  const key = new THREE.DirectionalLight("#ffffff", 2.5);
  key.position.set(4, 8, 5);
  scene.add(hemi, key);

  const table = new THREE.Mesh(new THREE.BoxGeometry(10, .35, 7.2), new THREE.MeshStandardMaterial({ color: "#f2c6d9", roughness: .65 }));
  table.position.y = -.35;
  scene.add(table);

  board = new THREE.Mesh(new THREE.BoxGeometry(8.4, .16, 5.3), new THREE.MeshPhysicalMaterial({ color: "#f7fbff", transparent: true, opacity: .76, roughness: .18, transmission: .25 }));
  board.name = "plastic-board";
  board.position.y = -.08;
  scene.add(board);

  const grid = new THREE.GridHelper(8, 16, "#e6a7ca", "#f0c7dd");
  grid.position.y = .02;
  grid.scale.z = .64;
  scene.add(grid);

  penMesh = makePen();
  scene.add(penMesh);
  boardReady = true;
  animate();
}

function newBoard() {
  if (!boardReady) return;
  clearBoard({ localOnly: true });
  studio.strokes = 0;
  studio.collabSeen = 0;
  studio.collabIds = new Set();
  els.studioMode.textContent = studio.mode === "collab" ? "Collab Build" : "Solo Build";
  els.studioTitle.textContent = studio.mode === "collab" ? "Shared Plastic Board" : "Plastic Board";
  els.collabPanel.classList.toggle("hidden", studio.mode !== "collab");
  els.activeCollabList.innerHTML = studio.collabFriends.map((friend) => `<span class="chip">${friend}</span>`).join("");
  if (studio.mode === "collab") addCollabFriends();
}

function makePen() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.16, 1.55, 8, 18), new THREE.MeshStandardMaterial({ color: studio.color, roughness: .28 }));
  body.rotation.z = Math.PI / 2;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.17, .45, 24), new THREE.MeshStandardMaterial({ color: "#3e3440", metalness: .1, roughness: .3 }));
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = .95;
  group.add(body, tip);
  group.position.set(-3.4, 1, 2.1);
  group.rotation.set(-.4, 0, -.25);
  return group;
}

function updatePenUi() {
  document.documentElement.style.setProperty("--pen-color", studio.color);
  els.activeColorName.textContent = studio.colorName;
  els.penNib.style.background = studio.color;
  if (penMesh?.children?.[0]) penMesh.children[0].material.color.set(studio.color);
  els.miniColors.querySelectorAll(".mini-color").forEach((button) => button.classList.toggle("active", button.dataset.color === studio.color));
}

function startDrawing(event) {
  if (!studio.power) return;
  studio.drawing = true;
  els.canvas.setPointerCapture(event.pointerId);
  lastPoint = getBoardPoint(event);
  movePen(lastPoint);
}

function draw(event) {
  const point = getBoardPoint(event);
  movePen(point);
  if (!studio.drawing || !studio.power || !point || !lastPoint) return;
  const distance = point.distanceTo(lastPoint);
  const step = studio.speed === "fast" ? .18 : .34;
  if (distance < step) return;
  addPlasticSegment(lastPoint, point, studio.color, .105, { broadcast: true });
  lastPoint = point;
}

function stopDrawing() {
  studio.drawing = false;
  lastPoint = null;
}

function getBoardPoint(event) {
  const rect = els.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(board)[0];
  return hit ? hit.point.clone().setY(.18 + studio.strokes * .0008) : null;
}

function movePen(point) {
  if (!point || !penMesh) return;
  penMesh.position.lerp(new THREE.Vector3(point.x - .45, .72, point.z + .34), .55);
}

function addPlasticSegment(a, b, color, radius, options = {}) {
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(.5);
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = Math.max(direction.length(), .05);
  const segment = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 16),
    new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .03 })
  );
  segment.position.copy(mid);
  segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  segment.userData.drawable = true;
  scene.add(segment);
  studio.strokes += 1;
  if (options.broadcast && studio.mode === "collab") {
    broadcastSegment(a, b, color, radius);
  }
}

function addHelperShape(shape) {
  if (!boardReady) return;
  const baseX = -2 + Math.random() * 4;
  const baseZ = -1.4 + Math.random() * 2.8;
  if (shape === "tower") {
    for (let i = 0; i < 8; i += 1) {
      const angleA = (i / 8) * Math.PI * 2;
      const angleB = ((i + 1) / 8) * Math.PI * 2;
      addPlasticSegment(new THREE.Vector3(baseX + Math.cos(angleA) * .42, .22 + i * .06, baseZ + Math.sin(angleA) * .42), new THREE.Vector3(baseX + Math.cos(angleB) * .42, .28 + i * .06, baseZ + Math.sin(angleB) * .42), studio.color, .09, { broadcast: true });
    }
  }
  if (shape === "wall") {
    for (let i = 0; i < 6; i += 1) addPlasticSegment(new THREE.Vector3(baseX - 1.1, .24 + i * .12, baseZ), new THREE.Vector3(baseX + 1.1, .24 + i * .12, baseZ), studio.color, .08, { broadcast: true });
  }
  if (shape === "roof") {
    addPlasticSegment(new THREE.Vector3(baseX - .7, .25, baseZ - .5), new THREE.Vector3(baseX, .9, baseZ), studio.color, .09, { broadcast: true });
    addPlasticSegment(new THREE.Vector3(baseX + .7, .25, baseZ - .5), new THREE.Vector3(baseX, .9, baseZ), studio.color, .09, { broadcast: true });
    addPlasticSegment(new THREE.Vector3(baseX - .7, .25, baseZ + .5), new THREE.Vector3(baseX, .9, baseZ), studio.color, .09, { broadcast: true });
    addPlasticSegment(new THREE.Vector3(baseX + .7, .25, baseZ + .5), new THREE.Vector3(baseX, .9, baseZ), studio.color, .09, { broadcast: true });
  }
}

function addCollabFriends() {
  studio.collabFriends.forEach((friend, index) => {
    const color = COLORS[(index + 2) % COLORS.length][1];
    const avatar = new THREE.Mesh(new THREE.SphereGeometry(.18, 18, 18), new THREE.MeshStandardMaterial({ color }));
    avatar.position.set(-3.2 + index * .55, .5, -2.3);
    avatar.userData.drawable = true;
    scene.add(avatar);
    addPlasticSegment(new THREE.Vector3(-3 + index * .6, .22, -1.8), new THREE.Vector3(-2.4 + index * .6, .24, -1.2), color, .08);
  });
}

function togglePower() {
  studio.power = !studio.power;
  els.powerBtn.classList.toggle("on", studio.power);
  els.powerBtn.textContent = studio.power ? "On" : "Off";
  els.powerBtn.setAttribute("aria-pressed", String(studio.power));
}

function setSpeed(speed) {
  studio.speed = speed;
  els.slowBtn.classList.toggle("active", speed === "slow");
  els.fastBtn.classList.toggle("active", speed === "fast");
}

function saveBuild() {
  if (!studio.strokes) return;
  const build = {
    id: crypto.randomUUID(),
    name: `${studio.colorName} build ${appState.backpack.length + 1}`,
    color: studio.color,
    parts: studio.strokes,
    mode: studio.mode === "collab" ? `with ${studio.collabFriends.join(", ")}` : "solo",
    at: new Date().toISOString()
  };
  appState.backpack.unshift(build);
  saveState();
  renderHome();
  if (studio.mode === "collab") {
    els.studioTitle.textContent = "Saved to everyone's backpack";
  } else {
    els.studioTitle.textContent = "Saved to Backpack";
  }
}

function clearBoard(options = {}) {
  if (!scene) return;
  [...scene.children].filter((child) => child.userData.drawable).forEach((child) => scene.remove(child));
  studio.strokes = 0;
  studio.collabSeen = 0;
  if (!options.localOnly && canUseServerCollab() && studio.mode === "collab" && studio.collabRoom) {
    fetch("/api/collab/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: studio.collabRoom })
    }).catch(() => {});
  }
}

function startCollabSync() {
  if (!canUseServerCollab()) return;
  stopCollabSync();
  fetchCollabStrokes();
  studio.collabTimer = window.setInterval(fetchCollabStrokes, 900);
}

function stopCollabSync() {
  if (studio.collabTimer) window.clearInterval(studio.collabTimer);
  studio.collabTimer = null;
}

async function broadcastSegment(a, b, color, radius) {
  if (!canUseServerCollab()) return;
  try {
    const response = await fetch("/api/collab/stroke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: studio.collabRoom,
        segment: { user: appState.username || "guest", color, radius, a: vectorData(a), b: vectorData(b) }
      })
    });
    const saved = await response.json();
    if (saved.id) studio.collabIds.add(saved.id);
  } catch {
    // Drawing should keep working even if the collab server is unavailable.
  }
}

async function fetchCollabStrokes() {
  if (!studio.collabRoom || studio.mode !== "collab" || !scene) return;
  try {
    const response = await fetch(`/api/collab?room=${encodeURIComponent(studio.collabRoom)}&since=${studio.collabSeen}`);
    const data = await response.json();
    data.strokes.forEach((stroke) => {
      if (studio.collabIds.has(stroke.id)) return;
      studio.collabIds.add(stroke.id);
      addPlasticSegment(vectorFromData(stroke.a), vectorFromData(stroke.b), stroke.color, stroke.radius || .105);
    });
    studio.collabSeen = data.total;
  } catch {
    stopCollabSync();
  }
}

function resizeRenderer() {
  if (!renderer) return;
  const rect = els.canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function animate() {
  if (animationStarted) return;
  animationStarted = true;
  renderer.setAnimationLoop(() => {
    if (penMesh) penMesh.rotation.y += .005;
    renderer.render(scene, camera);
  });
}

function cleanName(value) {
  return value.trim().replace(/\s+/g, "_").slice(0, 18);
}

function makeCollabRoom() {
  return [appState.username || "guest", ...studio.collabFriends].map(cleanName).sort().join("__").slice(0, 80);
}

function vectorData(vector) {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function vectorFromData(data) {
  return new THREE.Vector3(Number(data.x), Number(data.y), Number(data.z));
}

function canUseServerCollab() {
  return !location.hostname.endsWith("github.io");
}

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(storeKey)) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storeKey, JSON.stringify(appState));
}
