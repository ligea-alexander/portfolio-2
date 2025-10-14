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
  const isCaseStudyPage = document.querySelector('.case-study-main');

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
          duration: 1.3, // slightly slower for smoother effect
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

    // FIX: Only show cursor immediately for pages WITHOUT a loader
    if (!loader) {
      cursor.style.display = 'block';
    }
    // For pages WITH a loader, the cursor will be shown after the loader completes
  } else {
    console.log('Cursor elements NOT found!');
  }

  // ====== NAVBAR FUNCTIONALITY ====== 
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

  // Mobile Navigation Functionality
  // Global Mobile Navigation - Works on ALL pages
  function initGlobalMobileNavigation() {
    const container = document.getElementById('mobile-nav-container');
    const trigger = document.getElementById('mobile-nav-trigger-btn');
    const dropdown = document.getElementById('mobile-nav-dropdown');
    if (!container || !trigger || !dropdown) return;

    const IS_CASE = document.body.classList.contains('case-study-page');
    const TOP_THRESHOLD = 50;
    const isOpen = () => dropdown.classList.contains('open');

    console.log('🎯 Mobile nav setup:', IS_CASE ? 'CASE STUDY' : 'GLOBAL PAGE');

    // --- open/close
    function openDropdown() {
      dropdown.classList.add('open');
      // force visible while open: remove "scrolled" so CSS shows full opacity
      container.classList.remove('scrolled');
      console.log('📱 Dropdown opened');
    }

    function closeDropdown() {
      dropdown.classList.remove('open');
      // after closing, re-apply scroll state
      handleScroll();
      console.log('📱 Dropdown closed');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen() ? closeDropdown() : openDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target) && isOpen()) closeDropdown();
    });

    dropdown.querySelectorAll('.mobile-nav-link')
      .forEach(link => link.addEventListener('click', closeDropdown));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closeDropdown();
    });

    // --- scroll (rAF-throttled)
    let ticking = false;
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        console.log('📊 Scroll:', y, IS_CASE ? '(CASE)' : '(GLOBAL)');

        if (IS_CASE) {
          // case-study: hide when scrolled, show at top; menu close on scroll
          if (isOpen()) closeDropdown();
          if (y > TOP_THRESHOLD) {
            container.classList.add('scrolled');   // -> hidden per your CSS
            console.log('✅ Case study: HIDDEN');
          } else {
            container.classList.remove('scrolled'); // -> visible
            console.log('✅ Case study: VISIBLE');
          }
        } else {
          // global: never hide; just mute when scrolled
          if (!isOpen()) {
            // only apply scroll opacity when menu is closed
            if (y > TOP_THRESHOLD) {
              container.classList.add('scrolled');
              console.log('✅ Global: MUTED');
            } else {
              container.classList.remove('scrolled');
              console.log('✅ Global: FULL OPACITY');
            }
          }
        }

        ticking = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // init
    handleScroll();
    console.log('✅ Mobile nav initialization complete');
  }


  // Call the function
  initGlobalMobileNavigation();

  // Home page-specific functionality
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
      console.log('🔢 Updating filter counts...');

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
        const formattedCount = count.toString().padStart(2, '0');
        button.setAttribute('data-count', formattedCount);

        console.log(`📊 ${filter}: ${formattedCount} items`);
      });

      console.log('✅ Filter counts updated');
    }

    // Call it immediately when the page loads AND make sure it runs before mobile init
    setTimeout(() => {
      updateFilterCounts();

      // Then initialize mobile filter
      setTimeout(() => {
        initWorkFilterMobile();
      }, 50);
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

    // ===== MOBILE WORK PAGE FILTER FUNCTION =====
    function initWorkFilterMobile() {
      const filterContainer = document.querySelector('.filter-container');
      const filterButtons = document.querySelectorAll('.filter-btn');

      if (!filterContainer || filterButtons.length === 0) return;

      // Check if we're on mobile
      function isMobile() {
        return window.innerWidth <= 925;
      }

      // ENHANCED: Create dropdown menu structure with proper count handling
      function createDropdownMenu() {
        // Only create if it doesn't exist
        if (filterContainer.querySelector('.filter-dropdown')) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'filter-dropdown';

        filterButtons.forEach(button => {
          const filter = button.getAttribute('data-filter');

          // FIXED: Get count from CSS ::after content or calculate it
          let count = button.getAttribute('data-count') || '00';

          // If count is still not available, calculate it manually
          if (!count || count === '00') {
            if (filter === 'featured') {
              count = document.querySelectorAll('.featured-view .project-card-wrapper').length;
            } else if (filter === 'all') {
              count = document.querySelectorAll('.all-work-view .work-item').length;
            } else if (filter === 'focus') {
              count = document.querySelectorAll('.focus-view .focus-project-item').length;
            }
            // Format count to 2 digits
            count = count.toString().padStart(2, '0');
            // Update the button's data-count attribute
            button.setAttribute('data-count', count);
          }

          const text = button.textContent.replace(/\d+/g, '').trim(); // Remove existing numbers

          const dropdownItem = document.createElement('div');
          dropdownItem.className = 'dropdown-item';
          dropdownItem.setAttribute('data-filter', filter);

          dropdownItem.innerHTML = `
        <span class="filter-text">${text}</span>
        <span class="count">${count}</span>
      `;

          dropdown.appendChild(dropdownItem);
        });

        filterContainer.appendChild(dropdown);
      }


      // Update active filter display
      // ENHANCED: Update active filter display with proper count
      function updateActiveDisplay() {
        const activeButton = document.querySelector('.filter-btn.active');
        if (!activeButton) return;

        const activeText = activeButton.textContent.replace(/\d+/g, '').trim();
        let activeCount = activeButton.getAttribute('data-count') || '00';

        // ADDED: If count is still missing, recalculate it
        if (!activeCount || activeCount === '00') {
          const filter = activeButton.getAttribute('data-filter');
          if (filter === 'featured') {
            activeCount = document.querySelectorAll('.featured-view .project-card-wrapper').length;
          } else if (filter === 'all') {
            activeCount = document.querySelectorAll('.all-work-view .work-item').length;
          } else if (filter === 'focus') {
            activeCount = document.querySelectorAll('.focus-view .focus-project-item').length;
          }
          activeCount = activeCount.toString().padStart(2, '0');
          activeButton.setAttribute('data-count', activeCount);
        }

        // Update active button display for mobile
        if (isMobile()) {
          activeButton.innerHTML = `
        <span class="filter-text" data-count="${activeCount}">${activeText}</span>`;
        }

        // Update dropdown items
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
          item.classList.remove('current');
          if (item.getAttribute('data-filter') === activeButton.getAttribute('data-filter')) {
            item.classList.add('current');
          }
        });
      }

      // Toggle dropdown
      function toggleDropdown() {
        if (!isMobile()) return;

        const isOpen = filterContainer.classList.contains('open');

        if (isOpen) {
          filterContainer.classList.remove('open');
        } else {
          filterContainer.classList.add('open');
        }
      }

      // Close dropdown
      function closeDropdown() {
        filterContainer.classList.remove('open');
      }

      // Handle filter selection
      function selectFilter(filterValue) {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to selected button
        const newActiveButton = document.querySelector(`[data-filter="${filterValue}"]`);
        if (newActiveButton) {
          newActiveButton.classList.add('active');
        }

        // Update the display
        updateActiveDisplay();

        // Close dropdown
        closeDropdown();

        // Trigger the existing filter functionality
        triggerFilterChange(filterValue);
      }

      // Trigger existing filter functionality
      function triggerFilterChange(filter) {
        const featuredView = document.querySelector('.featured-view');
        const allWorkView = document.querySelector('.all-work-view');
        const focusView = document.querySelector('.focus-view');

        // Hide all views first
        if (featuredView) featuredView.classList.add('hidden');
        if (allWorkView) allWorkView.classList.add('hidden');
        if (focusView) focusView.classList.add('hidden');

        // Show the selected view
        if (filter === 'featured' && featuredView) {
          featuredView.classList.remove('hidden');
          setTimeout(() => {
            setupViewSwitchReveals('.featured-view .reveal-text');
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
      }

      // Setup event listeners
      function setupEventListeners() {
        // Click on active filter button to toggle dropdown (mobile only)
        filterButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            if (isMobile() && button.classList.contains('active')) {
              e.preventDefault();
              toggleDropdown();
            }
          });
        });

        // Click on dropdown items
        filterContainer.addEventListener('click', (e) => {
          const dropdownItem = e.target.closest('.dropdown-item');
          if (dropdownItem) {
            e.preventDefault();
            const filterValue = dropdownItem.getAttribute('data-filter');
            selectFilter(filterValue);
          }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!filterContainer.contains(e.target)) {
            closeDropdown();
          }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeDropdown();
          }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
          if (!isMobile()) {
            closeDropdown();
            filterContainer.classList.remove('open');
          }
          updateActiveDisplay();
        });
      }


      // ENHANCED: Initialize function with count updates
      function init() {
        // First, ensure all filter buttons have their counts updated
        updateFilterCounts();

        if (isMobile()) {
          createDropdownMenu();
        }
        updateActiveDisplay();
        setupEventListeners();
      }

      // Run initialization
      init();

      // ENHANCED: Re-run on window resize with count updates
      window.addEventListener('resize', () => {
        setTimeout(() => {
          if (isMobile() && !filterContainer.querySelector('.filter-dropdown')) {
            updateFilterCounts(); // Ensure counts are updated
            createDropdownMenu();
            updateActiveDisplay();
          }
        }, 100);
      });
    }

    initWorkFilterMobile();

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
      // CHECK IF MOBILE - if mobile, skip the hover effect entirely
      function isMobile() {
        return window.innerWidth <= 925;
      }

      // Skip hover effect setup on mobile
      if (isMobile()) {
        console.log('Mobile detected - skipping hover preview for:', text);
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
        const children = [...title.children].filter(n => n !== preview);
        const ref = children[index] || null;
        title.insertBefore(preview, ref);
      }

      function openPreview() {
        preview.style.display = 'block';
        gsap.to(preview, {
          width: OPEN_W,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out'
        });
      }

      function closePreview() {
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

      // accessibility - focus/blur on the entire work item
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

    // On window resize, if switching to mobile, disable hover effects
    window.addEventListener('resize', () => {
      // Debounce the resize
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(() => {
        // If switching from desktop to mobile, disable hover effects
        if (window.innerWidth <= 925) {
          const previews = document.querySelectorAll('.preview');
          previews.forEach(preview => {
            preview.style.display = 'none';
          });
        }
        // If switching from mobile to desktop, the page will need a refresh
        // to re-initialize hover effects properly
      }, 250);
    });

    // ===== ACCORDION FUNCTIONALITY FOR ALL WORK + FOCUS VIEWS =====
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

  // ===== CASE STUDY PAGE SCROLLSPY FUNCTIONALITY =====  

  // Replace the entire case study section in main.js with this:

  if (isCaseStudyPage) {
    function initScrollspy() {
      const caseMain = document.querySelector('.case-study-main-section');
      const caseBody = document.querySelector('.case-body');
      const sections = Array.from(document.querySelectorAll('.step[data-label]'));
      const railThumb = document.querySelector('.rail-thumb');   // desktop
      const railNav = document.querySelector('.rail-nav');     // desktop

      // MOBILE UI
      const mobileNavBar = document.querySelector('.mobile-nav-bar');
      const mobileNavTrigger = document.getElementById('mobile-nav-trigger');
      const mobileNavMenu = document.getElementById('mobile-nav-menu');
      const currentSectionLabel = document.querySelector('.current-section-label');
      const menuItems = Array.from(document.querySelectorAll('.nav-menu-item'));
      const progressContainer = document.querySelector('.progress-container');

      if (!caseMain || !caseBody || sections.length === 0) {
        console.log('Scrollspy: required elements missing');
        return;
      }

      const isMobile = () => window.innerWidth <= 925;

      // ---------- Build progress dashes from sections (mobile) ----------
      function buildProgressDashes() {
        if (!progressContainer) return;
        progressContainer.innerHTML = ''; // rebuild to match sections count
        sections.forEach((sec, i) => {
          const dash = document.createElement('div');
          dash.className = 'progress-dash';
          dash.dataset.index = String(i);
          dash.addEventListener('click', (e) => {
            e.stopPropagation();
            scrollToSection(i);
            // close menu if open
            if (mobileNavMenu?.classList.contains('open')) {
              mobileNavMenu.classList.remove('open');
              mobileNavTrigger?.classList.remove('open');
            }
          });
          progressContainer.appendChild(dash);
        });
      }

      // ---------- Helpers to read scroll + sizes ----------
      const TOP_OFFSET_MOBILE = 80;   // your fixed mobile bar height
      const TARGET_BIAS = 0.45; // center-ish target

      function getScrollY() {
        return isMobile() ? (window.scrollY || document.documentElement.scrollTop || 0)
          : caseBody.scrollTop;
      }
      function getViewportHeight() {
        return isMobile() ? window.innerHeight : caseBody.clientHeight;
      }

      function scrollToSection(index) {
        const target = sections[index];
        if (!target) return;

        if (isMobile()) {
          const rect = target.getBoundingClientRect();
          const y = rect.top + (window.scrollY || 0) - TOP_OFFSET_MOBILE;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          const rect = target.getBoundingClientRect();
          const containerRect = caseBody.getBoundingClientRect();
          const current = caseBody.scrollTop;
          const delta = rect.top - containerRect.top - 100; // desktop bias
          caseBody.scrollTo({ top: Math.max(0, current + delta), behavior: 'smooth' });
        }
      }

      // ---------- Active section detection ----------
      function getActiveIndex() {
        // Special handling for desktop scroll detection
        const center = getViewportHeight() * TARGET_BIAS;
        let best = 0, bestDist = Infinity;

        sections.forEach((sec, i) => {
          const r = sec.getBoundingClientRect();
          // Use getBoundingClientRect relative to scroller viewport:
          const top = isMobile() ? r.top : (r.top - caseBody.getBoundingClientRect().top);
          const bottom = top + r.height;
          const mid = top + r.height / 2;
          const dist = Math.abs(mid - center);
          const visible = bottom > 0 && top < getViewportHeight();

          if (visible && dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });

        // ADDED: Special case for last section - if we're near the bottom, force last section
        if (!isMobile()) {
          const scrollPercent = caseBody.scrollTop / (caseBody.scrollHeight - caseBody.clientHeight);
          if (scrollPercent > 0.85) { // If scrolled more than 85% down
            return sections.length - 1; // Force last section
          }
        } else {
          // Mobile version
          const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
          if (scrollPercent > 0.85) {
            return sections.length - 1;
          }
        }

        return best;
      }

      // ---------- UI updates ----------
      function updateMobileUI(index) {
        if (!isMobile()) return;

        // label
        if (currentSectionLabel) {
          currentSectionLabel.textContent = sections[index].dataset.label || sections[index].id || `Section ${index + 1}`;
        }
        // menu active dot/row
        menuItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('data-target') === `#${sections[index].id}`);
        });
        // dashes
        const dashes = progressContainer ? Array.from(progressContainer.querySelectorAll('.progress-dash')) : [];
        dashes.forEach((dash, i) => dash.classList.toggle('active', i <= index));
      }

      function updateDesktopRail() {
        if (isMobile() || !railThumb) return;
        const scrollHeight = caseBody.scrollHeight - caseBody.clientHeight;
        const progress = scrollHeight > 0 ? (caseBody.scrollTop / scrollHeight) : 0;
        const thumbHeight = 20; // %
        const maxTravel = 100 - thumbHeight;
        railThumb.style.top = `${Math.min(progress * maxTravel, maxTravel)}%`;
      }

      // ---------- Desktop rail nav setup ----------
      function buildDesktopRailNav() {
        if (isMobile() || !railNav) return;

        railNav.innerHTML = '';
        sections.forEach((section, i) => {
          const label = section.getAttribute('data-label');
          const id = section.getAttribute('id');
          if (label && id) {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = label;
            button.setAttribute('data-target', `#${id}`);
            button.addEventListener('click', () => scrollToSection(i));
            li.appendChild(button);
            railNav.appendChild(li);
          }
        });
      }

      function updateDesktopActiveNav(index) {
        if (isMobile() || !railNav) return;

        const buttons = railNav.querySelectorAll('button');
        buttons.forEach(button => button.classList.remove('active'));

        const activeButton = buttons[index];
        if (activeButton) {
          activeButton.classList.add('active');
        }

        // Update media gallery if exists
        updateMediaGallery(sections[index].id);
      }

      function updateMediaGallery(sectionId) {
        if (isMobile()) return;

        const mediaItems = document.querySelectorAll('.media-item');
        mediaItems.forEach(item => item.classList.remove('active'));
        const activeMedia = document.querySelector(`[data-media="${sectionId}"]`);
        if (activeMedia) {
          activeMedia.classList.add('active');
        }
      }

      // ---------- Mobile nav visibility tied to page scroll ----------
      function updateMobileNavVisibility() {
        if (!isMobile() || !mobileNavBar) return;
        const y = getScrollY();

        // show nav while in the case body band; hide otherwise
        const bodyRect = caseBody.getBoundingClientRect();
        const docYTop = (window.scrollY || 0) + bodyRect.top;
        const docYBot = docYTop + bodyRect.height;

        const within = y >= (docYTop - 160) && y <= (docYBot - 120); // small buffer
        mobileNavBar.style.opacity = within ? '1' : '0';
        mobileNavBar.style.display = within ? 'block' : 'none';

        console.log('📱 Nav visibility:', { y, docYTop, docYBot, within });
      }

      // ---------- Wire menu clicks (mobile) ----------
      if (mobileNavTrigger && mobileNavMenu) {
        mobileNavTrigger.addEventListener('click', (e) => {
          e.preventDefault();
          mobileNavMenu.classList.toggle('open');
          mobileNavTrigger.classList.toggle('open');
        });
        // menu item clicks -> jump
        menuItems.forEach(item => {
          item.addEventListener('click', (e) => {
            e.preventDefault();
            const id = item.getAttribute('data-target');
            const idx = sections.findIndex(s => `#${s.id}` === id);
            if (idx >= 0) scrollToSection(idx);
            mobileNavMenu.classList.remove('open');
            mobileNavTrigger.classList.remove('open');
          });
        });
      }

      // ---------- Desktop rail nav interaction ----------
      function setupDesktopRailVisibility() {
        if (isMobile() || !railNav) return;

        let scrollTimeout;
        function showRailNav() {
          railNav.classList.add('show-nav');
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            railNav.classList.remove('show-nav');
          }, 1000);
        }

        return showRailNav;
      }

      // ---------- Scroll listeners ----------
      // rAF-throttle to avoid jank
      let ticking = false;
      const showRailNav = setupDesktopRailVisibility();

      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const idx = getActiveIndex();
          updateMobileUI(idx);
          updateDesktopRail();
          updateDesktopActiveNav(idx);
          updateMobileNavVisibility();

          // Show desktop rail nav on scroll
          if (!isMobile() && showRailNav) {
            showRailNav();
          }

          ticking = false;
        });
      }

      // Use the correct scroller
      if (isMobile()) {
        window.addEventListener('scroll', onScroll, { passive: true });
      } else {
        caseBody.addEventListener('scroll', onScroll, { passive: true });
      }

      // ---------- Init ----------
      buildProgressDashes();
      buildDesktopRailNav();

      // ensure each section has an id for menu targets
      sections.forEach((s, i) => { if (!s.id) s.id = `section-${i + 1}`; });

      // Hide mobile nav initially
      if (mobileNavBar) {
        mobileNavBar.style.display = 'none';
        mobileNavBar.style.opacity = '0';
      }

      // first paint
      onScroll();

      // Re-init on resize breakpoint flip
      let rTO;
      window.addEventListener('resize', () => {
        clearTimeout(rTO);
        rTO = setTimeout(() => {
          // detach old listeners and re-init (simple path)
          if (isMobile()) {
            caseBody.removeEventListener('scroll', onScroll);
            window.addEventListener('scroll', onScroll, { passive: true });
          } else {
            window.removeEventListener('scroll', onScroll);
            caseBody.addEventListener('scroll', onScroll, { passive: true });
          }
          buildProgressDashes();
          buildDesktopRailNav();
          onScroll();
        }, 150);
      });

      console.log('✅ Scrollspy initialized with', sections.length, 'sections');
    }

    initScrollspy();

    // ===== SIMPLE MOBILE SECTION IMAGES HANDLING =====
    function initMobileSectionImages() {
      console.log('🖼️ Initializing mobile section images...');

      const mobileSectionImages = document.querySelectorAll('.mobile-section-image');

      if (mobileSectionImages.length === 0) {
        console.log('No mobile section images found');
        return;
      }

      // Simple visibility toggle based on screen size
      function toggleMobileImages() {
        const isMobile = window.innerWidth <= 925;

        mobileSectionImages.forEach((image, index) => {
          if (isMobile) {
            image.style.display = 'block';
            console.log(`📱 Showing mobile image ${index + 1}`);
          } else {
            image.style.display = 'none';
            console.log(`🖥️ Hiding mobile image ${index + 1}`);
          }
        });
      }

      // Initial setup
      toggleMobileImages();

      // Handle window resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          toggleMobileImages();
          // Refresh ScrollTrigger after resize
          ScrollTrigger.refresh();
        }, 150);
      });

      console.log(`✅ Mobile section images initialized: ${mobileSectionImages.length} images`);
    }

    // ===== CALL THE MOBILE IMAGES FUNCTION =====
    initMobileSectionImages();


    // Enhanced Interactive Gallery Viewer
    function initInteractiveGallery() {
      const overlay = document.getElementById('igOverlay');
      if (!overlay) return;

      const tiles = Array.from(document.querySelectorAll('.gallery-grid .gallery-image.clickable'));
      if (!tiles.length) return;

      const imgEl = overlay.querySelector('#igImage');
      const capEl = overlay.querySelector('#igCaption');
      const btnX = overlay.querySelector('.ig-close');
      const btnPrev = overlay.querySelector('.ig-prev');
      const btnNext = overlay.querySelector('.ig-next');
      const backdrop = overlay.querySelector('.ig-backdrop');
      const pagination = overlay.querySelector('#igPagination');

      const items = tiles.map(tile => {
        const img = tile.querySelector('img');
        return {
          src: img?.currentSrc || img?.src || '',
          alt: img?.alt || '',
          cap: tile.dataset.caption || img?.alt || ''
        };
      });

      let index = 0;
      let lastFocus = null;

      // Create pagination dots
      function createPagination() {
        pagination.innerHTML = '';
        items.forEach((_, i) => {
          const dot = document.createElement('div');
          dot.className = 'ig-dot';
          if (i === index) dot.classList.add('active');
          dot.addEventListener('click', () => openAt(i));
          pagination.appendChild(dot);
        });
      }

      // Update pagination dots
      function updatePagination() {
        const dots = pagination.querySelectorAll('.ig-dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }

      function openAt(i) {
        index = (i + items.length) % items.length;
        const it = items[index];

        imgEl.src = it.src;
        imgEl.alt = it.alt;
        capEl.textContent = it.cap;

        updatePagination();

        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('ig-lock');
        lastFocus = document.activeElement;
        btnX.focus();
      }

      function close() {
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('ig-lock');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }

      function next() {
        openAt(index + 1);
      }

      function prev() {
        openAt(index - 1);
      }

      // Initialize pagination
      createPagination();

      // Wire tiles
      tiles.forEach((tile, i) => {
        tile.addEventListener('click', (e) => {
          e.preventDefault();
          openAt(i);
        });

        tile.tabIndex = 0;
        tile.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openAt(i);
          }
        });
      });

      // Wire controls
      btnX.addEventListener('click', close);
      btnNext.addEventListener('click', next);
      btnPrev.addEventListener('click', prev);
      backdrop.addEventListener('click', close);

      // Keyboard controls
      document.addEventListener('keydown', e => {
        if (overlay.getAttribute('aria-hidden') === 'true') return;

        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        }
      });

      // Enhanced swipe support
      let startX = null;
      let startY = null;

      overlay.addEventListener('touchstart', e => {
        const touch = e.touches?.[0];
        if (touch) {
          startX = touch.clientX;
          startY = touch.clientY;
        }
      }, { passive: true });

      overlay.addEventListener('touchend', e => {
        if (startX == null || startY == null) return;

        const touch = e.changedTouches?.[0];
        if (!touch) return;

        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
          if (dx < 0) {
            next();
          } else {
            prev();
          }
        }

        startX = null;
        startY = null;
      }, { passive: true });

      console.log('✅ Enhanced interactive gallery initialized with', items.length, 'images');
    }

    // Initialize when page loads
    if (isCaseStudyPage) {
      setTimeout(() => {
        initInteractiveGallery();
      }, 100);
    }
  }
});