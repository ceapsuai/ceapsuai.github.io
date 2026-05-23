import {
  createCard,
  createElement,
  createListItem,
  formatDate,
  getItems,
  getItemUrl,
  getTypeLabel,
  loadSiteData,
  renderHeader,
  renderTags,
  setupMobileMenu,
} from "./data.js";

const state = {
  columnFilter: "todas",
};

init();

async function init() {
  try {
    const data = await loadSiteData();
    renderHeader(data);
    setupMobileMenu();
    renderHome(data);
    setupSubscribeForm(data);
  } catch (error) {
    renderError(error);
  }
}

function renderHome(data) {
  document.title = data.site.pageTitle;
  document.querySelector('meta[name="description"]').setAttribute("content", data.site.description);

  renderHero(data);
  renderFeaturedStrip(data);
  renderLatest(data);
  renderNewsletter(data);
  renderColumns(data);
  renderNewsEvents(data);
  renderPapers(data);
  renderOpportunities(data);
  renderAbout(data);
  renderSubscribe(data);
}

function renderHero(data) {
  setText("[data-hero-kicker]", data.site.founded ? `Fundado en ${data.site.founded}` : data.hero.kicker);
  renderHeroTitle(data.hero.title);
  setText("[data-hero-description]", data.hero.description);

  const actions = document.querySelector("[data-hero-actions]");
  actions.replaceChildren();
  data.hero.actions.forEach((action, index) => {
    const link = createElement("a", index === 0 ? "button button-primary" : "button button-secondary", action.label);
    link.href = action.href;
    actions.append(link);
  });
}

function renderFeaturedStrip(data) {
  const target = document.querySelector("[data-featured-strip]");
  target.replaceChildren();

  data.hero.featuredIds
    .map((id) => data.items.find((item) => item.id === id))
    .filter(Boolean)
    .forEach((item) => {
      const link = createElement("a", "quick-link");
      link.href = getItemUrl(item);
      link.append(createElement("span", "", getTypeLabel(data, item.type)));
      link.append(createElement("strong", "", item.title));
      link.append(createElement("small", "", item.author?.name || item.event?.place || formatDate(item.date)));
      target.append(link);
    });
}

function renderLatest(data) {
  setSectionText("latest", data.sections.latest);

  const target = document.querySelector("[data-latest-grid]");
  target.replaceChildren();
  getItems(data).slice(0, 6).forEach((item) => {
    target.append(createCard(item, data));
  });
}

function renderNewsletter(data) {
  setSectionText("newsletter", data.sections.newsletter);
  setText("[data-newsletter-cta]", data.sections.newsletter.cta);

  const newsletters = getItems(data, { type: "newsletter" });
  const [featured, ...rest] = newsletters;
  const featureTarget = document.querySelector("[data-newsletter-feature]");
  const listTarget = document.querySelector("[data-newsletter-list]");
  featureTarget.replaceChildren();
  listTarget.replaceChildren();

  if (featured) {
    const feature = createElement("a", "newsletter-feature");
    feature.href = getItemUrl(featured);
    feature.append(createElement("span", "issue-number", featured.issue));
    feature.append(createElement("p", "eyebrow", getTypeLabel(data, featured.type)));
    feature.append(createElement("h3", "", featured.title));
    feature.append(createElement("p", "", featured.summary));
    feature.append(renderTags(featured.tags));
    featureTarget.append(feature);
  }

  rest.slice(0, 4).forEach((item) => listTarget.append(createListItem(item, data)));
}

function renderColumns(data) {
  setSectionText("columns", data.sections.columns);
  renderColumnFilters(data);
  renderColumnGrid(data);
}

function renderColumnFilters(data) {
  const target = document.querySelector("[data-column-filters]");
  target.replaceChildren();

  data.sections.columns.filters.forEach((filter) => {
    const button = createElement("button", "", filter.label);
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(state.columnFilter === filter.value));
    button.addEventListener("click", () => {
      state.columnFilter = filter.value;
      renderColumnFilters(data);
      renderColumnGrid(data);
    });
    target.append(button);
  });
}

function renderColumnGrid(data) {
  const target = document.querySelector("[data-columns-grid]");
  target.replaceChildren();

  getItems(data, { type: "opinion" })
    .filter((item) => state.columnFilter === "todas" || item.category === state.columnFilter)
    .slice(0, 8)
    .forEach((item) => target.append(createCard(item, data, { variant: "opinion-card" })));
}

