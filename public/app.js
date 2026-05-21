const WORDS = [
  { word: "astute", category: "Analysis", level: "Core", definition: "able to notice and understand things quickly and accurately", example: "Her astute reading of the narrator reveals how little he understands himself.", synonyms: "perceptive, shrewd, discerning", nuance: "Often positive, especially for judgement or insight." },
  { word: "ambivalent", category: "Character", level: "Core", definition: "having mixed or conflicting feelings about something", example: "The speaker remains ambivalent about ambition, admiring its force while fearing its cost.", synonyms: "conflicted, uncertain, torn", nuance: "More precise than simply unsure." },
  { word: "anomaly", category: "SAT", level: "Core", definition: "something that does not fit the expected pattern", example: "The character's kindness is an anomaly in a society shaped by suspicion.", synonyms: "exception, irregularity, outlier", nuance: "Useful in argument when one example disrupts a trend." },
  { word: "articulate", category: "Argument", level: "Core", definition: "to express an idea clearly and effectively", example: "The essay articulates a clear objection to casual prejudice.", synonyms: "express, formulate, voice", nuance: "As a verb, it suggests controlled clarity." },
  { word: "candid", category: "Tone", level: "Core", definition: "honest and direct, especially about something difficult", example: "The candid tone makes the memoir feel intimate rather than performative.", synonyms: "frank, open, sincere", nuance: "Direct without necessarily being rude." },
  { word: "coherent", category: "Argument", level: "Core", definition: "logical, consistent, and easy to follow", example: "Her argument is coherent because each paragraph develops the same central claim.", synonyms: "logical, orderly, consistent", nuance: "A key word for evaluating essays." },
  { word: "compelling", category: "Argument", level: "Core", definition: "strong enough to persuade or hold attention", example: "The final image is compelling because it turns private grief into public accusation.", synonyms: "persuasive, convincing, powerful", nuance: "Can describe evidence, stories, or interpretations." },
  { word: "concede", category: "Argument", level: "Core", definition: "to admit that something is true, often before making a stronger point", example: "Although the writer concedes that tradition can comfort people, she questions its authority.", synonyms: "admit, acknowledge, grant", nuance: "Very useful for balanced essays." },
  { word: "connotation", category: "Analysis", level: "Core", definition: "the associations or feelings a word suggests beyond its literal meaning", example: "The word 'confined' has connotations of imprisonment and lost freedom.", synonyms: "association, implication, overtone", nuance: "Central for close language analysis." },
  { word: "contradictory", category: "Argument", level: "Core", definition: "containing ideas that cannot both be true in the same way", example: "The protagonist's contradictory behaviour makes him more convincing as a flawed human being.", synonyms: "inconsistent, conflicting, incompatible", nuance: "Stronger than different." },
  { word: "conviction", category: "Character", level: "Core", definition: "a firmly held belief or a confident sense of certainty", example: "Her moral conviction gives the speech its urgency.", synonyms: "belief, certainty, principle", nuance: "Can imply strength but also inflexibility." },
  { word: "cultivate", category: "SAT", level: "Core", definition: "to develop something carefully over time", example: "The writer cultivates sympathy for a character who first appears selfish.", synonyms: "develop, nurture, foster", nuance: "Suggests deliberate, gradual effort." },
  { word: "detrimental", category: "SAT", level: "Core", definition: "harmful or damaging", example: "The policy is detrimental because it rewards obedience instead of curiosity.", synonyms: "harmful, damaging, adverse", nuance: "Formal alternative to bad for." },
  { word: "discern", category: "Analysis", level: "Core", definition: "to notice or understand something that is not immediately obvious", example: "Readers can discern a quiet resentment beneath the polite dialogue.", synonyms: "detect, perceive, distinguish", nuance: "Excellent for subtle interpretation." },
  { word: "emulate", category: "SAT", level: "Core", definition: "to try to equal or imitate someone admired", example: "The younger poet emulates the confidence of earlier political writers.", synonyms: "imitate, mirror, follow", nuance: "Usually implies admiration." },
  { word: "evoke", category: "Analysis", level: "Core", definition: "to bring a feeling, memory, or image into the reader's mind", example: "The description of fog evokes uncertainty and moral confusion.", synonyms: "suggest, summon, conjure", nuance: "Useful for effects in literature." },
  { word: "formidable", category: "SAT", level: "Core", definition: "impressive, powerful, or difficult to deal with", example: "Her silence becomes a formidable form of resistance.", synonyms: "impressive, daunting, powerful", nuance: "Can be admiring or intimidating." },
  { word: "impartial", category: "Argument", level: "Core", definition: "fair and not favouring one side", example: "The article adopts an impartial tone before revealing its criticism.", synonyms: "neutral, unbiased, objective", nuance: "More formal than fair." },
  { word: "implicit", category: "Analysis", level: "Core", definition: "suggested without being directly stated", example: "The implicit criticism of class is sharper because it is never announced.", synonyms: "implied, indirect, unstated", nuance: "Opposite of explicit." },
  { word: "inadvertent", category: "SAT", level: "Core", definition: "not intentional", example: "His inadvertent insult exposes the assumptions he normally hides.", synonyms: "accidental, unplanned, unintended", nuance: "Formal word for by mistake." },
  { word: "inevitable", category: "Argument", level: "Core", definition: "certain to happen and impossible to avoid", example: "The ending feels inevitable because each choice narrows the character's freedom.", synonyms: "unavoidable, certain, inescapable", nuance: "Can describe plot, consequences, or social change." },
  { word: "integral", category: "Argument", level: "Core", definition: "essential to the whole", example: "The setting is integral to the story's critique of isolation.", synonyms: "essential, central, necessary", nuance: "Stronger than important." },
  { word: "juxtapose", category: "Analysis", level: "Core", definition: "to place two things side by side to highlight contrast", example: "The poem juxtaposes wealth and hunger to expose social hypocrisy.", synonyms: "contrast, compare, place beside", nuance: "A high-value literary analysis verb." },
  { word: "lucid", category: "Tone", level: "Core", definition: "clear and easy to understand", example: "The writer's lucid prose makes a complex moral issue accessible.", synonyms: "clear, intelligible, plain", nuance: "Positive word for clarity." },
  { word: "meticulous", category: "Character", level: "Core", definition: "showing great care and attention to detail", example: "The detective's meticulous habits contrast with the chaos around her.", synonyms: "careful, precise, thorough", nuance: "Usually positive, but can imply obsessiveness." },
  { word: "nuance", category: "Analysis", level: "Core", definition: "a subtle difference in meaning, feeling, or expression", example: "The essay gains nuance when it recognises both courage and vanity in the hero.", synonyms: "subtlety, distinction, shade", nuance: "Essential for mature analysis." },
  { word: "ominous", category: "Tone", level: "Core", definition: "suggesting that something bad may happen", example: "The ominous silence before the announcement creates suspense.", synonyms: "threatening, foreboding, sinister", nuance: "Often used for atmosphere." },
  { word: "plausible", category: "Argument", level: "Core", definition: "reasonable or believable", example: "This interpretation is plausible because it accounts for the final image.", synonyms: "credible, believable, reasonable", nuance: "Does not mean definitely true." },
  { word: "poignant", category: "Tone", level: "Core", definition: "deeply moving, often because of sadness or tenderness", example: "The final letter is poignant because it arrives too late.", synonyms: "moving, affecting, touching", nuance: "More restrained than heartbreaking." },
  { word: "pragmatic", category: "Argument", level: "Core", definition: "focused on what is practical and realistic", example: "The speaker's pragmatic solution lacks beauty but solves the immediate problem.", synonyms: "practical, realistic, sensible", nuance: "Can be positive or slightly cold." },
  { word: "precarious", category: "SAT", level: "Core", definition: "dangerously unstable or uncertain", example: "The family's precarious finances intensify every small conflict.", synonyms: "unstable, insecure, risky", nuance: "Useful for social or emotional situations." },
  { word: "profound", category: "Analysis", level: "Core", definition: "deep, serious, or far-reaching", example: "The play presents a profound conflict between loyalty and conscience.", synonyms: "deep, significant, far-reaching", nuance: "Avoid overusing it for merely good ideas." },
  { word: "resilient", category: "Character", level: "Core", definition: "able to recover after difficulty", example: "Her resilient humour prevents the novel from becoming bleak.", synonyms: "tough, adaptable, enduring", nuance: "Often describes people, communities, or voices." },
  { word: "scrutinise", category: "Analysis", level: "Core", definition: "to examine very carefully", example: "The narrator invites us to scrutinise the gap between appearance and truth.", synonyms: "inspect, examine, analyse", nuance: "British spelling; US spelling is scrutinize." },
  { word: "subtle", category: "Analysis", level: "Core", definition: "delicate, indirect, or not immediately obvious", example: "The writer's subtle irony makes the praise sound suspicious.", synonyms: "delicate, understated, indirect", nuance: "Not the same as weak." },
  { word: "tenacious", category: "Character", level: "Core", definition: "determined and unwilling to give up", example: "His tenacious search for justice gives the novel its momentum.", synonyms: "persistent, determined, resolute", nuance: "Can admire persistence or suggest stubbornness." },
  { word: "undermine", category: "Analysis", level: "Core", definition: "to weaken something gradually or indirectly", example: "The comic ending undermines the seriousness of the speech.", synonyms: "weaken, erode, subvert", nuance: "Excellent for analysing shifts in tone or authority." },
  { word: "viable", category: "Argument", level: "Core", definition: "capable of working successfully", example: "The proposal is only viable if the school protects time for reading.", synonyms: "workable, feasible, practical", nuance: "Often used for plans or solutions." },
  { word: "acerbic", category: "Tone", level: "Stretch", definition: "sharp, biting, or severe in tone", example: "The critic's acerbic humour turns politeness into attack.", synonyms: "biting, caustic, cutting", nuance: "More precise than mean or sarcastic." },
  { word: "assiduous", category: "SAT", level: "Stretch", definition: "showing steady care and effort", example: "Her assiduous preparation makes the final debate feel earned.", synonyms: "diligent, persistent, attentive", nuance: "Formal word for hardworking in a careful way." },
  { word: "capricious", category: "Character", level: "Stretch", definition: "changing suddenly and unpredictably", example: "The ruler's capricious decisions make everyone fearful.", synonyms: "fickle, unpredictable, erratic", nuance: "Often describes people with power." },
  { word: "didactic", category: "Analysis", level: "Stretch", definition: "intended to teach, sometimes too obviously", example: "The ending becomes didactic when the narrator explains the moral directly.", synonyms: "instructive, moralising, educational", nuance: "Can be neutral or critical." },
  { word: "equivocal", category: "Argument", level: "Stretch", definition: "ambiguous or open to more than one interpretation", example: "The character's equivocal apology leaves readers unsure of his sincerity.", synonyms: "ambiguous, unclear, uncertain", nuance: "Useful when evidence points in two directions." },
  { word: "fastidious", category: "Character", level: "Stretch", definition: "very attentive to detail, especially cleanliness or standards", example: "His fastidious manners disguise a deep insecurity.", synonyms: "meticulous, exacting, fussy", nuance: "Can sound admiring or critical." },
  { word: "incongruous", category: "Analysis", level: "Stretch", definition: "strangely out of place or not fitting the context", example: "The cheerful music feels incongruous after the scene of loss.", synonyms: "out of place, jarring, unsuitable", nuance: "Great for tonal mismatch." },
  { word: "laconic", category: "Tone", level: "Stretch", definition: "using very few words", example: "The father's laconic replies suggest emotional distance.", synonyms: "brief, terse, concise", nuance: "Not necessarily rude; can be controlled." },
  { word: "mellifluous", category: "Tone", level: "Stretch", definition: "smooth and pleasant to hear", example: "The mellifluous rhythm softens the poem's darker ideas.", synonyms: "smooth, musical, flowing", nuance: "Usually describes sound or style." },
  { word: "perfunctory", category: "Character", level: "Stretch", definition: "done with little care because it is only a duty", example: "His perfunctory apology reveals that he has learned nothing.", synonyms: "half-hearted, cursory, mechanical", nuance: "A precise word for empty politeness." },
  { word: "sardonic", category: "Tone", level: "Stretch", definition: "mocking in a dark, bitter, or cynical way", example: "The narrator's sardonic comments make heroism seem ridiculous.", synonyms: "mocking, cynical, scornful", nuance: "Sharper and darker than sarcastic." },
  { word: "trenchant", category: "Argument", level: "Stretch", definition: "sharp, clear, and forceful", example: "The essay offers a trenchant critique of performative kindness.", synonyms: "incisive, sharp, forceful", nuance: "Often positive for criticism." },
  { word: "vacillate", category: "Character", level: "Stretch", definition: "to keep changing between choices or opinions", example: "He vacillates between loyalty to his family and loyalty to the truth.", synonyms: "waver, hesitate, fluctuate", nuance: "More active than being unsure." },
  { word: "zeitgeist", category: "SAT", level: "Stretch", definition: "the defining mood or spirit of a particular time", example: "The novel captures the zeitgeist of a generation anxious about status.", synonyms: "spirit of the age, cultural mood", nuance: "Useful for context, but use sparingly." },
];

