// // Focus view animations - SCROLL TRIGGERED REVEAL FOR ALL TEXT
// function setupFocusScrollReveals() {
//   const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

//   // USE THE SAME splitElement function as main setupScrollReveals - NO FALLBACK
//   function splitElement(el) {
//     const st = new SplitText(el, {
//       type: 'lines,words',
//       linesClass: 'split-line',
//       wordsClass: 'split-word'
//     });
//     return { lines: st.lines, words: st.words, splitter: st };
//   }

//   // Wait for fonts just like main function
//   document.fonts.ready.then(() => {
//     console.log('Setting up focus view scroll reveals...');

//     // Get ALL reveal-text elements in focus view
//     const revealElements = document.querySelectorAll('.focus-view .reveal-text');

//     revealElements.forEach((el) => {
//       const { lines, words } = splitElement(el);

//       if (prefersReduced) {
//         gsap.set(el, { opacity: 1 });
//         return;
//       }

//       gsap.set(lines, { overflow: 'hidden' });
//       gsap.set(words, { yPercent: 115, opacity: 0, skewY: 8, rotate: 0.001 });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: el,
//           start: 'top 85%', // SAME as main function
//           once: true
//         }
//       });

//       tl.to(words, {
//         yPercent: 0,
//         opacity: 1,
//         skewY: 0,
//         ease: 'power3.out',
//         duration: 1.65,
//         stagger: {
//           each: el.tagName.match(/^H\d$/) ? 0.08 : 0.05,
//           from: el.tagName.match(/^H\d$/) ? 'center' : 0
//         }
//       });
//     });
//   }).catch(() => {
//     console.log('Font loading failed for focus view, proceeding anyway...');
//     setTimeout(() => setupFocusScrollReveals(), 500);
//   });
// }