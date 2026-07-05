import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://ceapsuai.github.io";
const ROOT = process.cwd();
const CONTENT_PATH = path.join(ROOT, "data", "content.json");
const OUTPUT_DIR = path.join(ROOT, "publicaciones");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const CSS_VERSION = "20260705-galeria";
const MENU_VERSION = "20260704-eventos";

const data = JSON.parse(await readFile(CONTENT_PATH, "utf8"));
const items = data.items
  .filter((item) => !item.draft)
  .sort((a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`));

await mkdir(OUTPUT_DIR, { recursive: true });

const generated = new Set();
for (const item of items) {
  const filename = `${encodeURIComponent(item.id)}.html`;
  generated.add(filename);
  await writeFile(path.join(OUTPUT_DIR, filename), renderPublicationPage(item), "utf8");
}

if (existsSync(OUTPUT_DIR)) {
  const files = await readdir(OUTPUT_DIR);
  await Promise.all(
    files
      .filter((file) => file.endsWith(".html") && !generated.has(file))
      .map((file) => rm(path.join(OUTPUT_DIR, file)))
  );
}

await writeFile(SITEMAP_PATH, renderSitemap(), "utf8");

console.log(`Generated ${generated.size} publication pages and sitemap.xml`);

function renderPublicationPage(item) {
  const canonical = `${SITE_URL}${itemUrl(item)}`;
  const description = item.summary || item.excerpt || data.site.description;
  const typeLabel = getTypeLabel(item.type);
  const imageUrl = item.image ? `${SITE_URL}/${item.image.replace(/^\/+/, "")}` : `${SITE_URL}/assets/img/brand/og-card.png`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description,
    datePublished: item.date,
    mainEntityOfPage: canonical,
    image: imageUrl,
    publisher: {
      "@type": "Organization",
      name: "CEAPS",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/img/brand/ceaps-logo-oficial.png`,
      },
    },
  };

  if (item.author?.name) {
    jsonLd.author = {
      "@type": "Person",
      name: item.author.name,
    };
  } else if (item.source?.name) {
    jsonLd.author = {
      "@type": "Organization",
      name: item.source.name,
      ...(item.source.url ? { url: item.source.url } : {}),
    };
  }

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(item.title)} | CEAPS</title>
    <meta name="description" content="${escapeAttr(description)}">
    <meta name="author" content="${escapeAttr(item.author?.name || "CEAPS")}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#201e1e">
    <meta name="color-scheme" content="dark light">
    <link rel="canonical" href="${canonical}">
    <link rel="manifest" href="../site.webmanifest">
    <link rel="icon" href="../assets/img/brand/ceaps-lambda.png" type="image/png">
    <meta property="og:title" content="${escapeAttr(item.title)}">
    <meta property="og:description" content="${escapeAttr(description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="CEAPS">
    <meta property="og:locale" content="es_CL">
    <meta property="og:image" content="${escapeAttr(imageUrl)}">
    <meta property="article:published_time" content="${escapeAttr(item.date)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttr(item.title)}">
    <meta name="twitter:description" content="${escapeAttr(description)}">
    <meta name="twitter:image" content="${escapeAttr(imageUrl)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/styles.css?v=${CSS_VERSION}">
    <script type="application/ld+json">${escapeScriptJson(jsonLd)}</script>
    <script type="module">
      import { setupMobileMenu } from "../assets/js/menu.js?v=${MENU_VERSION}";
      setupMobileMenu();
    </script>
  </head>
  <body class="detail-page">
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
${renderHeader()}
    <main id="contenido">
      <article class="detail-hero section-dark">
        <div class="shell detail-layout">
          <a class="back-link" href="/index.html">Volver a CEAPS</a>
          <div class="detail-meta">
            <span class="type-label">${escapeHtml(typeLabel)}</span>
            <span>${escapeHtml(formatDate(item.date))}</span>
          </div>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="detail-summary">${escapeHtml(description)}</p>
          ${renderByline(item)}
        </div>
      </article>

      <section class="content-band detail-content-band">
        <div class="shell detail-content-layout">
          ${renderSidebar(item)}
          <div class="article-body">
            ${renderBodyBlocks(item.body)}
          </div>
        </div>
      </section>

      ${renderRelated(item)}
    </main>
${renderFooter()}
  </body>
