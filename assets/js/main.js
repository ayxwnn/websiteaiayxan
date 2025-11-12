import { ALIENS, ALIENS_BY_ID } from "./data.js";

const TIMELINE = [
  {
    id: "season-1",
    season: "Season 1 — The Original Series",
    year: "2005",
    summary:
      "Ben discovers the Omnitrix during a summer road trip with Gwen and Grandpa Max, facing off against Vilgax and learning to control the classic ten aliens.",
    highlights: ["heatblast", "xlr8", "four-arms"],
  },
  {
    id: "season-2",
    season: "Season 2 — Expanding Threats",
    year: "2006",
    summary:
      "New villains emerge and Ben unlocks deeper Omnitrix secrets while juggling family life, resulting in more strategic use of the alien roster.",
    highlights: ["diamondhead", "ghostfreak", "ripjaws"],
  },
  {
    id: "season-3",
    season: "Season 3 — High Stakes Heroes",
    year: "2006",
    summary:
      "Ben faces intergalactic trials, unearths the Omnitrix’s origins, and begins training for larger conflicts that test his courage and leadership.",
    highlights: ["upgrade", "wildmutt", "stinkfly"],
  },
  {
    id: "season-4",
    season: "Season 4 — Race Against Time",
    year: "2007",
    summary:
      "Time-disrupting enemies force Ben to adapt quickly, combining old-school tactics with Omnitrix upgrades while preparing for the future.",
    highlights: ["heatblast", "diamondhead", "grey-matter"],
  },
];

const isPrefersReduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  injectCurrentYear();
  renderFeaturedAliens();
  setupAliensPage();
  setupAlienModal();
  setupOmnitrix();
  renderTimeline();
  setupTimelineAnimations();
});

