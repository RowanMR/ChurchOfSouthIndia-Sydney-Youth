/**
 * CSI SYDNEY YOUTH - Cinematic Interactive Experience
 * Awwwards Level Implementation
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- System Initialization ---
    initLenis();
    initCursor();
    initParticles();
    
    // --- GSAP Timeline Orchestration ---
    gsap.registerPlugin(ScrollTrigger);
    
    // Allow images and fonts to render before calculating scroll heights
    window.addEventListener("load", () => {
        initCinematicNav();
        buildSceneTheVoid();
        buildSceneFirstLight();
        buildSceneTextMorph();
        buildSceneHands();
        buildSceneCommunity();
        buildSceneSydney();
        buildSceneIdentity();
        buildSceneOutro();
        
        ScrollTrigger.refresh();
    });
});

/* ==================================================
   1. CORE SYSTEMS
================================================== */

let lenis;
function initLenis() {
    lenis = new Lenis({
        duration: 1.5, // Slow, cinematic scroll
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        direction: 'vertical',
        gestureDirection: 'vertical',
        mouseMultiplier: 0.8,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

function initCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    
    // Disable on touch devices
    if(window.matchMedia("(pointer: coarse)").matches) {
        cursor.style.display = 'none';
        return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function renderCursor() {
        // Linear interpolation for smooth trailing
        dotX += (mouseX - dotX) * 0.2;
        dotY += (mouseY - dotY) * 0.2;
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;

        cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;

        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover interactions
    const interactives = document.querySelectorAll('a, .interactive');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

/* ==================================================
   2. PARTICLE ENGINE (Canvas 2D)
================================================== */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let width, height;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, type = 'ambient') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        if (type === 'ambient') {
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = -Math.random() * 0.5;
            this.size = Math.random() * 1.5;
            this.life = Math.random() * 0.5 + 0.2;
            this.color = `rgba(255, 245, 220, ${Math.random() * 0.5})`;
        } else if (type === 'void-spark') {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 3 + 1;
            this.life = 1.0;
            this.decay = Math.random() * 0.02 + 0.02;
            this.color = 'rgba(255, 255, 255, 1)';
        } else if (type === 'divine-spark') {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 20 + 10;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 4 + 2;
            this.life = 1.0;
            this.decay = Math.random() * 0.015 + 0.01;
            this.color = `rgba(255, 255, 255, 1)`;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'ambient') {
            this.y -= 0.5; // continuous drift up
            if (this.y < 0) this.y = height;
        } else {
            this.life -= this.decay;
            this.vx *= 0.95; // friction
            this.vy *= 0.95;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (this.type === 'ambient') {
            ctx.fillStyle = this.color;
        } else {
            ctx.fillStyle = `rgba(255,255,255,${this.life})`;
        }
        
        ctx.fill();
    }
}

// Init ambient particles
for (let i = 0; i < 50; i++) {
    particles.push(new Particle(Math.random() * width, Math.random() * height, 'ambient'));
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].type !== 'ambient' && particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Triggers for Canvas Effects
function triggerVoidExplosion() {
    const cx = width / 2;
    const cy = height * 0.8;
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle(cx, cy, 'void-spark'));
    }
}

function triggerDivineExplosion() {
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < 300; i++) {
        particles.push(new Particle(cx, cy, 'divine-spark'));
    }
}


/* ==================================================
   3. SCENE TIMELINES (GSAP)
================================================== */

function initCinematicNav() {
    gsap.to('.cinematic-nav', {
        opacity: 1,
        duration: 2,
        delay: 3,
        ease: 'power2.out'
    });
}

// SCENE 01: THE VOID
function buildSceneTheVoid() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-void",
            start: "top top",
            end: "+=200%", // Pin for 2 viewport heights
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                // Trigger canvas explosion exactly at the impact point
                if (self.progress > 0.45 && self.progress < 0.5 && !self.exploded) {
                    triggerVoidExplosion();
                    self.exploded = true;
                } else if (self.progress < 0.45) {
                    self.exploded = false;
                }
            }
        }
    });

    tl.to('.void-dot', {
        top: '80%',
        ease: 'power4.in',
        duration: 2
    }, 0)
    .to('.void-dot', {
        height: '2px', // squash effect on impact
        duration: 0.1
    }, 2)
    .to('.void-dot', {
        opacity: 0,
        duration: 0.1
    }, 2.1)
    .to('.void-impact-ring', {
        opacity: 1,
        width: '50vw',
        height: '50vw',
        transform: 'translate(-50%, -50%)',
        borderWidth: '0px',
        duration: 1.5,
        ease: 'expo.out'
    }, 2.1)
    .to('.void-light-burst', {
        opacity: 1,
        scale: 10,
        duration: 2,
        ease: 'power2.inOut'
    }, 2.1)
    .to('.void-container', {
        opacity: 0,
        duration: 1
    }, 3);
}

