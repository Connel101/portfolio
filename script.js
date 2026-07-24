const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sections = [...document.querySelectorAll("main section[id]")];
const progressBar = document.querySelector("[data-reading-progress]");
const revealItems = [...document.querySelectorAll(".reveal")];
const systemWorkbench = document.querySelector("[data-system-map]");
const systemNodes = [...document.querySelectorAll("[data-system-node]")];
const relatedItems = [...document.querySelectorAll("[data-related]")];

const systemContent = {
  acquisition: {
    kicker: "Stage 01 / Acquisition",
    title: "Turning difficult sources into usable data",
    description:
      "Automated collection and digitisation using browser automation, web scraping, OCR, and structured ingestion pipelines.",
    tags: ["Playwright", "BeautifulSoup", "UiPath", "OCR"],
  },
  intelligence: {
    kicker: "Stage 02 / Processing & AI",
    title: "Extracting structure, meaning, and useful signals",
    description:
      "Document understanding, classification, computer vision, and AI-assisted extraction that convert unstructured inputs into dependable business data.",
    tags: ["Python", "Document AI", "Computer vision", "Classification"],
  },
  search: {
    kicker: "Stage 03 / Search & Storage",
    title: "Making large datasets fast to navigate",
    description:
      "Relational storage, optimised indexing, Elasticsearch, and vector similarity techniques designed for accurate, high-performance retrieval.",
    tags: ["PostgreSQL", "SQL Server", "Elasticsearch", "Vector search"],
  },
  delivery: {
    kicker: "Stage 04 / APIs & Delivery",
    title: "Connecting the result to people and systems",
    description:
      "Backend services, REST APIs, business applications, and enterprise integrations that put processed information into practical use.",
    tags: ["Django", "Flask", "REST APIs", "Docker"],
  },
};

function setMenu(open) {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

function updateProgress() {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: reducedMotion.matches ? 0 : 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
  if (systemWorkbench) revealObserver.observe(systemWorkbench);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const activeId = visible.target.id;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-24% 0px -62% 0px",
      threshold: [0, 0.15, 0.4],
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  systemWorkbench?.classList.add("is-visible");
}

function renderSystemDetail(systemKey) {
  const content = systemContent[systemKey];
  if (!content || !systemWorkbench) return;

  systemWorkbench.querySelector("[data-system-kicker]").textContent = content.kicker;
  systemWorkbench.querySelector("[data-system-title]").textContent = content.title;
  systemWorkbench.querySelector("[data-system-description]").textContent =
    content.description;

  const tags = systemWorkbench.querySelector("[data-system-tags]");
  tags.replaceChildren(
    ...content.tags.map((tag) => {
      const item = document.createElement("li");
      item.textContent = tag;
      return item;
    }),
  );

  systemNodes.forEach((node) => {
    const selected = node.dataset.systemNode === systemKey;
    node.classList.toggle("is-active", selected);
    node.setAttribute("aria-pressed", String(selected));
  });

  relatedItems.forEach((item) => {
    const relationships = item.dataset.related?.split(/\s+/) ?? [];
    const related = relationships.includes(systemKey);
    item.classList.toggle("is-related", related);
    item.classList.toggle("is-muted", !related);
  });
}

systemNodes.forEach((node, index) => {
  node.addEventListener("click", () => renderSystemDetail(node.dataset.systemNode));
  node.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const nextIndex = backwards
      ? (index - 1 + systemNodes.length) % systemNodes.length
      : (index + 1) % systemNodes.length;
    systemNodes[nextIndex].focus();
    renderSystemDetail(systemNodes[nextIndex].dataset.systemNode);
  });
});

document.querySelectorAll("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});

window.addEventListener("beforeprint", () => {
  revealItems.forEach((item) => item.classList.add("is-visible"));
});
