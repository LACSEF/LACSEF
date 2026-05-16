const SPOTLIGHT_COUNT = 5;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderSpotlight(sponsors, container) {
  const picked = shuffle(sponsors).slice(0, SPOTLIGHT_COUNT);
  container.innerHTML = `
    <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-stack-lg gap-2">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-primary mb-1">Our Sponsors</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Supporting LA County student researchers since 1950.
          </p>
        </div>
        <a
          href="sponsors.html"
          class="font-label-md text-label-md text-primary-container flex items-center gap-1 hover:underline shrink-0">
          View all sponsors
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-gutter">
        ${picked
          .map(
            (s) => `
          <div class="bg-surface border border-outline-variant rounded-xl p-stack-md flex items-center justify-center min-h-[120px]">
            <img
              loading="lazy"
              src="${s.image}"
              alt="${s.name}"
              class="max-h-16 max-w-full object-contain" />
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("sponsor-spotlight");
  if (!container) return;
  const res = await fetch("data/sponsors.json");
  const sponsors = await res.json();
  renderSpotlight(sponsors, container);
});
