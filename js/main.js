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
    { name: "Brad Miller", org: "Community Notes, SpaceXSI", url: "https://bradmiller.github.io", img: "images/organizers/brad-miller.jpg" },
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

/* ------------------------------------------------------------------
   Site navigation — one entry per page, rendered as the sidebar tree and the
   mobile menu. `sections` lists [id, label] pairs matching the page's markup;
   they are shown expanded on that page and behind a chevron elsewhere. Pages
   without sections render as a plain row.
   ------------------------------------------------------------------ */
const NAV = [
  {
    file: "index.html", label: "Overview",
    sections: [
      ["overview", "Introduction"],
      ["task", "The task"],
      ["timeline", "Timeline"],
      ["evaluation", "Evaluation"],
      ["prizes", "Prizes & support"],
      ["participate", "Participation"],
      ["organizers", "Organizers"],
      ["contact", "Communication"],
    ],
  },
  {
    file: "announcements.html", label: "Announcements",
    sections: [
      ["harnyx-credits", "Harnyx awards"],
      ["sensitive-content", "Sensitive content"],
      ["parallel-credits", "Parallel awards"],
    ],
  },
  {
    file: "tips.html", label: "Tips",
    sections: [
      ["admission", "Earn admission fast"],
      ["latency", "Limit latency"],
      ["engagement", "Leverage engagement"],
      ["selective", "Be selective"],
      ["data", "Use the data"],
    ],
  },
  {
    file: "resources.html", label: "Resources",
    sections: [
      ["docs", "Docs"],
      ["data", "Data"],
      ["code", "Code"],
      ["papers", "Papers"],
    ],
  },
];

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
    `<p class="contact__note">You can reach the organizers at
     <a href="mailto:${CONFIG.contactEmail}">${CONFIG.contactEmail}</a>. After registration, you should receive an
     invite to the WSDM Cup Discord server within 24 hours. If you do not receive a Discord invite, please contact the
     organizers by email.</p>`;
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

/* Navigation tree (sidebar and mobile menu), rendered from NAV */
function currentPage() {
  // Hosts may serve pages without the .html extension (e.g. Netlify's pretty
  // URLs turn tips.html into /tips), so match on the name alone. The site root
  // and anything unrecognized are the overview.
  const name = decodeURIComponent(location.pathname)
    .replace(/\/+$/, "")
    .split("/")
    .pop()
    .replace(/\.html$/, "");
  const page = NAV.find((p) => p.file.replace(/\.html$/, "") === name);
  return page ? page.file : "index.html";
}

function renderNavTree(container, idPrefix) {
  if (!container) return;
  const here = currentPage();
  container.innerHTML =
    `<ol class="navtree">` +
    NAV.map((p) => {
      const current = p.file === here;
      const row = `<a class="navtree__page" href="${current ? "#top" : p.file}"${current ? ' aria-current="page"' : ""}>${p.label}</a>`;
      if (!p.sections || !p.sections.length) {
        return `
        <li class="navtree__item${current ? " is-current" : ""}">
          <div class="navtree__row">${row}</div>
        </li>`;
      }
      const listId = `${idPrefix}-${p.file.replace(/\W/g, "")}`;
      const sections = p.sections
        .map(([id, label]) => `<li><a href="${current ? "" : p.file}#${id}">${label}</a></li>`)
        .join("");
      return `
        <li class="navtree__item${current ? " is-current is-open" : ""}">
          <div class="navtree__row">
            ${row}
            <button class="navtree__toggle" type="button" aria-expanded="${current}" aria-controls="${listId}" aria-label="${p.label} sections"></button>
          </div>
          <ol class="navtree__sections" id="${listId}">${sections}</ol>
        </li>`;
    }).join("") +
    `</ol>`;

  container.querySelectorAll(".navtree__toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.closest(".navtree__item").classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
}

function initSidebar() {
  renderNavTree(document.querySelector(".toc"), "toc");
}

/* Scroll-spy for the current page's sections in the sidebar */
function initScrollSpy() {
  const links = [...document.querySelectorAll('.toc .navtree__sections a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;

  const setActive = (id) =>
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));

  // Nothing intersects while the hero is on screen, so start on the first section.
  setActive(sections[0].id);

  const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  const observer = new IntersectionObserver(
    (entries) => {
      if (atBottom()) return;
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    },
    { rootMargin: "-20% 0px -65% 0px" }
  );
  sections.forEach((s) => observer.observe(s));

  // A short final section may never reach the observed band, so at the end of
  // the page mark the last section active.
  window.addEventListener("scroll", () => { if (atBottom()) setActive(sections[sections.length - 1].id); }, { passive: true });
}

/* Mobile menu */
function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.getElementById("mobile-nav");
  if (!toggle || !panel) return;

  // Same tree as the sidebar, followed by any external links in the top bar
  // (e.g. the conference site).
  renderNavTree(panel, "mnav");
  const externalLinks = [...document.querySelectorAll(".topnav .topnav__ext")]
    .map((a) => `<a class="mobile-nav__ext" href="${a.href}" target="_blank" rel="noopener">${a.textContent}</a>`);
  panel.insertAdjacentHTML("beforeend", externalLinks.join(""));

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
  initSidebar();
  initScrollSpy();
  initMobileNav();
  initHeader();
});