</html>
`;
}

function renderHeader() {
  const nav = renderNavLinks("desktop");
  const mobileNav = renderNavLinks("mobile");
  return `    <header class="site-header" data-header>
      <div class="shell header-inner">
        <a class="brand" href="/index.html" aria-label="Ir al inicio">
          <img class="university-logo" src="../assets/img/brand/uai-sin-escudo.png" alt="Universidad Adolfo Ibáñez">
          <span class="brand-mark" aria-hidden="true"><img src="../assets/img/brand/ceaps-lambda.png" alt=""></span>
          <span class="brand-copy">
            <strong class="brand-word">CE<span>Λ</span>PS</strong>
            <small>${escapeHtml(data.site.kicker)}</small>
          </span>
        </a>

        <nav class="desktop-nav" aria-label="Navegación principal">${nav}</nav>
        <a class="header-cta" href="/index.html#suscripcion">Suscribirse al boletín</a>

        <button class="icon-button menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" data-menu-toggle>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav class="mobile-nav" aria-label="Navegación móvil" data-mobile-nav>${mobileNav}</nav>
      <a class="mobile-cta" href="/index.html#suscripcion">Suscribirse al boletín</a>
    </header>
`;
}

function renderFooter() {
  return `    <footer class="site-footer">
      <div class="shell footer-grid">
        <div>
          <a class="brand footer-brand" href="/index.html" aria-label="Ir al inicio">
            <img class="university-logo" src="../assets/img/brand/uai-sin-escudo.png" alt="Universidad Adolfo Ibáñez">
            <span class="brand-mark" aria-hidden="true"><img src="../assets/img/brand/ceaps-lambda.png" alt=""></span>
            <span class="brand-copy">
              <strong class="brand-word">CE<span>Λ</span>PS</strong>
              <small>${escapeHtml(data.site.fullName)}</small>
            </span>
          </a>
        </div>
        <nav aria-label="Navegación de pie de página">${renderNavLinks("footer")}</nav>
        <p>${escapeHtml(data.footer.copyright)}</p>
      </div>
    </footer>
`;
}

function renderNavLinks() {
  return data.navigation
    .map((item) => `<a href="${escapeAttr(siteRootHref(item.href))}">${escapeHtml(item.label)}</a>`)
    .join("");
}

function renderByline(item) {
  const parts = [];

  if (item.author?.name) {
    const initials = item.author.initials || item.author.name.slice(0, 2);
    const role = item.author.role ? ` · ${item.author.role}` : "";
    parts.push(`<div class="author-line"><span class="avatar">${escapeHtml(initials)}</span><span>${escapeHtml(item.author.name + role)}</span></div>`);
  }

  if (item.event?.place) {
    const time = item.event.time ? ` · ${item.event.time}` : "";
    parts.push(`<span>${escapeHtml(item.event.place + time)}</span>`);
  }

  return parts.length ? `<div class="detail-byline">${parts.join("")}</div>` : "";
}

function renderSidebar(item) {
  const facts = [
    ["Tipo", getTypeLabel(item.type)],
    ["Fecha", formatDate(item.date, { day: "numeric", month: "long", year: "numeric" })],
  ];

  if (item.issue) facts.push(["Edición", item.issue]);
  if (item.author?.name) facts.push(["Autoría", item.author.name]);
  if (item.source?.name) facts.push(["Fuente", item.source.name]);
  if (item.event?.date) {
    const eventDate = formatDate(item.event.date, { weekday: "long", day: "numeric", month: "long" });
    facts.push(["Evento", `${eventDate}${item.event.time ? `, ${item.event.time}` : ""}`]);
  }
  if (item.deadline) facts.push(["Cierre", formatDate(item.deadline, { day: "numeric", month: "long", year: "numeric" })]);

  const factHtml = facts
    .map(([term, description]) => `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(description)}</dd>`)
    .join("");

  const tags = item.tags?.length ? renderTags(item.tags) : "";
  const cta = item.cta
    ? `<a class="button button-primary sidebar-action" href="${escapeAttr(item.cta.href)}"${item.cta.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(item.cta.label)}</a>`
    : "";

  return `<aside class="detail-sidebar">
            <div class="sidebar-box">
              <h2>Ficha</h2>
              <dl class="facts-list">${factHtml}</dl>
              ${tags}
            </div>
            ${cta}
          </aside>`;
}

function renderBodyBlocks(blocks = []) {
  return blocks
    .map((block) => {
      if (block.type === "lead") return `<p class="article-lead">${escapeHtml(block.text)}</p>`;
      if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === "quote") return `<blockquote>${escapeHtml(block.text)}</blockquote>`;
      if (block.type === "list") {
        const items = (block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (block.type === "image") return renderArticleFigure(block);
      if (block.type === "gallery") {
        const figures = (block.items || []).map((item) => renderArticleFigure(item)).join("");
        return `<div class="article-gallery">${figures}</div>`;
      }
      if (block.type === "links") {
        const links = (block.items || [])
          .map((item) => `<a href="${escapeAttr(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`)
          .join("");
        return `<div class="article-link-list">${links}</div>`;
      }
      return `<p>${escapeHtml(block.text || "")}</p>`;
    })
    .join("\n            ");
}

