/* ------------------------------------------------------------------
   Site configuration — edit these values as details are finalized.
   ------------------------------------------------------------------ */
const CONFIG = {
  registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc8bnyofe-M_1THRGfaNxCTEaXX5Qp74354H_FTJJ0-LSmKpg/viewform?usp=dialog",
  registrationOpens: "2026-11-11",

  contactEmail: "noteagents@googlegroups.com",

  // Add channels as they are set up. Each renders as a card above the contact note.
  // Example: { label: "Forum", href: "https://...", desc: "Discussion & help" }
  contact: [],

  // `x` is an X handle (links to x.com); `url` is a personal or academic site.
  // `img` is relative to the site root; omit it to show initials instead.
  organizers: [
    { name: "Brad Miller", org: "Community Notes, SpaceXSI", x: "__bradmiller__", img: "images/organizers/brad-miller.jpg" },
    { name: "Nikil Selvam", org: "Stanford University", url: "https://nikilrs.com", img: "images/organizers/nikil-selvam.png" },
    { name: "Jay Baxter", org: "Community Notes, SpaceXSI", x: "jaybaxter", img: "images/organizers/jay-baxter.jpg" },
    { name: "Jiansong Chao", org: "Community Notes, SpaceXSI" },
    { name: "Soham De", org: "University of Washington", url: "https://sohamde.in", img: "images/organizers/soham-de.jpg" },
    { name: "Sophie Hilgard", org: "Community Notes, SpaceXSI" },
    { name: "Haiwen Li", org: "MIT", url: "https://haiwenli.dev/", img: "images/organizers/haiwen-li.jpg" },
    { name: "Michiel Bakker", org: "MIT", url: "https://miba.dev", img: "images/organizers/michiel-bakker.jpg" },
    { name: "Keith Coleman", org: "Community Notes, SpaceXSI", x: "kcoleman", img: "images/organizers/keith-coleman.jpg" },
    { name: "Sanmi Koyejo", org: "Stanford University", url: "https://cs.stanford.edu/~sanmi/", img: "images/organizers/sanmi-koyejo.jpg" },
    { name: "Ellen Vitercik", org: "Stanford University", url: "https://vitercik.github.io", img: "images/organizers/ellen-vitercik.jpg" },
  ],
};

const fmt = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/* Registration buttons */
function initRegistration() {
  const live = Boolean(CONFIG.registrationUrl);
  document.querySelectorAll(".js-register").forEach((el) => {
    if (live) {
      el.href = CONFIG.registrationUrl;
      el.target = "_blank";
      el.rel = "noopener";
    }
  });

  const btn = document.getElementById("register-btn");
  if (!live && btn) {
    btn.textContent = `Opens ${fmt(CONFIG.registrationOpens)}`;
    btn.classList.add("btn--disabled");
    btn.setAttribute("aria-disabled", "true");
    btn.addEventListener("click", (e) => e.preventDefault());
  }
}

/* Organizers */
function initOrganizers() {
  const list = document.getElementById("people");
  if (!list) return;
  const initials = (n) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
  list.innerHTML = CONFIG.organizers
    .map((p) => {
      const href = p.x ? `https://x.com/${p.x}` : p.url;
      const avatar = p.img
        ? `<img class="person__avatar" src="${p.img}" alt="" loading="lazy">`
        : `<span class="person__avatar" aria-hidden="true">${initials(p.name)}</span>`;
      const inner = `
        ${avatar}
        <span class="person__name">${p.name}</span>
        <span class="person__org">${p.org}</span>`;
      return href
        ? `<li><a class="person" href="${href}" target="_blank" rel="noopener">${inner}</a></li>`
        : `<li><div class="person">${inner}</div></li>`;
    })
    .join("");
}

/* Contact */
function initContact() {
  const box = document.getElementById("contact-links");
  if (!box) return;
  const links = CONFIG.contact
    .map((c) => {
      const external = /^https?:/.test(c.href);
      return `
      <a class="contact__item" href="${c.href}"${external ? ' target="_blank" rel="noopener"' : ""}>
        <span class="contact__label">${c.label}${external ? " ↗" : ""}</span>
        <span class="contact__desc">${c.desc}</span>
      </a>`;
    })
    .join("");
  box.innerHTML =
    links +
    `<p class="contact__note">You may also contact the organizers at
     <a href="mailto:${CONFIG.contactEmail}">${CONFIG.contactEmail}</a>.</p>`;
}

/* Timeline status */
function initTimeline() {
  const now = today();
  const items = [...document.querySelectorAll("#timeline-list li")];
  let currentSet = false;
  items.forEach((li) => {
    const d = new Date(li.dataset.date + "T00:00:00");
    if (d < now) li.classList.add("is-past");
    else if (!currentSet) {
      li.classList.add("is-next");
      currentSet = true;
    }
  });
}

/* Scroll-spy for the sidebar table of contents */
function initScrollSpy() {
  const links = [...document.querySelectorAll(".toc a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;

  const setActive = (id) =>
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));

  // Nothing intersects while the hero is on screen, so start on the first section.
  setActive(sections[0].id);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    },
    { rootMargin: "-20% 0px -65% 0px" }
  );
  sections.forEach((s) => observer.observe(s));
}

/* Mobile menu */
function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.getElementById("mobile-nav");
  if (!toggle || !panel) return;

  const sectionLinks = [...document.querySelectorAll(".toc a")]
    .map((a) => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`);
  // External links in the top bar (e.g. the conference site) are absent from the anonymized build.
  const externalLinks = [...document.querySelectorAll(".topnav .topnav__ext")]
    .map((a) => `<a href="${a.href}" target="_blank" rel="noopener">${a.textContent}</a>`);
  panel.innerHTML = sectionLinks.concat(externalLinks).join("");

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    document.body.classList.remove("nav-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
    document.body.classList.toggle("nav-open", !open);
  });
  panel.addEventListener("click", (e) => e.target.closest("a") && close());
}

/* Header shadow on scroll */
function initHeader() {
  const bar = document.querySelector(".topbar");
  const onScroll = () => bar.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initRegistration();
  initOrganizers();
  initContact();
  initTimeline();
  initScrollSpy();
  initMobileNav();
  initHeader();
});