const PROMPTS = [
  "Argue whether ambition is more often a strength or a weakness. Use two words from today's set.",
  "Describe a character entering a room where they do not feel welcome. Focus on tone and implication.",
  "Write a short paragraph analysing how silence can reveal power in a scene.",
  "Explain whether social media makes people more articulate or more performative.",
  "Rewrite a simple idea into a more precise academic paragraph: 'The writer makes the character seem sad.'",
  "Compare courage and recklessness in a single paragraph.",
  "Describe a place that seems safe at first but becomes unsettling by the end.",
  "Make a balanced argument about whether exams reward real intelligence."
];

const els = {
  studiedCount: document.querySelector("#studiedCount"),
  dueCount: document.querySelector("#dueCount"),
  accuracy: document.querySelector("#accuracy"),
  streak: document.querySelector("#streak"),
  dailyDate: document.querySelector("#dailyDate"),
  dailyWords: document.querySelector("#dailyWords"),
  newDailyBtn: document.querySelector("#newDailyBtn"),
  writingPrompt: document.querySelector("#writingPrompt"),
  promptBtn: document.querySelector("#promptBtn"),
  responseInput: document.querySelector("#responseInput"),
  saveResponseBtn: document.querySelector("#saveResponseBtn"),
  clearResponseBtn: document.querySelector("#clearResponseBtn"),
  wordMeta: document.querySelector("#wordMeta"),
  wordTitle: document.querySelector("#wordTitle"),
  wordDefinition: document.querySelector("#wordDefinition"),
  wordDetails: document.querySelector("#wordDetails"),
  markKnownBtn: document.querySelector("#markKnownBtn"),
  againBtn: document.querySelector("#againBtn"),
  goodBtn: document.querySelector("#goodBtn"),
  quizProgress: document.querySelector("#quizProgress"),
  quizQuestion: document.querySelector("#quizQuestion"),
  quizOptions: document.querySelector("#quizOptions"),
  startQuizBtn: document.querySelector("#startQuizBtn"),
  nextQuizBtn: document.querySelector("#nextQuizBtn"),
  quizFeedback: document.querySelector("#quizFeedback"),
  wordGrid: document.querySelector("#wordGrid"),
  searchInput: document.querySelector("#searchInput"),
  writingCount: document.querySelector("#writingCount"),
  writingList: document.querySelector("#writingList"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
};

const today = isoDate(new Date());
const storageKey = "vocab-dashboard-state-v1";
let state = loadState();
let activeCategory = "All";
let selectedWord = WORDS[0];
let quiz = { queue: [], index: 0, current: null, answered: false };

boot();

function boot() {
  ensureDailySet();
  bindEvents();
  selectWord(selectedWord.word);
  renderPrompt();
  renderAll();
}

function bindEvents() {
  els.newDailyBtn.addEventListener("click", () => {
    state.dailyDate = "";
    ensureDailySet(true);
    saveState();
    renderAll();
  });

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item === button));
      renderWordGrid();
    });
  });

  els.searchInput.addEventListener("input", renderWordGrid);
  els.promptBtn.addEventListener("click", () => {
    state.promptIndex = (state.promptIndex + 1) % PROMPTS.length;
    saveState();
    renderPrompt();
  });
  els.saveResponseBtn.addEventListener("click", saveWriting);
  els.clearResponseBtn.addEventListener("click", () => { els.responseInput.value = ""; });
  els.markKnownBtn.addEventListener("click", () => completeWord(selectedWord.word, true));
  els.againBtn.addEventListener("click", () => completeWord(selectedWord.word, false));
  els.goodBtn.addEventListener("click", () => completeWord(selectedWord.word, true));
  els.startQuizBtn.addEventListener("click", startQuiz);
  els.nextQuizBtn.addEventListener("click", nextQuiz);
  els.exportBtn.addEventListener("click", exportProgress);
  els.importInput.addEventListener("change", importProgress);
}