function renderArticleFigure(block = {}) {
  const src = publicationMediaSrc(block.src || block.image || "");
  const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : "";

  return `<figure class="article-figure">
              <img src="${escapeAttr(src)}" alt="${escapeAttr(block.alt || "")}" loading="lazy" decoding="async">
              ${caption}
            </figure>`;
}

function renderRelated(item) {
  const related = items.filter((candidate) => candidate.type === item.type && candidate.id !== item.id).slice(0, 3);

  if (!related.length) return "";

  const cards = related.map((candidate) => renderCard(candidate)).join("\n");
  return `<section class="content-band section-muted" data-related-section>
        <div class="shell section-heading split-heading" data-section-number="01">
          <div>
            <p class="eyebrow">Seguir leyendo</p>
            <h2>Contenido relacionado</h2>
          </div>
          <a class="text-link" href="/index.html#ultimas">Ver publicaciones</a>
        </div>
        <div class="shell card-grid related-grid">
${cards}
        </div>
      </section>`;
}

function renderCard(item) {
  const author = item.author?.name
    ? `<div class="card-author"><span class="avatar">${escapeHtml(item.author.initials || item.author.name.slice(0, 2))}</span><span>${escapeHtml(item.author.name)}</span></div>`
    : "";
  const tags = item.tags?.length ? renderTags(item.tags.slice(0, 3)) : "";

  return `          <a class="content-card" href="${escapeAttr(itemUrl(item))}" aria-label="Leer ${escapeAttr(item.title)}">
            <div class="card-meta">
              <span class="type-label">${escapeHtml(getTypeLabel(item.type))}</span>
              <span>${escapeHtml(formatDate(item.date))}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary || item.excerpt || "")}</p>
            ${author}
            ${tags}
          </a>`;
}

function renderTags(tags = []) {
  return `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function renderSitemap() {
  const urls = [
    {
      loc: `${SITE_URL}/`,
      lastmod: latestItemDate(),
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: `${SITE_URL}/equipo.html`,
      lastmod: "2026-06-04",
      changefreq: "monthly",
      priority: "0.8",
    },
    ...authorIds().map((authorId) => ({
      loc: `${SITE_URL}/autor.html?autor=${encodeURIComponent(authorId)}`,
      lastmod: latestAuthorDate(authorId),
      changefreq: "monthly",
      priority: "0.7",
    })),
    ...items.map((item) => ({
      loc: `${SITE_URL}${itemUrl(item)}`,
      lastmod: item.date,
      changefreq: "yearly",
      priority: "0.8",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${escapeXml(url.changefreq)}</changefreq>
    <priority>${escapeXml(url.priority)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

function authorIds() {
  const ids = new Set();

  for (const member of data.teamPage?.members || []) {
    if (member.authorId) ids.add(member.authorId);
  }

  for (const item of items) {
    if (item.author?.id) ids.add(item.author.id);
  }

  return Array.from(ids).sort();
}

function latestAuthorDate(authorId) {
  const dates = items
    .filter((item) => item.author?.id === authorId)
    .map((item) => item.date)
    .sort()
    .reverse();

  return dates[0] || latestItemDate();
}

function latestItemDate() {
  return items.map((item) => item.date).sort().reverse()[0] || "2026-01-01";
}

function itemUrl(item) {
  return `/publicaciones/${encodeURIComponent(item.id)}.html`;
}

function siteRootHref(href = "") {
  if (/^(https?:|mailto:)/.test(href)) return href;
  if (href.startsWith("#")) return `/index.html${href}`;
  if (href.startsWith("/")) return href;
  return `/${href}`;
}

function publicationMediaSrc(src = "") {
  if (/^(https?:|data:|\/)/.test(src)) return src;
  return `../${src}`;
}

function getTypeLabel(type) {
  return data.types[type] || type;
}

function formatDate(dateString, options = {}) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}

function escapeXml(value = "") {
  return escapeHtml(value);
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
