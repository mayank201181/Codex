const TOPICS = [
  topic("Introduction to Science", "IS", "#176b55",
    "How scientists ask questions, plan fair tests, measure accurately, record evidence, and write conclusions.",
    ["variables", "risk", "accuracy", "graph skills", "conclusions"],
    ["Independent variable: the thing you change.", "Dependent variable: the thing you measure.", "Control variables: things kept the same.", "A fair test changes only one independent variable.", "Use SI units, repeat readings, and calculate a mean when readings vary.", "A conclusion should use data and answer the investigation question."],
    "CORMM helps experiments: Change one thing, Observe/measure one thing, Repeat, Measure carefully, keep other things the same.",
    ["Forgetting units in tables or graphs.", "Saying 'it went up' without quoting data.", "Confusing accuracy with precision.", "Changing more than one variable in a fair test."],
    ["Name the independent, dependent, and control variables in an investigation.", "Explain why repeated readings make results more reliable.", "Describe how to draw a line graph from results.", "Write a conclusion using data.", "Explain one safety risk and one control measure."],
    scienceDiagram("fairtest")),
  topic("Electricity and Energy", "EE", "#255f9f",
    "Simple circuits, energy stores and transfers, current, voltage, resistance, and how energy is conserved.",
    ["series circuits", "parallel circuits", "current", "voltage", "energy stores"],
    ["Current is the flow of charge and is measured in amperes.", "Voltage is the energy transferred per unit charge and is measured in volts.", "Resistance makes it harder for current to flow.", "In a series circuit, current is the same everywhere.", "In a parallel circuit, current splits between branches.", "Energy is transferred between stores but is not created or destroyed."],
    "VIP: Voltage pushes, current Is flow, resistance Prevents flow.",
    ["Drawing a voltmeter in series instead of parallel.", "Writing that energy is 'used up' instead of transferred.", "Forgetting that current is the same in all parts of a series circuit.", "Mixing up cells and batteries."],
    ["Compare current in series and parallel circuits.", "Explain what a battery does in a circuit.", "Describe how adding bulbs in series affects brightness.", "Explain energy conservation.", "State the units for current and voltage."],
    scienceDiagram("circuit")),
  topic("Reproduction and Variation", "RV", "#b04747",
    "Human reproduction, fertilisation, puberty, inheritance, environmental variation, and why offspring differ.",
    ["puberty", "fertilisation", "gametes", "inheritance", "variation"],
    ["Gametes are sex cells: sperm and egg cells.", "Fertilisation happens when the nuclei of sperm and egg join.", "The fertilised egg develops into an embryo.", "Inherited variation comes from genes passed from parents.", "Environmental variation is caused by surroundings and experiences.", "Puberty is when the body changes so it can reproduce."],
    "GO FRED: Gametes, Ovary/testes, Fertilisation, Reproduction, Embryo, Development.",
    ["Saying fertilisation happens in the uterus rather than the oviduct.", "Confusing inherited and environmental variation.", "Using vague words like 'baby seed' instead of sperm, egg, embryo.", "Forgetting that variation exists within a species."],
    ["Describe fertilisation.", "Compare inherited and environmental variation.", "Name the male and female gametes.", "Explain why siblings are similar but not identical.", "Describe the role of puberty in reproduction."],
    scienceDiagram("reproduction")),
  topic("Cells to Systems", "CS", "#7157a6",
    "Plant and animal cells, specialised cells, tissues, organs, organ systems, and how structure links to function.",
    ["cells", "tissues", "organs", "systems", "microscopes"],
    ["Cells are the basic units of living things.", "Animal cells have a nucleus, cytoplasm, cell membrane, and mitochondria.", "Plant cells also have a cell wall, chloroplasts, and a permanent vacuole.", "Specialised cells have adaptations for their job.", "Tissues are groups of similar cells.", "Organs are made of tissues and organ systems are made of organs."],
    "Cells -> Tissues -> Organs -> Organ systems -> Organism: C T O O O.",
    ["Drawing plant cells without a cell wall.", "Saying the nucleus is the 'brain' without explaining that it controls activities.", "Mixing up tissue and organ.", "Forgetting magnification units or scale."],
    ["Compare plant and animal cells.", "Explain how a sperm or root hair cell is adapted.", "Put cell, tissue, organ, system, organism in order.", "Describe the job of mitochondria.", "Explain why microscopes are useful."],
    scienceDiagram("cell")),
  topic("Ecological Interactions", "EI", "#3f7f3d",
    "Habitats, adaptations, food chains, food webs, competition, predators, prey, and how ecosystems change.",
    ["habitats", "adaptation", "food chains", "competition", "predators"],
    ["A habitat is where an organism lives.", "A population is all organisms of one species in an area.", "A community is all the populations in a habitat.", "Food chains show feeding relationships and energy transfer.", "Arrows show the direction of energy transfer.", "Organisms compete for resources such as food, space, light, water, and mates."],
    "HPC: Habitat has Populations; populations make Communities.",
    ["Drawing food-chain arrows the wrong way.", "Saying predators are always stronger rather than better adapted for catching prey.", "Forgetting plants compete for light and minerals.", "Confusing habitat with ecosystem."],
    ["Explain what arrows mean in a food chain.", "Describe one adaptation of a predator or prey.", "Define habitat, population, and community.", "Explain competition between plants.", "Predict what happens if one organism is removed from a food web."],
    scienceDiagram("foodweb")),
  topic("Waves and Sound", "WS", "#8a6b16",
    "Sound as vibrations, wave features, pitch, loudness, echoes, speed of sound, and how waves transfer energy.",
    ["vibration", "frequency", "amplitude", "pitch", "loudness"],
    ["Sound is made by vibrations.", "Sound travels through a medium such as air, water, or solids.", "Frequency is the number of vibrations per second and affects pitch.", "Amplitude is the size of vibration and affects loudness.", "Sound cannot travel through a vacuum.", "Echoes happen when sound reflects from a surface."],
    "FLAP: Frequency = pitch, Large Amplitude = louder.",
    ["Saying sound travels fastest in air.", "Confusing pitch and loudness.", "Forgetting that sound needs particles to travel.", "Writing that waves carry matter instead of energy."],
    ["Explain how sound is produced.", "Compare frequency and amplitude.", "Explain why sound cannot travel in space.", "Describe an echo.", "Describe how the ear detects sound."],
    scienceDiagram("wave")),
  topic("Matter and Separation", "MS", "#2b7a78",
    "Mixtures, solutions, dissolving, filtration, evaporation, chromatography, distillation, and choosing separation methods.",
    ["mixtures", "solutions", "filtration", "evaporation", "chromatography"],
    ["A mixture contains substances that are not chemically joined.", "A solute dissolves in a solvent to form a solution.", "Filtration separates an insoluble solid from a liquid.", "Evaporation separates a soluble solid from a solution.", "Chromatography separates dissolved substances such as inks.", "Distillation collects a solvent from a solution by evaporation then condensation."],
    "FEC-D: Filter insoluble, Evaporate solute, Chromatography colours, Distil solvent.",
    ["Using filtration for dissolved salt.", "Forgetting that clear solutions can still contain dissolved substances.", "Saying melting is the same as dissolving.", "Not naming the solute and solvent."],
    ["Choose a method to separate sand and water.", "Explain how to get salt from salt water.", "Define solute, solvent, and solution.", "Describe chromatography.", "Explain why filtration cannot remove dissolved sugar."],
    scienceDiagram("separation")),
  topic("Particle Model", "PM", "#784f33",
    "Solids, liquids, gases, particle arrangement and movement, changes of state, diffusion, density, and pressure.",
    ["solids", "liquids", "gases", "diffusion", "density"],
    ["Particles in solids are close together and vibrate in fixed positions.", "Particles in liquids are close together but can move past each other.", "Particles in gases are far apart and move quickly in all directions.", "Heating gives particles more energy.", "Diffusion is the spreading of particles from high to low concentration.", "Density depends on mass in a given volume."],
    "SoLiG: Solid locked, Liquid glides, Gas goes everywhere.",
    ["Drawing liquid particles far apart like gas particles.", "Saying particles expand when heated rather than move further apart.", "Forgetting that melting and freezing happen at the same temperature for a pure substance.", "Confusing boiling with evaporation."],
    ["Compare particle arrangements in solids, liquids, and gases.", "Explain diffusion.", "Describe what happens during melting.", "Explain gas pressure.", "Explain density using particles."],
    scienceDiagram("particles")),
  topic("Atoms and Elements", "AE", "#4e6f8f",
    "Atoms, elements, compounds, molecules, symbols, the periodic table, and chemical formulae.",
    ["atoms", "elements", "compounds", "molecules", "symbols"],
    ["An atom is the smallest part of an element that still has that element's properties.", "An element contains only one type of atom.", "A compound contains atoms of different elements chemically joined.", "A molecule is two or more atoms joined together.", "Chemical symbols have one capital letter and sometimes one lowercase letter.", "A formula shows the elements and numbers of atoms in a substance."],
    "Capital then small: Co is cobalt, CO is carbon monoxide.",
    ["Writing chemical symbols with the wrong capital letters.", "Calling mixtures compounds.", "Forgetting that compounds have a fixed ratio of atoms.", "Confusing atoms and cells."],
    ["Define atom, element, compound, and molecule.", "Explain the difference between a mixture and compound.", "Interpret H2O and CO2.", "Explain why NaCl is a compound.", "Describe how the periodic table is organised."],
    scienceDiagram("atoms"))
];

