const $ = (id) => document.getElementById(id);
const drop = $("drop"), fileInput = $("file"), preview = $("preview");
const MAX = 8 * 1024 * 1024, history = [];
let currentUrl = null;
 
const pct = (v) => (v * 100).toFixed(1) + "%";
const setError = (m) => { $("error").textContent = m || ""; $("error").hidden = !m; };
 
async function checkStatus() {
  const el = $("status");
  try {
    const r = await fetch("/api/health");
    if (!r.ok) throw 0;
    el.className = "pill on"; el.lastElementChild.textContent = "Model online";
  } catch {
    el.className = "pill off"; el.lastElementChild.textContent = "Server offline";
  }
}
 
function countUp(el, to) {
  const start = performance.now(), dur = 900;
  const tick = (t) => {
    const k = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - k, 3);
    el.textContent = (to * e).toFixed(1);
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
 
function showResult(data) {
  const { cat, dog } = data.probabilities;
  $("result").hidden = false;
  const v = $("verdict");
  const other = data.label === "other";
  v.textContent = other ? "Neither" : data.label; v.className = "verdict " + data.label;
  $("scoreLbl").textContent = other ? "% for " + data.best_guess : "% sure";
  $("pCat").textContent = pct(cat); $("pDog").textContent = pct(dog);
  $("note").textContent = other
    ? "This does not look clearly like a cat or a dog, so the model is not picking either one."
    : "Low confidence. Try a clearer photo with a single animal in frame.";
  $("note").hidden = !other && data.confidence >= 0.7;
  $("marker").style.left = "50%";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $("marker").style.left = Math.min(Math.max(dog * 100, 3), 97) + "%";
  }));
  countUp($("score"), data.confidence * 100);
}
 
function showImage(url) {
  currentUrl = url;
  preview.src = url; preview.hidden = false;
  drop.classList.add("has"); $("hint").hidden = true;
}
 
function renderHistory(activeUrl) {
  $("histWrap").hidden = history.length === 0;
  $("hist").replaceChildren(...history.map((h) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = h.data.label + (h.url === activeUrl ? " on" : "");
    b.title = `${h.data.label} · ${pct(h.data.confidence)}`;
    b.innerHTML = `<img alt="${h.data.label}" src="${h.url}"><span>${h.data.label === "other" ? "neither" : h.data.label}</span>`;
    b.onclick = () => { setError(""); showImage(h.url); showResult(h.data); $("again").hidden = false; renderHistory(h.url); };
    return b;
  }));
}
 
function reset() {
  preview.hidden = true; preview.removeAttribute("src"); currentUrl = null;
  drop.classList.remove("has"); $("hint").hidden = false;
  $("result").hidden = true; $("again").hidden = true; setError("");
  fileInput.value = ""; renderHistory(null);
}
 
async function classify(file) {
  setError("");
  if (!file) return;
  if (!file.type.startsWith("image/")) return setError("That file is not an image. Choose a JPG, PNG or WEBP photo.");
  if (file.size > MAX) return setError("That image is larger than 8 MB. Choose a smaller one.");
 
  const url = URL.createObjectURL(file);
  showImage(url);
  $("result").hidden = true; $("busy").hidden = false; $("beam").hidden = false;
 
  const body = new FormData(); body.append("file", file);
  try {
    const res = await fetch("/api/predict", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "The server could not process this image.");
    showResult(data);
    history.unshift({ url, data }); history.splice(6).forEach((h) => URL.revokeObjectURL(h.url));
    renderHistory(url);
  } catch (err) {
    setError(err instanceof TypeError ? "Cannot reach the server. Check that FastAPI is running." : err.message);
  } finally {
    $("busy").hidden = true; $("beam").hidden = true; $("again").hidden = false;
  }
}
 
const canPick = () => !drop.classList.contains("has");
drop.addEventListener("click", () => canPick() && fileInput.click());
drop.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && canPick()) { e.preventDefault(); fileInput.click(); } });
fileInput.addEventListener("change", () => classify(fileInput.files[0]));
["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (e) => classify(e.dataTransfer.files[0]));
document.addEventListener("paste", (e) => { const f = [...(e.clipboardData?.files || [])][0]; if (f) classify(f); });
$("again").addEventListener("click", reset);
checkStatus();
