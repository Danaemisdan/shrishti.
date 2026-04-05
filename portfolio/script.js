// Initialize Lenis for Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Connect GSAP scrolling with Lenis
gsap.registerPlugin(ScrollTrigger);

// ── Custom Cursor ──────────────────────────────────────────────
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: "power2.out"
    });
});

// Expand cursor to ring on any link / interactive element
document.querySelectorAll('a, button, .orbit-item, .skill-row, .c-interactive').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});


// Scroll Progress Bar
gsap.to('.progress-bar', {
    width: "100%",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true }
});

// Theme Color Automation
const sections = document.querySelectorAll('section');
sections.forEach(sec => {
    ScrollTrigger.create({
        trigger: sec,
        start: "top 50%", // When top hits 50% viewport
        end: "bottom 50%",
        onEnter: () => document.body.setAttribute('data-current-theme', sec.dataset.color),
        onEnterBack: () => document.body.setAttribute('data-current-theme', sec.dataset.color)
    });
});

// Main Animation Loop orchestration (ensuring splash loads first)
window.addEventListener("load", () => {
    
    // Disable scrolling during splash
    lenis.stop();

    const splashTl = gsap.timeline({
        onComplete: () => {
            // Un-lock scroll and swap the element states to make Header real
            lenis.start();
            document.querySelector('.splash-screen').style.display = 'none';
            gsap.to('.logo', { opacity: 1, duration: 0.2 });
            gsap.to('.header .nav-links', { opacity: 1, duration: 0.5 });
            
            // Kickoff Hero Timelines
            initHeroAnimations();
        }
    });

    // Lock scroll instantly to avoid false bounds
    window.scrollTo(0,0);
    const anchor = document.querySelector('.hero-logo-large');
    
    // Step 1: Draw cursive strokes — WHITE on BLACK splash
    splashTl.to('.letter', { 
                strokeDashoffset: 0, 
                duration: 0.9, 
                stagger: 0.15,
                ease: "power2.out" 
            })
            // Step 2: Flood with solid WHITE ink
            .to('.letter', {
                fill: "#FCFCFC",
                strokeWidth: 0,
                duration: 0.5,
                stagger: 0.1
            }, "-=0.8")
            // Step 3: Dot punctuates
            .to('.svg-dot', {
                opacity: 1,
                y: -30,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut"
            })
            .to('.svg-dot', { opacity: 1, duration: 0 })
            // Step 4: Subtle glow on black bg
            .to('.svg-text-group', {
                filter: "drop-shadow(0 0 12px rgba(255,255,255,0.4))",
                duration: 0.4,
                ease: "power2.inOut"
            })
            // Step 5: Logo flies to top-left anchor
            .to('#flying-logo', {
                top: () => anchor.getBoundingClientRect().top,
                left: () => anchor.getBoundingClientRect().left,
                width: () => anchor.getBoundingClientRect().width,
                transform: "translate(0%, 0%)",
                duration: 1.4,
                ease: "power3.inOut"
            }, "+=0.6")
            // Step 6: Splash fades out revealing WHITE hero
            .to('.splash-screen', {
                opacity: 0,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    document.querySelector('.splash-screen').style.display = 'none';

                    // Re-parent logo INTO the hero anchor so it resizes naturally
                    const logo = document.querySelector('#flying-logo');
                    const anchor = document.querySelector('.hero-logo-large');
                    
                    gsap.set(logo, { clearProps: "top,left,transform,width" });
                    logo.style.position = 'relative';
                    logo.style.width = '100%';
                    logo.style.height = '100%';
                    
                    anchor.appendChild(logo);
                    // Fire metallic bismuth shimmer now that logo is on white bg
                    logo.classList.add('metallic');
                }
            }, "+=0.1")
            // Step 7: Logo flips BLACK so it's visible on the white hero bg
            .to('.letter, .svg-dot', {
                fill: "#111111",
                stroke: "#111111",
                duration: 0.4,
                ease: "power2.inOut"
            }, "<")
            .to('.svg-text-group', { filter: "none", duration: 0.1 }, "<");
            
    function initHeroAnimations() {
        const heroTimeline = gsap.timeline();
        const innerSpans = document.querySelectorAll('.hero-title .line span');
        heroTimeline.to(innerSpans, { y: "0%", duration: 1.2, stagger: 0.1, ease: "power4.out", delay: 0.1 })
                    .fromTo(".reveal-fade", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, "-=0.5");
        
        const fadeUpElements = document.querySelectorAll('.anim-fade-up');
        fadeUpElements.forEach((el) => {
            gsap.fromTo(el, { opacity: 0, y: 40 }, {
                scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
                opacity: 1, y: 0, duration: 1, ease: "power3.out"
            });
        });



        // Distort-Climb: only fires in the last 20% of each section's scroll travel
        const sections = document.querySelectorAll('.hero, .about, .skills, .works-split');
        sections.forEach((sec, i) => {
            if (i < sections.length - 1) {
                gsap.to(sec, {
                    scrollTrigger: {
                        trigger: sec,
                        start: "bottom 40%",  // Starts late — only when section is nearly off screen
                        end: "bottom top",
                        scrub: 1.5          // Slightly more inertia so blur lingers
                    },
                    y: -220,
                    skewY: -4,
                    filter: "blur(18px)",
                    ease: "none"
                });
            }
        });

        // Logo stays fixed but disappears the moment hero scrolls out of view
        ScrollTrigger.create({
            trigger: '#hero',
            start: 'bottom top',   // as soon as hero bottom crosses the top of viewport
            onEnterBack: () => gsap.set('#flying-logo', { autoAlpha: 1 }),
            onLeave:     () => gsap.set('#flying-logo', { autoAlpha: 0 })
        });
        
    }
    
});

