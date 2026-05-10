const HERO_CAROUSEL_COUNT = 5;
const HERO_CAROUSEL_INTERVAL_MS = 6000;

const CATEGORY_STYLES = {
  Announcement: { bg: "bg-surface", text: "text-primary" },
  "For Judges": { bg: "bg-secondary-container", text: "text-on-secondary-fixed-variant" },
  "Success Stories": { bg: "bg-tertiary-fixed", text: "text-on-tertiary-fixed-variant" },
  "For Teachers": { bg: "bg-surface-variant", text: "text-on-surface-variant" },
  "For Students": { bg: "bg-primary-fixed", text: "text-on-primary-fixed" },
};
const DEFAULT_STYLE = { bg: "bg-secondary-container", text: "text-on-secondary-fixed-variant" };

const categoryStyle = (c) => CATEGORY_STYLES[c] || DEFAULT_STYLE;

const formatDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateLong = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]
  );

const articleHref = (id) => `article.html?id=${encodeURIComponent(id)}`;

async function loadArticles() {
  const res = await fetch("news/articles.json");
  const articles = await res.json();
  articles.sort((a, b) => b.date.localeCompare(a.date));
  return articles;
}

function renderHeroSlide(article) {
  const style = categoryStyle(article.category);
  const bgUrl = article.image || "images/lacsef-logo-solid.png";
  return `
    <a href="${articleHref(article.id)}" class="hero-slide absolute inset-0 opacity-0 pointer-events-none transition-opacity duration-700">
      <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${bgUrl.replace(/'/g, "\\'")}')"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>
      <div class="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full flex items-center">
        <div class="flex flex-col gap-stack-md max-w-3xl py-stack-xl">
          <span class="inline-block ${style.bg} ${style.text} px-2 py-1 rounded text-label-md font-label-md uppercase tracking-wide w-fit">${escapeHtml(article.category)}</span>
          <h1 class="font-headline-xl text-headline-xl md:text-[56px] text-white leading-tight">${escapeHtml(article.title)}</h1>
          <p class="font-body-lg text-body-lg text-white/90 max-w-2xl">${escapeHtml(article.excerpt)}</p>
          <div class="flex items-center gap-2 text-white/80 font-label-md text-label-md mt-stack-sm">
            <span class="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>${formatDateLong(article.date)}</span>
          </div>
          <span class="inline-flex items-center text-white font-label-md text-label-md mt-stack-md">
            Read Full Article <span class="material-symbols-outlined ml-1 text-[18px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </a>
  `;
}

function renderHeroCarousel(articles, container) {
  const slides = articles.slice(0, HERO_CAROUSEL_COUNT);
  if (!slides.length) return;

  container.innerHTML = `
    <div class="relative w-full h-[480px] md:h-[560px]">
      ${slides.map(renderHeroSlide).join("")}
      <button id="hero-prev" type="button" aria-label="Previous slide"
        class="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur flex items-center justify-center transition-colors">
        <span class="material-symbols-outlined text-[20px] text-white">arrow_back</span>
      </button>
      <button id="hero-next" type="button" aria-label="Next slide"
        class="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur flex items-center justify-center transition-colors">
        <span class="material-symbols-outlined text-[20px] text-white">arrow_forward</span>
      </button>
      <div id="hero-dots" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center"></div>
    </div>
  `;

  const slideEls = container.querySelectorAll(".hero-slide");
  const dotsContainer = container.querySelector("#hero-dots");
  dotsContainer.innerHTML = slides
    .map(
      (_, i) =>
        `<button type="button" class="hero-dot h-2 rounded-full bg-outline-variant transition-all" data-i="${i}" aria-label="Go to slide ${i + 1}"></button>`
    )
    .join("");
  const dotEls = dotsContainer.querySelectorAll(".hero-dot");

  let current = 0;
  let timer;

  const show = (i) => {
    current = (i + slides.length) % slides.length;
    slideEls.forEach((el, idx) => {
      const active = idx === current;
      el.classList.toggle("opacity-100", active);
      el.classList.toggle("opacity-0", !active);
      el.classList.toggle("pointer-events-auto", active);
      el.classList.toggle("pointer-events-none", !active);
    });
    dotEls.forEach((el, idx) => {
      const active = idx === current;
      el.classList.toggle("bg-white", active);
      el.classList.toggle("bg-white/40", !active);
      el.classList.toggle("w-6", active);
      el.classList.toggle("w-2", !active);
    });
  };

  const next = () => show(current + 1);
  const prev = () => show(current - 1);
  const restart = () => {
    clearInterval(timer);
    timer = setInterval(next, HERO_CAROUSEL_INTERVAL_MS);
  };

  container.querySelector("#hero-next").addEventListener("click", (e) => {
    e.preventDefault();
    next();
    restart();
  });
  container.querySelector("#hero-prev").addEventListener("click", (e) => {
    e.preventDefault();
    prev();
    restart();
  });
  dotEls.forEach((el) =>
    el.addEventListener("click", () => {
      show(+el.dataset.i);
      restart();
    })
  );

  show(0);
  restart();
}

