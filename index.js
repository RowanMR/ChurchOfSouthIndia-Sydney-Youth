/* ============================================================
   CSI SYDNEY YOUTH &mdash; CINEMATIC DIRECTOR ENGINE
   ============================================================ */

class ExperienceDirector {
    constructor() {
        this.initLenis();
        this.initCursor();
        this.initWebGL();
        this.splitTypography();
        this.initLoader();
        this.initNavigation();
        this.initSceneTimelines();
        this.initParallax();
        this.initMagnetic();
    }

    /* ------------------------------------------------------------
       1. SMOOTH SCROLL ENGINE (LENIS + GSAP INTEGRATION)
       ------------------------------------------------------------ */
    initLenis() {
        gsap.registerPlugin(ScrollTrigger);

        this.lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.5
        });

        this.lenis.on('scroll', (e) => {
            ScrollTrigger.update();
            this.scrollVelocity = e.velocity || 0;
            if (this.particleMaterial) {
                this.particleMaterial.uniforms.uVelocity.value = Math.abs(this.scrollVelocity) * 0.05;
            }
        });

        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

    /* ------------------------------------------------------------
       2. ADVANCED CURSOR SYSTEM (LERP + VELOCITY RESPONSE)
       ------------------------------------------------------------ */
    initCursor() {
        this.cursorCore = document.getElementById('cursor-core');
        this.cursorLens = document.getElementById('cursor-lens');
        this.cursorLabel = document.getElementById('cursor-label');

        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.posLens = { x: this.mouse.x, y: this.mouse.y };
        this.posCore = { x: this.mouse.x, y: this.mouse.y };

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        gsap.ticker.add(() => {
            // Lerp lens
            this.posLens.x += (this.mouse.x - this.posLens.x) * 0.15;
            this.posLens.y += (this.mouse.y - this.posLens.y) * 0.15;

            // Lerp core (faster)
            this.posCore.x += (this.mouse.x - this.posCore.x) * 0.4;
            this.posCore.y += (this.mouse.y - this.posCore.y) * 0.4;

            gsap.set(this.cursorLens, { x: this.posLens.x, y: this.posLens.y });
            gsap.set(this.cursorCore, { x: this.posCore.x, y: this.posCore.y });
            gsap.set(this.cursorLabel, { x: this.posLens.x, y: this.posLens.y });
        });

        // Hover triggers
        document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const label = el.getAttribute('data-cursor');
                if (label) {
                    document.body.classList.add('cursor-explore');
                    this.cursorLabel.textContent = label;
                } else {
                    document.body.classList.add('cursor-hover');
                }
            });

            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover', 'cursor-explore');
                this.cursorLabel.textContent = '';
            });
        });
    }

    /* ------------------------------------------------------------
       3. WEBGL ATMOSPHERIC PARTICLES (THREE.JS)
       ------------------------------------------------------------ */
    initWebGL() {
        const canvas = document.getElementById('webgl-canvas');
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Particle Geometry
        const particleCount = window.innerWidth < 768 ? 400 : 1200;
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;
            positions[i + 1] = (Math.random() - 0.5) * 15;
            positions[i + 2] = (Math.random() - 0.5) * 15;
            scales[i / 3] = Math.random() * 0.05 + 0.01;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Shader Material
        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uVelocity: { value: 0 },
                uColor: { value: new THREE.Color(0xcfa870) }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uVelocity;
                void main() {
                    vec3 p = position;
                    p.y += sin(uTime * 0.5 + p.x) * 0.1;
                    p.x += cos(uTime * 0.3 + p.y) * 0.1;
                    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                    gl_PointSize = (12.0 + uVelocity * 20.0) * (1.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                void main() {
                    float d = distance(gl_PointCoord, vec2(0.5));
                    if (d > 0.5) discard;
                    float alpha = smoothstep(0.5, 0.0, d) * 0.6;
                    gl_FragColor = vec4(uColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, this.particleMaterial);
        this.scene.add(this.particles);

        // Render Loop
        const clock = new THREE.Clock();
        const animate = () => {
            const time = clock.getElapsedTime();
            this.particleMaterial.uniforms.uTime.value = time;
            
            this.particles.rotation.y = time * 0.02;
            this.particles.rotation.x = (this.mouse ? this.mouse.y / window.innerHeight - 0.5 : 0) * 0.2;

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /* ------------------------------------------------------------
       4. TYPOGRAPHY SPLITTING HELPER
       ------------------------------------------------------------ */
    splitTypography() {
        document.querySelectorAll('[data-split]').forEach(el => {
            const text = el.textContent.trim();
            el.innerHTML = '';
            
            text.split(' ').forEach(word => {
                const wordSpan = document.createElement('span');
                wordSpan.classList.add('word');
                
                word.split('').forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.classList.add('char');
                    charSpan.textContent = char;
                    wordSpan.appendChild(charSpan);
                });
                
                el.appendChild(wordSpan);
                el.appendChild(document.createTextNode(' '));
            });
        });
    }

    /* ------------------------------------------------------------
       5. OPENING CINEMATIC LOADER
       ------------------------------------------------------------ */
    initLoader() {
        const loader = document.getElementById('loader-screen');
        const loaderBar = document.getElementById('loader-bar');
        const loaderStatus = document.getElementById('loader-status');

        let progress = { value: 0 };

        gsap.to(progress, {
            value: 100,
            duration: 2.2,
            ease: 'power2.inOut',
            onUpdate: () => {
                const p = Math.round(progress.value);
                loaderBar.style.width = p + '%';
                loaderStatus.textContent = (p < 10 ? '0' : '') + p + '%';
            },
            onComplete: () => {
                const tl = gsap.timeline();
                tl.to('.loader-content', { opacity: 0, y: -30, duration: 0.8, ease: 'power3.in' })
                  .to(loader, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=0.3')
                  .from('#s-opening .open-title .char', {
                      opacity: 0,
                      y: 100,
                      rotateX: -90,
                      stagger: 0.04,
                      duration: 1.2,
                      ease: 'power4.out'
                  }, '-=0.5')
                  .from('#s-opening .open-sub', { opacity: 0, y: 20, duration: 0.8 }, '-=0.6');
            }
        });
    }

    /* ------------------------------------------------------------
       6. NAVIGATION & HUD CONTROLLER
       ------------------------------------------------------------ */
    initNavigation() {
        const menuBtn = document.getElementById('menu-toggle');
        const navOverlay = document.getElementById('nav-overlay');
        const navLinks = document.querySelectorAll('.nav-links a');
        const navBgPreview = document.getElementById('nav-bg-preview');
        const globalProgress = document.getElementById('global-progress');
        const hudChapter = document.getElementById('hud-chapter');

        menuBtn.addEventListener('click', () => {
            navOverlay.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const bg = link.getAttribute('data-bg');
                if (bg) navBgPreview.style.backgroundImage = `url(${bg})`;
            });

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                navOverlay.classList.remove('active');
                this.lenis.scrollTo(target, { duration: 1.5 });
            });
        });

        // Track Chapters & Progress
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                gsap.set(globalProgress, { width: (self.progress * 100) + '%' });
            }
        });

        document.querySelectorAll('.scene').forEach(scene => {
            ScrollTrigger.create({
                trigger: scene,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => {
                    const ch = scene.getAttribute('data-chapter');
                    if (ch) hudChapter.textContent = ch;
                },
                onEnterBack: () => {
                    const ch = scene.getAttribute('data-chapter');
                    if (ch) hudChapter.textContent = ch;
                }
            });
        });
    }

    /* ------------------------------------------------------------
       7. SCENE TIMELINES (REVERSIBLE SCRUB-BASED CINEMATICS)
       ------------------------------------------------------------ */
    initSceneTimelines() {
        // Scene 01: Opening -> Exit Blur
        gsap.timeline({
            scrollTrigger: {
                trigger: '#s-opening',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        })
        .to('#s-opening .open-title-wrap', { y: -150, opacity: 0, filter: 'blur(10px)' });

        // Scene 02: Christ Stack Reveal
        const christTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#s-christ',
                start: 'top top',
                end: '+=200%',
                pin: true,
                scrub: 1
            }
        });

        christTl
            .to('.word-way', { opacity: 1, scale: 1.1, duration: 1 })
            .to('.word-way', { opacity: 0.15, scale: 1, duration: 1 })
            .to('.word-truth', { opacity: 1, scale: 1.1, duration: 1 })
            .to('.word-truth', { opacity: 0.15, scale: 1, duration: 1 })
            .to('.word-life', { opacity: 1, scale: 1.2, duration: 1 })
            .to('.cross-light-beam', { width: '80vw', opacity: 0.8, duration: 1.5 }, '-=1');

        // Scene 03: About (Blur-to-Clear Reveal)
        gsap.timeline({
            scrollTrigger: {
                trigger: '#s-about',
                start: 'top 60%',
                end: 'top 20%',
                scrub: 1
            }
        })
        .to('.about-statement', { filter: 'blur(0px)', opacity: 1 })
        .from('.about-pills .pill', { y: 30, opacity: 0, stagger: 0.2 }, '-=0.5');

        // Scene 04: Community Grid & Kinetic Text
        gsap.timeline({
            scrollTrigger: {
                trigger: '#s-community',
                start: 'top top',
                end: '+=150%',
                pin: true,
                scrub: 1
            }
        })
        .from('.comm-card', { y: 200, opacity: 0, stagger: 0.3 })
        .to('.community-kinetic-text', { scale: 1.25, duration: 2 }, 0);

        // Scene 05: Sydney Reveal
        gsap.timeline({
            scrollTrigger: {
                trigger: '#s-sydney',
                start: 'top 70%',
                end: 'top top',
                scrub: 1
            }
        })
        .from('.sydney-headline .char', { opacity: 0, y: 80, stagger: 0.03 })
        .from('.sydney-sub', { opacity: 0, y: 20 }, '-=0.3');

        // Scene 06: Events 3D Perspective Tunnel
        const eventsTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#s-events',
                start: 'top top',
                end: '+=300%',
                pin: true,
                scrub: 1
            }
        });

        const nodes = document.querySelectorAll('.event-node');
        nodes.forEach((node, idx) => {
            eventsTl
                .fromTo(node, 
                    { z: -1500, opacity: 0, filter: 'blur(20px)' },
                    { z: 0, opacity: 1, filter: 'blur(0px)', duration: 2 }
                )
                .to(node, { z: 800, opacity: 0, filter: 'blur(20px)', duration: 2 }, '+=1');
        });

        // Scene 07: Finale Light Burst
        gsap.timeline({
            scrollTrigger: {
                trigger: '#s-finale',
                start: 'top 50%',
                end: 'bottom bottom',
                scrub: 1
            }
        })
        .from('.finale-burst-light', { scale: 0.2, opacity: 0 })
        .from('.finale-title .char', { opacity: 0, y: 50, stagger: 0.04 });
    }

    /* ------------------------------------------------------------
       8. MULTI-LAYERED PARALLAX SYSTEM
       ------------------------------------------------------------ */
    initParallax() {
        document.querySelectorAll('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
            gsap.to(el, {
                y: () => -window.innerHeight * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }

    /* ------------------------------------------------------------
       9. MAGNETIC UI ELEMENTS
       ------------------------------------------------------------ */
    initMagnetic() {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(el, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    }
}

// Initialize on DOM Load
window.addEventListener('DOMContentLoaded', () => {
    window.experience = new ExperienceDirector();
});