function renderAll() {
  renderSummary();
  renderDailyWords();
  renderWordGrid();
  renderWriting();
}

function renderSummary() {
  const studied = Object.values(state.progress).filter((item) => item.seen > 0).length;
  const due = dueWords().length;
  const attempts = state.quiz.correct + state.quiz.incorrect;
  els.studiedCount.textContent = studied;
  els.dueCount.textContent = due;
  els.accuracy.textContent = attempts ? `${Math.round((state.quiz.correct / attempts) * 100)}%` : "-";
  els.streak.textContent = `${state.streak.count} ${state.streak.count === 1 ? "day" : "days"}`;
  els.dailyDate.textContent = readableDate(new Date(`${state.dailyDate}T00:00:00`));
}

function renderDailyWords() {
  els.dailyWords.innerHTML = state.dailyWords.map((word) => {
    const item = getWord(word);
    const progress = state.progress[word];
    return `
      <button class="daily-item" type="button" data-word="${item.word}">
        <span>${item.word}</span>
        <small>${item.category} / ${progress?.level || 0}/5</small>
      </button>
    `;
  }).join("");
  els.dailyWords.querySelectorAll("[data-word]").forEach((button) => {
    button.addEventListener("click", () => selectWord(button.dataset.word));
  });
}

function renderWordGrid() {
  const query = els.searchInput.value.trim().toLowerCase();
  const words = WORDS.filter((item) => {
    const inCategory = activeCategory === "All" || item.category === activeCategory;
    const haystack = `${item.word} ${item.definition} ${item.example} ${item.synonyms}`.toLowerCase();
    return inCategory && (!query || haystack.includes(query));
  });

  els.wordGrid.innerHTML = words.map((item) => {
    const progress = state.progress[item.word] || blankProgress();
    const due = progress.nextReview <= today;
    return `
      <button class="word-tile ${selectedWord.word === item.word ? "selected" : ""}" type="button" data-word="${item.word}">
        <span>${item.word}</span>
        <small>${item.category} / ${item.level}${due && progress.seen ? " / due" : ""}</small>
      </button>
    `;
  }).join("");

  els.wordGrid.querySelectorAll("[data-word]").forEach((button) => {
    button.addEventListener("click", () => selectWord(button.dataset.word));
  });
}

