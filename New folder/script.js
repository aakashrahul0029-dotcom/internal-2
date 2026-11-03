$(function () {
  // Loader
  let progress = 0;
  const loaderTimer = setInterval(() => {
    progress = Math.min(progress + Math.floor(Math.random() * 12) + 5, 100);
    $("#loaderBar").css("width", progress + "%");
    $("#loaderPercent").text(progress + "%");
    if (progress >= 100) {
      clearInterval(loaderTimer);
      setTimeout(() => $("#loader").addClass("hide"), 350);
    }
  }, 90);

  // Floating ember particles
  for (let i = 0; i < 34; i++) {
    const ember = $("<span class='ember'></span>");
    ember.css({ left: Math.random() * 100 + "%", top: (55 + Math.random() * 60) + "%", animationDuration: (5 + Math.random() * 9) + "s", animationDelay: (Math.random() * 8) + "s", opacity: Math.random() });
    $("#embers").append(ember);
  }

  // Scroll effects and reveal
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        if (entry.target.querySelector(".counter")) animateCounters(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  function animateCounters(scope) {
    $(scope).find(".counter").each(function () {
      const el = $(this), target = Number(el.data("count"));
      $({ value: 0 }).animate({ value: target }, {
        duration: 1300, easing: "swing",
        step: now => el.text(Math.floor(now)),
        complete: () => el.text(target)
      });
    });
  }

  function onScroll() {
    const scrollTop = $(window).scrollTop();
    const docHeight = $(document).height() - $(window).height();
    $("#scrollProgress").css("width", (docHeight > 0 ? scrollTop / docHeight * 100 : 0) + "%");
    $(".cinematic-nav").toggleClass("scrolled", scrollTop > 45);
    $("#backToTop").toggleClass("show", scrollTop > 500);
    const current = $("main section[id]").filter(function () {
      return $(this).offset().top <= scrollTop + 140;
    }).last().attr("id");
    $(".nav-link").removeClass("active");
    if (current) $('.nav-link[href="#' + current + '"]').addClass("active");
  }
  $(window).on("scroll", onScroll); onScroll();

  // Smooth anchor navigation and mobile menu close
  $('a[href^="#"]').on("click", function (e) {
    const target = $(this.getAttribute("href"));
    if (target.length) {
      e.preventDefault();
      $("html, body").animate({ scrollTop: target.offset().top - 72 }, 650);
      $(".navbar-collapse").collapse("hide");
    }
  });
  $("#backToTop").on("click", () => $("html, body").animate({ scrollTop: 0 }, 600));

  // Cursor glow (desktop)
  if (window.matchMedia("(pointer:fine)").matches) {
    $(".cursor-glow").css("opacity", .8);
    $(document).on("mousemove", e => $(".cursor-glow").css({ left: e.clientX, top: e.clientY }));
  }

  // Modal helpers
  const detailModal = new bootstrap.Modal(document.getElementById("detailModal"));
  const galleryModal = new bootstrap.Modal(document.getElementById("galleryModal"));
  const trailerModal = new bootstrap.Modal(document.getElementById("trailerModal"));
  function showDetail(eyebrow, title, description, extra) {
    $("#detailEyebrow").text(eyebrow);
    $("#detailTitle").text(title);
    $("#detailDescription").text(description);
    $("#detailExtra").text(extra);
    detailModal.show();
  }

  const mapInfo = {
    Erangel: ["CLASSIC ISLAND", "A varied island battlefield with open fields, towns, forests and plenty of ways to approach each rotation.", "Landing ideas: School • Pochinki • Georgopol. Explore the terrain and choose a drop that fits your squad."],
    Miramar: ["DESERT FRONTLINE", "A wide desert environment where ridgelines, compounds and long sightlines shape the fight.", "Landing ideas: Pecado • Hacienda del Patrón • Los Leones. Check your angles before crossing open ground."],
    Sanhok: ["JUNGLE WARFARE", "Dense vegetation and compact terrain encourage fast rotations and close-range engagements.", "Landing ideas: Bootcamp • Paradise Resort • Ruins. Keep moving and use natural cover."],
    Vikendi: ["FROZEN FRONTIER", "A snow-covered battlefield with varied elevation, settlements and challenging visibility.", "Landing ideas: Castle • Cosmodrome • Villa. Plan rotations around terrain and cover."],
    Livik: ["COMPACT BATTLEFIELD", "A compact environment designed for faster-paced encounters and shorter rotations.", "Landing ideas: Midstein • Power Plant • Iceborg. Stay alert as fights can arrive quickly."]
  };
  $(".map-open").on("click", function () {
    const name = $(this).data("map"), data = mapInfo[name];
    showDetail("MAP INTEL / " + data[0], name.toUpperCase(), data[1], data[2]);
  });

  const weaponInfo = {
    "M416": ["ASSAULT RIFLE", "A flexible assault rifle often picked for its adaptable loadout options.", "Playstyle: versatile • Best practice: controlled bursts and recoil drills."],
    "AKM": ["ASSAULT RIFLE", "A hard-hitting rifle that rewards deliberate recoil control.", "Playstyle: high-impact feel • Best practice: practise short bursts at different ranges."],
    "AWM": ["SNIPER RIFLE", "A bolt-action sniper profile built around precision and patience.", "Playstyle: long-range precision • Best practice: steady aim and smart positioning."],
    "M24": ["SNIPER RIFLE", "A bolt-action rifle for players who prefer measured, accurate shots.", "Playstyle: precision • Best practice: take shots from protected positions."],
    "GROZA": ["ASSAULT RIFLE", "A close-to-mid-range assault rifle profile with an aggressive feel.", "Playstyle: aggressive • Best practice: pair with a weapon for longer distances."],
    "DP-28": ["LIGHT MACHINE GUN", "A support-focused weapon profile suited to sustained pressure.", "Playstyle: support • Best practice: use stable positions and manage reload timing."],
    "UMP45": ["SUBMACHINE GUN", "A controllable close-range option for quick movement and tight spaces.", "Playstyle: close-range • Best practice: keep your crosshair ready around corners."],
    "SCAR-L": ["ASSAULT RIFLE", "A steady-feeling rifle profile that can suit players learning weapon control.", "Playstyle: adaptable • Best practice: build a consistent spray pattern."]
  };
  $(".weapon-details").on("click", function () {
    const name = $(this).data("weapon"), data = weaponInfo[name];
    showDetail("ARSENAL / " + data[0], name, data[1], data[2] + " Stats can vary by game version; check current in-game values.");
  });

  // Weapon filters and search
  let activeWeaponFilter = "all";
  function filterWeapons() {
    const query = $("#weaponSearch").val().toLowerCase().trim();
    $(".weapon-col").each(function () {
      const category = $(this).data("category"), name = String($(this).data("name")).toLowerCase();
      $(this).toggleClass("is-hidden", !(activeWeaponFilter === "all" || category === activeWeaponFilter) || !name.includes(query));
    });
  }
  $("#weaponFilters .filter-btn").on("click", function () {
    $("#weaponFilters .filter-btn").removeClass("active"); $(this).addClass("active");
    activeWeaponFilter = $(this).data("filter"); filterWeapons();
  });
  $("#weaponSearch").on("input", filterWeapons);

  // Weapon comparison: qualitative demo, no unverified numeric stats
  $("#compareBtn").on("click", function () {
    const a = $("#weaponA").val(), b = $("#weaponB").val();
    if (a === b) { $("#compareResult").text("Choose two different weapons to compare their roles."); return; }
    $("#compareResult").html("<strong>" + a + "</strong> — " + weaponInfo[a][0] + " / " + weaponInfo[a][2].split(" • ")[0] + " &nbsp; <span style='color:#d71920'>VS</span> &nbsp; <strong>" + b + "</strong> — " + weaponInfo[b][0] + " / " + weaponInfo[b][2].split(" • ")[0] + "<br><small>Qualitative playstyle comparison. Current in-game stats may change with updates.</small>");
  });

  // Demo leaderboard and sorting
  const players = [
    { name: "RAVEN", team: "NIGHT RAID", kills: 42, points: 980 },
    { name: "VORTEX", team: "RED ZONE", kills: 38, points: 925 },
    { name: "SHADOW", team: "ALPHA UNIT", kills: 35, points: 890 },
    { name: "NOVA", team: "WILD CARD", kills: 31, points: 842 },
    { name: "FALCON", team: "NIGHT RAID", kills: 28, points: 810 }
  ];
  function renderLeaderboard(sortBy) {
    const sorted = [...players].sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy]);
    $("#leaderboardBody").html(sorted.map((p, i) => `<tr><td class="rank-cell">#${String(i + 1).padStart(2, "0")}</td><td><strong>${p.name}</strong></td><td>${p.team}</td><td>${p.kills}</td><td>${p.points.toLocaleString()}</td></tr>`).join(""));
  }
  renderLeaderboard("points");
  $("#leaderSort").on("change", function () { renderLeaderboard(this.value); });

  // Gallery filtering and lightbox navigation
  let galleryItems = [], galleryIndex = 0;
  function visibleGalleryItems() { return $(".gallery-item:visible").toArray(); }
  $(".gallery-filters .filter-btn").on("click", function () {
    $(".gallery-filters .filter-btn").removeClass("active"); $(this).addClass("active");
    const category = $(this).data("gallery");
    $(".gallery-item").each(function () { $(this).toggle(category === "all" || $(this).data("category") === category); });
  });
  function openGallery(index) {
    galleryItems = visibleGalleryItems();
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = $(galleryItems[galleryIndex]);
    $("#lightboxImage").attr("src", item.data("full"));
    $("#lightboxCaption").text(item.find("span").text());
    galleryModal.show();
  }
  $(".gallery-item").on("click", function () { openGallery(visibleGalleryItems().indexOf(this)); });
  $(".gallery-prev").on("click", () => openGallery(galleryIndex - 1));
  $(".gallery-next").on("click", () => openGallery(galleryIndex + 1));
  $(document).on("keydown", e => {
    if ($("#galleryModal").hasClass("show")) {
      if (e.key === "ArrowLeft") openGallery(galleryIndex - 1);
      if (e.key === "ArrowRight") openGallery(galleryIndex + 1);
    }
  });

  // Trailer modal: placeholder is intentionally provided until a licensed trailer URL is supplied
  $(".trailer-trigger").on("click", () => trailerModal.show());

  // Tips
  const tips = [
    "Use cover before you use confidence. A smart rotation can win a fight before it begins.",
    "Keep an eye on the zone timer. Rotating early can give your squad better positions.",
    "Communicate enemy locations clearly: direction, distance and landmark.",
    "Avoid looting for too long. A good position is often worth more than one extra attachment.",
    "When pushing a compound, split angles with your squad instead of entering through one doorway.",
    "Practise recoil in short sessions. Consistency beats random sensitivity changes."
  ];
  let lastTip = 0;
  $("#newTip").on("click", function () {
    let next; do { next = Math.floor(Math.random() * tips.length); } while (next === lastTip);
    lastTip = next; $("#tipText").stop(true).fadeOut(120, function () { $(this).text("“" + tips[next] + "”").fadeIn(220); });
    $("#tipNumber").text(String(next + 1).padStart(2, "0"));
  });

  // Mini survival decision game
  const scenarios = [
    { title: "THE ZONE IS CLOSING.", text: "Your squad is outside the safe zone. You spot a vehicle nearby, but enemy fire is coming from the ridge. What is your move?", choices: ["SPRINT FOR THE VEHICLE", "SMOKE AND ROTATE TO COVER", "RETURN FIRE FROM OPEN GROUND"], good: 1, feedback: ["Risky move: the vehicle may expose your squad. Look for cover first.", "Smart call. Use utility and terrain to break sightlines while rotating.", "Dangerous choice: open-ground duels give the ridge a major advantage."] },
    { title: "A SQUAD HOLDS THE COMPOUND.", text: "You have a teammate watching the flank and a clear route behind a low wall. How do you approach?", choices: ["PUSH THE FRONT DOOR ALONE", "SPLIT ANGLES AND COORDINATE", "WAIT IN THE OPEN"], good: 1, feedback: ["Solo entry makes you easy to isolate. Coordinate your push.", "Strong teamwork. Multiple angles make it harder for defenders to hold.", "Open ground gives away your position. Find cover and make a plan."] },
    { title: "THE FINAL CIRCLE.", text: "Two teams remain. Your squad has a solid ridge position, but one teammate wants to chase a distant knock. What do you do?", choices: ["ABANDON POSITION TO CHASE", "HOLD COVER AND PLAY THE ZONE", "SPRAY RANDOMLY TO PRESSURE"], good: 1, feedback: ["Chasing can give up the strongest position. Keep the win condition in mind.", "Excellent discipline. Protect the position and force opponents to move.", "Unplanned fire wastes resources and reveals your position."] }
  ];
  let scenario = 0;
  function renderScenario() {
    const s = scenarios[scenario];
    $("#scenarioStep").text("SCENARIO " + String(scenario + 1).padStart(2, "0") + " / 03");
    $("#scenarioTitle").text(s.title); $("#scenarioText").text(s.text);
    $("#scenarioFeedback").text("Make your decision to continue.");
    $("#scenarioChoices").html(s.choices.map((choice, i) => `<button class="scenario-choice" data-choice="${i}">${choice}</button>`).join(""));
  }
  $("#scenarioChoices").on("click", ".scenario-choice", function () {
    const choice = Number($(this).data("choice")), s = scenarios[scenario];
    $("#scenarioChoices button").prop("disabled", true).css("opacity", .45);
    $(this).css({ opacity: 1, borderColor: choice === s.good ? "#c9a45c" : "#d71920" });
    $("#scenarioFeedback").text(s.feedback[choice] + (choice === s.good ? " +" : ""));
    setTimeout(() => { if (scenario < scenarios.length - 1) { scenario++; renderScenario(); } else { $("#scenarioTitle").text("SIMULATION COMPLETE."); $("#scenarioText").text("You have completed the field exercise. Review your choices and keep adapting."); $("#scenarioChoices").html("<span class='text-warning'>MISSION COMPLETE — READY FOR THE NEXT DROP.</span>"); $("#scenarioStep").text("EXERCISE COMPLETE"); } }, 1900);
  });
  $("#restartScenario").on("click", () => { scenario = 0; renderScenario(); });
  renderScenario();

  // Contact form: front-end validation only
  const toast = new bootstrap.Toast(document.getElementById("siteToast"), { delay: 3200 });
  function notify(message) { $("#toastMessage").text(message); toast.show(); }
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    const form = this;
    if (!form.checkValidity()) { form.classList.add("was-validated"); notify("Please complete all fields with valid details."); return; }
    notify("Thanks! Your demo message passed validation. No email was sent.");
    form.reset(); form.classList.remove("was-validated");
  });

  // Sound toggle is an honest UI state: no audio file is bundled.
  let soundEnabled = false;
  $("#soundToggle").on("click", function () {
    soundEnabled = !soundEnabled;
    $(this).find("i").toggleClass("bi-volume-up bi-volume-mute");
    $(this).find("span").text(soundEnabled ? "SOUND ON" : "SOUND OFF");
    notify(soundEnabled ? "Sound preference enabled. Add a licensed audio file to play ambience." : "Sound preference muted.");
  });
});
