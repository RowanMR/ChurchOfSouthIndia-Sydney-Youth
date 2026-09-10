/* ==========================================================================
   CSI SYDNEY YOUTH | CORE ARCHITECTURE
   ========================================================================== */

// --- 1. SYSTEM SETUP ---
gsap.registerPlugin(ScrollTrigger);

class App {
    constructor() {
        this.initLenis();
        this.initCursor();
        this.initCanvasAtmosphere();
        this.initNavigation();
        this.initMagneticEffects();
        this.initScrollChoreography();
    }

    // --- SMOOTH SCROLL (LENIS) ---
    initLenis() {
        this.lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        const raf = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // Sync GSAP with Lenis
        this.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { this.lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    }

    // --- CUSTOM CURSOR ---
    initCursor() {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        const text = document.querySelector('.cursor-text');
        
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediate update for dot
            gsap.to(dot, { x: mouseX, y: mouseY, duration: 0 });
        });

        // Lerp loop for ring
        const renderCursor = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            gsap.set(ring, { x: ringX, y: ringY });
            requestAnimationFrame(renderCursor);
        };
        renderCursor();

        // Hover States
        document.querySelectorAll('[data-cursor]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
                text.innerText = el.getAttribute('data-cursor');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                text.innerText = '';
            });
        });
    }

    // --- 3D CANVAS ATMOSPHERE ---
    initCanvasAtmosphere() {
        const canvas = document.getElementById('atmosphere-canvas');
        const ctx = canvas.getContext('2d');
        let width, height;
        const particles = [];

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.z = Math.random() * 2 + 0.1; 
                this.baseSize = Math.random() * 1.5;
                this.speed = (Math.random() * 0.2 + 0.1) / this.z;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update(scrollDelta) {
                this.y -= this.speed + (scrollDelta * 0.05 * (1/this.z));
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; // Gold tint
                ctx.fill();
            }
        }

        for (let i = 0; i < 150; i++) particles.push(new Particle());

        let lastScroll = 0;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            let currentScroll = window.scrollY;
            let scrollDelta = currentScroll - lastScroll;
            lastScroll = currentScroll;

            particles.forEach(p => {
                p.update(scrollDelta);
                p.draw();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }

    // --- MENU NAVIGATION ---
    initNavigation() {
        const trigger = document.querySelector('.nav-trigger');
        const overlay = document.querySelector('.nav-overlay');
        const links = document.querySelectorAll('.nav-link');
        let isOpen = false;

        trigger.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                overlay.classList.add('active');
                gsap.fromTo(links, 
                    { y: 50, opacity: 0 }, 
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: "power4.out" }
                );
                trigger.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                trigger.children[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                this.lenis.stop();
            } else {
                overlay.classList.remove('active');
                trigger.children[0].style.transform = 'none';
                trigger.children[1].style.transform = 'none';
                this.lenis.start();
            }
        });

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                trigger.click(); // Close menu
                setTimeout(() => {
                    this.lenis.scrollTo(target, { offset: 0, duration: 2 });
                }, 800);
            });
        });
    }

    // --- MAGNETIC BUTTONS ---
    initMagneticEffects() {
        const magnets = document.querySelectorAll('[data-magnetic]');
        magnets.forEach(magnet => {
            magnet.addEventListener('mousemove', (e) => {
                const rect = magnet.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(magnet, {
                    x: x * 0.4, y: y * 0.4,
                    duration: 0.6, ease: "power3.out"
                });
            });
            magnet.addEventListener('mouseleave', () => {
                gsap.to(magnet, {
                    x: 0, y: 0,
                    duration: 0.6, ease: "elastic.out(1, 0.3)"
                });
            });
        });

        // 3D Tilt for Youth Nights Card
        const card = document.querySelector('.yn-card');
        if(card) {
            document.querySelector('.youth-nights-scene').addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
                gsap.to(card, { rotateY: xAxis, rotateX: yAxis, ease: "power2.out", duration: 1 });
            });
            document.querySelector('.youth-nights-scene').addEventListener('mouseleave', () => {
                gsap.to(card, { rotateY: 0, rotateX: 0, ease: "power2.out", duration: 1 });
            });
        }
    }

    // --- MAJOR SCROLL CHOREOGRAPHY ---
    initScrollChoreography() {
        
        // Parallax utility
        gsap.utils.toArray('[data-speed]').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed'));
            gsap.to(el, {
                y: () => (ScrollTrigger.maxScroll(window) - ScrollTrigger.maxScroll(window)*speed) * 0.1,
                ease: "none",
                scrollTrigger: {
                    trigger: el.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // 01: Opening
        const tlOpening = gsap.timeline({
            scrollTrigger: { trigger: "#s01", start: "top top", end: "+=100%", scrub: 1, pin: true }
        });
        tlOpening.to(".title-layer-front", { z: 500, scale: 2.5, opacity: 0 }, 0)
                 .to(".title-layer-mid", { z: 200, scale: 1.8, opacity: 0 }, 0.1)
                 .to(".title-layer-back", { scale: 1.2, opacity: 0 }, 0.2);

        // 02: Faith / Christ (The Way, The Truth, The Life)
        const tlFaith = gsap.timeline({
            scrollTrigger: { trigger: "#s02", start: "top top", end: "+=200%", scrub: true, pin: true }
        });
        tlFaith.to(".parallax-img", { scale: 1, filter: "grayscale(30%) contrast(1.1)", duration: 3 }, 0)
               .to(".w-1", { opacity: 1, scale: 1, duration: 1 }, 0)
               .to(".w-1", { opacity: 0, scale: 1.2, duration: 1 }, 1)
               .to(".w-2", { opacity: 1, scale: 1, duration: 1 }, 1.5)
               .to(".w-2", { opacity: 0, scale: 1.2, duration: 1 }, 2.5)
               .to(".w-3", { opacity: 1, scale: 1, duration: 1 }, 3);

        // 03: About (Blur Reveal)
        gsap.to(".blur-text", {
            filter: "blur(0px)", opacity: 1,
            scrollTrigger: { trigger: "#s03", start: "top 60%", end: "center center", scrub: true }
        });
        gsap.to(".about-metadata", {
            opacity: 1, y: -20,
            scrollTrigger: { trigger: "#s03", start: "center 70%", end: "bottom 80%", scrub: true }
        });

        // 04: Identity Words
        const words = gsap.utils.toArray('.float-word');
        words.forEach((word, i) => {
            gsap.fromTo(word, 
                { x: i%2===0 ? -200 : 200, y: (i*100), rotation: Math.random()*20 - 10, opacity: 0 },
                { x: 0, y: 0, rotation: 0, opacity: 1, 
                  scrollTrigger: { trigger: "#s04", start: "top 80%", end: "center center", scrub: 1 }
                }
            );
        });

        // 06: Called Here (Massive Scale)
        const tlCalled = gsap.timeline({
            scrollTrigger: { trigger: "#s06", start: "top bottom", end: "bottom top", scrub: true }
        });
        tlCalled.fromTo(".ch-background img", { scale: 1.2, y: "-10%" }, { scale: 1, y: "10%", ease: "none" }, 0);

        // 07: Chapters Morphing
        const chapters = gsap.utils.toArray('.chapter-content');
        const tlChap = gsap.timeline({
            scrollTrigger: { trigger: "#s07", start: "top top", end: "+=200%", pin: true, scrub: true }
        });
        chapters.forEach((chap, i) => {
            tlChap.to(chap, { opacity: 1, duration: 1 })
                  .to(chap, { opacity: (i === chapters.length-1) ? 1 : 0, duration: 1 }, "+=1");
        });

        // 08: Youth Nights Reveal
        const ynCard = document.querySelector('.yn-card');
        const ynDetails = document.querySelector('.yn-expand-details');
        
        gsap.from(ynCard, {
            y: 150, opacity: 0, rotationX: -15,
            scrollTrigger: { trigger: "#s08", start: "top 70%", end: "center center", scrub: 1 }
        });

        // Click to expand card
        ynCard.addEventListener('click', () => {
            if(!ynCard.classList.contains('expanded')) {
                ynCard.classList.add('expanded');
                gsap.to(ynDetails, { height: "auto", opacity: 1, duration: 0.6, ease: "power3.out" });
            }
        });

        // 09: Horizontal Scroll Gallery
        const track = document.querySelector('.h-track');
        gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: { trigger: "#s09", start: "top top", end: "+=300%", pin: true, scrub: 1 }
        });

        // 10: Invitation
        gsap.to(".stretch-text", {
            letterSpacing: "15px", scale: 1.1,
            scrollTrigger: { trigger: "#s10", start: "top 80%", end: "bottom 20%", scrub: true }
        });
        gsap.to(".light-sweep", {
            x: "200%",
            scrollTrigger: { trigger: "#s10", start: "top 60%", end: "bottom top", scrub: 2 }
        });
    }
}

// Init App on load
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