function renderNewsEvents(data) {
  setSectionText("newsEvents", data.sections.newsEvents);
  setText("[data-news-title]", data.sections.newsEvents.newsTitle);
  setText("[data-events-title]", data.sections.newsEvents.eventsTitle);

  const newsTarget = document.querySelector("[data-news-list]");
  const eventsTarget = document.querySelector("[data-events-list]");
  newsTarget.replaceChildren();
  eventsTarget.replaceChildren();

  getItems(data, { type: "news" }).slice(0, 4).forEach((item) => newsTarget.append(createListItem(item, data)));

  getItems(data, { type: "event" }).slice(0, 4).forEach((item) => {
    const eventItem = createListItem(item, data);
    if (item.event?.date) {
      eventItem.append(createElement("strong", "event-date", `${formatDate(item.event.date, { weekday: "short", day: "numeric", month: "short" })} · ${item.event.time}`));
    }
    eventsTarget.append(eventItem);
  });
}

function renderPapers(data) {
  setSectionText("papers", data.sections.papers);

  const target = document.querySelector("[data-papers-grid]");
  target.replaceChildren();
  getItems(data, { type: "paper" }).slice(0, 6).forEach((item) => {
    const paper = createElement("a", "paper-card");
    paper.href = getItemUrl(item);
    paper.append(createElement("p", "eyebrow", item.category));
    paper.append(createElement("h3", "", item.title));
    paper.append(createElement("p", "", item.summary));
    paper.append(renderTags(item.tags));
    target.append(paper);
  });
}

function renderOpportunities(data) {
  setSectionText("opportunities", data.sections.opportunities);

  const target = document.querySelector("[data-opportunities-grid]");
  target.replaceChildren();
  getItems(data, { type: "opportunity" }).slice(0, 4).forEach((item) => target.append(createCard(item, data)));
}

function renderAbout(data) {
  setText("[data-about-kicker]", data.about.kicker);
  setText("[data-about-title]", data.about.title);
  setText("[data-about-description]", data.about.description);
  setText("[data-about-action]", data.about.action.label);
  const aboutAction = document.querySelector("[data-about-action]");
  if (aboutAction) {
    aboutAction.href = data.about.action.href;
  }

  const target = document.querySelector("[data-about-values]");
  target.replaceChildren();
  data.about.values.forEach((value) => {
    const item = createElement("article", "value-card");
    item.append(createElement("h3", "", value.title));
    item.append(createElement("p", "", value.description));
    target.append(item);
  });
}

function renderHeroTitle(title) {
  const node = document.querySelector("[data-hero-title]");
  if (!node) return;

  node.classList.toggle("hero-logo", title.toUpperCase() === "CEAPS");
  node.classList.toggle("hero-full-name", title.toUpperCase() !== "CEAPS");
  node.replaceChildren();

  if (title.toUpperCase() !== "CEAPS") {
    node.textContent = title;
    return;
  }

  node.setAttribute("aria-label", title);
  Array.from(title).forEach((letter) => {
    const span = createElement("span", letter.toUpperCase() === "A" ? "brand-accent" : "", letter);
    node.append(span);
  });
}

function renderSubscribe(data) {
  setText("[data-subscribe-kicker]", data.subscribe.kicker);
  setText("[data-subscribe-title]", data.subscribe.title);
  setText("[data-subscribe-description]", data.subscribe.description);
  setText("[data-subscribe-button]", data.subscribe.button);
  setText("[data-subscribe-note]", data.subscribe.note);
}

function setupSubscribeForm(data) {
  const form = document.querySelector("[data-subscribe-form]");
  const note = document.querySelector("[data-subscribe-note]");

  if (!form || !note) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = formData.get("email");
    const subject = encodeURIComponent(data.subscribe.emailSubject);
    const body = encodeURIComponent(`${data.subscribe.emailBody}\n\nCorreo: ${email}`);
    note.textContent = data.subscribe.success;
    window.location.href = `mailto:${data.site.email}?subject=${subject}&body=${body}`;
  });
}

function setSectionText(key, section) {
  setText(`[data-${toKebab(key)}-kicker]`, section.kicker);
  setText(`[data-${toKebab(key)}-title]`, section.title);
  setText(`[data-${toKebab(key)}-description]`, section.description);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) {
    node.textContent = value || "";
  }
}

function toKebab(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function renderError(error) {
  const main = document.querySelector("main");
  main.innerHTML = "";
  const section = createElement("section", "not-found section-dark");
  const shell = createElement("div", "shell");
  shell.append(createElement("p", "eyebrow", "Error de carga"));
  shell.append(createElement("h1", "", "No se pudo cargar el sitio"));
  shell.append(createElement("p", "", error.message));
  section.append(shell);
  main.append(section);
}
