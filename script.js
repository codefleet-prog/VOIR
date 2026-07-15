// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Force scroll restoration to manual and scroll to top immediately to prevent browser scroll memory snaps
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

let floatTween = null;
let isMouseOver = false;
let isScrollingTransition = false; // Flag to disable tilt during scroll transition

// Function to manage the gentle floating animation using GSAP (eliminates CSS transform clashing)
function startFloating() {
  const image = document.querySelector('.pizza-image');
  if (!image) return;
  
  // Kill any existing floating tween to prevent leaks/duplicates
  if (floatTween) floatTween.kill();
  
  // Explicitly lock the baseline position and scale of the pizza slice
  gsap.set(image, { y: 0, rotate: 0, scale: 1.25 });
  
  floatTween = gsap.to(image, {
    y: -15,
    rotate: 2,
    scale: 1.25, // Maintain the exact baseline scale to prevent growing/shrinking bugs
    duration: 2.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    overwrite: "auto"
  });
}

// 1. Entry Animations on Load (Matching React Framer Motion)
window.addEventListener('DOMContentLoaded', () => {
  const image = document.querySelector('.pizza-image');
  const container = document.querySelector('.hero-circle-container');

  // Set initial scale for the hero circle immediately so it loads large without snapping
  gsap.set('.circle-el', { scale: 1.18 });

  const tl = gsap.timeline({
    onComplete: () => {
      // Force scroll to top before measuring to prevent any layout snaps
      window.scrollTo(0, 0);
      // Switch hero-content from fixed back to relative so ScrollTrigger pinning works
      const heroContent = document.getElementById('hero-content');
      heroContent.classList.remove('fixed', 'inset-0');
      heroContent.classList.add('relative');
      // Build and register ScrollTrigger timelines ONLY after entrance animations complete.
      initScrollTrigger();
      document.body.classList.remove('overflow-hidden');
      startFloating();
    }
  });

  // Header Animation
  tl.to('.header-el', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Circle fades in as a decorative outline ring (no fill in hero, no Japan-flag look)
  tl.to('.circle-el', {
    opacity: 1,
    duration: 1.0,
    ease: 'power2.out'
  }, '-=0.6');

  // Pizza Rise-in (animating to its baseline scale of 1.25) + tagline fade
  tl.to('.pizza-image', {
    opacity: 1,
    y: 0,
    scale: 1.25,
    duration: 1.2,
    ease: 'power4.out'
  }, '-=0.8');

  tl.to('.hero-tagline-el', {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.6');

  // Left Column Text
  tl.to('.left-col', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.6');

  // Right Column Heading
  tl.to('.right-col', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.6');

  // Footer
  tl.to('.footer-el', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.6');

  // 2. Interactive Mouse 3D Parallax Tilt Effect on Pizza Container
  if (container && image) {
    container.addEventListener('mouseenter', () => {
      if (isScrollingTransition) return;
      isMouseOver = true;
      // Pause floating GSAP animation smoothly on mouseenter to avoid fighting transforms
      if (floatTween) floatTween.pause();
    });

    container.addEventListener('mousemove', (e) => {
      if (!isMouseOver || isScrollingTransition) return;
      
      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      
      // Calculate tilt degrees (Max tilt: 18 degrees)
      const tiltX = (relY / (rect.height / 2)) * -18;
      const tiltY = (relX / (rect.width / 2)) * 18;
      
      // Calculate slight translation shifts (Max translation: 25px)
      const transX = (relX / (rect.width / 2)) * 25;
      const transY = (relY / (rect.height / 2)) * 25;
      
      gsap.to(image, {
        rotateX: tiltX,
        rotateY: tiltY,
        x: transX,
        y: transY,
        scale: 1.35, // Elevate slice slightly when interactive
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    container.addEventListener('mouseleave', () => {
      isMouseOver = false;
      // Reset tilt and translation positions smoothly back to original float baseline
      gsap.to(image, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        scale: 1.25,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => {
          // Resume gentle GSAP floating animation once reset finishes
          if (!isMouseOver && !isScrollingTransition) {
            if (floatTween) floatTween.resume();
          }
        }
      });
    });
  }
});

// 3. ScrollTrigger Master Timeline Setup
function initScrollTrigger() {
  const isMobile = window.innerWidth < 768;
  const targetX = isMobile ? "0vw" : "30vw";
  const targetY = isMobile ? "36vh" : "32vh"; // Original fixed-viewport offsets aligned with the scrolled-up About section
  const targetScale = isMobile ? 0.7 : 0.85;
  const image = document.querySelector('.pizza-image');

  // Ensure circle starts as transparent outline ring (matches HTML inline style)
  gsap.set('.circle-el', { backgroundColor: 'transparent' });

  // Keep the About Section sitting near the bottom edge initially (y: "60vh").
  // This ensures its contents start appearing at the bottom of the screen, completely clear of the giant center circle.
  // We hide it using autoAlpha: 0 (combines opacity and visibility: hidden) so it does not block interactions.
  gsap.set('#about-section', { y: "60vh", autoAlpha: 0 });
  gsap.set('.about-content', { opacity: 0, y: 50 });
  gsap.set('.about-badge', { opacity: 0, y: 30 });
  gsap.set('.about-sandwich-image', { scale: 0, opacity: 0, x: 0, y: 0 });
  
  // Gallery initial state
  gsap.set('#gallery-section-overlay', { autoAlpha: 0 });
  gsap.set('.gallery-master-heading', { opacity: 0, y: 50 });
  gsap.set('.gallery-grid-container', { y: "100vh" });

  // Master timeline attached to scroll
  const scrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero-section",
      start: "top top",
      end: "+=1200%", // 1200vh total scroll distance to accommodate masonry gallery and contact section
      scrub: 1, // Smooth lagging scrub for luxury parallax organic latency
      pin: true, // Pin hero during scroll sequence
      anticipatePin: 1,
      onUpdate: (self) => {
        // Continuous, highly robust scroll progress tracking
        if (self.progress > 0.01) {
          isScrollingTransition = true;
          if (floatTween && !floatTween.paused()) {
            floatTween.pause();
          }
        } else if (self.progress === 0) {
          isScrollingTransition = false;
          if (image) {
            // Smoothly reset transforms back to baseline and resume floating loop
            gsap.to(image, { 
              rotateX: 0, 
              rotateY: 0, 
              x: 0, 
              y: 0, 
              scale: 1.25, 
              duration: 0.2,
              overwrite: "auto",
              onComplete: () => {
                if (floatTween && floatTween.paused()) {
                  floatTween.resume();
                }
              }
            });
          }
        }
      }
    }
  });

  // Phase 1 (0 to 0.5 of scrub): Hero items slowly slide out of viewport.
  // Circle transitions from outline ring to solid filled as it scales up to 2.2x —
  // the fill only becomes apparent when the circle dominates the screen.
  scrollTimeline.to('.footer-el', { y: 120, opacity: 0, ease: 'power1.inOut', duration: 0.5 }, 0)
    .to('.left-col', { x: -350, opacity: 0, ease: 'power2.inOut', duration: 0.5 }, 0)
    .to('.right-col', { x: 350, opacity: 0, ease: 'power2.inOut', duration: 0.5 }, 0)
    .to('.pizza-image', { scale: 0, opacity: 0, y: -60, ease: 'power2.inOut', duration: 0.5 }, 0)
    .to('.hero-tagline-el', { opacity: 0, ease: 'power1.inOut', duration: 0.3 }, 0)
    .to('.circle-el', {
      scale: 2.2,
      backgroundColor: '#B026FF',
      borderWidth: 0,
      ease: 'power2.inOut',
      duration: 0.5
    }, 0);

  // Phase 2 (0.5 to 1.0 of scrub): Circle shrinks and floats down to bottom-right.
  scrollTimeline.to('.circle-el', { 
    scale: targetScale, 
    x: targetX, 
    y: targetY, 
    ease: 'power2.inOut',
    duration: 0.5
  }, 0.5);

  // About Section Entrance: starts early at 0.4 progress (10% before the circle starts shrinking!)
  // This provides a beautiful overlapping fade where text starts resolving while the circle is at maximum scale.
  // It slides up elegantly from y: "60vh" to y: 0.
  scrollTimeline.to('#about-section', { y: 0, autoAlpha: 1, ease: 'power2.out', duration: 0.6 }, 0.4)
    .to('.about-content', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 0.4)
    .to('.about-badge', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.55 }, 0.45);

  const sandwichTargetX = isMobile ? "3vw" : "33.5vw"; // Offset horizontally to the right of the circle center (targetX)
  const sandwichTargetY = targetY; // Perfectly centered vertically on the circle center (targetY)

  // Sandwich Image Entrance: animates on top of the circle
  scrollTimeline.to('.about-sandwich-image', {
    scale: 1,
    opacity: 1,
    x: sandwichTargetX,
    y: sandwichTargetY,
    ease: 'back.out(1.5)', // Springy/bounce luxury visual arrival
    duration: 0.3 // Slowed down from 0.15
  }, 0.7); // Starts at 0.7 to finish exactly as the circle settles at 1.0

  // Phase 3 (1.5 to 2.5 of scrub): Circle scales up 40% and slides left, About items slide out
  const menuCircleScale = targetScale * 1.4; // 40% bigger
  const menuCircleX = isMobile ? "0vw" : "-28vw";
  const menuCircleY = isMobile ? "32vh" : "32vh";

  // Slower transition: duration 1.0 instead of 0.5
  scrollTimeline.to('.about-content', { x: -350, opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 1.5)
    .to('.about-badge', { x: 350, opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 1.5)
    .to('.about-sandwich-image', { x: 350, opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 1.5)
    .to('#about-section', { autoAlpha: 0, ease: 'power1.inOut', duration: 1.0 }, 1.5)
    .to('.circle-el', { backgroundColor: '#00F0FF', scale: menuCircleScale, x: menuCircleX, y: menuCircleY, ease: 'power2.inOut', duration: 1.0 }, 1.5);

  const pastaTargetX = isMobile ? "-4vw" : "-32vw"; // Offset horizontally to the left of the new circle position
  const pastaTargetY = isMobile ? "22vh" : "22vh"; // Offset vertically higher than the circle center

  // Menu Section Heading Entrance
  scrollTimeline.to('.menu-master-heading', {
    opacity: 1,
    y: 0,
    ease: 'power2.out',
    duration: 0.5
  }, 2.0);

  // Pasta/Offer Image 1 Entrance: Slowed down to duration 0.3
  scrollTimeline.to('.offer-img-1', {
    scale: 1,
    opacity: 1,
    x: pastaTargetX,
    y: pastaTargetY,
    ease: 'back.out(1.5)', // Springy/bounce luxury visual arrival
    duration: 0.3
  }, 2.2); // Ends at 2.5 exactly as circle settles

  // Phase 4-7 (2.5 to 6.5): Four menu categories appear sequentially. Everything is shifted by +0.5 to match the extended Phase 3.

  // 1. Pizzas
  scrollTimeline.to('.menu-cat-1', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 2.5)
    .to('.menu-cat-1', { opacity: 0, y: -50, ease: 'power2.in', duration: 0.4 }, 3.3);
    
  // Transition to Red for 02
  scrollTimeline.to('.circle-el', { backgroundColor: '#FF003C', ease: 'power2.inOut', duration: 0.4 }, 3.3);
  scrollTimeline.to('.menu-master-heading', { '--accent': '#FF003C', ease: 'power2.inOut', duration: 0.4 }, 3.3);
    
  // Image 1 out, Image 2 in
  scrollTimeline.to('.offer-img-1', { y: "-10vh", opacity: 0, scale: 0.5, ease: 'power2.in', duration: 0.4 }, 3.3);
  scrollTimeline.fromTo('.offer-img-2', 
    { x: pastaTargetX, y: "60vh", scale: 0.5, opacity: 0 }, 
    { x: pastaTargetX, y: pastaTargetY, scale: 1.15, opacity: 1, ease: 'back.out(1.2)', duration: 0.4, immediateRender: false }, 
    3.5);

  // 2. Pastas
  scrollTimeline.to('.menu-cat-2', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 3.5)
    .to('.menu-cat-2', { opacity: 0, y: -50, ease: 'power2.in', duration: 0.4 }, 4.3);

  // Transition to Purple for 03
  scrollTimeline.to('.circle-el', { backgroundColor: '#B026FF', ease: 'power2.inOut', duration: 0.4 }, 4.3);
  scrollTimeline.to('.menu-master-heading', { '--accent': '#B026FF', ease: 'power2.inOut', duration: 0.4 }, 4.3);

  // Image 2 out, Image 3 in
  scrollTimeline.to('.offer-img-2', { y: "-10vh", opacity: 0, scale: 0.5, ease: 'power2.in', duration: 0.4 }, 4.3);
  scrollTimeline.fromTo('.offer-img-3', 
    { x: pastaTargetX, y: "60vh", scale: 0.5, opacity: 0 }, 
    { x: pastaTargetX, y: pastaTargetY, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.4, immediateRender: false }, 
    4.5);

  // 3. Sandwiches
  scrollTimeline.to('.menu-cat-3', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 4.5)
    .to('.menu-cat-3', { opacity: 0, y: -50, ease: 'power2.in', duration: 0.4 }, 5.3);

  // Transition to Green for 04
  scrollTimeline.to('.circle-el', { backgroundColor: '#00FF66', ease: 'power2.inOut', duration: 0.4 }, 5.3);
  scrollTimeline.to('.menu-master-heading', { '--accent': '#00FF66', ease: 'power2.inOut', duration: 0.4 }, 5.3);

  // Image 3 out, Image 4 in
  scrollTimeline.to('.offer-img-3', { y: "-10vh", opacity: 0, scale: 0.5, ease: 'power2.in', duration: 0.4 }, 5.3);
  scrollTimeline.fromTo('.offer-img-4', 
    { x: pastaTargetX, y: "60vh", scale: 0.5, opacity: 0 }, 
    { x: pastaTargetX, y: pastaTargetY, scale: 1.2, opacity: 1, ease: 'back.out(1.2)', duration: 0.4, immediateRender: false }, 
    5.5);

  // 4. Desserts (Stays on screen slightly longer as the final item)
  scrollTimeline.to('.menu-cat-4', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 5.5)
    .to('.menu-cat-4', { opacity: 1, y: 0, duration: 0.6 }, 5.9); // Holds visibility until the end of scroll

  // Global Menu CTA (Fades in after Desserts and stays)
  scrollTimeline.to('.menu-cta', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 5.7)
    .to('.menu-cta', { opacity: 1, y: 0, duration: 0.4 }, 6.1);

  // Phase 8 (6.5 to 7.5): Transition to Gallery. Menu contents slide out, circle to top right.
  const galleryCircleX = isMobile ? "30vw" : "35vw";
  const galleryCircleY = isMobile ? "-35vh" : "-35vh";
  const galleryCircleScale = isMobile ? 0.6 : 0.8;

  scrollTimeline.to('.menu-master-heading', { x: -350, opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 6.5)
    .to('.offer-img-4', { x: 350, opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 6.5)
    .to('.menu-cat-4', { x: 350, opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 6.5)
    .to('.menu-cta', { x: 350, opacity: 0, ease: 'power2.inOut', duration: 1.0 }, 6.5)
    .to('#menu-section-overlay', { autoAlpha: 0, ease: 'power1.inOut', duration: 1.0 }, 6.5)
    .to('.circle-el', { backgroundColor: '#FFEA00', scale: galleryCircleScale, x: galleryCircleX, y: galleryCircleY, ease: 'power2.inOut', duration: 1.0 }, 6.5)
    // Gallery Section Entrance
    .to('#gallery-section-overlay', { autoAlpha: 1, ease: 'power2.out', duration: 0.6 }, 7.2)
    .to('.gallery-master-heading', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }, 7.2);

  // Phase 9 (7.5 to 9.5): Gallery masonry grid container slides up continuously.
  scrollTimeline.to('.gallery-grid-container', { y: "-120vh", ease: 'none', duration: 2.0 }, 7.5);

  // Phase 9.5 (7.9 to 9.5): When Image 3 hits ~60vh (at scrub time 7.9), the subheader slides up and circles fall
  scrollTimeline.to('.gallery-subheader', { y: "-150vh", ease: 'none', duration: 1.6 }, 7.9)
    .to('.gallery-parallax-circle', { y: "250vh", ease: 'none', duration: 1.6, stagger: { amount: 0.2, from: "random" } }, 7.9)
    .to('.circle-el', { y: "+=250vh", ease: 'none', duration: 1.6 }, 7.9)
    .to('#transition-circle', { y: 0, xPercent: -50, ease: 'power2.out', duration: 1.6 }, 7.9);

  // Phase 10 (9.0 to 10.0): The transition circle expands to cover the screen, hiding the gallery
  scrollTimeline.to('#transition-circle', { scale: 15, ease: 'power2.inOut', duration: 1.0 }, 9.0)
    .to('.gallery-master-heading', { autoAlpha: 0, duration: 0.1 }, 9.5) // hide halfway through expansion
    .to('.gallery-grid-container', { autoAlpha: 0, duration: 0.1 }, 9.5)
    .to('#gallery-parallax-circles', { autoAlpha: 0, duration: 0.1 }, 9.5);

  // Phase 11 (10.0 to 11.0): The circle scales down to 25vw and moves left, revealing Contact Section
  const contactCircleLeft = isMobile ? "10vw" : "15vw";
  const contactCircleScale = isMobile ? 2.5 : 2.5; // Base is 10vw, so 2.5 is 25vw

  scrollTimeline.to('#transition-circle', { scale: contactCircleScale, left: contactCircleLeft, bottom: "50vh", yPercent: 50, xPercent: -50, ease: 'power2.inOut', duration: 1.0 }, 10.0)
    .to('#contact-section-overlay', { autoAlpha: 1, duration: 0.1 }, 10.0)
    .to('.contact-content', { opacity: 1, y: 0, ease: 'power2.out', duration: 0.8 }, 10.2)
    .fromTo('#contact-dish-img', 
      { scale: 0, opacity: 0, rotation: 45, x: "-10vw" },
      { scale: 1, opacity: 1, rotation: -15, x: "0vw", ease: 'back.out(1.5)', duration: 0.8 },
      10.3
    );
}

// 4. Mobile Menu Overlay Toggle
window.toggleMobileMenu = function(open) {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  
  if (open) {
    menu.classList.remove('invisible');
    gsap.to(menu, {
      opacity: 1,
      duration: 0.4,
      ease: 'power3.out',
      onStart: () => {
        menu.style.visibility = 'visible';
      }
    });
  } else {
    gsap.to(menu, {
      opacity: 0,
      duration: 0.4,
      ease: 'power3.inOut',
      onComplete: () => {
        menu.classList.add('invisible');
        menu.style.visibility = 'hidden';
      }
    });
  }
}

// 5. Smooth Scroll for Anchor Links (accounting for GSAP Scrub Timeline)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      const vh = window.innerHeight;
      
      if (targetId === '#about') {
        e.preventDefault();
        // About section is fully readable at scrub time 1.0. Total duration is 11.5, total scroll is 12.0vh
        const scrollTarget = (1.0 / 11.5) * (12.0 * vh);
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      } else if (targetId === '#offers') {
        e.preventDefault();
        // Menu fully readable at 3.0. Total duration is 11.5, total scroll is 12.0vh
        const scrollTarget = (3.0 / 11.5) * (12.0 * vh);
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      } else if (targetId === '#gallery') {
        e.preventDefault();
        // Gallery fully settled at 8.0. Total duration is 11.5, total scroll is 12.0vh
        const scrollTarget = (8.0 / 11.5) * (12.0 * vh);
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      } else if (targetId === '#contact') {
        e.preventDefault();
        // Contact section fully visible at the very end. Total duration is 11.5, total scroll is 12.0vh
        const scrollTarget = (11.5 / 11.5) * (12.0 * vh);
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    });
  });

  // 6. Gallery Section Entrance
  gsap.to('[data-gallery-content]', {
    scrollTrigger: {
      trigger: "#gallery",
      start: "top 80%",
    },
    opacity: 1,
    y: 0,
    ease: 'power3.out',
    duration: 1.0
  });
});
