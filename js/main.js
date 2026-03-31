(function () {
  "use strict";

  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMobile = document.querySelector("[data-nav-mobile]");
  var navIconOpen = document.querySelector("[data-nav-icon-open]");
  var navIconClose = document.querySelector("[data-nav-icon-close]");

  function setNavOpen(open) {
    if (!navMobile) return;
    navMobile.classList.toggle("is-open", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (navIconOpen) navIconOpen.hidden = open;
    if (navIconClose) navIconClose.hidden = !open;
  }

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      var open = !navMobile.classList.contains("is-open");
      setNavOpen(open);
    });

    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024) setNavOpen(false);
  });

  /* Scroll reveal */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var delay = function (el) {
      var ms = parseInt(el.getAttribute("data-reveal-delay"), 10);
      return isNaN(ms) ? 0 : ms;
    };

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var d = delay(el);
          if (d) {
            setTimeout(function () {
              el.classList.add("is-visible");
            }, d);
          } else {
            el.classList.add("is-visible");
          }
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* Film previews: autoplay muted when in view, pause when scrolled away */
  var filmVideos = document.querySelectorAll(".film-card__video");
  filmVideos.forEach(function (v) {
    v.muted = true;
  });

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (filmVideos.length && !reduceMotion && "IntersectionObserver" in window) {
    var wirePreview = function (video) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var v = entry.target;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
              v.muted = true;
              var p = v.play();
              if (p !== undefined && typeof p.catch === "function") {
                p.catch(function () {});
              }
            } else {
              v.pause();
            }
          });
        },
        { threshold: [0, 0.2, 0.45], rootMargin: "0px 0px -5% 0px" }
      );
      io.observe(video);
    };
    filmVideos.forEach(wirePreview);
  }

  /* Contact form: static demo — swap action for Formspare / backend */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alert(
        "This is a static preview. Connect this form to your email or a service like Formspree to receive messages."
      );
    });
  }
})();
