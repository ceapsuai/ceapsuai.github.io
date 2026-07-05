const DATA_URL = new URL("../../data/content.json", import.meta.url);

export { setupMobileMenu } from "./menu.js";

export async function loadSiteData() {
  const response = await fetch(DATA_URL, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`No se pudo cargar data/content.json (${response.status})`);
  }

  return response.json();
}

export function getItems(data, filters = {}) {
  return data.items
    .filter((item) => {
      if (!filters.includeDrafts && item.draft) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.types && !filters.types.includes(item.type)) return false;
      if (filters.featured !== undefined && item.featured !== filters.featured) return false;
      if (filters.exclude && filters.exclude.includes(item.id)) return false;
      if (filters.category && item.category !== filters.category) return false;
      return true;
    })
    .sort(sortByDateDesc);
}

export function getItemById(data, id) {
  return data.items.find((item) => item.id === id && !item.draft);
}

export function getTypeLabel(data, type) {
  return data.types[type] || type;
}

export function getItemUrl(item) {
  return `/publicaciones/${encodeURIComponent(item.id)}.html`;
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function sortByDateDesc(a, b) {
  const first = new Date(`${a.date}T12:00:00`).getTime();
  const second = new Date(`${b.date}T12:00:00`).getTime();
  return second - first;
}

export function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = text;
  }

  return element;
}

export function renderTags(tags = []) {
  const wrapper = createElement("div", "tag-row");

  tags.forEach((tag) => {
    wrapper.append(createElement("span", "tag", tag));
  });

  return wrapper;
}

export function renderHeader(data) {
  document.querySelectorAll("[data-site-name], [data-footer-name]").forEach((node) => {
    node.textContent = data.site.name;
  });

  document.querySelectorAll("[data-site-kicker]").forEach((node) => {
    node.textContent = data.site.kicker;
  });

  document.querySelectorAll("[data-footer-description]").forEach((node) => {
    node.textContent = data.site.fullName;
  });

  document.querySelectorAll("[data-footer-copy]").forEach((node) => {
    node.textContent = data.footer.copyright;
  });

  const navTargets = [
    document.querySelector("[data-nav]"),
    document.querySelector("[data-mobile-nav]"),
    document.querySelector("[data-footer-nav]"),
  ].filter(Boolean);

  navTargets.forEach((target) => {
    target.replaceChildren();
    data.navigation.forEach((item) => {
      const link = createElement("a", "", item.label);
      link.href = item.href;
      target.append(link);
    });
  });
}

export function createCard(item, data, options = {}) {
  const card = createElement("a", `content-card ${options.variant || ""}`.trim());
  card.href = getItemUrl(item);
  card.setAttribute("aria-label", `Leer ${item.title}`);

  const meta = createElement("div", "card-meta");
  meta.append(createElement("span", "type-label", getTypeLabel(data, item.type)));
  meta.append(createElement("span", "", formatDate(item.date)));

  const title = createElement("h3", "", item.title);
  const summary = createElement("p", "", item.summary || item.excerpt);

  card.append(meta, title, summary);

  if (item.author?.name) {
    const author = createElement("div", "card-author");
    author.append(createElement("span", "avatar", item.author.initials || item.author.name.slice(0, 2)));
    const authorText = createElement("span", "", item.author.name);
    author.append(authorText);
    card.append(author);
  }

  if (item.tags?.length) {
    card.append(renderTags(item.tags.slice(0, 3)));
  }

  return card;
}

export function createListItem(item, data) {
  const link = createElement("a", "list-item");
  link.href = getItemUrl(item);

  const meta = createElement("div", "card-meta");
  meta.append(createElement("span", "type-label", getTypeLabel(data, item.type)));
  meta.append(createElement("span", "", formatDate(item.date)));

  const title = createElement("h3", "", item.title);
  const summary = createElement("p", "", item.summary || item.excerpt);

  link.append(meta, title, summary);
  return link;
}

export function renderBodyBlocks(container, blocks = []) {
  container.replaceChildren();

  blocks.forEach((block) => {
    if (block.type === "lead") {
      container.append(createElement("p", "article-lead", block.text));
      return;
    }

    if (block.type === "heading") {
      container.append(createElement("h2", "", block.text));
      return;
    }

    if (block.type === "quote") {
      const quote = createElement("blockquote", "", block.text);
      container.append(quote);
      return;
    }

    if (block.type === "list") {
      const list = createElement("ul", "");
      block.items.forEach((item) => {
        list.append(createElement("li", "", item));
      });
      container.append(list);
      return;
    }

    if (block.type === "image") {
      container.append(renderArticleFigure(block));
      return;
    }

    if (block.type === "gallery") {
      const gallery = createElement("div", "article-gallery");
      (block.items || []).forEach((item) => {
        gallery.append(renderArticleFigure(item));
      });
      container.append(gallery);
      return;
    }

    if (block.type === "links") {
      const links = createElement("div", "article-link-list");
      (block.items || []).forEach((item) => {
        const link = createElement("a", "", item.label);
        link.href = item.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        links.append(link);
      });
      container.append(links);
      return;
    }

    container.append(createElement("p", "", block.text));
  });
}

function renderArticleFigure(block) {
  const figure = createElement("figure", "article-figure");
  const image = document.createElement("img");
  image.src = block.src || block.image;
  image.alt = block.alt || "";
  image.loading = "lazy";
  image.decoding = "async";
  figure.append(image);

  if (block.caption) {
    figure.append(createElement("figcaption", "", block.caption));
  }

  return figure;
}
