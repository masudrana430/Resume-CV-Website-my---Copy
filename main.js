(function () {
  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const navOpenIcon = document.getElementById("navOpenIcon");
  const navCloseIcon = document.getElementById("navCloseIcon");

  if (navToggle && mobileNav && navOpenIcon && navCloseIcon) {
    navToggle.addEventListener("click", () => {
      const isHidden = mobileNav.classList.contains("hidden");

      // Show / hide menu
      if (isHidden) {
        mobileNav.classList.remove("hidden");
        navToggle.setAttribute("aria-expanded", "true");
      } else {
        mobileNav.classList.add("hidden");
        navToggle.setAttribute("aria-expanded", "false");
      }

      // Swap icons
      navOpenIcon.classList.toggle("hidden", !isHidden);
      navCloseIcon.classList.toggle("hidden", isHidden);
    });

    // Optional: close mobile menu when clicking a link
    mobileNav.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.add("hidden");
        navToggle.setAttribute("aria-expanded", "false");
        navOpenIcon.classList.remove("hidden");
        navCloseIcon.classList.add("hidden");
      });
    });
  }

  /* =========================
   Shortcuts & DOM handles
   ========================= */
  const root = document.documentElement;
  const themeMeta = document.getElementById("themeColorMeta");
  const progress = document.getElementById("progress");

  /* Tiny toast helper for UX feedback */
  const toast = (msg) => {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1700);
  };

  /* =========================
   Accent helpers
   ========================= */
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = [hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]].join("");
    }
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };
  const rgbToHex = (r, g, b) =>
    "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s, l };
  }
  function hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }
  const hslToHex = (h, s, l) => {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  };

  function setAccent(hex) {
    root.style.setProperty("--brand", hex);
    const { r, g, b } = hexToRgb(hex);
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    const { h, s, l } = rgbToHsl(r, g, b);

    const textL = isLight
      ? clamp(l * 0.4, 0.24, 0.4)
      : clamp(Math.max(l, 0.72), 0.72, 0.86);
    const uiL = isLight
      ? clamp(l * 0.55, 0.38, 0.58)
      : clamp(Math.max(l, 0.62), 0.62, 0.78);

    const brandText = hslToHex(h, s, textL);
    const brandUI = hslToHex(h, s, uiL);

    root.style.setProperty("--brand-text", brandText);
    root.style.setProperty("--brand-ui", brandUI);
    root.style.setProperty(
      "--ring",
      `rgba(${r}, ${g}, ${b}, ${isLight ? 0.32 : 0.28})`
    );
  }

  /* =========================
   Theme toggle + persistence
   ========================= */
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("mr-theme");
  if (savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme);

  themeMeta.content = savedTheme === "light" ? "#f7fafc" : "#0b1220";

  function loadAccent() {
    const saved =
      localStorage.getItem("mr-accent") ||
      getComputedStyle(root).getPropertyValue("--brand").trim() ||
      "#6366F1";
    setAccent(saved);
  }

  document.querySelectorAll(".swatch").forEach((s) =>
    s.addEventListener("click", () => {
      const hex = s.dataset.color;
      localStorage.setItem("mr-accent", hex);
      setAccent(hex);
    })
  );
  loadAccent();

  themeToggle.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "light" ? "" : "light";
    document.documentElement.setAttribute("data-theme", next);
    if (!next) document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("mr-theme", next);
    themeMeta.content = next === "light" ? "#f7fafc" : "#0b1220";
    setAccent(localStorage.getItem("mr-accent") || "#6366F1");
  });

  /* =========================
   Print
   ========================= */
  document
    .getElementById("printBtn")
    .addEventListener("click", () => window.print());

  /* =========================
   Animated tagline
   ========================= */
  const tagline = document.getElementById("tagline");
  const phrases = [
    "Junior Frontend & MERN Developer",
    "Building clean, responsive web applications",
    "React & Tailwind CSS enthusiast",
    "Fast learner and collaborative team player",
  ];

  let pi = 0,
    ci = 0,
    typing = true;
  (function typeLoop() {
    const p = phrases[pi];
    tagline.textContent = typing ? p.slice(0, ++ci) : p.slice(0, --ci);
    if (typing && ci === p.length) {
      typing = false;
      setTimeout(typeLoop, 1100);
      return;
    }
    if (!typing && ci === 0) {
      typing = true;
      pi = (pi + 1) % phrases.length;
    }
    setTimeout(typeLoop, typing ? 38 : 22);
  })();

  /* =========================
   Scroll progress + Back-to-top
   ========================= */
  const toTop = document.getElementById("toTop");
  window.addEventListener(
    "scroll",
    () => {
      const h = document.documentElement;
      const sc = h.scrollTop;
      const dh = h.scrollHeight - h.clientHeight;
      progress.style.width = (sc / dh) * 100 + "%";
      if (sc > 260) toTop.classList.add("show");
      else toTop.classList.remove("show");
    },
    { passive: true }
  );
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  // footer "Back to top" link (moved from inline onclick)
  const footerBackToTop = document.getElementById("footerBackToTop");
  if (footerBackToTop) {
    footerBackToTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================
   Reveal panels
   ========================= */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add("show");
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".panel.reveal").forEach((el) => io.observe(el));

  /* =========================
   Animate skill bars
   ========================= */
  const skillIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.querySelectorAll(".skill").forEach((s) => {
            const lvl = Math.min(100, parseFloat(s.dataset.level || "0"));
            const bar = s.querySelector(".bar > span");
            bar.style.width = lvl + "%";
          });
          skillIO.unobserve(e.target);
        }
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll(".panel").forEach((p) => skillIO.observe(p));

  /* =========================
   Click-to-copy contact rows
   ========================= */
  document.querySelectorAll(".row[data-copy]").forEach((r) =>
    r.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(r.dataset.copy);
        toast("Copied: " + r.dataset.copy);
      } catch {
        toast("Copy failed");
      }
    })
  );

  /* =========================
   Avatar 3D tilt
   ========================= */
  const tilt = document.getElementById("tilt");
  const img = tilt.querySelector(".avatar");
  tilt.addEventListener("mousemove", (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    img.style.transform = `rotateX(${(-y * 6).toFixed(
      2
    )}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
  });
  tilt.addEventListener("mouseleave", () => (img.style.transform = ""));

  /* =========================
   Certificates modal & toggle
   ========================= */
  const certModal = document.getElementById("certModal");
  const openCert = document.getElementById("openCert");
  const closeCert = document.getElementById("closeCert");
  const certObj = document.getElementById("certObj");
  const certImg = document.getElementById("certImg");
  const toggleView = document.getElementById("toggleView");

  function openModal() {
    if (certModal.showModal) certModal.showModal();
    else window.open(certObj.data, "_blank");
  }
  openCert.addEventListener("click", openModal);
  certObj.addEventListener("click", openModal);
  closeCert?.addEventListener("click", () => certModal.close());

  toggleView.addEventListener("click", () => {
    const showImage = certObj.style.display !== "none";
    certObj.style.display = showImage ? "none" : "";
    certImg.style.display = showImage ? "" : "none";
  });

  /* =========================
   Copy profile link
   ========================= */
  document
    .getElementById("copyProfile")
    .addEventListener("click", async () => {
      const url = location.href;
      try {
        await navigator.clipboard.writeText(url);
        toast("Profile link copied");
      } catch {
        toast("Copy failed");
      }
    });

  /* =========================
   References (CRUD, localStorage)
   ========================= */
  const refKey = "mr-refs";
  const refList = document.getElementById("refList");
  const addRefBtn = document.getElementById("addRef");
  const exportRefsBtn = document.getElementById("exportRefs");
  const refModal = document.getElementById("refModal");
  const refForm = document.getElementById("refForm");
  const refCancel = document.getElementById("refCancel");
  const refDelete = document.getElementById("refDelete");
  const $ = (id) => document.getElementById(id);
  let refs = [];
  let editIndex = -1;

  let _refBackdrop;
  const openRefModal = () => {
    if (refModal.showModal) refModal.showModal();
    else {
      refModal.setAttribute("open", "");
      _refBackdrop = document.createElement("div");
      _refBackdrop.className = "modal-backdrop";
      document.body.appendChild(_refBackdrop);
    }
  };
  const closeRefModal = () => {
    if (typeof refModal.close === "function") refModal.close();
    else {
      refModal.removeAttribute("open");
      _refBackdrop && _refBackdrop.remove();
      _refBackdrop = null;
    }
  };

  const esc = (s) =>
    String(s || "").replace(
      /[&<>"']/g,
      (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m])
    );

  function loadRefs() {
    try {
      refs = JSON.parse(localStorage.getItem(refKey)) || [];
    } catch {
      refs = [];
    }
  }
  function saveRefs() {
    localStorage.setItem(refKey, JSON.stringify(refs));
  }

  function renderRefs() {
    if (!refList) return;
    if (!refs.length) {
      refList.innerHTML =
        '<div class="muted">No references yet. Click “Add reference”.</div>';
      return;
    }
    refList.innerHTML = refs
      .map(
        (r, i) => `
      <div class="ref-card" data-idx="${i}">
        <div>
          <h4>${esc(r.name)}</h4>
          <div class="ref-meta">${esc(
          [r.role, r.company].filter(Boolean).join(" — ")
        )}</div>
          ${r.phone ? `<div class="ref-meta">${esc(r.phone)}</div>` : ""}
          ${r.email ? `<div class="ref-meta">${esc(r.email)}</div>` : ""}
        </div>
        <div class="ref-actions">
          <button class="btn ref-edit" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn ref-del" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>`
      )
      .join("");
  }

  loadRefs();
  renderRefs();

  addRefBtn?.addEventListener("click", () => {
    editIndex = -1;
    refForm.reset();
    refDelete.style.display = "none";
    openRefModal();
  });

  refDelete.style.display = "none";
  refCancel?.addEventListener("click", () => closeRefModal());

  refList?.addEventListener("click", (e) => {
    const card = e.target.closest(".ref-card");
    if (!card) return;
    const idx = Number(card.dataset.idx);

    if (e.target.closest(".ref-edit")) {
      editIndex = idx;
      const r = refs[idx] || {};
      $("refName").value = r.name || "";
      $("refRole").value = r.role || "";
      $("refCompany").value = r.company || "";
      $("refPhone").value = r.phone || "";
      $("refEmail").value = r.email || "";
      refDelete.style.display = "";
      openRefModal();
    } else if (e.target.closest(".ref-del")) {
      if (confirm("Delete this reference?")) {
        refs.splice(idx, 1);
        saveRefs();
        renderRefs();
        toast("Reference removed");
      }
    }
  });

  refDelete?.addEventListener("click", () => {
    if (editIndex >= 0 && confirm("Delete this reference?")) {
      refs.splice(editIndex, 1);
      saveRefs();
      renderRefs();
      closeRefModal();
      toast("Reference removed");
    }
  });

  refForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      name: $("refName").value.trim(),
      role: $("refRole").value.trim(),
      company: $("refCompany").value.trim(),
      phone: $("refPhone").value.trim(),
      email: $("refEmail").value.trim(),
    };
    if (!data.name) {
      toast("Name is required");
      return;
    }
    if (editIndex >= 0) refs[editIndex] = data;
    else refs.push(data);
    saveRefs();
    renderRefs();
    closeRefModal();
    toast("Reference saved");
  });

  exportRefsBtn?.addEventListener("click", async () => {
    const text = refs
      .map(
        (r) => `${r.name}
${[r.role, r.company].filter(Boolean).join(" — ")}
${[r.phone, r.email].filter(Boolean).join(" • ")}`
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast("References copied");
    } catch {
      toast("Copy failed");
    }
  });

  /* Footer year */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* =========================
 Initialize meters after DOM ready
 ========================= */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".meter").forEach(function (m) {
    var lvl = Math.min(
      100,
      parseFloat(m.getAttribute("data-level") || "0")
    );
    var span = m.querySelector("span");
    if (span) span.style.width = lvl + "%";
    m.setAttribute("aria-valuenow", String(lvl));
    var title = m.previousElementSibling;
    if (title) {
      var v = title.querySelector(".val");
      if (v) v.textContent = Math.round(lvl * 100) / 100 + "%";
    }
  });
});