function renderTicker(articles, container) {
  const items = articles
    .slice(0, 6)
    .map(
      (a) => `
        <a class="font-body-md text-body-md text-on-surface hover:text-primary transition-colors flex items-center gap-2 pr-16"
           href="${articleHref(a.id)}">
            <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
            ${escapeHtml(a.title)}
        </a>
    `
    )
    .join("");
  // Duplicate for seamless infinite scroll
  container.innerHTML = items + items;
}

function renderFeatured(article, container) {
  const style = categoryStyle(article.category);
  container.innerHTML = `
        <a href="${articleHref(article.id)}" class="group relative bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col md:flex-row hover:border-primary transition-colors duration-300">
            <div class="w-full md:w-2/5 h-64 md:h-auto relative bg-surface-container-low">
                <div class="absolute inset-0 bg-gradient-to-br from-primary-container to-tertiary-container opacity-90 mix-blend-multiply"></div>
                ${article.image ? `<img alt="${escapeHtml(article.title)}" class="w-full h-full object-cover" loading="lazy" src="${article.image}"/>` : ""}
                <div class="absolute top-4 left-4">
                    <span class="inline-block ${style.bg} ${style.text} px-2 py-1 rounded text-label-md font-label-md uppercase tracking-wide shadow-sm">${escapeHtml(article.category)}</span>
                </div>
            </div>
            <div class="p-stack-lg flex flex-col justify-center w-full md:w-3/5 bg-surface">
                <div class="flex items-center space-x-2 mb-stack-sm text-secondary font-label-md text-label-md">
                    <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span>${formatDateLong(article.date)}</span>
                </div>
                <h2 class="text-headline-lg font-headline-lg text-primary mb-stack-md group-hover:text-surface-tint transition-colors">${escapeHtml(article.title)}</h2>
                <p class="text-body-lg font-body-lg text-on-surface-variant mb-stack-lg">${escapeHtml(article.excerpt)}</p>
                <span class="inline-flex items-center text-primary font-label-md text-label-md hover:underline">
                    Read Full Article <span class="material-symbols-outlined ml-1 text-[18px]">arrow_forward</span>
                </span>
            </div>
        </a>
    `;
}

function renderCard(article) {
  const style = categoryStyle(article.category);
  return `
        <a href="${articleHref(article.id)}" class="bg-surface border border-outline-variant rounded-lg p-stack-md flex flex-col hover:border-primary-fixed-dim transition-colors">
            <div class="flex justify-between items-start mb-stack-md">
                <span class="inline-block ${style.bg} ${style.text} px-2 py-1 rounded text-label-md font-label-md">${escapeHtml(article.category)}</span>
                <span class="text-secondary font-label-md text-label-md">${formatDate(article.date)}</span>
            </div>
            <h3 class="text-headline-md font-headline-md text-primary mb-stack-sm">${escapeHtml(article.title)}</h3>
            <p class="text-body-md font-body-md text-on-surface-variant mb-stack-md flex-grow">${escapeHtml(article.excerpt)}</p>
            <span class="inline-flex items-center text-primary font-label-md text-label-md hover:underline mt-auto">
                Read more <span class="material-symbols-outlined ml-1 text-[16px]">arrow_forward</span>
            </span>
        </a>
    `;
}

