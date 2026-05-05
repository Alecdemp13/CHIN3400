const body = document.body;
const navLinks = [...document.querySelectorAll("#section-nav a")];
const sections = [...document.querySelectorAll(".doc-section")];
const notes = document.getElementById("reader-notes");
const backToTop = document.getElementById("back-to-top");
const footnoteTriggers = [...document.querySelectorAll(".footnote-trigger")];
const footnotePopover = document.getElementById("footnote-popover");
const citationViewButtons = [...document.querySelectorAll(".citation-view-toggle")];
const citationViewPanels = [...document.querySelectorAll(".citation-view-panel")];

const NOTES_KEY = "reader-notes";

function applyStoredPreferences() {
  const storedNotes = localStorage.getItem(NOTES_KEY);

  if (storedNotes && notes) notes.value = storedNotes;
}

function setActiveSection() {
  const offset = window.innerHeight * 0.35;
  let currentId = sections[0]?.id;

  sections.forEach((section) => {
    const top = section.getBoundingClientRect().top;
    if (top <= offset) currentId = section.id;
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;
    link.classList.toggle("active", isActive);
  });
}

function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach((widget) => {
    const tabs = [...widget.querySelectorAll('[role="tab"]')];
    const panelsInWidget = [...widget.querySelectorAll('[role="tabpanel"]')];

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
        panelsInWidget.forEach((p) => (p.hidden = true));
        tab.setAttribute("aria-selected", "true");
        const panelId = tab.getAttribute("aria-controls");
        const target = widget.querySelector(`#${panelId}`);
        if (target) target.hidden = false;
      });
    });
  });
}

function closeFootnotePopover() {
  if (!footnotePopover) return;
  footnotePopover.hidden = true;
  footnoteTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
}

function openFootnotePopover(trigger) {
  if (!footnotePopover) return;
  const content = trigger.dataset.footnote || "No footnote text provided.";
  const triggerRect = trigger.getBoundingClientRect();
  const popoverWidth = 280;

  footnotePopover.textContent = content;
  footnotePopover.hidden = false;

  const top = window.scrollY + triggerRect.bottom + 10;
  const maxLeft = window.scrollX + window.innerWidth - popoverWidth - 12;
  const left = Math.min(window.scrollX + triggerRect.left, maxLeft);

  footnotePopover.style.top = `${top}px`;
  footnotePopover.style.left = `${Math.max(12, left)}px`;

  footnoteTriggers.forEach((item) => {
    item.setAttribute("aria-expanded", item === trigger ? "true" : "false");
  });
}

function initFootnotes() {
  footnoteTriggers.forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isSameTrigger =
        !footnotePopover.hidden && trigger.getAttribute("aria-expanded") === "true";
      if (isSameTrigger) {
        closeFootnotePopover();
        return;
      }
      openFootnotePopover(trigger);
    });
  });

  document.addEventListener("click", (event) => {
    if (!footnotePopover || footnotePopover.hidden) return;
    const clickedPopover = footnotePopover.contains(event.target);
    const clickedTrigger = footnoteTriggers.some((trigger) => trigger.contains(event.target));
    if (!clickedPopover && !clickedTrigger) closeFootnotePopover();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeFootnotePopover();
  });
}

function initCitationViews() {
  if (!citationViewButtons.length || !citationViewPanels.length) return;

  citationViewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedView = button.dataset.citationViewTarget;
      if (!selectedView) return;

      citationViewButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      citationViewPanels.forEach((panel) => {
        panel.hidden = panel.dataset.citationView !== selectedView;
      });
    });
  });
}

notes?.addEventListener("input", () => {
  localStorage.setItem(NOTES_KEY, notes.value);
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  setActiveSection();
  closeFootnotePopover();
});

applyStoredPreferences();
initTabs();
initFootnotes();
initCitationViews();
setActiveSection();
