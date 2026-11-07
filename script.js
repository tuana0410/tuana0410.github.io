// =====================================================
//  TuanaOS: window buttons, project filter, terminal, clock
// =====================================================

// ---------- Minimize / restore a window with its "_" button ----------
function setMinimized(win, minimized) {
  const button = win.querySelector(".min");
  win.classList.toggle("is-minimized", minimized);
  button.textContent = minimized ? "□" : "_";
  button.setAttribute("aria-expanded", String(!minimized));
  button.setAttribute("aria-label", minimized ? "Restore window" : "Minimize window");
}

document.querySelectorAll(".window .min").forEach((button) => {
  button.addEventListener("click", () => {
    const win = button.closest(".window");
    setMinimized(win, !win.classList.contains("is-minimized"));
  });
});

// Clicking a desktop icon restores the window if it was minimized
document.querySelectorAll(".icon").forEach((icon) => {
  icon.addEventListener("click", () => {
    const win = document.querySelector(icon.getAttribute("href"));
    if (win) setMinimized(win, false);
  });
});

// ---------- Project filter (all / software / R&D) ----------
const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".file");
const itemCount = document.getElementById("item-count");

function filterProjects(category) {
  let shown = 0;
  projectCards.forEach((card) => {
    const match = category === "all" || card.dataset.cat === category;
    card.hidden = !match;
    if (match) shown++;
  });

  filterButtons.forEach((btn) => {
    const on = btn.dataset.filter === category;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
  });

  itemCount.textContent = shown + (shown === 1 ? " item" : " items");
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => filterProjects(btn.dataset.filter));
});

// ---------- Terminal ----------
const termOutput = document.getElementById("term-output");
const termForm = document.getElementById("term-form");
const termInput = document.getElementById("term-input");
const history = [];
let historyIndex = 0;

const SECTIONS = ["about", "experience", "projects", "skills", "terminal", "contact"];

function openSection(name) {
  const win = document.getElementById(name);
  if (!win) return false;
  setMinimized(win, false);
  win.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

const COMMANDS = {
  help: () => [
    "available commands:",
    "  <b>whoami</b>          who I am",
    "  <b>ls</b>              list the sections on this page",
    "  <b>open</b> &lt;name&gt;     go to a section, e.g. open projects",
    "  <b>projects</b>        short list of my projects",
    "  <b>skills</b>          languages and tools I use",
    "  <b>contact</b>         how to reach me",
    "  <b>date</b>            current time in Samsun",
    "  <b>clear</b>           clear the screen",
  ],
  whoami: () => [
    "Tuana Metdar",
    "3rd-year Software Engineering student, Samsun University.",
    "R&amp;D intern at Solvera Yazılım. Communication &amp; interface on Kozmos Havacılık (TEKNOFEST).",
  ],
  ls: () => [SECTIONS.map((n) => `<b>${n}</b>`).join("   ")],
  projects: () => [
    "<b>railway-fault/</b>    camera-based fault detection · UDHAM R&amp;D Incentive Award",
    "<b>tunel-rob/</b>        autonomous tunnel robot · UDHAM 2053",
    "<b>uav-enose/</b>        UAV gas mapping study",
    "<b>chat-app/</b>         real-time messaging · ASP.NET Core + React",
    "<b>visualizer/</b>       algorithm visualizer · React + TS",
    "<b>organizer-app/</b>    mobile organizer · React Native",
    "<b>arpacioglu-ms/</b>    stock &amp; order management",
    "<b>gpower-teardown/</b>  reverse engineering sprint",
    "type <b>open projects</b> for details",
  ],
  skills: () => [
    "languages   C#, C++, Python, TypeScript",
    "frameworks  React, React Native, Next.js, Node.js, ASP.NET Core",
    "data        PostgreSQL, MSSQL, Supabase, EF Core, SignalR",
    "systems     ROS, Gazebo, GStreamer, OpenCV, PySide6",
    "tools       Docker, Git, Linux, Figma",
  ],
  contact: () => [
    'email     <a href="mailto:tmetdar@gmail.com">tmetdar@gmail.com</a>',
    'github    <a href="https://github.com/tuana0410" target="_blank" rel="noopener">github.com/tuana0410</a>',
    'linkedin  <a href="https://www.linkedin.com/in/tuana-metdar-8a4882323" target="_blank" rel="noopener">tuana-metdar</a>',
  ],
  date: () => [
    new Date().toLocaleString("en-GB", { timeZone: "Europe/Istanbul" }) + " (Samsun)",
  ],
  clear: () => {
    termOutput.innerHTML = "";
    return [];
  },
  open: (arg) => {
    if (!arg) return ['<span class="err">usage: open &lt;name&gt;. Try: ls</span>'];
    return openSection(arg)
      ? [`<span class="ok">opening ${arg}...</span>`]
      : [`<span class="err">no such section: ${escapeHtml(arg)}</span>`];
  },
  sudo: () => ['<span class="err">permission denied. nice try :)</span>'],
};

// User input is shown as text, never as HTML
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function print(lines) {
  lines.forEach((line) => {
    const p = document.createElement("p");
    p.innerHTML = line;
    termOutput.appendChild(p);
  });
  termOutput.scrollTop = termOutput.scrollHeight;
}

termForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = termInput.value.trim();
  termInput.value = "";
  if (!raw) return;

  history.push(raw);
  historyIndex = history.length;
  print([`<span class="cmd">tuana@samsun:~$ ${escapeHtml(raw)}</span>`]);

  const [name, ...args] = raw.toLowerCase().split(/\s+/);
  const command = COMMANDS[name];
  print(command
    ? command(args.join(" "))
    : [`<span class="err">command not found: ${escapeHtml(name)}. Type help.</span>`]);
});

// Arrow up / down walks through earlier commands
termInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && historyIndex > 0) {
    historyIndex--;
    termInput.value = history[historyIndex];
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    historyIndex = Math.min(historyIndex + 1, history.length);
    termInput.value = history[historyIndex] || "";
    e.preventDefault();
  }
});

// Clicking anywhere in the terminal focuses the input (but links still work)
document.getElementById("term-body").addEventListener("click", (e) => {
  if (!e.target.closest("a")) termInput.focus();
});

// ---------- Taskbar clock (Samsun time) ----------
const clock = document.getElementById("clock");

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

updateClock();
setInterval(updateClock, 30000);