function selectWord(word) {
  selectedWord = getWord(word);
  const progress = state.progress[word] || blankProgress();
  els.wordMeta.textContent = `${selectedWord.category} / ${selectedWord.level} / level ${progress.level}/5`;
  els.wordTitle.textContent = selectedWord.word;
  els.wordDefinition.textContent = selectedWord.definition;
  els.wordDetails.innerHTML = `
    <div>
      <span>Example</span>
      <p>${selectedWord.example}</p>
    </div>
    <div>
      <span>Synonyms</span>
      <p>${selectedWord.synonyms}</p>
    </div>
    <div>
      <span>Nuance</span>
      <p>${selectedWord.nuance}</p>
    </div>
    <div>
      <span>Next review</span>
      <p>${progress.seen ? readableDate(new Date(`${progress.nextReview}T00:00:00`)) : "Not studied yet"}</p>
    </div>
  `;
  renderWordGrid();
}

function renderPrompt() {
  els.writingPrompt.textContent = PROMPTS[state.promptIndex % PROMPTS.length];
}

function renderWriting() {
  els.writingCount.textContent = `${state.writing.length} ${state.writing.length === 1 ? "entry" : "entries"}`;
  if (!state.writing.length) {
    els.writingList.innerHTML = `<p class="empty">Saved paragraphs will appear here.</p>`;
    return;
  }
  els.writingList.innerHTML = state.writing.slice(0, 8).map((entry) => `
    <article class="writing-entry">
      <div>
        <strong>${readableDate(new Date(`${entry.date}T00:00:00`))}</strong>
        <span>${entry.prompt}</span>
      </div>
      <p>${escapeHtml(entry.text)}</p>
    </article>
  `).join("");
}

