// index.js
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP or ScrollTrigger script not loaded properly.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const state = {
    lenis: null,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    canvas: {
      ambientCtx: null,
      particleCtx: null,
      particles: [],
      ambientParticles: []
    }
  };

  const init = () => {
    initSmoothScroll();
    initCursor();
    initImageLoading();
    initCanvasContexts();
    initAmbientParticles();
    initWorldThreeParticles();
    buildCinematicTimeline();
    bindEvents();
    
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

  const initSmoothScroll = () => {
    if (typeof Lenis === 'undefined') return;

    try {
      state.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5
      });

      state.lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        if (state.lenis) state.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      console.warn('Lenis smooth scroll failed to initialize, falling back to browser scroll.', e);
    }
  };

  const initCursor = () => {
    const cursor = document.getElementById('custom-cursor');
    const dot = cursor ? cursor.querySelector('.cursor-dot') : null;
    const ring = cursor ? cursor.querySelector('.cursor-ring') : null;

    if (!cursor || state.isMobile) {
      if (cursor) cursor.style.display = 'none';
      return;
    }

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    });

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      gsap.set(ring, { x: ringX, y: ringY });
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);
  };

  const initImageLoading = () => {
    const images = document.querySelectorAll('.cinema-img');

    images.forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => {
          img.style.display = 'none';
          const parent = img.parentElement;
          if (parent) {
            parent.style.background = 'radial-gradient(circle at 50% 40%, #2a241b 0%, #050508 100%)';
          }
        });
      }
    });
  };

  const initCanvasContexts = () => {
    const ambientCanvas = document.getElementById('ambient-canvas');
    const particleCanvas = document.getElementById('particle-canvas');

    if (ambientCanvas) {
      ambientCanvas.width = state.windowWidth;
      ambientCanvas.height = state.windowHeight;
      state.canvas.ambientCtx = ambientCanvas.getContext('2d');
    }

    if (particleCanvas) {
      particleCanvas.width = state.windowWidth;
      particleCanvas.height = state.windowHeight;
      state.canvas.particleCtx = particleCanvas.getContext('2d');
    }
  };

  const initAmbientParticles = () => {
    const count = state.isMobile ? 30 : 70;
    state.canvas.ambientParticles = [];

    for (let i = 0; i < count; i++) {
      state.canvas.ambientParticles.push({
        x: Math.random() * state.windowWidth,
        y: Math.random() * state.windowHeight,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.2
      });
    }

    const renderAmbient = () => {
      const ctx = state.canvas.ambientCtx;
      if (!ctx) return;

      ctx.clearRect(0, 0, state.windowWidth, state.windowHeight);

      state.canvas.ambientParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = state.windowWidth;
        if (p.x > state.windowWidth) p.x = 0;
        if (p.y < 0) p.y = state.windowHeight;
        if (p.y > state.windowHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 220, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(renderAmbient);
    };

    renderAmbient();
  };

  const initWorldThreeParticles = () => {
    const count = state.isMobile ? 80 : 200;
    state.canvas.particles = [];

    for (let i = 0; i < count; i++) {
      state.canvas.particles.push({
        x: (Math.random() - 0.5) * state.windowWidth * 2,
        y: (Math.random() - 0.5) * state.windowHeight * 2,
        z: Math.random() * 2000,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? '#ffffff' : '#d4af37'
      });
    }
  };

  const drawWorldThreeParticles = (progress) => {
    const ctx = state.canvas.particleCtx;
    if (!ctx) return;

    ctx.clearRect(0, 0, state.windowWidth, state.windowHeight);

    const cx = state.windowWidth / 2;
    const cy = state.windowHeight / 2;

    state.canvas.particles.forEach((p) => {
      let currentZ = (p.z - progress * 2500) % 2000;
      if (currentZ < 1) currentZ += 2000;

      const scale = 400 / currentZ;
      const x2d = cx + p.x * scale;
      const y2d = cy + p.y * scale;

      if (x2d >= 0 && x2d <= state.windowWidth && y2d >= 0 && y2d <= state.windowHeight) {
        const alpha = Math.min(1, (2000 - currentZ) / 500) * (currentZ / 2000);
        ctx.beginPath();
        ctx.arc(x2d, y2d, Math.max(0.5, p.radius * scale), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1.0;
  };

  const buildCinematicTimeline = () => {
    const world1 = document.getElementById('world-01');
    const world2 = document.getElementById('world-02');
    const world3 = document.getElementById('world-03');

    // WORLD 01 TIMELINE
    const dotContainer = document.getElementById('dot-container');
    const luminousDot = document.getElementById('luminous-dot');
    const lightTrail = document.getElementById('dot-light-trail');
    const shockwaves = document.querySelectorAll('.shockwave');
    const lightBurst = document.querySelector('.light-burst');
    const secondaryFlash = document.querySelector('.secondary-flash');

    const tlWorld1 = gsap.timeline({
      scrollTrigger: {
        trigger: world1,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1
      }
    });

    tlWorld1
      .to(luminousDot, {
        scale: 1.8,
        boxShadow: '0 0 40px 10px rgba(255, 255, 255, 1), 0 0 90px 30px rgba(212, 175, 55, 0.9)',
        duration: 1
      })
      .to(dotContainer, {
        y: '35vh',
        scale: 0.4,
        duration: 2.5,
        ease: 'power2.in'
      }, '<')
      .to(lightTrail, {
        height: '180px',
        opacity: 0.8,
        duration: 2
      }, '<+=0.5')
      .to(dotContainer, {
        y: '48vh',
        scale: 30,
        duration: 1.2,
        ease: 'power4.in'
      })
      .to(lightTrail, {
        opacity: 0,
        duration: 0.3
      }, '<')
      .to(secondaryFlash, {
        opacity: 1,
        duration: 0.1,
        ease: 'power4.out'
      })
      .to(lightBurst, {
        opacity: 1,
        duration: 0.4
      }, '<')
      .to(shockwaves, {
        scale: 40,
        opacity: 1,
        stagger: 0.15,
        duration: 1.5,
        ease: 'power3.out'
      }, '<')
      .to(secondaryFlash, {
        opacity: 0,
        duration: 0.8
      })
      .to(lightBurst, {
        scale: 2,
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(251,249,245,1) 100%)',
        duration: 1.5
      });

    // WORLD 02 TIMELINE
    const skyImg = document.querySelector('.layer-sky');
    const mountainImg = document.querySelector('.layer-mountains');
    const sunSource = document.querySelector('.layer-sun-source');
    const christContainer = document.getElementById('christ-container');
    const artworkLightPass = document.querySelector('.artwork-light-pass');
    const secondaryArtwork = document.querySelector('.secondary-artwork');

    const tlWorld2 = gsap.timeline({
      scrollTrigger: {
        trigger: world2,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1
      }
    });

    tlWorld2
      .fromTo(skyImg, { scale: 1.3, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 2 })
      .fromTo(mountainImg, { y: '30%', opacity: 0 }, { y: '0%', opacity: 1, duration: 2 }, '<+=0.3')
      .fromTo(sunSource, { scale: 0.2, opacity: 0 }, { scale: 1.2, opacity: 1, duration: 2.5 }, '<')
      .fromTo(christContainer, {
        scale: 0.6,
        y: '20%',
        opacity: 0,
        filter: 'brightness(0) blur(20px)'
      }, {
        scale: 1.0,
        y: '0%',
        opacity: 1,
        filter: 'brightness(1) blur(0px)',
        duration: 3,
        ease: 'power2.out'
      })
      .to(artworkLightPass, {
        left: '200%',
        duration: 1.8,
        ease: 'power1.inOut'
      })
      .to(secondaryArtwork, {
        opacity: 0.6,
        duration: 2
      })
      .to(christContainer, {
        scale: 1.4,
        z: 300,
        duration: 3,
        ease: 'power1.in'
      }, '<')
      .to('#christ-artwork', {
        filter: 'contrast(2) brightness(2) blur(10px)',
        opacity: 0,
        duration: 1.5
      });

    // WORLD 03 TIMELINE
    const faithChars = document.querySelectorAll('.word-faith .char');
    const graceChars = document.querySelectorAll('.word-grace .char');
    const lightChars = document.querySelectorAll('.word-light .char');
    const jesusChars = document.querySelectorAll('.word-jesus .char');

    const tlWorld3 = gsap.timeline({
      scrollTrigger: {
        trigger: world3,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          drawWorldThreeParticles(self.progress);
        }
      }
    });

    tlWorld3
      .fromTo('.word-faith', { z: -1500, opacity: 0 }, { z: 200, opacity: 1, duration: 3 })
      .to(faithChars, {
        rotateY: (i) => (i - 2) * 15,
        rotateX: 10,
        stagger: 0.05,
        duration: 2
      }, '<')
      .to('.word-faith', {
        z: 1200,
        opacity: 0,
        duration: 2,
        ease: 'power2.in'
      })
      .fromTo('.word-grace', { z: -1800, opacity: 0 }, { z: 100, opacity: 1, duration: 3 }, '<+=0.5')
      .to(graceChars, {
        scale: 1.2,
        color: '#ffffff',
        stagger: 0.08,
        duration: 2
      }, '<')
      .to('.word-grace', {
        z: 1400,
        opacity: 0,
        duration: 2
      })
      .fromTo('.word-light', { z: -2000, opacity: 0 }, { z: 0, opacity: 1, duration: 3 }, '<+=0.5')
      .to(lightChars, {
        textShadow: '0 0 120px rgba(255, 255, 255, 1)',
        stagger: 0.05,
        duration: 2
      }, '<')
      .to('.word-light', {
        z: 1500,
        opacity: 0,
        duration: 2
      })
      .fromTo('.word-jesus', { z: -2500, scale: 0.2, opacity: 0 }, { z: 0, scale: 1.0, opacity: 1, duration: 4, ease: 'power3.out' }, '<+=0.5')
      .to(jesusChars, {
        stagger: 0.1,
        keyframes: [
          { textShadow: '0 0 40px rgba(212,175,55,1)', duration: 1 },
          { textShadow: '0 0 120px rgba(255,255,255,1)', duration: 1 }
        ]
      }, '<');
  };

  const bindEvents = () => {
    window.addEventListener('resize', () => {
      state.windowWidth = window.innerWidth;
      state.windowHeight = window.innerHeight;
      state.isMobile = window.innerWidth <= 768;

      initCanvasContexts();
      ScrollTrigger.refresh();
    });
  };

  init();
});
