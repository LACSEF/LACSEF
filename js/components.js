const _base = document.currentScript
  ? document.currentScript.src.replace(/\/js\/components\.js.*$/, "")
  : "";

document.addEventListener("DOMContentLoaded", async () => {
  async function inject(id, url) {
    const res = await fetch(_base + "/" + url);
    const tmp = document.createElement("template");
    tmp.innerHTML = await res.text();
    // Resolve relative <a href> values against the site root so the injected
    // header/footer nav works from any depth (e.g. /students/foo.html or
    // /news/posts/bar.html). Skip absolute URLs, fragments, mailto/tel, etc.
    tmp.content.querySelectorAll("a[href]").forEach((a) => {
      const v = a.getAttribute("href");
      if (v && !/^(?:[a-z][a-z0-9+.-]*:|#|\/\/|\/)/i.test(v)) {
        a.setAttribute("href", _base + "/" + v);
      }
    });
    const el = document.getElementById(id);
    if (el) el.outerHTML = tmp.innerHTML;
  }

  await Promise.all([
    inject("site-header", "components/header.html"),
    inject("site-footer", "components/footer.html"),
  ]);

  const yearEl = document.getElementById("copyright-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let currentPage = location.pathname.split("/").pop() || "index.html";
  if (currentPage && !currentPage.includes(".")) currentPage += ".html";
  if (currentPage === "article.html") currentPage = "news.html";
  document.querySelectorAll("header nav a[data-page]").forEach((a) => {
    if (a.dataset.page === currentPage) {
      a.classList.add("font-bold", "border-b-2", "border-on-primary", "pb-1");
    }
  });

  const toggle = document.getElementById("mobile-nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    const icon = toggle.querySelector(".material-symbols-outlined");
    toggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("hidden") === false;
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (icon) icon.textContent = isOpen ? "close" : "menu";
    });
    mobileNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileNav.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
        if (icon) icon.textContent = "menu";
      });
    });
  }
});