const state = loadState();
let activeTopic = TOPICS[0];
let activeView = "guide";
let cardIndex = 0;
let cardShowingAnswer = false;
let quizIndex = 0;

const els = {
  topicList: document.querySelector("#topicList"),
  activeTopicMeta: document.querySelector("#activeTopicMeta"),
  topicCount: document.querySelector("#topicCount"),
  flashcardCount: document.querySelector("#flashcardCount"),
  questionCount: document.querySelector("#questionCount"),
  aiStatus: document.querySelector("#aiStatus"),
  guideView: document.querySelector("#guideView"),
  flashcardView: document.querySelector("#flashcardView"),
  quizView: document.querySelector("#quizView"),
  mistakesView: document.querySelector("#mistakesView")
};

boot();

function boot() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  renderShell();
  renderAll();
}

function topic(title, code, color, summary, tags, guide, mnemonic, mistakes, stems, diagram) {
  const flashcards = makeFlashcards(title, guide, stems);
  return { title, code, color, summary, tags, guide, mnemonic, mistakes, diagram, flashcards, questions: makeQuestions(title, guide, stems, mistakes) };
}

function makeFlashcards(title, guide, stems) {
  const cards = guide.map((answer) => ({ prompt: answer.split(":")[0].replace(/\.$/, ""), answer }));
  stems.forEach((stem) => cards.push({ prompt: stem, answer: modelAnswer(title, stem) }));
  return cards.slice(0, 12);
}