function saveWriting() {
  const text = els.responseInput.value.trim();
  if (!text) return;
  state.writing.unshift({
    date: today,
    prompt: els.writingPrompt.textContent,
    text,
  });
  markActivity();
  saveState();
  els.responseInput.value = "";
  renderAll();
}

function completeWord(word, success) {
  const progress = state.progress[word] || blankProgress();
  progress.seen += 1;
  progress.correct += success ? 1 : 0;
  progress.incorrect += success ? 0 : 1;
  progress.level = success ? Math.min(5, progress.level + 1) : Math.max(0, progress.level - 1);
  progress.nextReview = addDays(today, success ? reviewInterval(progress.level) : 1);
  state.progress[word] = progress;
  markActivity();
  saveState();
  renderAll();
  selectWord(word);
}

function startQuiz() {
  const source = unique([...dueWords(), ...state.dailyWords]);
  quiz.queue = shuffle(source).slice(0, 10);
  quiz.index = 0;
  quiz.answered = false;
  if (!quiz.queue.length) {
    els.quizQuestion.textContent = "No quiz words yet. Refresh the daily set or choose a word to study.";
    return;
  }
  showQuizQuestion();
}

function showQuizQuestion() {
  quiz.current = getWord(quiz.queue[quiz.index]);
  quiz.answered = false;
  const distractors = shuffle(WORDS.filter((item) => item.word !== quiz.current.word)).slice(0, 3);
  const options = shuffle([quiz.current, ...distractors]);
  els.quizProgress.textContent = `${quiz.index + 1} / ${quiz.queue.length}`;
  els.quizQuestion.textContent = `Which word means: ${quiz.current.definition}?`;
  els.quizOptions.innerHTML = options.map((item) => `
    <button type="button" data-answer="${item.word}">${item.word}</button>
  `).join("");
  els.quizFeedback.textContent = "";
  els.nextQuizBtn.disabled = true;
  els.quizOptions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => answerQuiz(button.dataset.answer));
  });
}