// ===== Certificates: multi-PDF gallery =====
(function () {
  const certPills = document.querySelectorAll(".cert-pill[data-cert-pdf]");
  const certObj = document.getElementById("certObj");
  const certImg = document.getElementById("certImg");
  const certTitleEl = document.getElementById("certTitle");
  const certTagEl = document.getElementById("certTag");
  const openBtn = document.getElementById("openCert");
  const downloadLink = document.getElementById("downloadCert");
  const toggleBtn = document.getElementById("toggleView");

  if (!certPills.length || !certObj || !openBtn || !downloadLink) return;

  let current = {
    pdf: "",
    image: "",
    title: "",
    tag: "",
  };
  let showPdf = true;

  function applyCert(data) {
    current = data;

    // Update active pill
    certPills.forEach((pill) => {
      pill.classList.toggle("is-active", pill === data.element);
    });

    // Update viewer
    certObj.setAttribute("data", data.pdf || "");
    if (certImg) {
      if (data.image) {
        certImg.src = data.image;
      }
      certImg.style.display = showPdf || !data.image ? "none" : "block";
      certObj.style.display = showPdf || !data.image ? "block" : "none";
    }

    // Update text
    if (certTitleEl) certTitleEl.textContent = data.title || "Certificate";
    if (certTagEl) certTagEl.textContent = data.tag || "";

    // Update download link (PDF)
    downloadLink.href = data.pdf || "#";
    const safeName =
      (data.title || "certificate").replace(/\s+/g, "-").toLowerCase() +
      ".pdf";
    downloadLink.download = safeName;
  }

  function pillToData(pill) {
    return {
      element: pill,
      pdf: pill.dataset.certPdf || "",
      image: pill.dataset.certImg || "",
      title: pill.dataset.certTitle || pill.textContent.trim(),
      tag: pill.dataset.certTag || "",
    };
  }

  certPills.forEach((pill) => {
    pill.addEventListener("click", () => applyCert(pillToData(pill)));
  });

  // Initial selection = first pill
  applyCert(pillToData(certPills[0]));

  // Open in new tab
  openBtn.addEventListener("click", () => {
    if (current.pdf) {
      window.open(current.pdf, "_blank", "noopener");
    }
  });

  // Toggle PDF vs image (if you later add PNG/JPG previews)
  if (toggleBtn && certImg) {
    toggleBtn.addEventListener("click", () => {
      showPdf = !showPdf;
      if (!current.image) {
        // No image available – always show PDF
        showPdf = true;
      }
      certObj.style.display = showPdf ? "block" : "none";
      certImg.style.display = showPdf ? "none" : "block";
    });
  }
})();