// SCENE 02: THE FIRST LIGHT
function buildSceneFirstLight() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-first-light",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
        }
    });

    // Parallax background
    tl.to('.scene-first-light .bg-layer', {
        y: '20%',
        scale: 1,
        ease: 'none',
        duration: 1
    }, 0);

    // Text Reveal
    gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-first-light",
            start: "top center",
            end: "+=50%",
            scrub: 1
        }
    })
    .to('.cinematic-title .word', {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.3,
        ease: 'power3.out'
    });
}

// SCENE 03 & 04: TEXT MORPH
function buildSceneTextMorph() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-text-morph",
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 1
        }
    });

    tl.to('.morph-text', {
        opacity: 1,
        duration: 1
    })
    .to('.morph-bg', {
        opacity: 0, // Background fades out, leaving only text with image inside
        duration: 2
    })
    .to('.morph-text', {
        scale: 50, // Massive scale through the text
        opacity: 0,
        duration: 3,
        ease: 'power4.in'
    }, "+=0.5");
}

// SCENE 05: THE HANDS (SHOWCASE)
function buildSceneHands() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-hands",
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                if (self.progress > 0.6 && self.progress < 0.65 && !self.divineExploded) {
                    triggerDivineExplosion();
                    self.divineExploded = true;
                } else if (self.progress < 0.6) {
                    self.divineExploded = false;
                }
            }
        }
    });

    // Atmosphere building
    tl.to('.hands-atmosphere', {
        opacity: 1,
        duration: 2
    }, 0);

    // Hands moving toward center
    tl.to('.hand-left', {
        left: '2vw',
        opacity: 1,
        duration: 4,
        ease: 'power2.inOut'
    }, 0)
    .to('.hand-right', {
        right: '2vw',
        opacity: 1,
        duration: 4,
        ease: 'power2.inOut'
    }, 0);

    // The Touch
    tl.to('.divine-contact-point', {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'power4.out'
    }, 3.8)
    .to('.divine-contact-point', {
        scale: 50,
        opacity: 0,
        duration: 2,
        ease: 'power2.in'
    }, 4.2)
    .to('.white-transition', {
        opacity: 1,
        duration: 1.5
    }, 4.5);
}

// SCENE 06: COMMUNITY (Fades in from white transition)
function buildSceneCommunity() {
    // Reveal community background out of the white flash
    gsap.to('.community-bg', {
        scrollTrigger: {
            trigger: "#scene-community",
            start: "top bottom",
            end: "top top",
            scrub: 1
        },
        opacity: 1,
        filter: 'brightness(1) contrast(1)'
    });

    gsap.to('.warm-overlay', {
        scrollTrigger: {
            trigger: "#scene-community",
            start: "top center",
            end: "bottom center",
            scrub: 1
        },
        opacity: 1
    });

    // Stagger text horizontally
    gsap.to('.stagger-text', {
        scrollTrigger: {
            trigger: "#scene-community",
            start: "top center",
            end: "+=50%",
            scrub: 1
        },
        x: 0,
        opacity: 1,
        stagger: 0.2,
        ease: 'power2.out'
    });

    // Parallax
    gsap.to('.community-bg', {
        scrollTrigger: {
            trigger: "#scene-community",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        y: '15%',
        ease: 'none'
    });
}

// SCENE 07: SYDNEY ATMOSPHERE
function buildSceneSydney() {
    gsap.to('.sydney-bg', {
        scrollTrigger: {
            trigger: "#scene-sydney",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        y: '20%',
        scale: 1,
        ease: 'none'
    });
}

// SCENE 08: IDENTITY REVEAL
function buildSceneIdentity() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-identity",
            start: "top center",
            end: "center center",
            scrub: 1
        }
    });

    tl.to('.reveal-up', {
        y: 0,
        opacity: 1,
        stagger: 0.3,
        ease: 'power3.out'
    });
}

// SCENE 09: OUTRO
function buildSceneOutro() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-outro",
            start: "top center",
            end: "bottom bottom",
            scrub: 1
        }
    });

    tl.to('.invitation-text', {
        opacity: 1,
        y: -20,
        duration: 1
    })
    .to('.cinematic-btn', {
        opacity: 1,
        y: -10,
        duration: 0.5
    }, "-=0.5")
    .to('.minimal-footer', {
        opacity: 0.8,
        duration: 0.5
    }, "-=0.2");
}
