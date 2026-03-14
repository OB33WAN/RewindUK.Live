const DEFAULT_CONTENT = {
  stream: {
    url: "https://sonic.onlineaudience.co.uk:8264/stream",
    externalPlayerUrl: "https://sonic.onlineaudience.co.uk/cp/widgets/player/single/?p=8264",
    statusReady: "READY TO PLAY",
    statusLive: "LIVE - ON AIR",
    statusUnavailable: "Stream unavailable"
  },
  contact: {
    email: "contact@rewinduk.live"
  }
};

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const STREAM_WIDGET_NOWPLAY_URL = "https://sonic.onlineaudience.co.uk/cp/widgets/player/nowplay.php";
const STREAM_WIDGET_NOWPLAY_BODY = {
  rsys: "scv26",
  port: "8264"
};
const STREAM_STATS_ENDPOINTS = [
  "https://sonic.onlineaudience.co.uk:8264/currentsong?sid=1",
  "https://sonic.onlineaudience.co.uk:8264/stats?json=1",
  "https://sonic.onlineaudience.co.uk:8264/7.html"
];
const STREAM_PLAYED_URL = "https://sonic.onlineaudience.co.uk:8264/played?sid=1&type=json";
const TRACK_POLL_MS = 20000;
let songHistory = [];
let lastKnownTrack = "";
const LIVE_TICKER_MESSAGES = [
  "Underground selections streaming now",
  "Next up: deep house, UKG, and bassline pressure",
  "Tap play and lock into the RewindUK Live frequency",
  "Shoutouts open now - hit contact and send yours"
];

let stationAudio = null;
let siteContent = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pathValue(source, path) {
  return path.split(".").reduce((obj, key) => {
    if (!obj || !(key in obj)) return undefined;
    return obj[key];
  }, source);
}

async function loadContent() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load content.json");
    siteContent = await response.json();
  } catch (_error) {
    siteContent = DEFAULT_CONTENT;
  }
}