function makeQuestions(title, guide, stems, mistakes) {
  const verbs = ["Describe", "Explain", "Compare", "State", "Use an example to explain", "Predict", "Define", "Suggest why", "Link structure to function for", "Write a full-mark answer about"];
  const questions = [];
  for (let i = 0; i < 50; i += 1) {
    const stem = stems[i % stems.length];
    const guidePoint = guide[i % guide.length];
    const mistake = mistakes[i % mistakes.length];
    questions.push({
      id: `${slug(title)}-${i + 1}`,
      question: `${verbs[i % verbs.length]}: ${stem}`,
      hint: `Include the key idea: ${guidePoint}`,
      modelAnswer: modelAnswer(title, stem, guidePoint),
      markScheme: [
        `Uses correct science vocabulary for ${title}.`,
        `Includes this key idea: ${guidePoint}`,
        "Explains the reason, not just the fact.",
        `Avoids this common mistake: ${mistake}`
      ],
      marks: 4
    });
  }
  return questions;
}

function modelAnswer(title, stem, guidePoint = "") {
  return `${stem.replace(/\.$/, "")}: ${guidePoint || "Use clear scientific vocabulary, give the key fact, and explain why it happens."} A full-mark answer should be specific, use the correct unit or keyword where needed, and link cause to effect.`;
}

