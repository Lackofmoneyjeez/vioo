(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Count the seven-segment readout up to the target age ---------- */
  function animateAgeCounter(el, target, duration) {
    if (!el) return;
    if (reduceMotion) {
      el.textContent = String(target).padStart(2, "0");
      return;
    }
    var startTime = null;
    function frame(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var value = Math.floor(progress * target);
      el.textContent = String(value).padStart(2, "0");
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = String(target).padStart(2, "0");
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Boot the hero: fade tagline/readout in, then count up the age ---------- */
  function runIntro() {
    var tagline = document.querySelector(".tagline");
    var readout = document.querySelector(".readout");
    var segAge = document.getElementById("segAge");

    setTimeout(function () {
      if (tagline) tagline.classList.add("show");
    }, 150);

    setTimeout(function () {
      if (readout) readout.classList.add("show");
      animateAgeCounter(segAge, 19, 700);
    }, 400);
  }

  /* ---------- Scroll reveal for sections ---------- */
  function setupScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Subtle circuit-grid parallax on pointer move ---------- */
  function setupGridParallax() {
    var grid = document.getElementById("gridBg");
    if (!grid || reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    var ticking = false;
    window.addEventListener("mousemove", function (e) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var xRatio = e.clientX / window.innerWidth - 0.5;
        var yRatio = e.clientY / window.innerHeight - 0.5;
        var moveX = xRatio * 16;
        var moveY = yRatio * 16;
        grid.style.transform = "translate(" + moveX.toFixed(1) + "px, " + moveY.toFixed(1) + "px)";
        ticking = false;
      });
    });
  }

  /* ---------- Modal popups (ABOUT_ME.EXE / SKILL_TREE.LOG) ---------- */
  function setupModals() {
    var overlay = document.getElementById("modalOverlay");
    if (!overlay) return;

    var openers = document.querySelectorAll("[data-modal]");
    var closers = overlay.querySelectorAll("[data-close]");
    var activeModal = null;
    var lastFocused = null;

    function openModal(id) {
      var modal = document.getElementById(id);
      if (!modal) return;
      lastFocused = document.activeElement;
      activeModal = modal;

      overlay.classList.add("open");
      modal.classList.add("active");
      void overlay.offsetWidth;
      overlay.classList.add("show");
      modal.classList.add("show");

      modal.focus();
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      if (!activeModal) return;
      var modal = activeModal;

      overlay.classList.remove("show");
      modal.classList.remove("show");

      setTimeout(function () {
        overlay.classList.remove("open");
        modal.classList.remove("active");
        document.body.style.overflow = "";
      }, 200);

      activeModal = null;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(btn.getAttribute("data-modal"));
      });
    });

    closers.forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && activeModal) closeModal();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    runIntro();
    setupScrollReveal();
    setupGridParallax();
    setupModals();
  });
})();

