const _base = document.currentScript
  ? document.currentScript.src.replace(/\/js\/components\.js.*$/, "")
  : "";

document.addEventListener("DOMContentLoaded", async () => {
  async function inject(id, url) {
    const res = await fetch(_base + "/" + url);
    const html = await res.text();
    const el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  await Promise.all([
    inject("site-header", "components/header.html"),
    inject("site-footer", "components/footer.html"),
  ]);

  let currentPage = location.pathname.split("/").pop() || "home.html";
  if (currentPage === "article.html") currentPage = "news.html";
  document.querySelectorAll("header nav a[data-page]").forEach((a) => {
    if (a.dataset.page === currentPage) {
      a.classList.add("font-bold", "border-b-2", "border-on-primary", "pb-1");
    }
  });
});
