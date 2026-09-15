(() => {
  'use strict';

  const body = document.body;
  const header = document.getElementById('site-header');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const year = document.getElementById('year');
  const nextEvent = document.getElementById('next-third-sunday');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /*
   * ---------------------------------------------------------
   * MOBILE NAVIGATION
   * ---------------------------------------------------------
   */

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;

    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute(
      'aria-label',
      open ? 'Close menu' : 'Open menu'
    );

    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen =
      menuToggle.getAttribute('aria-expanded') === 'true';

    setMenu(!isOpen);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenu(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenu(false);
    }
  });

  /*
   * ---------------------------------------------------------
   * HEADER / SCROLL STATE
   * ---------------------------------------------------------
   */

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  const navLinks = [
    ...document.querySelectorAll('.nav-link'),
  ];

  const sectionMap = [
    { id: 'top', nav: '#top' },
    { id: 'community', nav: '#community' },
    { id: 'youth-connect', nav: '#youth-connect' },
    { id: 'story', nav: '#story' },
    { id: 'social', nav: '#social' },
  ];

  const updateScrollState = () => {
    const currentY = window.scrollY;

    header?.classList.toggle(
      'is-scrolled',
      currentY > 30
    );

    if (
      currentY > lastScrollY + 10 &&
      currentY > 180 &&
      !body.classList.contains('menu-open')
    ) {
      header?.classList.add('is-hidden');
    }

    if (
      currentY < lastScrollY - 10 ||
      currentY < 80
    ) {
      header?.classList.remove('is-hidden');
    }

    lastScrollY = currentY;
    scrollTicking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) return;

      scrollTicking = true;
      requestAnimationFrame(updateScrollState);
    },
    { passive: true }
  );

  /*
   * ---------------------------------------------------------
   * ACTIVE NAVIGATION
   * ---------------------------------------------------------
   */

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const section = sectionMap.find(
            (item) => item.id === entry.target.id
          );

          if (!section) return;

          navLinks.forEach((link) => {
            link.classList.toggle(
              'is-active',
              link.getAttribute('href') === section.nav
            );
          });
        });
      },
      {
        rootMargin: '-42% 0px -50% 0px',
        threshold: 0,
      }
    );

    sectionMap.forEach(({ id }) => {
      const section = document.getElementById(id);

      if (section) {
        sectionObserver.observe(section);
      }
    });
  }

  /*
   * ---------------------------------------------------------
   * SCROLL REVEALS
   * ---------------------------------------------------------
   */

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -7% 0px',
      }
    );

    document
      .querySelectorAll('.reveal-up, .reveal-scale')
      .forEach((element) => {
        revealObserver.observe(element);
      });
  } else {
    document
      .querySelectorAll('.reveal-up, .reveal-scale')
      .forEach((element) => {
        element.classList.add('is-visible');
      });
  }

  /*
   * ---------------------------------------------------------
   * LIGHTWEIGHT PARALLAX
   * ---------------------------------------------------------
   *
   * Disabled on:
   * - reduced motion
   * - smaller screens
   */

  const canParallax =
    !reduceMotion &&
    window.matchMedia('(min-width: 861px)').matches;

  const parallaxItems = canParallax
    ? [...document.querySelectorAll('[data-parallax]')]
    : [];

  if (parallaxItems.length) {
    let parallaxFrame = null;

    const renderParallax = () => {
      const viewportHeight = window.innerHeight;

      parallaxItems.forEach((element) => {
        const speed =
          Number(element.dataset.parallax) || 0;

        const rect = element.getBoundingClientRect();

        const centerOffset =
          (rect.top + rect.height / 2 - viewportHeight / 2) *
          speed;

        const isHeroMedia =
          element.classList.contains('hero-media');

        element.style.transform =
          `translate3d(0, ${centerOffset.toFixed(2)}px, 0)` +
          (isHeroMedia ? ' scale(1.06)' : '');
      });

      parallaxFrame = null;
    };

    const requestParallaxRender = () => {
      if (parallaxFrame !== null) return;

      parallaxFrame = requestAnimationFrame(
        renderParallax
      );
    };

    window.addEventListener(
      'scroll',
      requestParallaxRender,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      requestParallaxRender,
      { passive: true }
    );

    renderParallax();
  }

  /*
   * ---------------------------------------------------------
   * IMAGE FALLBACKS
   * ---------------------------------------------------------
   *
   * Prevents broken-image UI from disrupting the design.
   */

  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener(
      'error',
      () => {
        const parent = image.parentElement;

        image.remove();

        const fallback =
          parent?.querySelector('.image-fallback');

        if (fallback) {
          fallback.style.zIndex = '0';
          fallback.style.opacity = '1';
        }
      },
      { once: true }
    );
  });

  /*
   * ---------------------------------------------------------
   * NEXT THIRD SUNDAY
   * ---------------------------------------------------------
   */

  const findNextThirdSunday = (
    from = new Date()
  ) => {
    const current = new Date(from);

    current.setHours(12, 0, 0, 0);

    const createThirdSunday = (yearValue, monthValue) => {
      const date = new Date(
        yearValue,
        monthValue,
        15,
        12,
        0,
        0,
        0
      );

      const weekday = date.getDay();

      const daysUntilSunday =
        (7 - weekday) % 7;

      date.setDate(
        15 + daysUntilSunday
      );

      return date;
    };

    let candidate = createThirdSunday(
      current.getFullYear(),
      current.getMonth()
    );

    if (candidate < current) {
      candidate = createThirdSunday(
        current.getFullYear(),
        current.getMonth() + 1
      );
    }

    return candidate;
  };

  if (nextEvent) {
    const date = findNextThirdSunday();

    nextEvent.textContent =
      new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
  }

  /*
   * ---------------------------------------------------------
   * CUSTOM CURSOR
   * ---------------------------------------------------------
   *
   * Desktop only.
   * Automatically disabled for reduced motion.
   */

  const finePointer = window.matchMedia(
    '(pointer: fine) and (min-width: 1000px)'
  );

  if (
    finePointer.matches &&
    !reduceMotion
  ) {
    body.classList.add('has-pointer');

    const dot =
      document.querySelector('.cursor-dot');

    const ring =
      document.querySelector('.cursor-ring');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener(
      'pointermove',
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        if (dot) {
          dot.style.transform =
            `translate3d(${mouseX}px, ${mouseY}px, 0)` +
            ' translate(-50%, -50%)';
        }
      },
      { passive: true }
    );

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      if (ring) {
        ring.style.transform =
          `translate3d(${ringX}px, ${ringY}px, 0)` +
          ' translate(-50%, -50%)';
      }

      requestAnimationFrame(animateCursor);
    };

    requestAnimationFrame(animateCursor);

    document
      .querySelectorAll(
        'a, button, .story-photo, .social-card'
      )
      .forEach((element) => {
        element.addEventListener(
          'pointerenter',
          () => {
            body.classList.add('cursor-hover');
          }
        );

        element.addEventListener(
          'pointerleave',
          () => {
            body.classList.remove('cursor-hover');
          }
        );
      });
  }

  /*
   * ---------------------------------------------------------
   * SMOOTH ANCHOR NAVIGATION
   * ---------------------------------------------------------
   *
   * Uses native smooth scrolling and respects
   * reduced-motion preferences.
   */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId =
          link.getAttribute('href');

        if (
          !targetId ||
          targetId === '#'
        ) {
          return;
        }

        const target =
          document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: reduceMotion
            ? 'auto'
            : 'smooth',
          block: 'start',
        });
      });
    });

  /*
   * ---------------------------------------------------------
   * MAGNETIC CTA EFFECT
   * ---------------------------------------------------------
   *
   * Subtle desktop-only interaction.
   */

  const magneticElements =
    !reduceMotion &&
    window.matchMedia(
      '(pointer: fine) and (min-width: 1000px)'
    ).matches
      ? document.querySelectorAll(
          '[data-magnetic]'
        )
      : [];

  magneticElements.forEach((element) => {
    const strength =
      Number(element.dataset.magnetic) || 0.2;

    element.addEventListener(
      'pointermove',
      (event) => {
        const rect =
          element.getBoundingClientRect();

        const x =
          event.clientX -
          (rect.left + rect.width / 2);

        const y =
          event.clientY -
          (rect.top + rect.height / 2);

        element.style.transform =
          `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      }
    );

    element.addEventListener(
      'pointerleave',
      () => {
        element.style.transform = '';
      }
    );
  });

  /*
   * ---------------------------------------------------------
   * RESIZE CLEANUP
   * ---------------------------------------------------------
   */

  window.addEventListener(
    'resize',
    () => {
      if (
        window.innerWidth > 860 &&
        body.classList.contains('menu-open')
      ) {
        setMenu(false);
      }
    },
    { passive: true }
  );
})();