// --- WORKS ORBIT LOGIC ---

const worksSection = document.getElementById('works');
if (worksSection) {
    const orbitRing = document.getElementById('orbit-ring');
    const orbitItems = document.querySelectorAll('.orbit-item');
    const bgVideo = document.getElementById('orbit-bg-video');
    const activeNum = document.getElementById('orbit-active-num');
    const activeTitle = document.getElementById('orbit-active-title');

    const totalItems = orbitItems.length;
    let radius = window.innerWidth > 768 ? window.innerWidth * 0.25 : 150; 
    if (radius > 400) radius = 400;

    // Position items in a circle and add interactions
    orbitItems.forEach((item, i) => {
        const angle = (i / totalItems) * 360;
        item.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;
        item.dataset.angle = angle;
        
        // Link navigation mapping from Works.md
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            if (url) window.open(url, '_blank');
        });

        // Hover playback
        const video = item.querySelector('video');
        if (video) {
            item.addEventListener('mouseenter', () => {
                video.currentTime = 0;
                video.play().catch(() => {});
            });
            item.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });

    let currentIndex = -1;

    // Spin the ring based on scroll
    gsap.to(orbitRing, {
        scrollTrigger: {
            trigger: worksSection,
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // smooth scroll tie
            onUpdate: (self) => {
                const ringRotation = -self.progress * 360;
                
                // Counter the ring rotation for each item so they stay upright
                orbitItems.forEach((item) => {
                    const angle = parseFloat(item.dataset.angle);
                    item.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg) rotate(${-ringRotation}deg)`;
                });

                // Find active index based on progress
                let newIndex = Math.round(self.progress * totalItems) % totalItems;
                if (newIndex < 0) newIndex += totalItems;

                if (newIndex !== currentIndex) {
                    currentIndex = newIndex;
                    updateActiveItem(currentIndex);
                }
            }
        },
        rotation: -360, // ring rotates backwards full circle
        ease: "none"
    });

    function updateActiveItem(index) {
        orbitItems.forEach(i => i.classList.remove('active'));
        const activeItem = orbitItems[index];
        if(!activeItem) return;

        activeItem.classList.add('active');
        activeNum.textContent = activeItem.dataset.num;
        activeTitle.textContent = activeItem.dataset.title;

        const newSrc = activeItem.dataset.vid;
        if (bgVideo.getAttribute("src") !== newSrc) {
            // Blur out, swap, blur in
            gsap.to(bgVideo, {
                opacity: 0,
                filter: "blur(30px)",
                duration: 0.3,
                onComplete: () => {
                    bgVideo.src = newSrc;
                    bgVideo.load();
                    bgVideo.play().catch(() => {});
                    gsap.to(bgVideo, { opacity: 0.3, filter: "blur(0px)", duration: 0.5 });
                }
            });
        }
    }

    // Handle resize to adjust orbit radius dynamically
    window.addEventListener('resize', () => {
        radius = window.innerWidth > 768 ? window.innerWidth * 0.25 : 150;
        if (radius > 400) radius = 400;
        const currentRingRot = gsap.getProperty(orbitRing, "rotation") || 0;
        orbitItems.forEach((item) => {
            const angle = parseFloat(item.dataset.angle);
            item.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg) rotate(${-currentRingRot}deg)`;
        });
    });
}