function renderShell() {
  els.topicCount.textContent = TOPICS.length;
  els.flashcardCount.textContent = TOPICS.reduce((sum, topicItem) => sum + topicItem.flashcards.length, 0);
  els.questionCount.textContent = TOPICS.reduce((sum, topicItem) => sum + topicItem.questions.length, 0);
  els.topicList.innerHTML = TOPICS.map((topicItem) => `
    <button class="topic-button ${topicItem === activeTopic ? "active" : ""}" type="button" data-topic="${topicItem.code}">
      <strong>${topicItem.title}</strong>
      <span>${topicItem.questions.length} questions / ${topicItem.flashcards.length} cards</span>
    </button>
  `).join("");
  els.topicList.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTopic = TOPICS.find((topicItem) => topicItem.code === button.dataset.topic);
      cardIndex = 0;
      quizIndex = 0;
      cardShowingAnswer = false;
      renderShell();
      renderAll();
    });
  });
}

function renderAll() {
  els.activeTopicMeta.textContent = activeTopic.code;
  renderGuide();
  renderFlashcards();
  renderQuiz();
  renderMistakes();
}

function setView(view) {
  activeView = view;
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  const views = { guide: els.guideView, flashcards: els.flashcardView, quiz: els.quizView, mistakes: els.mistakesView };
  for (const [key, element] of Object.entries(views)) {
    element.classList.toggle("hidden", key !== view);
  }
}

function renderGuide() {
  els.guideView.innerHTML = `
    <article class="study-hero">
      <div class="hero-band">
        <div>
          <p class="eyebrow">${activeTopic.code}</p>
          <h1 style="color:${activeTopic.color}">${activeTopic.title}</h1>
          <p>${activeTopic.summary}</p>
          <div class="tag-row">${activeTopic.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
        <div class="diagram">${activeTopic.diagram}</div>
      </div>
    </article>
    <div class="guide-grid">
      <section class="guide-section">
        <h2>Study Guide</h2>
        <ul>${activeTopic.guide.map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="mnemonic"><strong>Mnemonic:</strong> ${activeTopic.mnemonic}</div>
      </section>
      <section class="diagram-stack">
        <article class="diagram-card"><h3>Core Diagram</h3><div class="diagram">${activeTopic.diagram}</div></article>
        <article class="diagram-card"><h3>Common Exam Mistakes</h3><ul class="mistakes-list">${activeTopic.mistakes.map((item) => `<li><strong>Watch out:</strong> ${item}</li>`).join("")}</ul></article>
      </section>
    </div>
  `;
}

function renderFlashcards() {
  const card = activeTopic.flashcards[cardIndex];
  els.flashcardView.innerHTML = `
    <div class="flash-toolbar">
      <h2>${activeTopic.title} Flashcards</h2>
      <span>${cardIndex + 1} / ${activeTopic.flashcards.length}</span>
    </div>
    <article class="flashcard">
      <span class="label">${cardShowingAnswer ? "Answer" : "Question"}</span>
      <strong>${cardShowingAnswer ? card.answer : card.prompt}</strong>
      ${cardShowingAnswer ? "<p>Say this aloud, then check whether your wording used the key science vocabulary.</p>" : "<p>Try to answer before flipping the card.</p>"}
      <div class="card-actions">
        <button id="flipCard" class="primary-button" type="button">${cardShowingAnswer ? "Show question" : "Show answer"}</button>
        <button id="prevCard" class="secondary-button" type="button">Previous</button>
        <button id="nextCard" class="secondary-button" type="button">Next</button>
      </div>
    </article>
  `;
  document.querySelector("#flipCard").addEventListener("click", () => { cardShowingAnswer = !cardShowingAnswer; renderFlashcards(); });
  document.querySelector("#prevCard").addEventListener("click", () => { cardIndex = (cardIndex + activeTopic.flashcards.length - 1) % activeTopic.flashcards.length; cardShowingAnswer = false; renderFlashcards(); });
  document.querySelector("#nextCard").addEventListener("click", () => { cardIndex = (cardIndex + 1) % activeTopic.flashcards.length; cardShowingAnswer = false; renderFlashcards(); });
}

