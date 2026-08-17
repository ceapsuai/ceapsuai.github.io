import {
  createCard,
  createElement,
  getAuthorProfile,
  getItems,
  loadSiteData,
  renderHeader,
  setupMobileMenu,
} from "./data.js?v=20260817-alvaro";

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
  const profile = getAuthorProfile(data, authorId) || member || columns[0]?.author;
  const authorName = profile?.name || "Autor no encontrado";
  const description = profile?.bio || `Columnas de opinión publicadas por ${authorName} en CEAPS.`;
  const role = profile?.role || columns[0]?.author?.role || "Columnista CEAPS";

  document.title = `${authorName} | Columnistas CEAPS`;
  updateMeta('meta[name="description"]', "content", description);
  updateMeta('meta[property="og:title"]', "content", `${authorName} | Columnistas CEAPS`);
  updateMeta('meta[property="og:description"]', "content", description);
  updateMeta('meta[name="twitter:title"]', "content", `${authorName} | Columnistas CEAPS`);
  updateMeta('meta[name="twitter:description"]', "content", description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = `${location.origin}${location.pathname}${location.search}`;
  updateMeta('meta[property="og:url"]', "content", `${location.origin}${location.pathname}${location.search}`);

  setText("[data-author-title]", authorName);
  setText("[data-author-role]", role);
  setText("[data-author-bio]", description);
  setText(
    "[data-author-columns-description]",
    `${columns.length} ${columns.length === 1 ? "columna publicada" : "columnas publicadas"} en CEAPS.`
  );
  renderAuthorPhoto(profile, authorName);
  renderAcademicDetails(profile);
  renderAuthorLinks(profile);

  const target = document.querySelector("[data-author-grid]");
  target.replaceChildren();

  if (!columns.length) {
    target.append(createEmptyState("Sin columnas publicadas", "Cuando existan columnas de este autor, aparecerán en esta página."));
    return;
  }

  columns.forEach((item) => target.append(createCard(item, data)));
}

function renderAuthorPhoto(profile, authorName) {
  const wrapper = document.querySelector("[data-author-photo-wrapper]");
  const image = document.querySelector("[data-author-photo]");
  if (!wrapper || !image || !profile?.image) return;

  image.src = profile.image;
  image.alt = `Retrato de ${authorName}`;
  wrapper.hidden = false;

  const absoluteImage = new URL(profile.image, location.href).href;
  updateMeta('meta[property="og:image"]', "content", absoluteImage);
  updateMeta('meta[name="twitter:image"]', "content", absoluteImage);
}

function renderAuthorLinks(profile) {
  const target = document.querySelector("[data-author-links]");
  const links = profile?.links?.filter((link) => link?.label && link?.href) || [];
  if (!target) return;

  target.replaceChildren();
  target.hidden = !links.length;

  links.forEach((link) => {
    const anchor = createElement("a", "author-profile-link-button", link.label);
    anchor.href = link.href;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.setAttribute("aria-label", `${link.label} de ${profile.name}`);
    target.append(anchor);
  });
}

function renderAcademicDetails(profile) {
  const target = document.querySelector("[data-author-academic-details]");
  if (!target) return;

  const education = profile?.education || [];
  if (!profile?.academicTitle && !education.length && !profile?.specialization) {
    target.hidden = true;
    target.replaceChildren();
    return;
  }

  target.replaceChildren();
  target.hidden = false;

  if (profile.academicTitle) target.append(createElement("h2", "", profile.academicTitle));

  if (education.length) {
    const list = createElement("ul", "author-education-list");
    education.forEach((item) => list.append(createElement("li", "", item)));
    target.append(list);
  }

  if (profile.specialization) {
    target.append(createElement("p", "author-specialization", profile.specialization));
  }
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

function updateMeta(selector, attribute, value) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute(attribute, value);
}
