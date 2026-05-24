import {
  createElement,
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
    renderTeamPage(data);
  } catch (error) {
    renderError(error);
  }
}

function renderTeamPage(data) {
  const page = data.teamPage;

  document.title = `${page.title} | CEAPS`;
  document.querySelector('meta[name="description"]').setAttribute("content", page.description);

  setText("[data-team-kicker]", page.kicker);
  setText("[data-team-title]", page.title);
  setText("[data-team-description]", page.description);

  const grid = document.querySelector("[data-team-grid]");
  grid.replaceChildren();
  page.members.forEach((member) => grid.append(createMemberCard(member)));
}

function createMemberCard(member) {
  const card = createElement("article", "team-card");
  const media = createElement("div", "team-photo");

  if (member.image) {
    const image = document.createElement("img");
    image.src = member.image;
    image.alt = `Foto de ${member.name}`;
    image.loading = "lazy";
    media.append(image);
  } else {
    media.append(createElement("span", "", "Foto"));
  }

  const body = createElement("div", "team-card-body");
  body.append(createElement("h2", "", member.name));
  body.append(createElement("p", "team-role", member.role));
  body.append(createElement("p", "team-text", member.text));

  if (member.email) {
    const email = createElement("a", "team-link", "Contacto");
    email.href = `mailto:${member.email}`;
    body.append(email);
  }

  if (member.link) {
    const link = createElement("a", "team-link", "Saber +");
    link.href = member.link;
    body.append(link);
  }

  card.append(media, body);
  return card;
}

function renderError(error) {
  const main = document.querySelector("main");
  main.innerHTML = "";
  const section = createElement("section", "not-found section-dark");
  const shell = createElement("div", "shell");
  shell.append(createElement("p", "eyebrow", "Error de carga"));
  shell.append(createElement("h1", "", "No se pudo cargar el equipo"));
  shell.append(createElement("p", "", error.message));
  section.append(shell);
  main.append(section);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value || "";
}