function renderQuiz() {
  const q = activeTopic.questions[quizIndex];
  els.quizView.innerHTML = `
    <div class="quiz-toolbar">
      <h2>${activeTopic.title} Written Quiz</h2>
      <span>${quizIndex + 1} / ${activeTopic.questions.length}</span>
    </div>
    <article class="quiz-card">
      <div class="quiz-meta"><span>${q.marks} marks</span><span>AI-marked written answer</span></div>
      <p class="quiz-question">${q.question}</p>
      <details class="hint"><summary>Show hint</summary><p>${q.hint}</p></details>
      <textarea id="studentAnswer" placeholder="Type your answer here. Use full sentences and science keywords."></textarea>
      <div class="quiz-actions">
        <button id="markAnswer" class="primary-button" type="button">Mark with AI</button>
        <button id="showAnswer" class="secondary-button" type="button">Show model answer</button>
        <button id="nextQuestion" class="secondary-button" type="button">Next question</button>
      </div>
      <div id="quizFeedback" class="feedback hidden"></div>
    </article>
  `;
  document.querySelector("#markAnswer").addEventListener("click", markAnswer);
  document.querySelector("#showAnswer").addEventListener("click", () => showFeedback({ status: "correct", marks_awarded: q.marks, marks_available: q.marks, what_was_good: "Use this to compare your wording.", missing_points: [], model_answer: q.modelAnswer, revision_tip: "Rewrite the answer once without looking." }));
  document.querySelector("#nextQuestion").addEventListener("click", () => { quizIndex = (quizIndex + 1) % activeTopic.questions.length; renderQuiz(); });
}

async function markAnswer() {
  const answer = document.querySelector("#studentAnswer").value.trim();
  const q = activeTopic.questions[quizIndex];
  if (!answer) return showFeedback({ status: "incorrect", marks_awarded: 0, marks_available: q.marks, what_was_good: "No answer was entered yet.", missing_points: q.markScheme, model_answer: q.modelAnswer, revision_tip: "Try writing one clear sentence first, then add a because sentence." });
  els.aiStatus.textContent = "Marking...";
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: activeTopic.title, question: q.question, studentAnswer: answer, modelAnswer: q.modelAnswer, markScheme: q.markScheme, marks: q.marks })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "AI marking failed");
    showFeedback(data);
    saveMistake(q, answer, data);
    els.aiStatus.textContent = "Ready";
  } catch (error) {
    els.aiStatus.textContent = "Offline";
    showFeedback({ status: "partially_correct", marks_awarded: 0, marks_available: q.marks, what_was_good: "AI marking is not connected yet.", missing_points: ["Check that OPENAI_API_KEY is set before deployment.", error.message], model_answer: q.modelAnswer, revision_tip: "You can still use the model answer and mark scheme for practice." });
  }
}

function showFeedback(data) {
  const box = document.querySelector("#quizFeedback");
  box.className = `feedback ${data.status}`;
  box.innerHTML = `
    <h3>${labelStatus(data.status)}: ${data.marks_awarded}/${data.marks_available}</h3>
    <p><strong>Good:</strong> ${data.what_was_good}</p>
    ${data.missing_points?.length ? `<ul>${data.missing_points.map((point) => `<li>${point}</li>`).join("")}</ul>` : ""}
    <p><strong>Full-mark answer:</strong> ${data.model_answer}</p>
    <p><strong>Revision tip:</strong> ${data.revision_tip}</p>
  `;
}