function setupNavigation() {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  const page = document.body.dataset.page;
  const navLinks = document.querySelectorAll("[data-nav-link]");

  if (page && navLinks.length) {
    navLinks.forEach((link) => {
      if (link.dataset.navLink === page) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (!nav || !navToggle) return;

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open");
    if (!expanded) {
      navToggle.setAttribute("aria-label", "Close navigation");
      navToggle.classList.add("is-active");
    } else {
      navToggle.setAttribute("aria-label", "Open navigation");
      navToggle.classList.remove("is-active");
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

function injectCurrentYear() {
  const yearEls = document.querySelectorAll("[data-current-year]");
  const year = new Date().getFullYear();
  yearEls.forEach((el) => {
    el.textContent = year;
  });
}

function renderFeaturedAliens() {
  const container = document.querySelector("[data-featured-aliens]");
  if (!container) return;

  const featured = [...ALIENS]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  container.innerHTML = featured
    .map((alien) => createAlienCardMarkup(alien, { compact: true }))
    .join("");
}

function createAlienCardMarkup(alien, options = {}) {
  const compact = Boolean(options.compact);
  const powerPercent = Math.round((alien.powerLevel / 10) * 100);

  const cardAttributes = compact
    ? ""
    : ` data-alien-id="${alien.id}" tabindex="-1"`;

  return `
    <article class="alien-card ${compact ? "alien-card--compact" : ""}"${cardAttributes}>
      <figure class="alien-card__media">
        <img src="${alien.img}" alt="${alien.name} portrait" loading="lazy" width="400" height="400">
      </figure>
      <div class="alien-card__content">
        <header>
          <h3 class="alien-card__title">${alien.name}</h3>
          <p class="alien-card__subtitle">${alien.species} • ${alien.homePlanet}</p>
        </header>
        <div class="alien-card__meta">
          <span class="alien-card__label">Power Level</span>
          <div class="power-meter" role="img" aria-label="${alien.name} power level ${alien.powerLevel} of 10">
            <div class="power-meter__fill" style="width:${powerPercent}%"></div>
          </div>
        </div>
        ${
          compact
            ? `<p class="alien-card__summary">${alien.summary.slice(0, 140)}...</p>`
            : `<p class="alien-card__summary">${alien.summary}</p>`
        }
        ${
          compact
            ? `<a class="button button-secondary" href="aliens.html#${alien.id}" data-nav-skip>View Alien</a>`
            : `<button class="button button-primary" data-alien-modal-trigger data-alien-id="${alien.id}">View details</button>`
        }
      </div>
    </article>
  `;
}

function setupAliensPage() {
  const grid = document.querySelector("[data-alien-grid]");
  if (!grid) return;

  const searchInput = document.querySelector("[data-alien-search]");
  const filterSelect = document.querySelector("[data-alien-filter]");
  const sortToggle = document.querySelector("[data-alien-sort]");
  const resultsCount = document.querySelector("[data-alien-count]");

  const planets = [
    ...new Set(
      ALIENS.map((alien) => alien.homePlanet).sort((a, b) =>
        a.localeCompare(b)
      )
    ),
  ];

  if (filterSelect) {
    filterSelect.innerHTML =
      `<option value="all">All home planets</option>` +
      planets.map((planet) => `<option value="${planet}">${planet}</option>`).join("");
  }

  const state = {
    search: "",
    planet: "all",
    sort: "desc",
  };

  const render = () => {
    let filtered = ALIENS.filter((alien) => {
      const matchesSearch = alien.name
        .toLowerCase()
        .includes(state.search.toLowerCase());
      const matchesPlanet =
        state.planet === "all" || alien.homePlanet === state.planet;
      return matchesSearch && matchesPlanet;
    });

    filtered.sort((a, b) => {
      if (state.sort === "asc") {
        return a.powerLevel - b.powerLevel;
      }
      return b.powerLevel - a.powerLevel;
    });

    if (resultsCount) {
      resultsCount.textContent = `${filtered.length} alien${
        filtered.length === 1 ? "" : "s"
      }`;
    }

    grid.innerHTML = filtered
      .map((alien) => createAlienCardMarkup(alien))
      .join("");

    attachAlienModalEvents();

    const hash = window.location.hash.replace("#", "");
    if (hash && ALIENS_BY_ID[hash]) {
      focusAlienCard(hash);
    }
  };

  const handleSearch = (event) => {
    state.search = event.target.value.trim();
    render();
  };

  const handleFilter = (event) => {
    state.planet = event.target.value;
    render();
  };

  const handleSort = () => {
    state.sort = state.sort === "desc" ? "asc" : "desc";
    if (sortToggle) {
      sortToggle.setAttribute(
        "aria-label",
        state.sort === "desc"
          ? "Sort by power level, strongest first"
          : "Sort by power level, weakest first"
      );
      sortToggle.dataset.sortDirection = state.sort;
      sortToggle.textContent =
        state.sort === "desc" ? "Highest power" : "Lowest power";
    }
    render();
  };

  searchInput?.addEventListener("input", handleSearch);
  filterSelect?.addEventListener("change", handleFilter);
  sortToggle?.addEventListener("click", handleSort);

  render();
}

function focusAlienCard(id) {
  const card = document.querySelector(`[data-alien-id="${id}"]`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.focus({ preventScroll: true });
  }
}

function setupAlienModal() {
  const modal = document.querySelector("[data-alien-modal]");
  if (!modal) return;

  const closeButton = modal.querySelector("[data-modal-close]");
  const overlay = modal.querySelector("[data-modal-overlay]");

  const closeModal = () => {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    const opener = document.querySelector("[data-modal-last-focus]");
    if (opener) {
      opener.removeAttribute("data-modal-last-focus");
      opener.focus({ preventScroll: true });
    }
  };

  closeButton?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", closeModal);

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
    if (event.key === "Tab") {
      trapFocus(modal, event);
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-alien-modal-trigger]");
    if (!trigger) return;

    const alienId = trigger.dataset.alienId;
    const alien = ALIENS_BY_ID[alienId];
    if (!alien) return;

    trigger.setAttribute("data-modal-last-focus", "true");
    populateAlienModal(modal, alien);
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    closeButton?.focus({ preventScroll: true });
  });
}

function attachAlienModalEvents() {
  // This function ensures dynamically inserted cards have accessible attributes
  const cardButtons = document.querySelectorAll(
    "[data-alien-modal-trigger]:not([tabindex])"
  );
  cardButtons.forEach((button) => {
    button.setAttribute("tabindex", "0");
  });
}

function populateAlienModal(modal, alien) {
  const title = modal.querySelector("[data-modal-title]");
  const subtitle = modal.querySelector("[data-modal-subtitle]");
  const summary = modal.querySelector("[data-modal-summary]");
  const abilities = modal.querySelector("[data-modal-abilities]");
  const appearance = modal.querySelector("[data-modal-appearance]");
  const img = modal.querySelector("[data-modal-img]");
  const powerMeter = modal.querySelector("[data-modal-power]");
  const unlocked = modal.querySelector("[data-modal-unlocked]");

  if (title) title.textContent = alien.name;
  if (subtitle)
    subtitle.textContent = `${alien.species} • ${alien.homePlanet}`;
  if (summary) summary.textContent = alien.summary;
  if (appearance) appearance.textContent = alien.firstAppearance;
  if (unlocked) unlocked.textContent = `Unlocked by: ${alien.unlockedBy}`;
  if (img) {
    img.src = alien.img;
    img.alt = `${alien.name} portrait`;
  }
  if (abilities) {
    abilities.innerHTML = alien.abilities
      .map((ability) => `<li>${ability}</li>`)
      .join("");
  }
  if (powerMeter) {
    const fill = powerMeter.querySelector(".power-meter__fill");
    if (fill) {
      fill.style.width = `${(alien.powerLevel / 10) * 100}%`;
      fill.setAttribute("aria-label", `${alien.name} power ${alien.powerLevel}/10`);
    }
  }
}

function trapFocus(container, event) {
  const focusableSelectors =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusable = [...container.querySelectorAll(focusableSelectors)];
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setupOmnitrix() {
  const omnitrix = document.querySelector("[data-omnitrix]");
  if (!omnitrix) return;

  const displayName = document.querySelector("[data-omnitrix-name]");
  const displaySpecies = document.querySelector("[data-omnitrix-species]");
  const displayPower = document.querySelector("[data-omnitrix-power]");
  const displayImage = document.querySelector("[data-omnitrix-image]");

  const spinDuration = isPrefersReduceMotion ? 300 : 1200;

  const showAlien = (alien) => {
    if (displayName) displayName.textContent = alien.name;
    if (displaySpecies)
      displaySpecies.textContent = `${alien.species} • ${alien.homePlanet}`;
    if (displayPower)
      displayPower.textContent = `Power level: ${alien.powerLevel}/10`;
    if (displayImage) {
      displayImage.src = alien.img;
      displayImage.alt = `${alien.name} portrait`;
    }
  };

  omnitrix.addEventListener("click", () => {
    omnitrix.classList.add("is-spinning");
    setTimeout(() => {
      const randomAlien = ALIENS[Math.floor(Math.random() * ALIENS.length)];
      showAlien(randomAlien);
      omnitrix.classList.remove("is-spinning");
      omnitrix.setAttribute("aria-live", "polite");
    }, spinDuration);
  });

  // Initialize with the first alien for context
  showAlien(ALIENS[0]);
}

function renderTimeline() {
  const timelineContainer = document.querySelector("[data-timeline]");
  if (!timelineContainer) return;

  timelineContainer.innerHTML = TIMELINE.map((entry) => {
    const highlights = entry.highlights
      .map((id) => ALIENS_BY_ID[id])
      .filter(Boolean);

    return `
      <section class="timeline-card" id="${entry.id}">
        <header class="timeline-card__header">
          <h3>${entry.season}</h3>
          <span class="timeline-card__year">${entry.year}</span>
        </header>
        <p class="timeline-card__summary">${entry.summary}</p>
        <div class="timeline-card__aliens">
          ${highlights
            .map(
              (alien) => `
                <figure class="timeline-card__alien">
                  <img src="${alien.img}" alt="${alien.name} highlight" loading="lazy" width="160" height="160">
                  <figcaption>${alien.name}</figcaption>
                </figure>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }).join("");
}

function setupTimelineAnimations() {
  const timelineContainer = document.querySelector("[data-timeline]");
  if (!timelineContainer || isPrefersReduceMotion) return;

  const cards = timelineContainer.querySelectorAll(".timeline-card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  cards.forEach((card) => observer.observe(card));
}
