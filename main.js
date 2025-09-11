document.addEventListener("DOMContentLoaded", (event) => {
  // Loader and main content handling
  const loader = document.getElementById("loader");
  const mainContent = document.getElementById("main-content");
  const footer = document.querySelector(".footer");
  const cursor = document.getElementById('custom-cursor');

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ===== MOVE PAGE DETECTION HERE - BEFORE LOADER =====
  const isHomePage = document.querySelector('.featured-work');
  const isWorkPage = document.querySelector('.work-main');
  const isCaseStudyPage = document.querySelector('.project-main');

  // ===== SCROLL-ONLY REVEAL FUNCTION =====
  function setupScrollReveals(selector = '.reveal-text') {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function splitElement(el) {
      const st = new SplitText(el, {
        type: 'lines,words',
        linesClass: 'split-line',
        wordsClass: 'split-word'
      });
      return { lines: st.lines, words: st.words, splitter: st };
    }

    document.fonts.ready.then(() => {
      console.log('Setting up SCROLL-ONLY reveals...');

      const revealElements = document.querySelectorAll(selector);

      revealElements.forEach((el) => {
        // Skip work titles - they have their own word-splitting system
        if (el.classList.contains('work-title') || el.closest('.work-title')) {
          return;
        }

        const { lines, words } = splitElement(el);

        if (prefersReduced) {
          gsap.set(el, { opacity: 1 });
          return;
        }

        gsap.set(lines, { overflow: 'hidden' });
        gsap.set(words, { yPercent: 115, opacity: 0, skewY: 8, rotate: 0.001 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
            // ADD THIS: Only trigger on actual scroll, not on page load
            refreshPriority: -1, // Lower priority
            invalidateOnRefresh: true
          }
        });

        tl.to(words, {
          yPercent: 0,
          opacity: 1,
          skewY: 0,
          ease: 'power3.out',
          duration: 1.65,
          stagger: {
            each: el.tagName.match(/^H\d$/) ? 0.08 : 0.05,
            from: el.tagName.match(/^H\d$/) ? 'center' : 0
          }
        });
      });
    });
  }

  // If there's no loader (like on about/work pages), show cursor immediately
  if (!loader) {
    if (cursor) {
      cursor.style.display = 'block';
    }
    if (mainContent) {
      mainContent.style.display = "block";
    }
  } else {
    // Hide cursor initially only if there's a loader
    if (cursor) {
      cursor.style.display = 'none';
    }

    // Show the loader initially, hide main content and footer
    if (loader) {
      loader.style.display = "flex";
    }
    if (mainContent) {
      mainContent.style.display = "none";
    }
    if (footer) {
      footer.style.display = "none";
    }

    // Start fade after 2.5 seconds
    setTimeout(() => {
      loader.style.opacity = 1;
      const fade = () => {
        if ((loader.style.opacity -= 0.02) <= 0) {
          loader.style.display = "none";
          mainContent.style.display = "block";
          if (footer) {
            footer.style.display = "block";
          }
          if (cursor) {
            cursor.style.display = 'block';
          }

          if (isHomePage) {
            setTimeout(() => {
              console.log('Setting up scroll reveals after loader...');
              setupScrollReveals('.reveal-text');

              // Bridge description animation with fonts ready check
              document.fonts.ready.then(() => {
                const bridgeDescription = document.querySelector('.bridge-description');
                if (bridgeDescription) {
                  console.log('Setting up bridge description animation');

                  // Simple fade-up animation - no text splitting
                  gsap.set(bridgeDescription, { opacity: 0, y: 50 });

                  gsap.to(bridgeDescription, {
                    opacity: 1,
                    y: 0,
                    duration: 1.5,
                    ease: 'power3.out',
                    scrollTrigger: {
                      trigger: bridgeDescription,
                      start: 'top 85%',
                      once: true
                    }
                  });
                }
              });
            }, 500); // Increase from 100 to 500ms
          }
        } else {
          requestAnimationFrame(fade);
        }
      };
      fade();
    }, 2500);
  }

  // ====== Custom Cursor Functionality ======  

  // const cursor = document.getElementById('custom-cursor');
  const cursorSquare = document.querySelector('.cursor-square');
  const cursorCircle = document.querySelector('.cursor-circle');

  console.log('Cursor elements found:', { cursor, cursorSquare, cursorCircle });

  if (cursor && cursorSquare && cursorCircle) {
    let mouseX = 0;
    let mouseY = 0;
    let circleX = 0;
    let circleY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      // Direct follow for square
      cursorSquare.style.left = mouseX + 'px';
      cursorSquare.style.top = mouseY + 'px';
      cursorSquare.style.transform = 'translate(-50%, -50%)';

      // Smooth follow for circle
      circleX += (mouseX - circleX) * 0.1;
      circleY += (mouseY - circleY) * 0.1;

      cursorCircle.style.left = circleX + 'px';
      cursorCircle.style.top = circleY + 'px';
      cursorCircle.style.transform = 'translate(-50%, -50%)';

      requestAnimationFrame(updateCursor);
    }

    updateCursor();

    // ✅ FIX: Only show cursor immediately for pages WITHOUT a loader
    if (!loader) {
      cursor.style.display = 'block';
    }
    // For pages WITH a loader, the cursor will be shown after the loader completes
  } else {
    console.log('Cursor elements NOT found!');
  }

  // Navbar scroll behavior
  window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.nav-container');

    if (window.scrollY > 50) { // After scrolling 50px
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Cleanup and refresh on window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

  if (isHomePage) {

    // Animate "View All" text
    gsap.to(".featured-text > span:last-child", { // Target the LAST span child (View All)
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".featured-work h2",
        start: "top 80%",
        end: "bottom 60%",
        toggleActions: "play none none reverse",
        // markers: true,
      },
      delay: 8
    });

    // Word Cloud Functionality
    const toolsMap = {
      "data-science": ["R", "Python", "SQL", "Tableau", "Machine Learning", "Statistics"],
      "storytelling": ["D3.js", "GSAP", "Figma", "Adobe Illustrator", "Narrative Design"],
      "development": ["JavaScript", "Node.js", "Vue", "React", "API Design", "Performance"],
      "design": ["Figma", "Affinity", "Adobe Illustrator", "UI/UX", "Prototyping", "Design Systems"]
    };

    const allTools = [
      "R", "Python", "SQL", "Tableau", "Machine Learning", "Statistics",
      "D3.js", "GSAP", "Figma", "Adobe Illustrator", "Narrative Design",
      "JavaScript", "Node.js", "Vue", "React", "API Design", "Performance",
      "UI/UX", "Prototyping", "Design Systems", "Affinity"
    ];

    // Simple collision detection
    function findNonOverlappingPosition(width, height, cloudWidth, cloudHeight, existingPositions) {
      let attempts = 0;
      const maxAttempts = 50;

      while (attempts < maxAttempts) {
        const x = 40 + Math.random() * Math.max(0, cloudWidth - width - 80);
        const y = 40 + Math.random() * Math.max(0, cloudHeight - height - 80);

        // Check for overlaps
        let hasOverlap = false;
        for (let pos of existingPositions) {
          const buffer = 25; // Space between words
          if (x < pos.x + pos.width + buffer &&
            x + width + buffer > pos.x &&
            y < pos.y + pos.height + buffer &&
            y + height + buffer > pos.y) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          return { x, y };
        }

        attempts++;
      }

      // Fallback: return random position
      return {
        x: 40 + Math.random() * Math.max(0, cloudWidth - width - 80),
        y: 40 + Math.random() * Math.max(0, cloudHeight - height - 80)
      };
    }

    // Main word cloud function
    function renderWordCloud(tools) {
      const cloud = document.getElementById('tools-cloud');
      if (!cloud) {
        console.log('Cloud container not found');
        return;
      }

      cloud.innerHTML = '';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const cloudRect = cloud.getBoundingClientRect();
          const cloudWidth = cloudRect.width;
          const cloudHeight = cloudRect.height;

          console.log('Cloud dimensions:', { width: cloudWidth, height: cloudHeight });

          if (cloudWidth === 0 || cloudHeight === 0) {
            console.log('Container not ready, retrying...');
            setTimeout(() => renderWordCloud(tools), 200);
            return;
          }

          const positions = [];

          tools.forEach((tool, index) => {
            const span = document.createElement('span');
            span.textContent = tool;
            span.style.position = 'absolute';
            span.style.opacity = '0';

            const fontSize = 1.0 + Math.random() * 0.4; // Increase from 0.9 to 1.0 for larger base size
            span.style.fontSize = `${fontSize}em`;

            cloud.appendChild(span);

            requestAnimationFrame(() => {
              const spanWidth = span.offsetWidth;
              const spanHeight = span.offsetHeight;

              let position = findNonOverlappingPosition(spanWidth, spanHeight, cloudWidth, cloudHeight, positions);

              span.style.left = position.x + 'px';
              span.style.top = position.y + 'px';

              // Add subtle floating animation
              span.style.animationDelay = `${Math.random() * 2}s`;
              span.style.animationDuration = `${6 + Math.random() * 4}s`;

              // Store position
              positions.push({
                x: position.x,
                y: position.y,
                width: spanWidth,
                height: spanHeight
              });

              // Animate in
              gsap.to(span, {
                opacity: 0.85,
                duration: 0.6,
                delay: index * 0.05,
                ease: "power2.out"
              });
            });
          });
        });
      });
    }

    // Initialize on page load
    if (document.getElementById('tools-cloud')) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          renderWordCloud(allTools);
        }, 500);
      });

      // setTimeout(() => {
      //   const cloud = document.getElementById('tools-cloud');
      //   if (cloud && cloud.children.length === 0) {
      //     renderWordCloud(allTools);
      //   }
      // }, 1000);
    }

    // Service items click handler
    const serviceItems = document.querySelectorAll('.service-item');

    serviceItems.forEach(item => {
      const header = item.querySelector('.service-header');

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        serviceItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        if (isActive) {
          item.classList.remove('active');
          renderWordCloud(allTools);
        } else {
          item.classList.add('active');
          const serviceKey = item.getAttribute('data-service');
          renderWordCloud(toolsMap[serviceKey] || allTools);
        }
      });
    });
  }

  // Work page-specific functionality
  if (isWorkPage) {

    // ===== DYNAMIC FILTER COUNTS =====
    function updateFilterCounts() {
      const filterButtons = document.querySelectorAll('.filter-btn');

      filterButtons.forEach(button => {
        const filter = button.getAttribute('data-filter');
        let count = 0;

        if (filter === 'featured') {
          count = document.querySelectorAll('.featured-view .project-card-wrapper').length;
        } else if (filter === 'all') {
          count = document.querySelectorAll('.all-work-view .work-item').length;
        } else if (filter === 'focus') {
          count = document.querySelectorAll('.focus-view .focus-project-item').length;
        }

        // Update the data-count attribute
        button.setAttribute('data-count', count.toString().padStart(2, '0'));
      });
    }

    // Call it when the page loads
    setTimeout(() => {
      updateFilterCounts();
    }, 100);
    // ===== VIEW-SWITCH REVEAL FUNCTION (immediate, snappy reveals) =====
    function setupViewSwitchReveals(selector) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function splitElement(el) {
        const st = new SplitText(el, {
          type: 'lines,words',
          linesClass: 'split-line',
          wordsClass: 'split-word'
        });
        return { lines: st.lines, words: st.words, splitter: st };
      }

      document.fonts.ready.then(() => {
        console.log('Setting up VIEW-SWITCH reveals...');

        const revealElements = document.querySelectorAll(selector);

        revealElements.forEach((el) => {
          // Skip work titles AND already processed elements
          if (el.classList.contains('work-title') ||
            el.closest('.work-title') ||
            el.__switchProcessed) {
            return;
          }

          // Only animate elements that are currently in viewport (above the fold)
          const rect = el.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

          if (!isInViewport) {
            return; // Let scroll reveals handle this element
          }

          // Mark as processed to prevent double-processing
          el.__switchProcessed = true;

          const { lines, words } = splitElement(el);

          if (prefersReduced) {
            gsap.set(el, { opacity: 1 });
            return;
          }

          // Simple immediate reveal - no complex roll out/in
          gsap.set(lines, { overflow: 'hidden' });
          gsap.set(words, { yPercent: 30, opacity: 0 });

          // Simple, immediate reveal
          gsap.to(words, {
            yPercent: 0,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.55,
            delay: 0.1,
            stagger: {
              each: 0.03,
              from: 0
            }
          });
        });
      });
    }

    // CALLING THE MAIN SCROLL REVEALS FUNCTION
    setTimeout(() => {
      console.log('Setting up work page scroll reveals...');
      setupScrollReveals('.reveal-text');

      // Separate animation for work titles (no SplitText conflict)
      function animateWorkTitles() {
        const workTitles = document.querySelectorAll('.all-work-view .work-title.reveal-text');

        workTitles.forEach((title) => {
          // Simple fade-up animation that doesn't interfere with word splitting
          gsap.set(title, { opacity: 0, y: 30 });

          gsap.to(title, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 90%',
              once: true
            }
          });
        });
      }

      animateWorkTitles(); // Add this line
    }, 200);


    // ===== ALL WORK VIEW IMAGE REVEAL FUNCTION =====
    // Work page filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const featuredView = document.querySelector('.featured-view');
    const allWorkView = document.querySelector('.all-work-view');
    const focusView = document.querySelector('.focus-view');

    if (filterButtons.length > 0) {
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const filter = button.getAttribute('data-filter');

          // Update active button
          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          // Hide all views first
          if (featuredView) featuredView.classList.add('hidden');
          if (allWorkView) allWorkView.classList.add('hidden');
          if (focusView) focusView.classList.add('hidden');

          // Show the selected view and set up BOTH switch + scroll animations
          if (filter === 'featured' && featuredView) {
            featuredView.classList.remove('hidden');
            setTimeout(() => {
              // Immediate switch reveal for visible elements
              setupViewSwitchReveals('.featured-view .reveal-text');
              // Set up scroll reveals for elements below the fold
              setTimeout(() => {
                setupScrollReveals('.featured-view .reveal-text');
              }, 100);
            }, 100);

          } else if (filter === 'all' && allWorkView) {
            allWorkView.classList.remove('hidden');
            setTimeout(() => {
              setupViewSwitchReveals('.all-work-view .reveal-text');
              setTimeout(() => {
                setupScrollReveals('.all-work-view .reveal-text');
              }, 100);
            }, 100);

          } else if (filter === 'focus' && focusView) {
            focusView.classList.remove('hidden');
            setTimeout(() => {
              setupViewSwitchReveals('.focus-view .reveal-text');
              setTimeout(() => {
                setupScrollReveals('.focus-view .reveal-text');
              }, 100);
            }, 100);
          }

          // Refresh ScrollTrigger after view change
          setTimeout(() => ScrollTrigger.refresh(), 200);
        });
      });
      // Set up scroll reveals for the initially visible view
      setTimeout(() => {
        if (featuredView && !featuredView.classList.contains('hidden')) {
          setupScrollReveals('.featured-view .reveal-text');
        } else if (allWorkView && !allWorkView.classList.contains('hidden')) {
          setupScrollReveals('.all-work-view .reveal-text');
        } else if (focusView && !focusView.classList.contains('hidden')) {
          setupScrollReveals('.focus-view .reveal-text');
        }
      }, 300);
    }

    const workTitles = document.querySelectorAll('.work-title');

    workTitles.forEach((title, idx) => {
      const src = title.getAttribute('data-image');
      const text = (title.textContent || '').trim();
      if (!src || !text) {
        console.warn('Title missing data-image or text:', title);
        return;
      }

      // 1) split into individual words (each word = <p.word>) - EXACTLY like your test
      const words = text.split(/\s+/);
      title.textContent = '';
      words.forEach(w => {
        const p = document.createElement('p');
        p.className = 'word';
        p.textContent = w;
        title.appendChild(p);
      });

      // 2) create one reusable preview per title - EXACTLY like your test
      const preview = document.createElement('div');
      preview.className = 'preview';

      const img = new Image();
      img.className = 'preview__img';
      img.src = src;
      img.alt = text;

      // DEBUG: verify load/err - EXACTLY like your test
      img.addEventListener('load', () => {
        console.log('✓ Image loaded successfully:', img.src, img.naturalWidth, 'x', img.naturalHeight);
        img.style.visibility = 'visible';
        img.style.opacity = '1';
      });
      img.addEventListener('error', () => {
        console.error('✗ Failed to load image:', img.src);
        img.style.background = 'repeating-linear-gradient(45deg,#c00 0 6px,#600 6px 12px)';
        img.style.visibility = 'visible';
      });

      preview.appendChild(img);

      // 3) tween helpers / state - EXACTLY like your test
      const OPEN_W = 180; //px
      gsap.set(preview, { width: 0, opacity: 0 });

      let hovering = false;
      let fixedIndex = -1;

      function measureGaps() {
        // EXACTLY like your test
        const els = [...title.querySelectorAll('.word')];
        const list = [];

        if (els.length === 1) {
          const rect = els[0].getBoundingClientRect();
          list.push({ index: 1, mid: rect.right + 20 });
          return list;
        }

        for (let i = 0; i < els.length - 1; i++) {
          const a = els[i].getBoundingClientRect();
          const b = els[i + 1].getBoundingClientRect();
          list.push({ index: i + 1, mid: (a.right + b.left) / 2 });
        }
        return list;
      }

      function getFixedPosition() {
        // EXACTLY like your test
        const wordCount = title.querySelectorAll('.word').length;
        if (wordCount === 1) return 1;
        if (wordCount === 2) return 1;

        const variations = [
          Math.floor(wordCount / 2),
          1,
          wordCount - 1,
          Math.floor(wordCount / 3),
          Math.floor((wordCount * 2) / 3)
        ];

        return variations[idx % variations.length];
      }

      function insertAt(index) {
        // EXACTLY like your test
        const children = [...title.children].filter(n => n !== preview);
        const ref = children[index] || null;
        title.insertBefore(preview, ref);
      }

      function openPreview() {
        preview.style.display = 'block';

        // Simple, controlled reveal - just expand width smoothly
        gsap.to(preview, {
          width: OPEN_W,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out'
        });
      }

      function closePreview() {
        // Simple, controlled close
        gsap.to(preview, {
          width: 0,
          opacity: 0,
          duration: 0.28,
          ease: 'power2.in',
          onComplete: () => {
            preview.style.display = 'none';
          }
        });
      }

      function enter(e) {
        const gaps = measureGaps();
        if (!gaps.length) return;

        hovering = true;

        if (fixedIndex === -1) {
          fixedIndex = getFixedPosition();
        }

        fixedIndex = Math.min(fixedIndex, gaps.length);
        insertAt(fixedIndex);
        openPreview();
      }

      function leave() {
        hovering = false;
        closePreview();
      }

      const workItem = title.closest('.work-item');
      workItem.addEventListener('mouseenter', enter);
      workItem.addEventListener('mouseleave', leave);

      // accessibility - EXACTLY like your test
      workItem.setAttribute('tabindex', '0');
      workItem.addEventListener('focus', (e) => {
        const gaps = measureGaps();
        if (!gaps.length) return;
        hovering = true;

        if (fixedIndex === -1) {
          fixedIndex = getFixedPosition();
        }

        fixedIndex = Math.min(fixedIndex, gaps.length);
        insertAt(fixedIndex);
        openPreview();
      });
      workItem.addEventListener('blur', leave);
    });

    // Add this to your work page section in main.js
    // Update the setupAccordions function to handle Focus items
    function setupAccordions() {
      const workItems = document.querySelectorAll('.work-item');
      const focusItems = document.querySelectorAll('.focus-project-item');

      // Handle All Work View accordions
      workItems.forEach(item => {
        const titleContainer = item.querySelector('.work-title-container');

        titleContainer.addEventListener('click', (e) => {
          e.stopPropagation();

          const isActive = item.classList.contains('active');

          // Close all other accordions
          workItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });

          // Toggle current accordion
          item.classList.toggle('active');
        });
      });

      // Handle Focus View accordions
      focusItems.forEach(item => {
        item.addEventListener('click', () => {
          const isActive = item.classList.contains('active');

          // Close all other accordions in same section
          const section = item.closest('.focus-section');
          const sectionItems = section.querySelectorAll('.focus-project-item');

          sectionItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });

          // Toggle current accordion
          item.classList.toggle('active');
        });
      });
    }

    // Call this function in your work page initialization
    setTimeout(() => {
      setupAccordions();
    }, 300);

  }

  if (isCaseStudyPage) {
    // ===== PROJECT PAGE SCROLLSPY FUNCTIONALITY =====
    function initScrollspy() {
      if (!document.querySelector('.case-study-scrollspy-section')) { // Updated selector
        console.log('No scrollspy section found');
        return;
      }

      console.log('Initializing scrollspy...');

      const sections = document.querySelectorAll('.case-study-content-section'); // Updated selector
      const mediaItems = document.querySelectorAll('.media-item');
      const scrollbarThumb = document.querySelector('.scrollbar-thumb');

      console.log('Scrollspy elements:', { sections: sections.length, mediaItems: mediaItems.length, scrollbarThumb: !!scrollbarThumb });

      // ScrollTrigger for each section
      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => activateMedia(section.dataset.section),
          onEnterBack: () => activateMedia(section.dataset.section),
        });
      });

      function activateMedia(sectionName) {
        console.log('Activating media for section:', sectionName);

        // Remove active class from all media items
        mediaItems.forEach(item => item.classList.remove('active'));

        // Add active class to corresponding media item
        const activeMedia = document.querySelector(`[data-media="${sectionName}"]`);
        if (activeMedia) {
          activeMedia.classList.add('active');
        }

        // Update scrollbar thumb position
        const sectionIndex = Array.from(sections).findIndex(s => s.dataset.section === sectionName);
        const thumbPosition = (sectionIndex / (sections.length - 1)) * 75; // 75% max position
        if (scrollbarThumb) {
          scrollbarThumb.style.top = `${thumbPosition}%`;
        }
      }

      // Initialize with first section
      if (sections.length > 0) {
        activateMedia(sections[0].dataset.section);
      }
    }

    // Initialize case study page functionality
    if (isCaseStudyPage) {
      console.log('Case study page detected - initializing...');
      setTimeout(() => {
        initScrollspy();
      }, 100);
    }
  }
}
);