// =============================
// "Let's talk" contact modal
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const contactModal = document.getElementById("contactModal");
  const openContact = document.getElementById("openContactModal");
  const contactClose = document.getElementById("contactClose");
  const contactCancel = document.getElementById("contactCancel");
  const contactForm = document.getElementById("contactForm");
  let contactBackdrop = null;

  if (!contactModal || !openContact) return;

  const openModal = () => {
    if (contactModal.open) return;
    contactModal.showModal();

    contactBackdrop = document.createElement("div");
    contactBackdrop.className = "modal-backdrop";
    document.body.appendChild(contactBackdrop);
  };

  const closeModal = () => {
    if (contactModal.open) contactModal.close();
    if (contactBackdrop) {
      contactBackdrop.remove();
      contactBackdrop = null;
    }
  };

  openContact.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  if (contactClose) {
    contactClose.addEventListener("click", closeModal);
  }
  if (contactCancel) {
    contactCancel.addEventListener("click", closeModal);
  }

  // Close on Esc using dialog "cancel" event
  contactModal.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeModal();
  });

  // Click outside dialog to close
  contactModal.addEventListener("click", (e) => {
    const rect = contactModal.getBoundingClientRect();
    const clickInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!clickInDialog) {
      closeModal();
    }
  });

  // Build mailto body from form and open email client
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (document.getElementById("contactName")?.value || "").trim();
      const email =
        (document.getElementById("contactEmail")?.value || "").trim();
      const topic =
        (document.getElementById("contactTopic")?.value || "").trim();
      const budget =
        (document.getElementById("contactBudget")?.value || "").trim();
      const message =
        (document.getElementById("contactMessage")?.value || "").trim();

      const lines = [
        `Name: ${name || "N/A"}`,
        `Email: ${email || "N/A"}`,
        topic && `Topic: ${topic}`,
        budget && `Budget: ${budget}`,
        "",
        "Message:",
        message || "(no message provided)"
      ].filter(Boolean);

      const subject = encodeURIComponent(
        `New message from ${name || "portfolio visitor"}`
      );
      const body = encodeURIComponent(lines.join("\n"));

      window.location.href = `mailto:masud040502@gmail.com?subject=${subject}&body=${body}`;

      closeModal();
    });
  }
});
