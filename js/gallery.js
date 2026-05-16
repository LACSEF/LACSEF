const PAGE_SIZE = 12;

let allPhotos = [];
let activeYear = "all";
let currentPage = 1;

function getYears(photos) {
  return [...new Set(photos.map((p) => p.year))].sort((a, b) => b - a);
}

function sorted() {
  const pool = activeYear === "all" ? allPhotos : allPhotos.filter((p) => p.year === activeYear);
  return pool.slice().sort((a, b) => a.year - b.year);
}

function renderGrid(gridContainer, paginationContainer) {
  const photos = sorted();
  const totalPages = Math.max(1, Math.ceil(photos.length / PAGE_SIZE));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagePhotos = photos.slice(start, start + PAGE_SIZE);

  if (!photos.length) {
    gridContainer.innerHTML =
      '<p class="col-span-full text-center font-body-md text-body-md text-secondary py-stack-xl">No photos for this year yet.</p>';
    paginationContainer.innerHTML = "";
    return;
  }

  gridContainer.innerHTML = pagePhotos
    .map(
      (p, i) => `
    <button
      type="button"
      data-index="${start + i}"
      class="gallery-item group relative overflow-hidden rounded-xl bg-surface-container-low aspect-[4/3] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <img
        loading="lazy"
        src="${p.src}"
        alt="${p.alt}"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
        <span class="translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full px-4 py-3 font-label-md text-label-md text-white">
          ${p.caption}
        </span>
      </div>
    </button>`
    )
    .join("");

  gridContainer.querySelectorAll(".gallery-item").forEach((el) => {
    el.addEventListener("click", () => openLightbox(+el.dataset.index));
  });

  renderPagination(
    paginationContainer,
    totalPages,
    currentPage,
    gridContainer,
    paginationContainer
  );
}

function renderPagination(container, total, current, gridContainer, paginationContainer) {
  if (total <= 1) {
    container.innerHTML = "";
    return;
  }

  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const ACTIVE =
    "w-9 h-9 flex items-center justify-center rounded font-label-md text-label-md bg-primary-container text-on-primary";
  const INACTIVE =
    "w-9 h-9 flex items-center justify-center rounded font-label-md text-label-md text-primary hover:bg-surface-container-low transition-colors";
  const ARROW =
    "w-9 h-9 flex items-center justify-center rounded text-primary hover:bg-surface-container-low transition-colors";
  const ARROW_DISABLED =
    "w-9 h-9 flex items-center justify-center rounded text-outline cursor-not-allowed";

  container.innerHTML = `
    <nav aria-label="Gallery pagination" class="flex items-center gap-1 justify-center pt-stack-lg border-t border-outline-variant mt-stack-md">
      <button class="${current === 1 ? ARROW_DISABLED : ARROW}" data-page="${current - 1}" ${current === 1 ? "disabled" : ""} aria-label="Previous page">
        <span class="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>
      ${pages
        .map((p) =>
          p === "..."
            ? `<span class="w-9 h-9 flex items-center justify-center text-secondary font-label-md text-label-md select-none">&hellip;</span>`
            : `<button class="${p === current ? ACTIVE : INACTIVE}" data-page="${p}" aria-label="Page ${p}"${p === current ? ' aria-current="page"' : ""}>${p}</button>`
        )
        .join("")}
      <button class="${current === total ? ARROW_DISABLED : ARROW}" data-page="${current + 1}" ${current === total ? "disabled" : ""} aria-label="Next page">
        <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>
    </nav>
  `;

  container.querySelectorAll("button[data-page]:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = +btn.dataset.page;
      renderGrid(gridContainer, paginationContainer);
      gridContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderFilters(filtersContainer, gridContainer, paginationContainer) {
  const years = getYears(allPhotos);
  const BTN_ACTIVE =
    "font-label-md text-label-md px-4 py-2 rounded-full bg-primary-container text-on-primary transition-colors";
  const BTN_INACTIVE =
    "font-label-md text-label-md px-4 py-2 rounded-full border border-outline-variant text-primary hover:bg-surface-variant transition-colors";

  const all = document.createElement("button");
  all.type = "button";
  all.textContent = "All Years";
  all.className = activeYear === "all" ? BTN_ACTIVE : BTN_INACTIVE;
  all.addEventListener("click", () =>
    setYear("all", gridContainer, filtersContainer, paginationContainer)
  );
  filtersContainer.appendChild(all);

  years.forEach((y) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = y;
    btn.className = activeYear === y ? BTN_ACTIVE : BTN_INACTIVE;
    btn.addEventListener("click", () =>
      setYear(y, gridContainer, filtersContainer, paginationContainer)
    );
    filtersContainer.appendChild(btn);
  });
}

function setYear(year, gridContainer, filtersContainer, paginationContainer) {
  activeYear = year;
  currentPage = 1;
  filtersContainer.querySelectorAll("button").forEach((btn) => {
    const match = btn.textContent === "All Years" ? year === "all" : +btn.textContent === year;
    btn.className = match
      ? "font-label-md text-label-md px-4 py-2 rounded-full bg-primary-container text-on-primary transition-colors"
      : "font-label-md text-label-md px-4 py-2 rounded-full border border-outline-variant text-primary hover:bg-surface-variant transition-colors";
  });
  renderGrid(gridContainer, paginationContainer);
}

// Lightbox
let lightboxIndex = 0;

function openLightbox(index) {
  lightboxIndex = index;
  const lb = document.getElementById("gallery-lightbox");
  lb.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  showLightboxPhoto(sorted());
}

function closeLightbox() {
  document.getElementById("gallery-lightbox").classList.add("hidden");
  document.body.style.overflow = "";
}

function showLightboxPhoto(photos) {
  const p = photos[lightboxIndex];
  document.getElementById("lb-img").src = p.src;
  document.getElementById("lb-img").alt = p.alt;
  document.getElementById("lb-caption").textContent = p.caption;
  document.getElementById("lb-counter").textContent = `${lightboxIndex + 1} / ${photos.length}`;
  document.getElementById("lb-prev").disabled = lightboxIndex === 0;
  document.getElementById("lb-next").disabled = lightboxIndex === photos.length - 1;
}

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("gallery-grid");
  const filters = document.getElementById("gallery-filters");
  const pagination = document.getElementById("gallery-pagination");
  if (!grid || !filters || !pagination) return;

  const res = await fetch("data/gallery.json");
  allPhotos = await res.json();

  renderFilters(filters, grid, pagination);
  renderGrid(grid, pagination);

  // Lightbox wiring
  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  document.getElementById("gallery-lightbox").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.getElementById("lb-prev").addEventListener("click", () => {
    if (lightboxIndex > 0) {
      lightboxIndex--;
      showLightboxPhoto(sorted());
    }
  });
  document.getElementById("lb-next").addEventListener("click", () => {
    const photos = sorted();
    if (lightboxIndex < photos.length - 1) {
      lightboxIndex++;
      showLightboxPhoto(photos);
    }
  });
  document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("gallery-lightbox");
    if (lb.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft" && lightboxIndex > 0) {
      lightboxIndex--;
      showLightboxPhoto(sorted());
    }
    if (e.key === "ArrowRight") {
      const photos = sorted();
      if (lightboxIndex < photos.length - 1) {
        lightboxIndex++;
        showLightboxPhoto(photos);
      }
    }
  });
});