function initMenu() {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

function renderTextBindings() {
  document.querySelectorAll("[data-text]").forEach((el) => {
    const value = pathValue(siteContent, el.dataset.text);
    if (typeof value === "string") el.textContent = value;
  });

  document.querySelectorAll("[data-html]").forEach((el) => {
    const value = pathValue(siteContent, el.dataset.html);
    if (typeof value === "string") el.innerHTML = value;
  });

  document.querySelectorAll("[data-href]").forEach((el) => {
    const value = pathValue(siteContent, el.dataset.href);
    if (typeof value === "string") {
      if (el.tagName.toLowerCase() === "iframe") {
        el.setAttribute("src", value);
      } else {
        el.setAttribute("href", value);
      }
    }
  });
}

function renderPrimaryNavigation() {
  const navLinks = document.querySelector("[data-nav-links]");
  if (!navLinks || !Array.isArray(siteContent.navigation)) return;

  const currentPage = document.body.dataset.page;
  navLinks.innerHTML = siteContent.navigation
    .map((item) => {
      const activeClass = item.label.toLowerCase() === currentPage ? "active" : "";
      return `<a class="${activeClass}" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`;
    })
    .join("");
}

function renderFooterNavigation() {
  const container = document.querySelector("[data-footer-nav]");
  if (!container || !Array.isArray(siteContent.navigation)) return;

  container.innerHTML = siteContent.navigation
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join("");
}

function renderSocialButtons() {
  const container = document.querySelector("[data-social-buttons]");
  if (!container || !Array.isArray(siteContent.socials)) return;

  container.innerHTML = siteContent.socials
    .map(
      (social) =>
        `<a class="social-btn" href="${escapeHtml(social.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(social.name)}">${escapeHtml(social.short || social.name.slice(0, 2).toUpperCase())}</a>`
    )
    .join("");
}

function renderContactLinks() {
  const container = document.querySelector("[data-contact-links]");
  if (!container) return;

  const email = pathValue(siteContent, "contact.email");
  const socials = Array.isArray(siteContent.socials) ? siteContent.socials : [];

  const links = [
    email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : "",
    ...socials.map(
      (social) =>
        `<a href="${escapeHtml(social.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(social.name)}</a>`
    )
  ].filter(Boolean);

  container.innerHTML = links.join("");
}

function renderHomeDjs() {
  const container = document.querySelector("[data-home-djs]");
  if (!container || !Array.isArray(siteContent.djs)) return;

  container.innerHTML = siteContent.djs
    .slice(0, 4)
    .map(
      (dj) => `
        <a class="card" href="djs.html">
          <div class="media"><img src="${escapeHtml(dj.image)}" alt="${escapeHtml(dj.name)}" /></div>
          <div class="content"><span class="eyebrow">Resident</span><h3>${escapeHtml(dj.name)}</h3></div>
        </a>
      `
    )
    .join("");
}

function renderDjsPage() {
  const container = document.querySelector("[data-djs-list]");
  if (!container || !Array.isArray(siteContent.djs)) return;

  container.innerHTML = siteContent.djs
    .map(
      (dj) => `
        <article class="card">
          <div class="media"><img src="${escapeHtml(dj.image)}" alt="${escapeHtml(dj.name)}" /></div>
          <div class="content">
            <span class="eyebrow">${escapeHtml(dj.genre || "Resident")}</span>
            <h3>${escapeHtml(dj.name)}</h3>
            <p>${escapeHtml(dj.bio || "")}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderUpNext() {
  const container = document.querySelector("[data-up-next]");
  if (!container || !Array.isArray(siteContent.schedule?.upNext)) return;

  container.innerHTML = siteContent.schedule.upNext
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.day)}</strong>
          <b>${escapeHtml(item.dj)}</b>
          <span class="text-muted">${escapeHtml(item.time)}</span>
        </li>
      `
    )
    .join("");
}

function renderSchedulePage() {
  const tabsContainer = document.querySelector("[data-schedule-tabs]");
  const itemsContainer = document.querySelector("[data-schedule-items]");
  const shows = Array.isArray(siteContent.schedule?.shows) ? siteContent.schedule.shows : [];
  if (!tabsContainer || !itemsContainer || !shows.length) return;

  const days = [...new Set(shows.map((show) => show.day.toLowerCase()))];
  const dayLabels = Object.fromEntries(shows.map((show) => [show.day.toLowerCase(), show.day]));

  tabsContainer.innerHTML = [
    `<button class="tab-btn active" type="button" data-day="all">All</button>`,
    ...days.map(
      (day) =>
        `<button class="tab-btn" type="button" data-day="${escapeHtml(day)}">${escapeHtml(dayLabels[day].slice(0, 3))}</button>`
    )
  ].join("");

  itemsContainer.innerHTML = shows
    .map(
      (show) => `
        <article class="schedule-item" data-schedule-item="${escapeHtml(show.day.toLowerCase())}">
          <h4>${escapeHtml(show.day)} • ${escapeHtml(show.time)} • ${escapeHtml(show.show)}</h4>
          <p>${escapeHtml(show.dj)} • ${escapeHtml(show.genre)}</p>
        </article>
      `
    )
    .join("");
}

function parseEventMoment(event) {
  const dateTimeIso = typeof event?.dateTimeIso === "string" ? event.dateTimeIso.trim() : "";
  if (dateTimeIso) {
    const parsedDateTime = new Date(dateTimeIso);
    if (!Number.isNaN(parsedDateTime.getTime())) {
      return { moment: parsedDateTime, precise: true };
    }
  }

  const dateIso = typeof event?.dateIso === "string" ? event.dateIso.trim() : "";
  const timeIso = typeof event?.timeIso === "string" ? event.timeIso.trim() : "";

  if (dateIso && timeIso) {
    const parsedDateTime = new Date(`${dateIso}T${timeIso}`);
    if (!Number.isNaN(parsedDateTime.getTime())) {
      return { moment: parsedDateTime, precise: true };
    }
  }

  if (dateIso) {
    const parsedDate = new Date(`${dateIso}T00:00:00`);
    if (!Number.isNaN(parsedDate.getTime())) {
      return {
        moment: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
        precise: false
      };
    }
  }

  const fallbackDate = typeof event?.date === "string" ? event.date.trim() : "";
  if (fallbackDate) {
    const parsedFallback = new Date(fallbackDate);
    if (!Number.isNaN(parsedFallback.getTime())) {
      return {
        moment: new Date(parsedFallback.getFullYear(), parsedFallback.getMonth(), parsedFallback.getDate()),
        precise: false
      };
    }
  }

  return { moment: null, precise: false };
}

function renderEventCards(items) {
  return items
    .map((event) => {
      const url = event.ticketUrl ? escapeHtml(event.ticketUrl) : "";
      const timeLabel = typeof event.time === "string" && event.time.trim() ? ` • ${escapeHtml(event.time)}` : "";
      const link = url
        ? `<div class="mt-18"><a class="btn btn-primary" href="${url}" target="_blank" rel="noopener noreferrer">More Info</a></div>`
        : "";

      return `
        <article class="card">
          <div class="content">
            <span class="eyebrow">${escapeHtml(event.date || "TBC")}${timeLabel} • ${escapeHtml(event.location || "TBC")}</span>
            <h3>${escapeHtml(event.name || "Untitled Event")}</h3>
            <p>${escapeHtml(event.details || "")}</p>
            ${link}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderEventsPage() {
  const upcomingContainer = document.querySelector("[data-events-upcoming]");
  const pastContainer = document.querySelector("[data-events-past]");
  const items = Array.isArray(siteContent.events?.items) ? siteContent.events.items : [];
  if (!upcomingContainer || !pastContainer) return;

  const now = new Date();
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const normalized = items.map((event) => {
    const parsed = parseEventMoment(event);
    return {
      ...event,
      eventMoment: parsed.moment,
      hasExactTime: parsed.precise
    };
  });

  const upcoming = normalized
    .filter((event) => {
      if (!event.eventMoment) return true;
      if (event.hasExactTime) return event.eventMoment >= now;
      return event.eventMoment >= todayOnly;
    })
    .sort((a, b) => {
      if (!a.eventMoment && !b.eventMoment) return 0;
      if (!a.eventMoment) return 1;
      if (!b.eventMoment) return -1;
      return a.eventMoment.getTime() - b.eventMoment.getTime();
    });

  const past = normalized
    .filter((event) => {
      if (!event.eventMoment) return false;
      if (event.hasExactTime) return event.eventMoment < now;
      return event.eventMoment < todayOnly;
    })
    .sort((a, b) => b.eventMoment.getTime() - a.eventMoment.getTime());

  upcomingContainer.innerHTML = upcoming.length
    ? renderEventCards(upcoming)
    : `<article class="panel"><p class="text-muted">No upcoming events yet. Add one in chat and it will appear here.</p></article>`;

  pastContainer.innerHTML = past.length
    ? renderEventCards(past)
    : `<article class="panel"><p class="text-muted">No past events yet.</p></article>`;
}

function updateAudioUI() {
  const isPlaying = stationAudio && !stationAudio.paused;
  const liveText = siteContent?.stream?.statusLive || DEFAULT_CONTENT.stream.statusLive;
  const readyText = siteContent?.stream?.statusReady || DEFAULT_CONTENT.stream.statusReady;

  document.querySelectorAll("[data-audio-toggle]").forEach((button) => {
    const playText = button.dataset.playText || "Play Live";
    const pauseText = button.dataset.pauseText || "Pause Live";
    button.textContent = isPlaying ? pauseText : playText;
  });
  document.querySelectorAll("[data-stream-status]").forEach((el) => {
    el.textContent = isPlaying ? liveText : readyText;
  });

  document.body.classList.toggle("live-playing", Boolean(isPlaying));

  const chip = document.querySelector("[data-live-chip-status]");
  if (chip) {
    chip.textContent = isPlaying ? "On Air Now" : "Global Stream";
    chip.classList.toggle("is-live", Boolean(isPlaying));
  }

}

function initAudioPlayer() {
  const streamUrl = siteContent?.stream?.url || DEFAULT_CONTENT.stream.url;
  const externalPlayerUrl = siteContent?.stream?.externalPlayerUrl || DEFAULT_CONTENT.stream.externalPlayerUrl;
  const unavailableText = siteContent?.stream?.statusUnavailable || DEFAULT_CONTENT.stream.statusUnavailable;

  stationAudio = new Audio(streamUrl);
  stationAudio.preload = "none";

  stationAudio.addEventListener("playing", updateAudioUI);
  stationAudio.addEventListener("pause", updateAudioUI);
  stationAudio.addEventListener("error", () => {
    document.querySelectorAll("[data-stream-status]").forEach((el) => {
      el.textContent = unavailableText;
    });
  });

  document.querySelectorAll("[data-audio-toggle]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (stationAudio.paused) {
        try {
          await stationAudio.play();
        } catch (_err) {
          window.open(externalPlayerUrl, "_blank", "noopener");
        }
      } else {
        stationAudio.pause();
      }
      updateAudioUI();
    });
  });

  updateAudioUI();
}

function initScheduleTabs() {
  const tabsContainer = document.querySelector("[data-schedule-tabs]");
  const items = document.querySelectorAll("[data-schedule-item]");
  if (!tabsContainer || !items.length) return;

  tabsContainer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches("[data-day]")) return;

    const selected = target.dataset.day || "all";
    tabsContainer.querySelectorAll("[data-day]").forEach((btn) => btn.classList.remove("active"));
    target.classList.add("active");

    items.forEach((item) => {
      const day = item.dataset.scheduleItem;
      const show = selected === "all" || day === selected;
      item.hidden = !show;
    });
  });
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const contactEmail = siteContent?.contact?.email || DEFAULT_CONTENT.contact.email;
  const accessKey = (form.dataset.web3formsKey || "").trim();

  const statusEl = document.createElement("p");
  statusEl.className = "mt-8 text-muted";
  statusEl.setAttribute("aria-live", "polite");
  statusEl.hidden = true;
  form.appendChild(statusEl);

  form.setAttribute("action", `mailto:${contactEmail}`);
  form.setAttribute("method", "post");
  form.setAttribute("enctype", "text/plain");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const message = data.get("message") || "";

    if (accessKey) {
      data.append("access_key", accessKey);
      data.append("subject", "Contact from RewindUK Live website");
      data.append("from_name", String(name));

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          body: data
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error("Web3Forms submission failed");
        }

        statusEl.hidden = false;
        statusEl.textContent = "Message sent successfully. We will be in touch soon.";
        form.reset();
        return;
      } catch (_error) {
        statusEl.hidden = false;
        statusEl.textContent = "Could not submit online right now, opening your email app as fallback.";
      }
    }

    const subject = encodeURIComponent("Contact from RewindUK Live website");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  });
}

function initRevealEffects() {
  const targets = document.querySelectorAll("section.block, .page-head, .hero, .panel, .card");
  if (!targets.length) return;

  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
}

function initBackToTop() {
  const button = document.createElement("button");
  button.className = "to-top";
  button.type = "button";
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "↑";
  document.body.appendChild(button);

  const onScroll = () => {
    const shouldShow = window.scrollY > 420;
    button.classList.toggle("show", shouldShow);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initLiveTicker() {
  const ticker = document.querySelector("[data-live-ticker]");
  if (!ticker) return;

  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % LIVE_TICKER_MESSAGES.length;
    ticker.textContent = LIVE_TICKER_MESSAGES[index];
  }, 4500);
}

function parseTrackString(raw) {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.trim();
  if (!clean || clean.toLowerCase() === "unknown" || clean === "-") return null;
  const sep = clean.indexOf(" - ");
  if (sep > 0) {
    return { artist: clean.slice(0, sep).trim(), title: clean.slice(sep + 3).trim(), full: clean };
  }
  return { artist: "", title: clean, full: clean };
}

function decodeHtmlEntities(value) {
  if (!value || typeof value !== "string") return value || "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value.trim();
}

function renderTrackNow(track) {
  document.querySelectorAll("[data-current-track-title]").forEach((el) => {
    el.textContent = track.title;
  });
  document.querySelectorAll("[data-current-track-artist]").forEach((el) => {
    el.textContent = track.artist || "";
    el.hidden = !track.artist;
  });
}

function renderTrackHistory() {
  document.querySelectorAll("[data-song-history]").forEach((list) => {
    if (!songHistory.length) {
      list.innerHTML = '<li class="song-history-placeholder">No recent tracks available yet.</li>';
      return;
    }
    list.innerHTML = songHistory
      .map(
        (t, i) =>
          `<li class="song-history-item">` +
          `<span class="song-history-num">${i + 1}</span>` +
          `<div class="song-history-detail">` +
          `<strong>${escapeHtml(t.title)}</strong>` +
          (t.artist ? `<span>${escapeHtml(t.artist)}</span>` : "") +
          `</div></li>`
      )
      .join("");
  });
}

async function pollCurrentTrack() {
  for (const url of STREAM_STATS_ENDPOINTS) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "";
      let raw = "";
      if (contentType.includes("json")) {
        const data = await res.json();
        raw =
          data?.songtitle ||
          data?.streams?.[0]?.songtitle ||
          data?.streams?.[0]?.title ||
          data?.currentsong ||
          data?.song?.title ||
          data?.title ||
          "";
      } else {
        const text = await res.text();
        if (url.includes("7.html")) {
          // Shoutcast v1 /7.html - comma-separated
          raw = decodeHtmlEntities(text.split(",")[6] || "");
        } else {
          raw = decodeHtmlEntities(text);
        }
      }
      const track = parseTrackString(raw);
      if (!track) continue;
      renderTrackNow(track);
      if (track.full !== lastKnownTrack) {
        lastKnownTrack = track.full;
        songHistory.unshift(track);
        if (songHistory.length > 20) songHistory.pop();
        renderTrackHistory();
      }
      return true;
    } catch (_e) {
      // CORS or network - try next endpoint
    }
  }
  return false;
}

async function loadInitialHistory() {
  try {
    const res = await fetch(STREAM_PLAYED_URL, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.history)
      ? data.history
      : Array.isArray(data?.played)
      ? data.played
      : [];
    const parsed = items
      .map((item) => parseTrackString(item?.metadata?.tit2 || item?.song?.title || item?.title || ""))
      .filter(Boolean)
      .slice(0, 20);
    if (parsed.length && !songHistory.length) {
      songHistory = parsed;
      lastKnownTrack = parsed[0]?.full || "";
      renderTrackNow(parsed[0]);
      renderTrackHistory();
      return true;
    }
    return false;
  } catch (_e) {
    return false;
  }
}

function initTrackPolling() {
  if (!document.querySelector("[data-song-history]")) return;
  loadInitialHistory().then(pollCurrentTrack);
  window.setInterval(pollCurrentTrack, TRACK_POLL_MS);
}

function submitWidgetNowPlayingForms() {
  document.querySelectorAll("[data-widget-nowplay-form]").forEach((form) => {
    const cacheInput = form.querySelector("[data-widget-nowplay-cache]");
    if (cacheInput) {
      cacheInput.value = String(Date.now());
    }
    form.submit();
  });
}

function initWidgetNowPlayingMirror() {
  if (!document.querySelector("[data-widget-nowplay-form]")) return;
  submitWidgetNowPlayingForms();
  window.setInterval(submitWidgetNowPlayingForms, TRACK_POLL_MS);
}

function activateFeedTab(tabName, buttonSelector, panelSelector, buttonAttr, panelAttr) {
  const buttons = document.querySelectorAll(buttonSelector);
  const panels = document.querySelectorAll(panelSelector);
  if (!buttons.length || !panels.length) return;

  buttons.forEach((btn) => {
    const active = btn.getAttribute(buttonAttr) === tabName;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  panels.forEach((panel) => {
    const active = panel.getAttribute(panelAttr) === tabName;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
}

function initLiveFeedTabs() {
  const buttons = document.querySelectorAll("[data-feed-tab-target]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.feedTabTarget;
      if (!target) return;
      activateFeedTab(target, "[data-feed-tab-target]", "[data-feed-panel]", "data-feed-tab-target", "data-feed-panel");
    });
  });
}

function initLiveEmbedLaunch() {
  const openButton = document.querySelector("[data-open-live-embed]");
  if (!openButton) return;

  openButton.addEventListener("click", () => {
    activateFeedTab("tiktok", "[data-feed-tab-target]", "[data-feed-panel]", "data-feed-tab-target", "data-feed-panel");
    const panel = document.querySelector('[data-feed-panel="tiktok"]');
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function initHomeLiveFeedTabs() {
  const buttons = document.querySelectorAll("[data-home-feed-tab-target]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-home-feed-tab-target");
      if (!target) return;
      activateFeedTab(target, "[data-home-feed-tab-target]", "[data-home-feed-panel]", "data-home-feed-tab-target", "data-home-feed-panel");
    });
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadContent();

  renderTextBindings();
  renderPrimaryNavigation();
  renderFooterNavigation();
  renderSocialButtons();
  renderContactLinks();
  renderHomeDjs();
  renderDjsPage();
  renderUpNext();
  renderSchedulePage();
  renderEventsPage();

  initMenu();
  initYear();
  initAudioPlayer();
  initScheduleTabs();
  initContactForm();
  initRevealEffects();
  initBackToTop();
  initLiveTicker();
  initLiveFeedTabs();
  initLiveEmbedLaunch();
  initHomeLiveFeedTabs();
  initWidgetNowPlayingMirror();
  initTrackPolling();
});
