const THEME_KEY = "journey-theme";
const MILESTONES_KEY = "journey-milestones";
const REFLECTIONS_KEY = "journey-reflections";

const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

const milestoneForm = document.getElementById("milestoneForm");
const milestoneInput = document.getElementById("milestoneInput");
const milestoneList = document.getElementById("milestoneList");
const progressLabel = document.getElementById("progressLabel");

const reflectionForm = document.getElementById("reflectionForm");
const reflectionInput = document.getElementById("reflectionInput");
const reflectionList = document.getElementById("reflectionList");
const loadPlanButton = document.getElementById("loadPlanButton");

const STARTER_MILESTONES = [
	"Map the six GH-600 domains and their relative weights",
	"Write a reviewable agent task with inputs, outputs, controls, and evidence",
	"Create a least-privilege custom agent profile",
	"Explain MCP local, HTTP, and SSE transport choices",
	"Practice Copilot CLI sessions, plans, and programmatic prompts",
	"Configure and explain cloud-agent setup steps",
	"Record durable state and identify context-drift risks",
	"Diagnose an agent failure using logs and workflow artifacts",
	"Design a multi-agent workflow with clear ownership and concurrency control",
	"Apply GitHub guardrails: narrow permissions, reviews, and rulesets",
	"Complete a small branch-to-PR exercise with validation evidence",
	"Review weak areas and write a final exam-day checklist",
];

const read = (key, fallback) => {
	try {
		return JSON.parse(localStorage.getItem(key)) ?? fallback;
	} catch {
		return fallback;
	}
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const showToast = (message) => {
	toast.textContent = message;
	toast.classList.add("show");
	setTimeout(() => toast.classList.remove("show"), 1500);
};

const setTheme = (isDark) => {
	body.classList.toggle("dark", isDark);
	themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
	localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
};

const renderMilestones = () => {
	const items = read(MILESTONES_KEY, []);
	milestoneList.innerHTML = "";

	if (!items.length) {
		milestoneList.innerHTML = '<li class="item"><span>No milestones yet. Add your first one.</span></li>';
		progressLabel.textContent = "0 of 0 completed";
		return;
	}

	items.forEach((item) => {
		const li = document.createElement("li");
		li.className = `item ${item.done ? "done" : ""}`;

		const left = document.createElement("div");
		left.className = "row";
		left.style.alignItems = "center";

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = item.done;
		checkbox.setAttribute("aria-label", `Mark milestone: ${item.text}`);
		checkbox.addEventListener("change", () => toggleMilestone(item.id));

		const text = document.createElement("span");
		text.textContent = item.text;

		left.append(checkbox, text);

		const del = document.createElement("button");
		del.className = "btn secondary";
		del.type = "button";
		del.textContent = "Delete";
		del.addEventListener("click", () => deleteMilestone(item.id));

		li.append(left, del);
		milestoneList.append(li);
	});

	const complete = items.filter((x) => x.done).length;
	progressLabel.textContent = `${complete} of ${items.length} completed`;
};

const addMilestone = (text) => {
	const items = read(MILESTONES_KEY, []);
	items.push({ id: crypto.randomUUID(), text, done: false });
	write(MILESTONES_KEY, items);
	renderMilestones();
	showToast("Milestone added");
};

const toggleMilestone = (id) => {
	const items = read(MILESTONES_KEY, []).map((item) =>
		item.id === id ? { ...item, done: !item.done } : item,
	);
	write(MILESTONES_KEY, items);
	renderMilestones();
};

const deleteMilestone = (id) => {
	const items = read(MILESTONES_KEY, []).filter((item) => item.id !== id);
	write(MILESTONES_KEY, items);
	renderMilestones();
	showToast("Milestone removed");
};

const loadStarterPlan = () => {
	const items = read(MILESTONES_KEY, []);
	const existingTexts = new Set(items.map((item) => item.text));
	const newItems = STARTER_MILESTONES.filter((text) => !existingTexts.has(text)).map((text) => ({
		id: crypto.randomUUID(),
		text,
		done: false,
	}));

	if (!newItems.length) {
		showToast("Starter plan is already loaded");
		return;
	}

	write(MILESTONES_KEY, [...items, ...newItems]);
	renderMilestones();
	showToast(`${newItems.length} study milestones added`);
};

const renderReflections = () => {
	const notes = read(REFLECTIONS_KEY, []);
	reflectionList.innerHTML = "";

	if (!notes.length) {
		reflectionList.innerHTML = '<li class="item"><span>No reflections yet. Save your first note.</span></li>';
		return;
	}

	notes.forEach((note) => {
		const li = document.createElement("li");
		li.className = "item";

		const content = document.createElement("div");
		const summary = document.createElement("span");
		summary.textContent = note.text;
		const date = document.createElement("p");
		date.className = "meta";
		date.textContent = new Date(note.createdAt).toLocaleString();
		content.append(summary, date);

		const del = document.createElement("button");
		del.className = "btn secondary";
		del.type = "button";
		del.textContent = "Delete";
		del.addEventListener("click", () => deleteReflection(note.id));

		li.append(content, del);
		reflectionList.append(li);
	});
};

const addReflection = (text) => {
	const notes = read(REFLECTIONS_KEY, []);
	notes.unshift({
		id: crypto.randomUUID(),
		text,
		createdAt: new Date().toISOString(),
	});
	write(REFLECTIONS_KEY, notes.slice(0, 10));
	renderReflections();
	showToast("Reflection saved");
};

const deleteReflection = (id) => {
	const notes = read(REFLECTIONS_KEY, []).filter((note) => note.id !== id);
	write(REFLECTIONS_KEY, notes);
	renderReflections();
	showToast("Reflection removed");
};

themeToggle.addEventListener("click", () => {
	setTheme(!body.classList.contains("dark"));
});

milestoneForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const text = milestoneInput.value.trim();
	if (!text) return;
	addMilestone(text);
	milestoneInput.value = "";
	milestoneInput.focus();
});

reflectionForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const text = reflectionInput.value.trim();
	if (!text) return;
	addReflection(text);
	reflectionInput.value = "";
	reflectionInput.focus();
});

loadPlanButton.addEventListener("click", loadStarterPlan);

setTheme(localStorage.getItem(THEME_KEY) === "dark");
renderMilestones();
renderReflections();
