/* ==========================================================================
   Internal Cargo Unloading Robot — NASA HUNCH Project
   Vanilla JavaScript. No dependencies, no build step.
   Order:
     1  Helpers
     2  Header, navigation, scroll progress
     3  Scroll reveal
     4  Build-step accordion
     5  Image lightbox & missing-image placeholders
     6  Demo sequence stepper
     7  Bill of materials (data, filter, sort, totals)
     8  Test results (localStorage, stats, chart)

   theme.js handles the js/reduced-motion classes and footer year on every page.
   ========================================================================== */

(function () {
  "use strict";

  /* 1 · Helpers ------------------------------------------------------------ */
  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const money = (value) => "$" + Number(value).toLocaleString("en-US");

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatNumber = (value) => {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  };

  /* 2 · Header, navigation & scroll progress ------------------------------- */
  const header = $("#site-header");
  const navToggle = $("#nav-toggle");
  const navMenu = $("#primary-nav");
  const navLinks = $$(".nav a");
  const progressBar = $("#scroll-progress-bar");
  const mobileNav = window.matchMedia("(max-width: 1080px)");
  let navOpen = false;

  function setNav(open) {
    if (!navToggle || !navMenu) return;
    navOpen = open;
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    const label = $(".sr-only", navToggle);
    if (label) label.textContent = open ? "Close menu" : "Open menu";
    // Keep the collapsed mobile menu out of the tab order.
    if (mobileNav.matches) navMenu.inert = !open;
    else navMenu.inert = false;
  }

  if (navToggle && navMenu) {
    if (mobileNav.matches) navMenu.inert = true;
    navToggle.addEventListener("click", () => setNav(!navOpen));

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setNav(false));
    });

    document.addEventListener("click", (event) => {
      if (!navOpen || !header) return;
      if (!header.contains(event.target)) setNav(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navOpen) {
        setNav(false);
        navToggle.focus();
      }
    });

    if (mobileNav.addEventListener) {
      mobileNav.addEventListener("change", () => {
        if (mobileNav.matches) {
          navMenu.inert = !navOpen;
        } else {
          navMenu.inert = false;
          setNav(false);
        }
      });
    }
  }

  // Scroll progress + active section. Throttled to one paint per frame.
  const sectionLinks = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      const section = id && id.startsWith("#") ? $(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  let scrollTicking = false;

  function updateScrollUI() {
    scrollTicking = false;
    const scrollTop = window.scrollY || window.pageYOffset;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      const ratio = max > 0 ? Math.min(scrollTop / max, 1) : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
    }

    if (header) header.classList.toggle("is-scrolled", scrollTop > 8);

    if (sectionLinks.length) {
      const offset = (header ? header.offsetHeight : 0) + 120;
      let currentLink = null;

      sectionLinks.forEach(({ link, section }) => {
        if (section.getBoundingClientRect().top <= offset) currentLink = link;
      });

      // Nearing the bottom, highlight the last linked section (Team/footer).
      if (window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 4) {
        currentLink = sectionLinks[sectionLinks.length - 1].link;
      }

      sectionLinks.forEach(({ link }) => {
        const active = link === currentLink;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", onScroll);
  window.addEventListener("hashchange", onScroll);
  updateScrollUI();

  /* 3 · Scroll reveal ------------------------------------------------------ */
  const revealTargets = $$("[data-reveal]");
  const revealGroups = $$("[data-reveal-group]");

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));

    revealGroups.forEach((group) => {
      // Stagger children slightly for a calmer entrance.
      Array.from(group.children).forEach((child, index) => {
        child.style.transitionDelay = Math.min(index * 60, 300) + "ms";
      });
      observer.observe(group);
    });
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    revealGroups.forEach((el) => el.classList.add("is-visible"));
  }

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      revealTargets.forEach((el) => el.classList.add("is-visible"));
      revealGroups.forEach((el) => el.classList.add("is-visible"));
    });
  }

  /* 4 · Build-step accordion ----------------------------------------------- */
  const accordion = $("#build-accordion");

  if (accordion) {
    const items = $$(".acc__item", accordion);

    items.forEach((item) => {
      const trigger = $(".acc__trigger", item);
      const panel = $(".acc__panel", item);
      if (!trigger || !panel) return;

      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      item.classList.toggle("is-open", isOpen);
      panel.inert = !isOpen;
      panel.setAttribute("aria-hidden", String(!isOpen));

      trigger.addEventListener("click", () => {
        const open = trigger.getAttribute("aria-expanded") !== "true";
        trigger.setAttribute("aria-expanded", String(open));
        item.classList.toggle("is-open", open);
        panel.inert = !open;
        panel.setAttribute("aria-hidden", String(!open));
      });
    });
  }

  /* 5 · Lightbox & image placeholders -------------------------------------- */
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightbox-img");
  const lightboxCaption = $("#lightbox-caption");
  const lightboxCounter = $("#lightbox-counter");
  const lightboxPrev = $("#lightbox-prev");
  const lightboxNext = $("#lightbox-next");
  const lightboxClose = $("#lightbox-close");

  let lightboxItems = [];
  let lightboxIndex = 0;

  function markImageMissing(img) {
    const media = img.closest(".media");
    if (media) {
      media.classList.add("is-missing");
      const placeholder = media.querySelector(".media__placeholder");
      if (placeholder) placeholder.removeAttribute("aria-hidden");
    }
    const trigger = img.closest(".figure-card__btn");
    if (trigger) {
      const file = img.getAttribute("src") || "image";
      trigger.disabled = true;
      trigger.setAttribute("title", "Image not found");
      trigger.setAttribute("aria-label", "Image not found: " + file);
    }
  }

  // Show a labelled placeholder instead of a broken-image icon.
  $$(".media img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) {
      markImageMissing(img);
      return;
    }
    img.addEventListener("error", () => markImageMissing(img), { once: true });
  });

  function getLightboxItems() {
    return $$("[data-lightbox]")
      .filter((trigger) => !trigger.disabled)
      .map((trigger) => {
        const img = $("img", trigger);
        const figure = trigger.closest("figure");
        const title = figure ? $(".figure-card__title", figure) : null;
        const caption = figure ? $("figcaption", figure) : null;
        return {
          trigger,
          src: img ? img.getAttribute("src") : "",
          alt: img ? img.getAttribute("alt") || "" : "",
          caption: caption ? caption.textContent.replace(/\s+/g, " ").trim() : title ? title.textContent.trim() : ""
        };
      })
      .filter((item) => item.src);
  }

  function showLightboxSlide(index) {
    if (!lightboxItems.length || !lightboxImg) return;
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIndex];

    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCounter) lightboxCounter.textContent = lightboxIndex + 1 + " / " + lightboxItems.length;
    if (lightboxPrev) lightboxPrev.disabled = lightboxItems.length < 2;
    if (lightboxNext) lightboxNext.disabled = lightboxItems.length < 2;
  }

  function openLightbox(trigger) {
    if (!lightbox || typeof lightbox.showModal !== "function") return;
    lightboxItems = getLightboxItems();
    const index = lightboxItems.findIndex((item) => item.trigger === trigger);
    if (index < 0) return;

    showLightboxSlide(index);
    document.body.classList.add("no-scroll");
    if (!lightbox.open) lightbox.showModal();
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (lightbox && lightbox.open) lightbox.close();
  }

  $$("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("no-scroll");
      if (lightboxImg) {
        lightboxImg.removeAttribute("src");
        lightboxImg.alt = "";
      }
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showLightboxSlide(lightboxIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showLightboxSlide(lightboxIndex + 1);
      }
    });

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", () => showLightboxSlide(lightboxIndex - 1));
    }
    if (lightboxNext) {
      lightboxNext.addEventListener("click", () => showLightboxSlide(lightboxIndex + 1));
    }
    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }
  }

  /* 6 · Demo sequence stepper ---------------------------------------------- */
  const demoSteps = [
    {
      label: "Start",
      desc: "Operator verifies the aisle is clear, presses Start, and confirms the robot is homed. Nothing moves until this deliberate start."
    },
    {
      label: "Navigate",
      desc: "The robot drives along the clear central aisle to the target cargo position. Distance sensors guard the approach."
    },
    {
      label: "Identify",
      desc: "The operator scans the QR/ID label (a manual scan is fine) and checks the cargo against the manifest checklist."
    },
    {
      label: "Grip",
      desc: "The lift lowers to the bag, the two-finger gripper closes gently, and a short hold check confirms the grip before lifting."
    },
    {
      label: "Lift / transport",
      desc: "The mast raises the bag clear of the rack and the base carries it to the stowage shelf."
    },
    {
      label: "Hand off",
      desc: "The lift lowers into the shelf, the gripper releases, and the robot backs out without disturbing neighboring cargo."
    },
    {
      label: "Update status",
      desc: "The hand-off is marked complete in the manifest and test log, then the robot returns home for the next cycle."
    }
  ];

  const demo = $("#demo");
  const demoStepsEl = $("#demo-steps");
  const demoToggle = $("#demo-toggle");
  const demoReset = $("#demo-reset");
  const demoTitle = $("#demo-title");
  const demoDesc = $("#demo-desc");
  const demoCount = $("#demo-count");
  const demoState = $("#demo-state");
  const demoBar = $("#demo-bar");
  const demoAnnounce = $("#demo-announce");

  let demoIndex = 0;
  let demoPlaying = false;
  let demoTimer = null;
  let demoAutoStarted = false;
  let demoUserInteracted = false;
  let demoButtons = [];

  function syncDemoToggle() {
    if (!demoToggle) return;
    demoToggle.textContent = demoPlaying ? "Pause" : demoIndex === demoSteps.length - 1 ? "Replay" : "Play";
    demoToggle.setAttribute("aria-pressed", String(demoPlaying));
  }

  function setDemoStep(index, options) {
    const opts = options || {};
    demoIndex = Math.max(0, Math.min(index, demoSteps.length - 1));
    const step = demoSteps[demoIndex];

    demoButtons.forEach((button, i) => {
      button.classList.toggle("is-active", i === demoIndex);
      button.classList.toggle("is-done", i < demoIndex);
      if (i === demoIndex) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    if (demoTitle) demoTitle.textContent = step.label;
    if (demoDesc) demoDesc.textContent = step.desc;
    if (demoCount) demoCount.textContent = "Step " + (demoIndex + 1) + " of " + demoSteps.length;
    if (demoBar) demoBar.style.width = ((demoIndex + 1) / demoSteps.length) * 100 + "%";
    if (demoState) demoState.textContent = opts.state || (demoPlaying ? "Running" : "Paused");
    if (opts.announce && demoAnnounce) {
      demoAnnounce.textContent = "Step " + (demoIndex + 1) + ": " + step.label + ". " + step.desc;
    }
    syncDemoToggle();
  }

  function stopDemoTimer() {
    if (demoTimer) {
      window.clearTimeout(demoTimer);
      demoTimer = null;
    }
  }

  function scheduleDemoTick() {
    stopDemoTimer();
    demoTimer = window.setTimeout(() => {
      if (!demoPlaying) return;
      if (demoIndex < demoSteps.length - 1) {
        setDemoStep(demoIndex + 1, { state: "Running" });
        scheduleDemoTick();
      } else {
        demoPlaying = false;
        stopDemoTimer();
        if (demoState) demoState.textContent = "Complete";
        syncDemoToggle();
      }
    }, 2600);
  }

  function playDemo() {
    if (!demoSteps.length) return;
    if (demoIndex === demoSteps.length - 1) setDemoStep(0, { state: "Running" });
    demoPlaying = true;
    demoAutoStarted = true;
    syncDemoToggle();
    if (demoState) demoState.textContent = "Running";
    scheduleDemoTick();
  }

  function pauseDemo() {
    demoPlaying = false;
    stopDemoTimer();
    if (demoState) demoState.textContent = "Paused";
    syncDemoToggle();
  }

  if (demo && demoStepsEl) {
    demoSteps.forEach((step, index) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const num = document.createElement("span");
      const label = document.createElement("span");

      button.type = "button";
      button.className = "demo__step";
      button.setAttribute("aria-label", "Step " + (index + 1) + ": " + step.label);
      num.className = "demo__num";
      num.setAttribute("aria-hidden", "true");
      num.textContent = String(index + 1).padStart(2, "0");
      label.className = "demo__label";
      label.textContent = step.label;

      button.append(num, label);
      button.addEventListener("click", () => {
        stopDemoTimer();
        demoPlaying = false;
        demoUserInteracted = true;
        setDemoStep(index, { state: "Paused", announce: true });
      });

      li.appendChild(button);
      demoStepsEl.appendChild(li);
      demoButtons.push(button);
    });

    setDemoStep(0, { state: "Ready" });

    if (demoToggle) {
      demoToggle.addEventListener("click", () => {
        demoUserInteracted = true;
        if (demoPlaying) pauseDemo();
        else playDemo();
      });
    }

    if (demoReset) {
      demoReset.addEventListener("click", () => {
        demoUserInteracted = true;
        demoPlaying = false;
        stopDemoTimer();
        setDemoStep(0, { state: "Ready", announce: true });
      });
    }

    // Start the loop once when the demo is actually on screen.
    if ("IntersectionObserver" in window && !reduceMotion.matches) {
      const demoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || demoAutoStarted || demoUserInteracted) return;
            playDemo();
            demoObserver.disconnect();
          });
        },
        { threshold: 0.45 }
      );
      demoObserver.observe(demo);
    } else {
      syncDemoToggle();
    }
  }

  /* 7 · Bill of materials -------------------------------------------------- */
  //  ✏️ EDIT PRICES HERE. Prices are approximate US estimates, in dollars.
  //  Add `optional: true` to exclude a part from the totals.
  const bomGroups = [
    {
      id: "frame",
      title: "Frame & Motion",
      subtitle: "Rail, lift, transmission, structure",
      items: [
        { name: "V-slot 2040 extrusion", spec: "X rail, 1 × 1.2 m", price: 18 },
        { name: "T-slot 2020 extrusion", spec: "Uprights, Z column, brace, 4 × 0.5 m", price: 20 },
        { name: "V-wheel gantry plate kit", spec: "X carriage", price: 20 },
        { name: "Mini V-wheel plate", spec: "Z carriage", price: 12 },
        { name: "Brackets, T-nuts, M5 screws", spec: "Assorted fasteners", price: 15 },
        { name: "Plywood base", spec: "¾ in, 2 × 4 ft", price: 20 },
        { name: "NEMA 17 steppers", spec: "2 × ~40 N·cm, 1.5 A", price: 25 },
        { name: "GT2 belt + pulley set", spec: "6 mm belt 3 m, 20T pulley, 2 idlers, clips", price: 15 },
        { name: "T8 lead screw", spec: "8 mm lead, 400–500 mm, anti-backlash nut, coupler, top bearing", price: 18 },
        { name: "NEMA 17 mounts", spec: "2 mounts", price: 8 },
        { name: "Drag chain", spec: "10 × 10 mm, 1 m", price: 8 },
        { name: "M3 hardware", spec: "Screws, standoffs, heat-set inserts", price: 12 }
      ]
    },
    {
      id: "gripper",
      title: "Gripper",
      subtitle: "Jaw, pads, actuation",
      items: [
        { name: "Metal-gear servos", spec: "2 × MG996R or DS3218", price: 20 },
        { name: "PETG filament", spec: "1 kg for jaws and mounts", price: 20 },
        { name: "TPU or rubber shelf liner", spec: "Grip pads", price: 10 },
        { name: "Printed hook", spec: "For bags with handles", price: 0, optional: true }
      ]
    },
    {
      id: "electronics",
      title: "Electronics",
      subtitle: "Control, power, sensing, safety",
      items: [
        { name: "Arduino Mega 2560 + RAMPS 1.4", spec: "Motion controller stack", price: 30 },
        { name: "Stepper drivers", spec: "TMC2209 / DRV8825, 2–3 with heatsinks", price: 25 },
        { name: "12 V 10 A power supply", spec: "Main supply", price: 22 },
        { name: "Buck converter", spec: "12 → 6 V, 5 A servo rail", price: 8 },
        { name: "E-stop switch", spec: "22 mm, normally closed", price: 10 },
        { name: "Fuse holder, fuses, rocker switch", spec: "Incoming power protection", price: 10 },
        { name: "Roller-lever limit switches", spec: "6 switches", price: 8 },
        { name: "VL53L1X time-of-flight sensor", spec: "1–2 distance sensors", price: 15 },
        { name: "Wiring and connectors", spec: "Wire, ferrules, connectors, loom", price: 25 },
        { name: "Joystick + Home/Run/Stop buttons", spec: "Teleop and operator controls", price: 10 },
        { name: "Perfboard, LEDs, buzzer", spec: "Status and wiring", price: 8 },
        { name: "Raspberry Pi + camera", spec: "Optional vision add-on", price: 60, priceLabel: "60–100", optional: true }
      ]
    },
    {
      id: "test",
      title: "Test Environment",
      subtitle: "Mock module, payloads, consumables",
      items: [
        { name: "Mock module frame", spec: "PVC / lumber / foam board, ~1.2 × 0.6 × 0.6 m", price: 25 },
        { name: "Stowage bay", spec: "Bin or shelf with Velcro / elastic", price: 10 },
        { name: "Test pouches + box", spec: "0.5 / 1.0 / 1.5 kg pouches and one box", price: 15 },
        { name: "Consumables", spec: "Thread locker, PTFE or white lithium lube, zip ties, tape", price: 25 }
      ]
    }
  ];

  const bomState = { group: "all", search: "", sortKey: null, sortDir: 1 };
  const bomGroupsEl = $("#bom-groups");
  const bomStatus = $("#bom-status");
  const bomSearch = $("#bom-search");
  const bomSummary = $("#bom-summary");

  const groupSubtotal = (group) =>
    group.items.reduce((sum, item) => sum + (item.optional ? 0 : item.price), 0);

  function sortIcon(key) {
    if (bomState.sortKey !== key) return "↕";
    return bomState.sortDir === 1 ? "▲" : "▼";
  }

  function ariaSort(key) {
    if (bomState.sortKey !== key) return "none";
    return bomState.sortDir === 1 ? "ascending" : "descending";
  }

  function sortButton(key, label) {
    const active = bomState.sortKey === key;
    const direction = active ? (bomState.sortDir === 1 ? "ascending" : "descending") : "";
    return (
      '<button type="button" class="sort-btn" data-sort="' + key + '" data-active="' + active + '" ' +
      'aria-label="Sort by ' + label.toLowerCase() + (direction ? ", " + direction : "") + '">' +
      escapeHtml(label) +
      ' <span class="sort-icon" aria-hidden="true">' + sortIcon(key) + "</span></button>"
    );
  }

  function renderBom() {
    if (!bomGroupsEl) return;
    const query = bomState.search.trim().toLowerCase();
    let visibleCount = 0;
    const totalCount = bomGroups.reduce((sum, group) => sum + group.items.length, 0);
    let html = "";

    bomGroups.forEach((group) => {
      if (bomState.group !== "all" && bomState.group !== group.id) return;

      let items = group.items.filter((item) => {
        if (!query) return true;
        return (item.name + " " + item.spec).toLowerCase().includes(query);
      });

      if (!items.length) return;

      items = items.slice();
      if (bomState.sortKey === "name") {
        items.sort((a, b) => a.name.localeCompare(b.name) * bomState.sortDir);
      } else if (bomState.sortKey === "price") {
        items.sort((a, b) => (a.price - b.price) * bomState.sortDir);
      }

      visibleCount += items.length;

      const rows = items
        .map((item) => {
          const price = item.priceLabel ? item.priceLabel : item.price;
          return (
            '<tr class="' + (item.optional ? "is-optional" : "") + '">' +
            '<td><span class="bom-name">' + escapeHtml(item.name) + "</span>" +
            (item.optional ? ' <span class="badge badge--amber badge--xs">Optional</span>' : "") + "</td>" +
            '<td class="bom-spec">' + escapeHtml(item.spec) + "</td>" +
            '<td class="num">$' + escapeHtml(price) + "</td>" +
            "</tr>"
          );
        })
        .join("");

      html +=
        '<section class="bom-group" data-group="' + group.id + '">' +
        '<div class="bom-group__head"><h3>' + escapeHtml(group.title) + "</h3><p>" + escapeHtml(group.subtitle) + "</p></div>" +
        '<div class="table-wrap"><table class="bom-table">' +
        '<caption class="sr-only">' + escapeHtml(group.title) + " bill of materials</caption>" +
        "<thead><tr>" +
        '<th scope="col" aria-sort="' + ariaSort("name") + '">' + sortButton("name", "Part") + "</th>" +
        '<th scope="col">Spec / qty</th>' +
        '<th scope="col" class="num" aria-sort="' + ariaSort("price") + '">' + sortButton("price", "Est.") + "</th>" +
        "</tr></thead><tbody>" + rows + "</tbody>" +
        '<tfoot><tr><th scope="row" colspan="2">Group subtotal</th><td class="num">' +
        money(groupSubtotal(group)) + "</td></tr></tfoot>" +
        "</table></div></section>";
    });

    if (!visibleCount) {
      html = '<p class="bom-empty">No parts match those filters. Try a different search or choose “All”.</p>';
    }

    bomGroupsEl.innerHTML = html;

    if (bomStatus) {
      if (!visibleCount) {
        bomStatus.textContent = "No parts match · group subtotals include all parts.";
      } else if (visibleCount === totalCount && bomState.group === "all" && !query) {
        bomStatus.textContent =
          "Showing all " + totalCount + " parts · group subtotals include all parts in the group.";
      } else {
        bomStatus.textContent =
          "Showing " + visibleCount + " of " + totalCount + " parts · group subtotals include all parts.";
      }
    }

  }

  function renderBomSummary() {
    if (!bomSummary) return;
    const subtotals = bomGroups.map((group) => ({ title: group.title, value: groupSubtotal(group) }));
    const total = subtotals.reduce((sum, group) => sum + group.value, 0);

    bomSummary.innerHTML =
      subtotals
        .map(
          (group) =>
            '<article class="sum-card"><span class="sum-card__label">' + escapeHtml(group.title) + "</span>" +
            "<strong>" + money(group.value) + '</strong><p>Group subtotal</p></article>'
        )
        .join("") +
      '<article class="sum-card sum-card--total">' +
      '<div class="sum-card__copy"><span class="sum-card__label">Estimated new-parts total</span>' +
      "<strong>" + money(total) + "</strong></div>" +
      "<p>Excludes the optional Raspberry Pi and camera ($60–100). Budget range ≈ $450–600 " +
      "depending on stock and options. Prices approximate; verify before purchasing.</p>" +
      "</article>";
  }

  if (bomGroupsEl) {
    renderBom();
    renderBomSummary();

    if (bomSearch) {
      bomSearch.addEventListener("input", () => {
        bomState.search = bomSearch.value;
        renderBom();
      });
    }

    $$("[data-group-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        bomState.group = button.dataset.groupFilter;
        $$("[data-group-filter]").forEach((other) => {
          const active = other === button;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });
        renderBom();
      });
    });

    bomGroupsEl.addEventListener("click", (event) => {
      const button = event.target.closest(".sort-btn");
      if (!button) return;
      const key = button.dataset.sort;
      if (key !== "name" && key !== "price") return;

      // Remember which group was clicked so focus can return to the same table.
      const groupEl = button.closest(".bom-group");
      const groupId = groupEl ? groupEl.dataset.group : null;

      if (bomState.sortKey === key) bomState.sortDir *= -1;
      else {
        bomState.sortKey = key;
        bomState.sortDir = 1;
      }
      renderBom();

      let nextButton = null;
      if (groupId) {
        nextButton = bomGroupsEl.querySelector('.bom-group[data-group="' + groupId + '"] .sort-btn[data-active="true"]');
      }
      if (!nextButton) nextButton = bomGroupsEl.querySelector('.sort-btn[data-active="true"]');
      if (nextButton) nextButton.focus();
    });
  }

  /* 8 · Test results ------------------------------------------------------- */
  const STORAGE_KEY = "icur-trials-v1";
  const trialForm = $("#trial-form");
  const payloadInput = $("#trial-payload");
  const resultInput = $("#trial-result");
  const timeInput = $("#trial-time");
  const notesInput = $("#trial-notes");
  const trialError = $("#trial-error");
  const storageNote = $("#storage-note");
  const trialsBody = $("#trials-body");
  const trialsStatus = $("#trials-status");
  const clearTrials = $("#clear-trials");
  const chart = $("#cycle-chart");
  const chartWrap = $("#chart-wrap");
  const chartEmpty = $("#chart-empty");
  const chartBadge = $("#chart-badge");

  const statCount = $("#stat-count");
  const statCountNote = $("#stat-count-note");
  const statRate = $("#stat-rate");
  const statRateBadge = $("#stat-rate-badge");
  const statRateNote = $("#stat-rate-note");
  const statAvg = $("#stat-avg");
  const statAvgBadge = $("#stat-avg-badge");
  const statAvgNote = $("#stat-avg-note");
  const rateFill = $("#rate-fill");

  let storageAvailable = true;
  let trials = [];

  try {
    const probe = "__icur_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
  } catch (error) {
    storageAvailable = false;
  }

  function showStorageNote() {
    if (storageNote) storageNote.hidden = false;
  }

  if (!storageAvailable) showStorageNote();

  function isValidTrial(trial) {
    return (
      trial &&
      typeof trial === "object" &&
      Number.isFinite(Number(trial.payload)) &&
      Number(trial.payload) > 0 &&
      (trial.result === "success" || trial.result === "fail") &&
      Number.isFinite(Number(trial.time)) &&
      Number(trial.time) > 0
    );
  }

  function loadTrials() {
    if (!storageAvailable) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValidTrial).map((trial, index) => ({
        id: typeof trial.id === "string" ? trial.id : "loaded-" + index,
        payload: Number(trial.payload),
        result: trial.result,
        time: Number(trial.time),
        notes: typeof trial.notes === "string" ? trial.notes.slice(0, 120) : ""
      }));
    } catch (error) {
      return [];
    }
  }

  function saveTrials() {
    if (!storageAvailable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
    } catch (error) {
      storageAvailable = false;
      showStorageNote();
    }
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "trial-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function setBadge(element, text, state) {
    if (!element) return;
    element.textContent = text;
    element.dataset.state = state;
  }

  function renderStats() {
    const total = trials.length;
    const successes = trials.filter((trial) => trial.result === "success").length;
    const rate = total ? (successes / total) * 100 : 0;
    const average = total ? trials.reduce((sum, trial) => sum + trial.time, 0) / total : 0;

    if (statCount) statCount.textContent = String(total);
    if (statCountNote) {
      statCountNote.textContent = total === 0 ? "No trials yet" : total === 1 ? "1 trial recorded" : total + " trials recorded";
    }

    if (statRate) statRate.textContent = total ? Math.round(rate) + "%" : "—";
    if (statRateNote) {
      statRateNote.textContent = total
        ? successes + " of " + total + (total === 1 ? " trial" : " trials") + " succeeded · target 80%"
        : "Target 8 of 10 (80%)";
    }
    if (rateFill) rateFill.style.width = Math.min(rate, 100) + "%";

    if (!total) {
      setBadge(statRateBadge, "No data", "idle");
    } else if (rate >= 80) {
      setBadge(statRateBadge, "On target", "good");
    } else {
      setBadge(statRateBadge, "Below target", "bad");
    }

    if (statAvg) statAvg.textContent = total ? formatNumber(average) + " s" : "—";
    if (statAvgNote) {
      statAvgNote.textContent = total
        ? "Across " + total + " logged " + (total === 1 ? "trial" : "trials") + " · target under 60 s"
        : "Target under 60 s";
    }

    if (!total) {
      setBadge(statAvgBadge, "No data", "idle");
    } else if (average < 60) {
      setBadge(statAvgBadge, "Under 60 s", "good");
    } else {
      setBadge(statAvgBadge, "Not under 60 s", "bad");
    }
  }

  function renderTable() {
    if (!trialsBody) return;
    trialsBody.textContent = "";

    if (!trials.length) {
      const tr = document.createElement("tr");
      tr.className = "trial-empty";
      const td = document.createElement("td");
      td.colSpan = 6;
      td.textContent = "No trials yet. Add your first run above.";
      tr.appendChild(td);
      trialsBody.appendChild(tr);
      return;
    }

    trials.forEach((trial, index) => {
      const tr = document.createElement("tr");

      const num = document.createElement("td");
      num.className = "trial-num";
      num.textContent = String(index + 1);

      const payload = document.createElement("td");
      payload.textContent = formatNumber(trial.payload) + " kg";

      const result = document.createElement("td");
      const pill = document.createElement("span");
      pill.className = "pill " + (trial.result === "success" ? "pill--success" : "pill--fail");
      pill.textContent = trial.result === "success" ? "Success" : "Fail";
      result.appendChild(pill);

      const time = document.createElement("td");
      time.className = "num";
      time.textContent = formatNumber(trial.time) + " s";

      const notes = document.createElement("td");
      notes.className = "trial-notes";
      notes.textContent = trial.notes || "—";

      const actions = document.createElement("td");
      actions.className = "num";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "icon-btn";
      remove.dataset.delete = trial.id;
      remove.setAttribute("aria-label", "Delete trial " + (index + 1));
      remove.innerHTML =
        '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
        '<path d="M4 6h12M8 6V4h4v2M6 6l.8 10h6.4L14 6M8.5 9v4M11.5 9v4" ' +
        'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      actions.appendChild(remove);

      tr.append(num, payload, result, time, notes, actions);
      trialsBody.appendChild(tr);
    });
  }

  function renderChart() {
    if (!chart || !chartWrap) return;

    const total = trials.length;
    if (chartBadge) chartBadge.textContent = total + (total === 1 ? " trial" : " trials");

    if (!total) {
      if (chartEmpty) chartEmpty.hidden = false;
      chart.setAttribute("aria-label", "No trials logged yet. Add a trial to display the cycle-time chart.");
      const context = chart.getContext("2d");
      if (context) context.clearRect(0, 0, chart.width, chart.height);
      return;
    }

    if (chartEmpty) chartEmpty.hidden = true;

    const rect = chartWrap.getBoundingClientRect();
    const width = Math.max(200, Math.floor(rect.width));
    const height = Math.max(180, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    chart.width = Math.round(width * dpr);
    chart.height = Math.round(height * dpr);
    chart.style.width = width + "px";
    chart.style.height = height + "px";

    const context = chart.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const pad = { top: 22, right: 16, bottom: 34, left: 44 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const maxTime = Math.max(60, ...trials.map((trial) => trial.time));
    // Round up to a multiple of 20 so the four grid lines read as whole seconds.
    const yMax = Math.ceil((maxTime * 1.12) / 20) * 20;
    const colors = {
      grid: "rgba(151,178,218,0.12)",
      axis: "rgba(151,178,218,0.3)",
      text: "#8FA3BF",
      success: "#34D399",
      fail: "#FC3D21",
      target: "rgba(252,61,33,0.9)"
    };

    context.font = "10px " + "ui-monospace, SFMono-Regular, Consolas, monospace";
    context.textBaseline = "middle";

    // Horizontal grid + y labels
    const ticks = 4;
    for (let i = 0; i <= ticks; i += 1) {
      const y = pad.top + (plotH / ticks) * i;
      context.beginPath();
      context.strokeStyle = colors.grid;
      context.lineWidth = 1;
      context.moveTo(pad.left, y + 0.5);
      context.lineTo(pad.left + plotW, y + 0.5);
      context.stroke();

      context.fillStyle = colors.text;
      context.textAlign = "right";
      const value = Math.round(yMax - (yMax / ticks) * i);
      context.fillText(value + " s", pad.left - 8, y);
    }

    // Baseline
    context.beginPath();
    context.strokeStyle = colors.axis;
    context.moveTo(pad.left, pad.top + plotH + 0.5);
    context.lineTo(pad.left + plotW, pad.top + plotH + 0.5);
    context.stroke();

    // Bars
    const slot = plotW / total;
    const barWidth = Math.max(3, Math.min(30, slot * 0.58));
    const radius = Math.min(3, barWidth / 2);

    trials.forEach((trial, index) => {
      const barHeight = Math.max(2, (trial.time / yMax) * plotH);
      const x = pad.left + slot * index + (slot - barWidth) / 2;
      const y = pad.top + plotH - barHeight;
      context.fillStyle = trial.result === "success" ? colors.success : colors.fail;

      context.beginPath();
      context.moveTo(x, y + barHeight);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.lineTo(x + barWidth - radius, y);
      context.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      context.lineTo(x + barWidth, y + barHeight);
      context.closePath();
      context.fill();

      // X labels: only as many as fit comfortably.
      const labelEvery = Math.max(1, Math.ceil(total / 12));
      if (index % labelEvery === 0 || index === total - 1) {
        context.fillStyle = colors.text;
        context.textAlign = "center";
        context.fillText("T" + (index + 1), x + barWidth / 2, pad.top + plotH + 16);
      }
    });

    // 60-second target line
    const targetY = pad.top + plotH - (60 / yMax) * plotH;
    context.beginPath();
    context.strokeStyle = colors.target;
    context.lineWidth = 1.2;
    context.setLineDash([5, 5]);
    context.moveTo(pad.left, targetY);
    context.lineTo(pad.left + plotW, targetY);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = "#FF8B76";
    context.textAlign = "right";
    context.font = "10px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText("60 s target", pad.left + plotW, targetY - 9);

    const times = trials.slice(0, 12).map((trial) => formatNumber(trial.time));
    const more = trials.length > 12 ? " and " + (trials.length - 12) + " more" : "";
    chart.setAttribute(
      "aria-label",
      "Bar chart of cycle time per trial. " + trials.length + (trials.length === 1 ? " trial" : " trials") + ". Times in seconds: " +
      times.join(", ") + more + ". Target is 60 seconds."
    );
  }

  function renderAllResults() {
    renderStats();
    renderTable();
    renderChart();
  }

  function announce(message) {
    if (trialsStatus) trialsStatus.textContent = message;
  }

  trials = loadTrials();
  renderAllResults();

  const trialFields = [payloadInput, resultInput, timeInput].filter(Boolean);

  function clearTrialInvalidState() {
    trialFields.forEach((field) => field.removeAttribute("aria-invalid"));
  }

  trialFields.forEach((field) => {
    field.addEventListener("input", () => field.removeAttribute("aria-invalid"));
  });

  if (trialForm) {
    trialForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (trialError) trialError.hidden = true;
      clearTrialInvalidState();

      const payload = Number(payloadInput ? payloadInput.value.trim() : "");
      const time = Number(timeInput ? timeInput.value.trim() : "");
      const result = resultInput ? resultInput.value : "";
      const notes = notesInput ? notesInput.value.trim() : "";

      let message = "";
      let focusTarget = null;

      if (!payloadInput || payloadInput.value.trim() === "" || !Number.isFinite(payload) || payload < 0.1 || payload > 5) {
        message = "Enter a payload between 0.1 and 5 kg.";
        focusTarget = payloadInput;
      } else if (result !== "success" && result !== "fail") {
        message = "Choose a result: success or fail.";
        focusTarget = resultInput;
      } else if (!timeInput || timeInput.value.trim() === "" || !Number.isFinite(time) || time < 0.1 || time > 600) {
        message = "Enter a cycle time between 0.1 and 600 seconds.";
        focusTarget = timeInput;
      }

      if (message) {
        if (trialError) {
          trialError.textContent = message;
          trialError.hidden = false;
        }
        if (focusTarget) {
          focusTarget.setAttribute("aria-invalid", "true");
          focusTarget.focus();
        }
        return;
      }

      clearTrialInvalidState();
      trials.push({ id: makeId(), payload: payload, result: result, time: time, notes: notes });
      saveTrials();
      renderAllResults();
      trialForm.reset();
      if (payloadInput) payloadInput.focus();
      announce(
        "Trial added. " + trials.length + " " + (trials.length === 1 ? "trial" : "trials") +
        " logged. Success rate " + Math.round((trials.filter((trial) => trial.result === "success").length / trials.length) * 100) + "%."
      );
    });
  }

  if (trialsBody) {
    trialsBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete]");
      if (!button) return;
      const id = button.dataset.delete;
      const removed = trials.find((trial) => trial.id === id);
      trials = trials.filter((trial) => trial.id !== id);
      saveTrials();
      renderAllResults();
      announce(removed ? "Trial deleted." : "Trial removed.");
    });
  }

  if (clearTrials) {
    clearTrials.addEventListener("click", () => {
      if (!trials.length) {
        announce("There are no trials to clear.");
        return;
      }
      const confirmed = window.confirm(
        "Delete all " + trials.length + " logged trials? This cannot be undone."
      );
      if (!confirmed) return;
      trials = [];
      saveTrials();
      renderAllResults();
      announce("All trials cleared.");
    });
  }

  // Redraw the chart when its container changes size.
  if (chartWrap && typeof window.ResizeObserver === "function") {
    let resizeFrame = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(renderChart);
    });
    resizeObserver.observe(chartWrap);
  } else {
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(renderChart, 150);
    });
  }

})();
