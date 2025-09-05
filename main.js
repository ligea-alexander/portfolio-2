document.addEventListener("DOMContentLoaded", (event) => {

  // Loader and main content handling
  const loader = document.getElementById("loader");
  const mainContent = document.getElementById("main-content");
  const footer = document.querySelector(".footer");

  // Hide cursor initially
  const cursor = document.getElementById('custom-cursor');

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
          // Show cursor when content appears
          if (cursor) {
            cursor.style.display = 'block';
          }
        } else {
          requestAnimationFrame(fade);
        }
      };
      fade();
    }, 2500);
  }
  // Custom Cursor - rest of your cursor code stays the same
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


  // Check which page we're on
  const isHomePage = document.querySelector('.featured-work');
  const isWorkPage = document.querySelector('.work-main');
  // Register GSAP plugins
  gsap.registerPlugin(SplitText);

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);
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

      setTimeout(() => {
        const cloud = document.getElementById('tools-cloud');
        if (cloud && cloud.children.length === 0) {
          renderWordCloud(allTools);
        }
      }, 1000);
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

          // Show the selected view
          if (filter === 'featured' && featuredView) {
            featuredView.classList.remove('hidden');
          } else if (filter === 'all' && allWorkView) {
            allWorkView.classList.remove('hidden');
          } else if (filter === 'focus' && focusView) {
            focusView.classList.remove('hidden');
          }
        });
      });
    }
    // Replace the current workItems code (lines 328-373) with this:

    // Work page image reveal - EXACT adaptation of your working test
    if (isWorkPage) {
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

        // events - EXACTLY like your test
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
    }
  }

});