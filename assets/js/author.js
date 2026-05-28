import {
  createCard,
  createElement,
  getItems,
  loadSiteData,
  renderHeader,
  setupMobileMenu,
} from "./data.js?v=20260523-clean";

init();

async function init() {
  try {
    const data = await loadSiteData();
    renderHeader(data);
    setupMobileMenu();
    renderAuthorPage(data);
  } catch (error) {
    renderError(error);
  }
}

function renderAuthorPage(data) {
  const authorId = new URLSearchParams(window.location.search).get("autor");
  const members = data.teamPage?.members || [];
  const member = members.find((person) => person.authorId === authorId || slugify(person.name) === authorId);
  const columns = getItems(data, { type: "opinion" }).filter((item) => matchesAuthor(item, authorId, member));
  const authorName = member?.name || columns[0]?.author?.name || "Autor no encontrado";

  document.title = `Columnas de opinión de ${authorName} | CEAPS`;
  document.querySelector('meta[name="description"]').setAttribute("content", `Columnas de opinión publicadas por ${authorName} en CEAPS.`);

  setText("[data-author-title]", `Columnas de opinión de ${authorName}`);
  setText("[data-author-description]", member?.role || columns[0]?.author?.role || "Publicaciones de opinión en CEAPS.");

  const target = document.querySelector("[data-author-grid]");
  target.replaceChildren();

  if (!columns.length) {
    target.append(createEmptyState("Sin columnas publicadas", "Cuando existan columnas de este autor, aparecerán en esta página."));
    return;
  }

  columns.forEach((item) => target.append(createCard(item, data)));
}

function matchesAuthor(item, authorId, member) {
  if (!item.author) return false;
  if (item.author.id && item.author.id === authorId) return true;
  if (member && item.author.name === member.name) return true;
  return slugify(item.author.name || "") === authorId;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createEmptyState(title, description) {
  const state = createElement("div", "empty-state");
  state.append(createElement("h3", "", title));
  state.append(createElement("p", "", description));
  return state;
}

function renderError(error) {
  const main = document.querySelector("main");
  main.innerHTML = "";
  const section = createElement("section", "not-found section-dark");
  const shell = createElement("div", "shell");
  shell.append(createElement("p", "eyebrow", "Error de carga"));
  shell.append(createElement("h1", "", "No se pudo cargar el autor"));
  shell.append(createElement("p", "", error.message));
  section.append(shell);
  main.append(section);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value || "";
}
