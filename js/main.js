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

  /* Gallery: single img in the DOM; JS swaps src/alt so slides never stack */
  var gallerySlides = [
    { src: "images/gallery/slide-01.png", alt: "Promotional poster for the Film and TV Masterclass in KwaZulu-Natal, featuring official presenters.", w: 1200, h: 1600 },
    { src: "images/gallery/slide-02.png", alt: "Film crew on location beside a pool with boom microphone and cinema camera.", w: 1600, h: 1067 },
    { src: "images/gallery/slide-03.png", alt: "Colleagues celebrating at a dinner in a warm, wood-paneled restaurant.", w: 1200, h: 1600 },
    { src: "images/gallery/slide-04.png", alt: "Group photo outdoors at the Nelson Mandela Capture Site sculpture in KZN.", w: 1600, h: 900 },
    { src: "images/gallery/slide-05.png", alt: "Team collaborating indoors with headphones during an audio session.", w: 1600, h: 1200 },
    { src: "images/gallery/slide-06.png", alt: "Group of colleagues posing cheerfully outside a hotel entrance at dusk.", w: 1600, h: 900 },
    { src: "images/gallery/slide-07.png", alt: "Two people on a rural bridge overlooking green hills and mountains.", w: 1600, h: 900 },
    { src: "images/gallery/slide-08.png", alt: "Two giraffes on a grassy ridge silhouetted against a bright blue sky.", w: 1200, h: 1600 },
    { src: "images/gallery/slide-09.png", alt: "On-location security and crew in high-visibility vests in a grassy field.", w: 1600, h: 900 },
    { src: "images/gallery/slide-10.png", alt: "Travel group posing outside a hotel entrance in late-afternoon light.", w: 1600, h: 900 },
    { src: "images/gallery/slide-11.png", alt: "Team photo on a cobbled plaza in front of a glass-fronted building.", w: 1600, h: 900 },
    { src: "images/gallery/slide-12.png", alt: "Behind the scenes: boom operator and camera on tripod in a grassy, wooded area.", w: 1600, h: 900 },
    { src: "images/gallery/slide-13.png", alt: "Wide shot of a film set in a field with scrims, tent, and crew.", w: 1600, h: 900 },
    { src: "images/gallery/slide-14.png", alt: "Four cast or crew members standing in long grass, looking toward the horizon.", w: 1600, h: 900 },
    { src: "images/gallery/slide-15.png", alt: "Large diverse group smiling together outdoors in front of evergreen trees.", w: 1600, h: 900 }
  ];

  var carouselRoot = document.querySelector("[data-carousel]");
  var carouselImg = document.querySelector("[data-carousel-img]");
  if (carouselRoot && carouselImg) {
    var prevBtn = carouselRoot.querySelector("[data-carousel-prev]");
    var nextBtn = carouselRoot.querySelector("[data-carousel-next]");
    var dotsWrap = carouselRoot.querySelector("[data-carousel-dots]");
    var live = carouselRoot.querySelector("[data-carousel-live]");
    var n = gallerySlides.length;
    var index = 0;
    var timer = null;
    var intervalMs = 5500;

    var reduceMotionGallery =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setStatus() {
      if (!live) return;
      live.textContent = "Slide " + (index + 1) + " of " + n;
    }

    function updateDots() {
      if (!dotsWrap) return;
      var btns = dotsWrap.querySelectorAll(".gallery-carousel__dot");
      btns.forEach(function (b, i) {
        var on = i === index;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
      });
    }

    function goTo(i) {
      if (n === 0) return;
      index = ((i % n) + n) % n;
      var s = gallerySlides[index];
      if (s) {
        carouselImg.src = s.src;
        carouselImg.alt = s.alt;
        if (s.w) carouselImg.width = s.w;
        if (s.h) carouselImg.height = s.h;
      }
      setStatus();
      updateDots();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startTimer() {
      stopTimer();
      if (reduceMotionGallery || n < 2) return;
      timer = window.setInterval(next, intervalMs);
    }

    if (dotsWrap && n) {
      for (var di = 0; di < n; di++) {
        (function (i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "gallery-carousel__dot";
          dot.setAttribute("role", "tab");
          dot.setAttribute("aria-label", "Go to slide " + (i + 1));
          dot.addEventListener("click", function () {
            goTo(i);
            startTimer();
          });
          dotsWrap.appendChild(dot);
        })(di);
      }
    }

    goTo(0);

    if (prevBtn) prevBtn.addEventListener("click", function () {
      prev();
      startTimer();
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      next();
      startTimer();
    });

    carouselRoot.addEventListener("mouseenter", stopTimer);
    carouselRoot.addEventListener("mouseleave", startTimer);
    carouselRoot.addEventListener("focusin", stopTimer);
    carouselRoot.addEventListener("focusout", function (e) {
      if (!carouselRoot.contains(e.relatedTarget)) startTimer();
    });

    startTimer();
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