function saveMistake(question, answer, feedback) {
  if (feedback.status === "correct") return;
  state.mistakes.unshift({ date: new Date().toISOString(), topic: activeTopic.title, question: question.question, answer, feedback });
  state.mistakes = state.mistakes.slice(0, 40);
  localStorage.setItem("science-dashboard-state-v1", JSON.stringify(state));
  renderMistakes();
}

function renderMistakes() {
  const mistakes = state.mistakes.filter((item) => item.topic === activeTopic.title);
  els.mistakesView.innerHTML = `
    <div class="flash-toolbar"><h2>${activeTopic.title} Mistake Tracker</h2><span>${mistakes.length} saved</span></div>
    ${mistakes.length ? `<div class="mistake-grid">${mistakes.map((item) => `
      <article class="mistake-card">
        <h3>${item.question}</h3>
        <p><strong>Your answer:</strong> ${escapeHtml(item.answer)}</p>
        <p><strong>Fix:</strong> ${item.feedback.model_answer}</p>
      </article>
    `).join("")}</div>` : `<p class="empty">Partial or incorrect AI-marked answers will appear here.</p>`}
  `;
}

function labelStatus(status) {
  return { correct: "Correct", partially_correct: "Partially correct", incorrect: "Needs work" }[status] || "Marked";
}