async function renderArticlePage(id) {
  const articles = await loadArticles();
  const article = articles.find((a) => a.id === id);
  const root = document.getElementById("article-root");

  if (!article) {
    root.innerHTML = `
            <p class="font-body-lg text-body-lg text-secondary mb-stack-md">Article not found.</p>
            <a href="news.html" class="text-primary hover:underline font-label-md text-label-md">← Back to News</a>
        `;
    return;
  }

  document.title = `${article.title} - LA Science Fair`;
  const style = categoryStyle(article.category);

  const mdRes = await fetch(`news/posts/${article.file}.md`);
  const md = await mdRes.text();
  const bodyHtml = window.marked ? marked.parse(md) : `<pre>${escapeHtml(md)}</pre>`;

  root.innerHTML = `
        <a href="news.html" class="inline-flex items-center text-secondary hover:text-primary mb-stack-md font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
            Back to News
        </a>
        <div class="mb-stack-md">
            <span class="inline-block ${style.bg} ${style.text} px-3 py-1 rounded text-label-md font-label-md uppercase tracking-wide">${escapeHtml(article.category)}</span>
        </div>
        <h1 class="font-headline-xl text-headline-xl text-primary mb-stack-md">${escapeHtml(article.title)}</h1>
        <div class="flex items-center text-secondary font-label-md text-label-md mb-stack-lg">
            <span class="material-symbols-outlined text-[16px] mr-1">calendar_today</span>
            <span>${formatDateLong(article.date)}</span>
        </div>
        ${article.image ? `<img class="w-full rounded-lg mb-stack-lg" src="${article.image}" alt="${escapeHtml(article.title)}"/>` : ""}
        <div class="prose prose-lg max-w-none">${bodyHtml}</div>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const ticker = document.getElementById("news-ticker");
  const featured = document.getElementById("news-featured");
  const grid = document.getElementById("news-grid");
  const heroCarousel = document.getElementById("hero-carousel");
  const articleRoot = document.getElementById("article-root");

  if (ticker || featured || grid || heroCarousel) {
    const articles = await loadArticles();
    if (heroCarousel) renderHeroCarousel(articles, heroCarousel);
    if (ticker) renderTicker(articles, ticker);

    if (featured || grid) {
      const ACTIVE_BTN =
        "w-full text-left font-label-md text-label-md text-primary bg-surface-container-low px-3 py-2 rounded";
      const INACTIVE_BTN =
        "w-full text-left font-label-md text-label-md text-secondary hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded transition-colors";

      function applyFilter(category) {
        if (category === "all") {
          if (featured) {
            const f = articles.find((a) => a.featured) || articles[0];
            renderFeatured(f, featured);
            if (grid)
              grid.innerHTML = articles
                .filter((a) => a !== f)
                .map(renderCard)
                .join("");
          } else if (grid) {
            grid.innerHTML = articles.map(renderCard).join("");
          }
        } else {
          if (featured) featured.innerHTML = "";
          const matching = articles.filter((a) => a.category === category);
          if (grid) {
            grid.innerHTML = matching.length
              ? matching.map(renderCard).join("")
              : '<p class="md:col-span-2 text-secondary text-center py-stack-lg font-body-md text-body-md">No articles in this category yet.</p>';
          }
        }
      }

      applyFilter("all");

      const buttons = document.querySelectorAll("aside ul button");
      buttons.forEach((btn) => {
        const text = btn.textContent.replace(/\s+/g, " ").trim();
        const category = text === "All Updates" ? "all" : text;
        btn.addEventListener("click", () => {
          buttons.forEach((b) => (b.className = b === btn ? ACTIVE_BTN : INACTIVE_BTN));
          applyFilter(category);
        });
      });
    }
  }

  if (articleRoot) {
    const id = new URLSearchParams(location.search).get("id");
    if (id) renderArticlePage(id);
    else articleRoot.innerHTML = '<p class="text-secondary">No article specified.</p>';
  }
});
