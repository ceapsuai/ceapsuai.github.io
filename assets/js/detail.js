import {
  createCard,
  createElement,
  formatDate,
  getItemById,
  getItems,
  getTypeLabel,
  loadSiteData,
  renderBodyBlocks,
  renderHeader,
  renderTags,
  setupMobileMenu,
} from "./data.js";

init();

async function init() {
  try {
    const data = await loadSiteData();
    renderHeader(data);
    setupMobileMenu();

    const id = new URLSearchParams(window.location.search).get("id");
    const item = getItemById(data, id);

    if (!item) {
      renderNotFound(data);
      return;
    }

    renderDetail(data, item);
  } catch (error) {
    renderError(error);
  }
}

function renderDetail(data, item) {
  document.title = `${item.title} | CEAPS`;
  document.querySelector('meta[name="description"]').setAttribute("content", item.summary || item.excerpt || data.site.description);

  const meta = document.querySelector("[data-detail-meta]");
  meta.replaceChildren();
  meta.append(createElement("span", "type-label", getTypeLabel(data, item.type)));
  meta.append(createElement("span", "", formatDate(item.date)));
  if (item.readingTime) meta.append(createElement("span", "", item.readingTime));

  setText("[data-detail-title]", item.title);
  setText("[data-detail-summary]", item.summary || item.excerpt);

  renderByline(item);
  renderSidebar(data, item);
  renderBodyBlocks(document.querySelector("[data-detail-body]"), item.body);
  renderRelated(data, item);
}

function renderByline(item) {
  const target = document.querySelector("[data-detail-byline]");
  target.replaceChildren();

  if (item.author?.name) {
    const author = createElement("div", "author-line");
    author.append(createElement("span", "avatar", item.author.initials || item.author.name.slice(0, 2)));
    const text = createElement("span", "", `${item.author.name} · ${item.author.role}`);
    author.append(text);
    target.append(author);
  }

  if (item.event?.place) {
    target.append(createElement("span", "", `${item.event.place} · ${item.event.time}`));
  }
}

function renderSidebar(data, item) {
  const target = document.querySelector("[data-detail-sidebar]");
  target.replaceChildren();

  const summary = createElement("div", "sidebar-box");
  summary.append(createElement("h2", "", "Ficha"));

  const list = createElement("dl", "facts-list");
  addFact(list, "Tipo", getTypeLabel(data, item.type));
  addFact(list, "Fecha", formatDate(item.date, { day: "numeric", month: "long", year: "numeric" }));
  if (item.issue) addFact(list, "Edición", item.issue);
  if (item.author?.name) addFact(list, "Autoría", item.author.name);
  if (item.event?.date) addFact(list, "Evento", `${formatDate(item.event.date, { weekday: "long", day: "numeric", month: "long" })}, ${item.event.time}`);
  if (item.deadline) addFact(list, "Cierre", formatDate(item.deadline, { day: "numeric", month: "long", year: "numeric" }));
  summary.append(list);

  if (item.tags?.length) {
    summary.append(renderTags(item.tags));
  }

  target.append(summary);

  if (item.cta) {
    const cta = createElement("a", "button button-primary sidebar-action", item.cta.label);
    cta.href = item.cta.href;
    target.append(cta);
  }
}

function renderRelated(data, item) {
  const target = document.querySelector("[data-related-grid]");
  target.replaceChildren();

  getItems(data, { type: item.type, exclude: [item.id] })
    .slice(0, 3)
    .forEach((related) => target.append(createCard(related, data)));
}

function addFact(list, term, description) {
  const dt = createElement("dt", "", term);
  const dd = createElement("dd", "", description);
  list.append(dt, dd);
}

function renderNotFound(data) {
  setText("[data-detail-title]", "Contenido no encontrado");
  setText("[data-detail-summary]", "El enlace no coincide con ninguna publicación del archivo JSON.");
  renderBodyBlocks(document.querySelector("[data-detail-body]"), [
    {
      type: "paragraph",
      text: "Revisa que el identificador exista en data/content.json o vuelve al inicio para explorar las publicaciones disponibles.",
    },
  ]);
  renderRelated(data, { id: "", type: "opinion" });
}

function renderError(error) {
  setText("[data-detail-title]", "No se pudo cargar el contenido");
  setText("[data-detail-summary]", error.message);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value || "";
}
