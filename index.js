(() => {
  'use strict';

  /* ========================================================
     DOM
  ======================================================== */

  const body = document.body;

  const header =
    document.getElementById('site-header');

  const mobileMenu =
    document.getElementById('mobile-menu');

  const menuToggle =
    document.querySelector('.menu-toggle');

  const year =
    document.getElementById('year');

  const nextEvent =
    document.getElementById('next-third-sunday');

  const progress =
    document.getElementById('scroll-progress');

  const heroSpotlight =
    document.getElementById('hero-spotlight');

  const connectSpotlight =
    document.getElementById('connect-spotlight');


  /* ========================================================
     YEAR
  ======================================================== */

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }


  /* ========================================================
     REDUCED MOTION
  ======================================================== */

  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  /* ========================================================
     UTILITIES
  ======================================================== */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);


  /* ========================================================
     MOBILE NAVIGATION
  ======================================================== */

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) {
      return;
    }

    menuToggle.setAttribute(
      'aria-expanded',
      String(open)
    );

    menuToggle.setAttribute(
      'aria-label',
      open
        ? 'Close menu'
        : 'Open menu'
    );

    mobileMenu.setAttribute(
      'aria-hidden',
      String(!open)
    );

    if (open) {
      mobileMenu.removeAttribute('inert');
    } else {
      mobileMenu.setAttribute(
        'inert',
        ''
      );
    }

    mobileMenu.classList.toggle(
      'is-open',
      open
    );

    body.classList.toggle(
      'menu-open',
      open
    );

    body.classList.toggle(
      'no-cursor',
      open
    );
  };


  menuToggle?.addEventListener(
    'click',
    () => {
      const open =
        menuToggle.getAttribute(
          'aria-expanded'
        ) === 'true';

      setMenu(!open);
    }
  );


  mobileMenu?.querySelectorAll('a').forEach(
    (link) => {
      link.addEventListener(
        'click',
        () => {
          setMenu(false);
        }
      );
    }
  );


  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        setMenu(false);
      }
    }
  );


  /* ========================================================
     HEADER / SCROLL STATE
  ======================================================== */

  let lastScrollY =
    window.scrollY;

  let scrollTicking =
    false;

  const navLinks =
    [...document.querySelectorAll('.nav-link')];

  const sectionMap = [
    {
      id: 'top',
      nav: '#top'
    },
    {
      id: 'community',
      nav: '#community'
    },
    {
      id: 'youth-connect',
      nav: '#youth-connect'
    },
    {
      id: 'story',
      nav: '#story'
    },
    {
      id: 'social',
      nav: '#social'
    }
  ];


  const updateHeader =
    () => {
      const currentY =
        window.scrollY;

      if (header) {
        header.classList.toggle(
          'is-scrolled',
          currentY > 30
        );

        if (
          currentY >
            lastScrollY + 10 &&
          currentY > 180 &&
          !body.classList.contains(
            'menu-open'
          )
        ) {
          header.classList.add(
            'is-hidden'
          );
        }

        if (
          currentY <
            lastScrollY - 10 ||
          currentY < 80
        ) {
          header.classList.remove(
            'is-hidden'
          );
        }
      }

      lastScrollY =
        currentY;

      scrollTicking =
        false;
    };


  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) {
        return;
      }

      scrollTicking = true;

      requestAnimationFrame(
        updateHeader
      );
    },
    {
      passive: true
    }
  );


  /* ========================================================
     SCROLL PROGRESS
  ======================================================== */

  const updateProgress =
    () => {
      if (!progress) {
        return;
      }

      const scrollTop =
        window.scrollY;

      const scrollHeight =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      const percentage =
        scrollHeight > 0
          ? (scrollTop / scrollHeight) * 100
          : 0;

      progress.style.width =
        `${clamp(
          percentage,
          0,
          100
        )}%`;
    };


  window.addEventListener(
    'scroll',
    updateProgress,
    {
      passive: true
    }
  );

  updateProgress();


  /* ========================================================
     ACTIVE NAVIGATION
  ======================================================== */

  if (
    'IntersectionObserver'
    in window
  ) {
    const sectionObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const match =
                sectionMap.find(
                  (section) =>
                    section.id ===
                    entry.target.id
                );

              if (!match) {
                return;
              }

              navLinks.forEach(
                (link) => {
                  link.classList.toggle(
                    'is-active',
                    link.getAttribute(
                      'href'
                    ) === match.nav
                  );
                }
              );
            }
          );
        },
        {
          rootMargin:
            '-42% 0px -50% 0px',
          threshold: 0
        }
      );

    sectionMap.forEach(
      ({ id }) => {
        const section =
          document.getElementById(id);

        if (section) {
          sectionObserver.observe(
            section
          );
        }
      }
    );
  }


  /* ========================================================
     REVEAL SYSTEM
  ======================================================== */

  if (
    'IntersectionObserver'
    in window
  ) {
    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                'is-visible'
              );

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: .1,
          rootMargin:
            '0px 0px -7% 0px'
        }
      );

    document
      .querySelectorAll(
        '.reveal-up, .reveal-scale'
      )
      .forEach(
        (element) => {
          revealObserver.observe(
            element
          );
        }
      );
  } else {
    document
      .querySelectorAll(
        '.reveal-up, .reveal-scale'
      )
      .forEach(
        (element) => {
          element.classList.add(
            'is-visible'
          );
        }
      );
  }


  /* ========================================================
     IMAGE FAILURE FALLBACKS
  ======================================================== */

  document
    .querySelectorAll('img')
    .forEach(
      (image) => {
        image.addEventListener(
          'error',
          () => {
            const parent =
              image.parentElement;

            image.remove();

            const fallback =
              parent?.querySelector(
                '.image-fallback'
              );

            if (fallback) {
              fallback.style.zIndex =
                '0';
            }
          },
          {
            once: true
          }
        );
      }
    );


  /* ========================================================
     NEXT THIRD SUNDAY
  ======================================================== */

  const getThirdSunday =
    (
      yearValue,
      monthValue
    ) => {
      const date =
        new Date(
          yearValue,
          monthValue,
          15,
          12,
          0,
          0,
          0
        );

      const weekday =
        date.getDay();

      const daysUntilSunday =
        (7 - weekday) % 7;

      date.setDate(
        15 +
          daysUntilSunday
      );

      return date;
    };


  const getNextThirdSunday =
    (
      from = new Date()
    ) => {
      const current =
        new Date(from);

      current.setHours(
        12,
        0,
        0,
        0
      );

      let candidate =
        getThirdSunday(
          current.getFullYear(),
          current.getMonth()
        );

      if (
        candidate <
        current
      ) {
        candidate =
          getThirdSunday(
            current.getFullYear(),
            current.getMonth() + 1
          );
      }

      return candidate;
    };


  if (nextEvent) {
    const date =
      getNextThirdSunday();

    nextEvent.textContent =
      new Intl.DateTimeFormat(
        'en-AU',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      ).format(date);
  }


  /* ========================================================
     LIGHTWEIGHT PARALLAX
  ======================================================== */

  const canParallax =
    !reducedMotion &&
    window.matchMedia(
      '(min-width: 861px)'
    ).matches;

  const parallaxItems =
    canParallax
      ? [
          ...document.querySelectorAll(
            '[data-parallax]'
          )
        ]
      : [];

  if (
    parallaxItems.length
  ) {
    let frame = null;

    const renderParallax =
      () => {
        const viewportHeight =
          window.innerHeight;

        parallaxItems.forEach(
          (element) => {
            const speed =
              Number(
                element.dataset
                  .parallax
              ) || 0;

            const rect =
              element.getBoundingClientRect();

            const centerOffset =
              (
                rect.top +
                rect.height / 2 -
                viewportHeight / 2
              ) * speed;

            if (
              element.classList.contains(
                'hero-media'
              )
            ) {
              element.style.transform =
                `translate3d(0, ${centerOffset.toFixed(
                  2
                )}px, 0) scale(1.055)`;
            } else {
              element.style.transform =
                `translate3d(0, ${centerOffset.toFixed(
                  2
                )}px, 0)`;
            }
          }
        );

        frame = null;
      };


    const requestParallax =
      () => {
        if (frame !== null) {
          return;
        }

        frame =
          requestAnimationFrame(
            renderParallax
          );
      };


    window.addEventListener(
      'scroll',
      requestParallax,
      {
        passive: true
      }
    );

    window.addEventListener(
      'resize',
      requestParallax,
      {
        passive: true
      }
    );

    renderParallax();
  }


  /* ========================================================
     SPOTLIGHT EFFECT
  ======================================================== */

  const spotlightElements = [
    {
      element: heroSpotlight,
      section:
        document.querySelector(
          '.hero'
        )
    },
    {
      element: connectSpotlight,
      section:
        document.querySelector(
          '.youth-connect'
        )
    }
  ];


  spotlightElements.forEach(
    ({
      element,
      section
    }) => {
      if (
        !element ||
        !section
      ) {
        return;
      }

      section.addEventListener(
        'pointermove',
        (event) => {
          if (
            reducedMotion ||
            window.innerWidth <
              861
          ) {
            return;
          }

          const rect =
            section.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left;

          const y =
            event.clientY -
            rect.top;

          element.style.left =
            `${x}px`;

          element.style.top =
            `${y}px`;
        },
        {
          passive: true
        }
      );

      section.addEventListener(
        'pointerleave',
        () => {
          element.style.opacity =
            '0';

          window.setTimeout(
            () => {
              element.style.opacity =
                '';
            },
            250
          );
        }
      );
    }
  );


  /* ========================================================
     SPOTLIGHT IMAGE CARDS
  ======================================================== */

  document
    .querySelectorAll(
      '.spotlight-card'
    )
    .forEach(
      (card) => {
        card.addEventListener(
          'pointermove',
          (event) => {
            if (
              reducedMotion ||
              window.innerWidth <
                861
            ) {
              return;
            }

            const rect =
              card.getBoundingClientRect();

            const x =
              event.clientX -
              rect.left;

            const y =
              event.clientY -
              rect.top;

            const px =
              x /
              rect.width;

            const py =
              y /
              rect.height;

            const rotateX =
              (0.5 - py) * 3;

            const rotateY =
              (px - 0.5) * 4;

            card.style.transform =
              `perspective(1000px) rotateX(${rotateX.toFixed(
                2
              )}deg) rotateY(${rotateY.toFixed(
                2
              )}deg)`;

            card.style.setProperty(
              '--spot-x',
              `${x}px`
            );

            card.style.setProperty(
              '--spot-y',
              `${y}px`
            );
          },
          {
            passive: true
          }
        );

        card.addEventListener(
          'pointerleave',
          () => {
            card.style.transform =
              '';
          }
        );
      }
    );


  /* ========================================================
     MAGNETIC INTERACTIONS
  ======================================================== */

  if (
    !reducedMotion &&
    window.matchMedia(
      '(pointer: fine)'
    ).matches
  ) {
    document
      .querySelectorAll(
        '[data-magnetic]'
      )
      .forEach(
        (element) => {
          const strength =
            Number(
              element.dataset
                .magnetic
            ) || .1;

          element.addEventListener(
            'pointermove',
            (event) => {
              const rect =
                element.getBoundingClientRect();

              const x =
                event.clientX -
                (
                  rect.left +
                  rect.width / 2
                );

              const y =
                event.clientY -
                (
                  rect.top +
                  rect.height / 2
                );

              element.style.transform =
                `translate3d(${(
                  x * strength
                ).toFixed(
                  2
                )}px, ${(
                  y * strength
                ).toFixed(
                  2
                )}px, 0)`;
            }
          );

          element.addEventListener(
            'pointerleave',
            () => {
              element.style.transform =
                '';
            }
          );
        }
      );
  }


  /* ========================================================
     CUSTOM CURSOR
  ======================================================== */

  const finePointer =
    window.matchMedia(
      '(pointer: fine) and (min-width: 1000px)'
    );

  if (
    finePointer.matches &&
    !reducedMotion
  ) {
    const dot =
      document.querySelector(
        '.cursor-dot'
      );

    const ring =
      document.querySelector(
        '.cursor-ring'
      );

    if (dot && ring) {
      body.classList.add(
        'has-pointer'
      );

      let mouseX =
        window.innerWidth / 2;

      let mouseY =
        window.innerHeight / 2;

      let ringX =
        mouseX;

      let ringY =
        mouseY;


      window.addEventListener(
        'pointermove',
        (event) => {
          mouseX =
            event.clientX;

          mouseY =
            event.clientY;

          dot.style.transform =
            `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        },
        {
          passive: true
        }
      );


      const animateCursor =
        () => {
          ringX +=
            (
              mouseX - ringX
            ) * .15;

          ringY +=
            (
              mouseY - ringY
            ) * .15;

          ring.style.transform =
            `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

          requestAnimationFrame(
            animateCursor
          );
        };

      requestAnimationFrame(
        animateCursor
      );


      document
        .querySelectorAll(
          'a, button, .story-photo, .social-card, .location-art, .spotlight-card'
        )
        .forEach(
          (element) => {
            element.addEventListener(
              'pointerenter',
              () => {
                body.classList.add(
                  'cursor-hover'
                );
              }
            );

            element.addEventListener(
              'pointerleave',
              () => {
                body.classList.remove(
                  'cursor-hover'
                );
              }
            );
          }
        );
    }
  }


  /* ========================================================
     SMOOTH ANCHORS
  ======================================================== */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(
      (link) => {
        link.addEventListener(
          'click',
          (event) => {
            const targetId =
              link.getAttribute(
                'href'
              );

            if (
              !targetId ||
              targetId === '#'
            ) {
              return;
            }

            const target =
              document.querySelector(
                targetId
              );

            if (!target) {
              return;
            }

            event.preventDefault();

            target.scrollIntoView(
              {
                behavior:
                  reducedMotion
                    ? 'auto'
                    : 'smooth',
                block:
                  'start'
              }
            );
          }
        );
      }
    );


  /* ========================================================
     RESIZE STATE
  ======================================================== */

  window.addEventListener(
    'resize',
    () => {
      if (
        window.innerWidth >
          1000 &&
        body.classList.contains(
          'menu-open'
        )
      ) {
        setMenu(false);
      }
    },
    {
      passive: true
    }
  );


  /* ========================================================
     VISUAL POLISH: IMAGE LOAD STATE
  ======================================================== */

  window.addEventListener(
    'load',
    () => {
      document.documentElement.classList.add(
        'page-ready'
      );
    }
  );

})();