function loadState() {
  try { return JSON.parse(localStorage.getItem("science-dashboard-state-v1")) || { mistakes: [] }; }
  catch { return { mistakes: [] }; }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function scienceDiagram(kind) {
  const common = `viewBox="0 0 360 210" role="img" aria-label="Science diagram"`;
  const diagrams = {
    fairtest: `<svg ${common}><rect x="25" y="50" width="90" height="70" rx="8" fill="#d9efe8" stroke="#176b55"/><rect x="135" y="50" width="90" height="70" rx="8" fill="#fff5cf" stroke="#8a6b16"/><rect x="245" y="50" width="90" height="70" rx="8" fill="#e8eef8" stroke="#255f9f"/><path d="M115 85h20M225 85h20" stroke="#16202a" stroke-width="3"/><text x="70" y="88" text-anchor="middle">Change</text><text x="180" y="88" text-anchor="middle">Measure</text><text x="290" y="88" text-anchor="middle">Keep same</text><path d="M70 145c70 34 145 34 220 0" fill="none" stroke="#176b55" stroke-width="5"/></svg>`,
    circuit: `<svg ${common}><rect x="70" y="55" width="220" height="100" rx="10" fill="none" stroke="#16202a" stroke-width="4"/><line x1="110" y1="55" x2="110" y2="20" stroke="#16202a" stroke-width="4"/><line x1="125" y1="55" x2="125" y2="30" stroke="#16202a" stroke-width="4"/><circle cx="210" cy="155" r="25" fill="#fff5cf" stroke="#8a6b16" stroke-width="4"/><path d="M195 155h30M210 140v30" stroke="#8a6b16" stroke-width="3"/><text x="118" y="16" text-anchor="middle">cell</text><text x="210" y="198" text-anchor="middle">bulb</text></svg>`,
    reproduction: `<svg ${common}><circle cx="105" cy="105" r="48" fill="#ffe1e1" stroke="#b04747" stroke-width="4"/><circle cx="235" cy="105" r="18" fill="#dce8ff" stroke="#255f9f" stroke-width="4"/><path d="M185 105h28" stroke="#255f9f" stroke-width="5"/><path d="M153 105h45" stroke="#16202a" stroke-width="3" marker-end="url(#a)"/><defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0l8 4-8 4z" fill="#16202a"/></marker></defs><text x="105" y="170" text-anchor="middle">egg cell</text><text x="235" y="170" text-anchor="middle">sperm cell</text><text x="180" y="42" text-anchor="middle">fertilisation</text></svg>`,
    cell: `<svg ${common}><rect x="35" y="45" width="130" height="105" rx="22" fill="#edf5f7" stroke="#7157a6" stroke-width="4"/><circle cx="100" cy="98" r="22" fill="#d9ccef" stroke="#7157a6"/><rect x="205" y="38" width="120" height="120" rx="4" fill="#e7f4df" stroke="#176b55" stroke-width="6"/><circle cx="266" cy="98" r="18" fill="#d9ccef" stroke="#7157a6"/><circle cx="230" cy="68" r="9" fill="#58a45b"/><circle cx="304" cy="128" r="9" fill="#58a45b"/><text x="100" y="178" text-anchor="middle">animal</text><text x="266" y="178" text-anchor="middle">plant</text></svg>`,
    foodweb: `<svg ${common}><text x="180" y="34" text-anchor="middle">fox</text><text x="85" y="110" text-anchor="middle">rabbit</text><text x="270" y="110" text-anchor="middle">bird</text><text x="180" y="184" text-anchor="middle">plants</text><path d="M180 166L92 122M180 166l84-44M98 96l70-48M265 96l-70-48" fill="none" stroke="#3f7f3d" stroke-width="4" marker-end="url(#b)"/><defs><marker id="b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0l8 4-8 4z" fill="#3f7f3d"/></marker></defs></svg>`,
    wave: `<svg ${common}><path d="M25 105c30-70 60-70 90 0s60 70 90 0 60-70 90 0 30 70 55 0" fill="none" stroke="#8a6b16" stroke-width="6"/><line x1="35" y1="105" x2="335" y2="105" stroke="#d8ddd6" stroke-width="2"/><path d="M118 105v-62" stroke="#b04747" stroke-width="3"/><text x="145" y="60">amplitude</text><path d="M113 150h92" stroke="#255f9f" stroke-width="3"/><text x="160" y="178" text-anchor="middle">wavelength</text></svg>`,
    separation: `<svg ${common}><path d="M90 45h95l-34 58v55h-27v-55z" fill="#e8eef8" stroke="#255f9f" stroke-width="4"/><rect x="110" y="158" width="58" height="25" fill="#fff5cf" stroke="#8a6b16"/><path d="M225 55h65v105h-65z" fill="#edf5f7" stroke="#176b55" stroke-width="4"/><path d="M225 88h65" stroke="#176b55" stroke-width="3"/><circle cx="248" cy="78" r="5" fill="#b04747"/><circle cx="270" cy="108" r="5" fill="#7157a6"/><text x="138" y="30" text-anchor="middle">filter</text><text x="258" y="190" text-anchor="middle">chromatography</text></svg>`,
    particles: `<svg ${common}><rect x="32" y="55" width="86" height="90" fill="#edf5f7" stroke="#16202a"/><rect x="137" y="55" width="86" height="90" fill="#fff5cf" stroke="#16202a"/><rect x="242" y="55" width="86" height="90" fill="#ffe1e1" stroke="#16202a"/>${dots(48, 70, 3, 4, 18)}${dots(153, 78, 3, 4, 20)}${dots(260, 70, 3, 3, 32)}<text x="75" y="176" text-anchor="middle">solid</text><text x="180" y="176" text-anchor="middle">liquid</text><text x="285" y="176" text-anchor="middle">gas</text></svg>`,
    atoms: `<svg ${common}><circle cx="95" cy="105" r="38" fill="#e8eef8" stroke="#255f9f" stroke-width="4"/><circle cx="95" cy="105" r="8" fill="#255f9f"/><circle cx="220" cy="90" r="24" fill="#fff5cf" stroke="#8a6b16" stroke-width="4"/><circle cx="260" cy="118" r="24" fill="#ffe1e1" stroke="#b04747" stroke-width="4"/><line x1="240" y1="103" x2="242" y2="105" stroke="#16202a" stroke-width="5"/><text x="95" y="170" text-anchor="middle">atom</text><text x="240" y="170" text-anchor="middle">compound</text></svg>`
  };
  return diagrams[kind];
}

function dots(x, y, rows, cols, gap) {
  let out = "";
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) out += `<circle cx="${x + c * gap}" cy="${y + r * gap}" r="5" fill="#176b55"/>`;
  return out;
}