function answerQuiz(answer) {
  if (quiz.answered) return;
  quiz.answered = true;
  const correct = answer === quiz.current.word;
  state.quiz.correct += correct ? 1 : 0;
  state.quiz.incorrect += correct ? 0 : 1;
  completeWord(quiz.current.word, correct);
  els.quizOptions.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("correct", button.dataset.answer === quiz.current.word);
    button.classList.toggle("wrong", button.dataset.answer === answer && !correct);
  });
  els.quizFeedback.textContent = correct
    ? `Correct. Try using "${quiz.current.word}" in today's paragraph.`
    : `Not quite. "${quiz.current.word}" means ${quiz.current.definition}.`;
  els.nextQuizBtn.disabled = false;
}

function nextQuiz() {
  if (quiz.index >= quiz.queue.length - 1) {
    els.quizQuestion.textContent = "Quiz complete. Your review schedule has been updated.";
    els.quizOptions.innerHTML = "";
    els.quizProgress.textContent = `${quiz.queue.length} / ${quiz.queue.length}`;
    els.nextQuizBtn.disabled = true;
    els.quizFeedback.textContent = "";
    renderAll();
    return;
  }
  quiz.index += 1;
  showQuizQuestion();
}

function ensureDailySet(force = false) {
  if (!force && state.dailyDate === today && state.dailyWords.length) return;
  const due = dueWords();
  const fresh = WORDS
    .filter((item) => !due.includes(item.word))
    .sort((a, b) => (state.progress[a.word]?.seen || 0) - (state.progress[b.word]?.seen || 0))
    .map((item) => item.word);
  state.dailyDate = today;
  state.dailyWords = unique([...due.slice(0, 4), ...shuffle(fresh).slice(0, 6)]).slice(0, 8);
}

function dueWords() {
  return Object.entries(state.progress)
    .filter(([, progress]) => progress.seen > 0 && progress.nextReview <= today)
    .map(([word]) => word);
}

function markActivity() {
  if (state.streak.lastDate === today) return;
  const yesterday = addDays(today, -1);
  state.streak.count = state.streak.lastDate === yesterday ? state.streak.count + 1 : 1;
  state.streak.lastDate = today;
}

function loadState() {
  const fallback = {
    dailyDate: "",
    dailyWords: [],
    promptIndex: 0,
    progress: {},
    writing: [],
    quiz: { correct: 0, incorrect: 0 },
    streak: { count: 0, lastDate: "" },
  };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `vocab-progress-${today}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    state = { ...state, ...JSON.parse(await file.text()) };
    ensureDailySet();
    saveState();
    renderAll();
    selectWord(selectedWord.word);
  } catch {
    alert("That progress file could not be imported.");
  } finally {
    event.target.value = "";
  }
}

function getWord(word) {
  return WORDS.find((item) => item.word === word) || WORDS[0];
}

function blankProgress() {
  return { seen: 0, correct: 0, incorrect: 0, level: 0, nextReview: today };
}

function reviewInterval(level) {
  return [1, 1, 3, 7, 14, 30][level] || 30;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readableDate(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function unique(items) {
  return [...new Set(items)];
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}
