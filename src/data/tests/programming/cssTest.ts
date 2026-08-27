import { buildExpandedTest } from '../testBuilder'

const webCat = {
  id: 'cat-web-development',
  name: 'Web Development',
  slug: 'web-development',
  description: 'Frontend and backend web technologies: HTML, CSS, JavaScript, React, and Node.js.',
  color: '#0284c7',
  icon: 'Globe',
}

export const cssDeepTest = buildExpandedTest(
  'css-deep',
  'css-test',
  'CSS Deep-Dive Test',
  'Selectors, specificity, Flexbox, Grid, custom properties, animations, and responsive design patterns.',
  'Assess modern CSS mastery: cascade and specificity rules, Flexbox alignment, CSS Grid template areas, custom properties (variables), keyframe animations, container queries, and CSS logical properties for responsive design.',
  webCat,
  'css',
  'intermediate',
  30,
  [
    {
      topic: 'Cascade & Specificity',
      prompt: 'Given these CSS rules targeting the same `<p>` element, which wins? `p { color: red }`, `#main p { color: blue }`, `.content p { color: green }`',
      options: [
        'p { color: red } – first rule',
        '.content p { color: green } – last rule',
        '#main p { color: blue } – highest specificity (ID selector)',
        'All three apply simultaneously',
      ],
      correct: 2,
      explanation:
        'CSS specificity hierarchy: inline styles (1000) > ID selectors (100) > class/attribute/pseudo-class selectors (10) > element selectors (1). An ID selector (`#main`) has specificity 101 (ID + element). A class selector (`.content p`) has specificity 11. Element-only (`p`) has specificity 1. The ID rule wins.',
      hint: 'ID selectors have the highest specificity among non-inline rules.',
      difficulty: 'intermediate',
      tags: ['Specificity', 'Cascade', 'CSS'],
    },
    {
      topic: 'CSS – !important',
      prompt: 'What is the recommended practice regarding `!important` in CSS, and when is it legitimate?',
      options: [
        'Always use !important for all critical styles',
        'Avoid !important in regular stylesheets; legitimate uses include utility/helper classes (where precedence over any context is intentional) and overriding third-party styles you cannot modify',
        '!important is deprecated and removed from CSS3',
        '!important only works in media queries',
      ],
      correct: 1,
      explanation:
        '`!important` breaks the natural cascade and makes debugging extremely difficult. Overuse leads to "specificity wars." Legitimate uses: accessibility overrides (e.g. forced-color mode), utility-class systems where intentional override is the design, or overriding third-party CSS you cannot source-edit.',
      hint: 'If you need !important to fix a bug, the real problem is specificity architecture.',
      difficulty: 'intermediate',
      tags: ['!important', 'Specificity', 'CSS Best Practices'],
    },
    {
      topic: 'Box Model – box-sizing',
      prompt: 'How does `box-sizing: border-box` change the CSS box model behaviour?',
      options: [
        'It makes margin collapse work differently',
        'padding and border are included within the declared width/height, so an element with width: 200px, padding: 20px will still occupy exactly 200px total width',
        'It removes the default browser margin and padding',
        'It makes the element display as a block regardless of its display property',
      ],
      correct: 1,
      explanation:
        'With the default `content-box`, padding and border are added outside the declared width. With `border-box`, they are subtracted from the content area, meaning the element\'s total size equals exactly the declared width/height. This is why `* { box-sizing: border-box }` is a modern CSS reset staple.',
      hint: 'border-box: total = declared width; content-box: total = declared width + padding + border.',
      difficulty: 'beginner',
      tags: ['Box Model', 'box-sizing', 'Layout'],
    },
    {
      topic: 'Flexbox – main axis alignment',
      prompt: 'In a flex container, which property controls alignment of items along the main axis?',
      options: [
        'align-items',
        'justify-content',
        'align-self',
        'flex-direction',
      ],
      correct: 1,
      explanation:
        '`justify-content` distributes space and aligns items along the main axis (horizontal by default). Values include `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly`. `align-items` controls alignment on the cross axis.',
      hint: '"Justify" = main axis; "Align" = cross axis.',
      difficulty: 'beginner',
      tags: ['Flexbox', 'justify-content', 'Layout'],
    },
    {
      topic: 'Flexbox – flex-grow flex-shrink',
      prompt: 'An item has `flex: 1`. What does this shorthand set?',
      options: [
        'flex-grow: 1, flex-shrink: 0, flex-basis: auto',
        'flex-grow: 1, flex-shrink: 1, flex-basis: 0%',
        'flex-grow: 0, flex-shrink: 1, flex-basis: 1px',
        'flex: 1 is not valid CSS',
      ],
      correct: 1,
      explanation:
        'The `flex` shorthand sets `flex-grow`, `flex-shrink`, and `flex-basis`. `flex: 1` expands to `flex: 1 1 0%` – the item can grow and shrink, and starts with zero base size, distributing all available space proportionally by grow factors.',
      hint: 'The three values are: grow, shrink, basis.',
      difficulty: 'intermediate',
      tags: ['Flexbox', 'flex-grow', 'flex shorthand'],
    },
    {
      topic: 'CSS Grid – template areas',
      prompt: 'What does the following CSS define?',
      codeSnippet: `.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}`,
      codeLanguage: 'css',
      options: [
        'Three rows with arbitrary sizing and no named areas',
        'A named template where elements positioned with grid-area: header occupy both columns in the first row; sidebar occupies column 1 of row 2; main occupies column 2; footer spans both columns in row 3',
        'A grid with only two columns and unlimited rows',
        'CSS does not support named grid areas',
      ],
      correct: 1,
      explanation:
        '`grid-template-areas` creates a named visual map of the grid. Child elements use `grid-area: header` etc. to occupy their named zone. Repeating a name across columns makes the element span those columns. A `.` denotes an empty cell.',
      hint: 'grid-template-areas is a visual representation of the layout in ASCII.',
      difficulty: 'intermediate',
      tags: ['CSS Grid', 'grid-template-areas', 'Layout'],
    },
    {
      topic: 'CSS Grid – auto-fill vs auto-fit',
      prompt: 'What is the key difference between `repeat(auto-fill, ...)` and `repeat(auto-fit, ...)` in CSS Grid?',
      options: [
        'auto-fill only works for fixed-size columns; auto-fit is for flexible columns',
        'auto-fill creates as many tracks as can fit without overflowing (retaining empty column tracks); auto-fit collapses empty tracks to zero width, allowing remaining items to expand',
        'They are identical in behaviour',
        'auto-fit creates more columns than auto-fill',
      ],
      correct: 1,
      explanation:
        'Both fill available space with as many tracks as possible. The difference appears when there are fewer items than tracks: `auto-fill` keeps empty tracks (preserving column structure), while `auto-fit` collapses empty tracks so remaining items can grow to fill the container.',
      hint: 'auto-fit "fits" items to the container; auto-fill "fills" all possible slots.',
      difficulty: 'advanced',
      tags: ['CSS Grid', 'auto-fill', 'auto-fit', 'Responsive'],
    },
    {
      topic: 'Custom Properties – CSS Variables',
      prompt: 'How do CSS custom properties (variables) differ from preprocessor variables (Sass/Less)?',
      options: [
        'There is no difference; both compile to static values',
        'CSS custom properties are live at runtime (accessible to JavaScript, inherited through the DOM, can be updated dynamically); preprocessor variables are static constants resolved only at compile time',
        'Preprocessor variables support inheritance; CSS variables do not',
        'CSS variables only work in media queries',
      ],
      correct: 1,
      explanation:
        'CSS custom properties (`--color: hsl(...)`) are part of the live DOM cascade: they inherit, can be updated with JavaScript (`el.style.setProperty(\'--color\', \'red\')`), respond to media queries, and can be scoped to any element. Preprocessor variables are compile-time constants that produce static output.',
      hint: 'CSS variables are a cascade feature; preprocessor variables are build-time macros.',
      difficulty: 'intermediate',
      tags: ['CSS Variables', 'Custom Properties', 'Theming'],
    },
    {
      topic: 'Custom Properties – Theming',
      prompt: 'How would you implement a dark mode theme toggle using only CSS custom properties?',
      options: [
        'Use JavaScript to swap out the entire stylesheet',
        'Define --color tokens on :root for light mode and redefine them inside [data-theme="dark"] or prefers-color-scheme: dark; components automatically pick up the new token values',
        'Dark mode requires Sass mixins, not native CSS',
        'Use filter: invert(100%) on the body element',
      ],
      correct: 1,
      explanation:
        'Define semantic tokens (`--bg: white`, `--text: black`) on `:root`. In `@media (prefers-color-scheme: dark)` or `[data-theme="dark"]`, redefine the same tokens (`--bg: #1a1a1a`). All components referencing `var(--bg)` automatically adapt — no duplicated component rules.',
      hint: 'Token redefinition in a new scope changes values for all descendants.',
      difficulty: 'intermediate',
      tags: ['Dark Mode', 'CSS Variables', 'Theming'],
    },
    {
      topic: 'Positioning – fixed vs sticky',
      prompt: 'What is the difference between `position: fixed` and `position: sticky`?',
      options: [
        'Both are identical; sticky is just a newer alias',
        'fixed positions the element relative to the viewport, always stays on screen regardless of scrolling; sticky behaves as relative until a scroll threshold is crossed, then sticks to the viewport within its scroll container',
        'sticky positions relative to the parent element regardless of scrolling',
        'fixed is only supported in modern browsers; sticky has universal support',
      ],
      correct: 1,
      explanation:
        '`position: fixed` removes the element from document flow and locks it to the viewport – it never scrolls with the page. `position: sticky` is a hybrid: it scrolls normally until it hits its `top`/`left`/etc. offset, then sticks within its parent scroll container (unsticking when the parent scrolls out of view).',
      hint: 'Sticky is like fixed, but only within its scroll container.',
      difficulty: 'intermediate',
      tags: ['Positioning', 'sticky', 'fixed'],
    },
    {
      topic: 'Stacking Context – z-index',
      prompt: 'When does a `z-index` value NOT work as expected on a positioned element?',
      options: [
        'z-index never works on elements inside flexbox containers',
        'When the element is inside a stacking context created by an ancestor (transform, opacity < 1, isolation: isolate, etc.), z-index is only meaningful within that context, not globally',
        'z-index only works on elements with display: flex',
        'z-index has no effect inside media queries',
      ],
      correct: 1,
      explanation:
        'Many CSS properties create new stacking contexts: `transform`, `opacity < 1`, `filter`, `isolation: isolate`, `will-change`, `position: fixed`. Inside a stacking context, z-index values are local. Even z-index: 9999 inside a stacking context cannot paint above elements in a higher stacking context outside.',
      hint: 'z-index wars are usually stacking context problems, not z-index value problems.',
      difficulty: 'advanced',
      tags: ['z-index', 'Stacking Context', 'Positioning'],
    },
    {
      topic: 'CSS Animations – keyframes',
      prompt: 'What does `animation-fill-mode: forwards` do on a CSS animation?',
      options: [
        'The animation plays forward (left to right) only',
        'After the animation finishes, the element retains the styles from the last keyframe instead of reverting to its pre-animation state',
        'The animation loops forward indefinitely',
        'forwards has no effect unless animation-direction is also set',
      ],
      correct: 1,
      explanation:
        '`animation-fill-mode: forwards` holds the computed styles from the last keyframe (`100%` or `to`) after the animation ends. Without it, the element snaps back to its original styles. `backwards` applies the first keyframe styles during `animation-delay`. `both` applies both.',
      hint: 'forwards "freezes" the end state after animation completes.',
      difficulty: 'intermediate',
      tags: ['CSS Animations', 'animation-fill-mode', 'Keyframes'],
    },
    {
      topic: 'CSS Transitions',
      prompt: 'What is the difference between CSS `transition` and CSS `animation`?',
      options: [
        'Transitions are faster; animations are slower',
        'Transitions animate a property between two states triggered by state changes (hover, focus, class add); animations use keyframes and run autonomously on element load or loop independently of state changes',
        'Animations require JavaScript; transitions are pure CSS',
        'They are identical in behaviour',
      ],
      correct: 1,
      explanation:
        '`transition` triggers when a property value changes from state A to B (e.g. hover adds a class). It needs an external trigger. `animation` with `@keyframes` can start automatically, loop, delay, alternate, and play sequences of multiple intermediate states without external triggers.',
      hint: 'Transitions react to changes; animations play on their own schedule.',
      difficulty: 'beginner',
      tags: ['CSS Transitions', 'CSS Animations', 'Differences'],
    },
    {
      topic: 'Responsive – Media Queries',
      prompt: 'What is the difference between a "mobile-first" and "desktop-first" media query approach?',
      options: [
        'Mobile-first uses max-width queries; desktop-first uses min-width queries',
        'Mobile-first writes base CSS for small screens and uses min-width queries to progressively enhance for larger screens; desktop-first writes base CSS for large screens and uses max-width queries to adjust for smaller screens',
        'There is no performance or design difference',
        'Mobile-first requires a separate CSS file',
      ],
      correct: 1,
      explanation:
        'Mobile-first: base styles target small screens; `@media (min-width: 768px)` adds enhancements for tablets and above. Desktop-first: base styles target wide screens; `@media (max-width: 767px)` overrides for smaller screens. Mobile-first is preferred: simpler overrides, better performance on slow mobile connections (progressive enhancement).',
      hint: 'min-width queries add complexity as screens get larger; max-width removes complexity.',
      difficulty: 'intermediate',
      tags: ['Responsive', 'Media Queries', 'Mobile First'],
    },
    {
      topic: 'Container Queries',
      prompt: 'What problem do CSS Container Queries solve that standard media queries cannot?',
      options: [
        'Container queries are just a syntax alias for media queries',
        'Container queries allow components to respond to the size of their parent container rather than the viewport, enabling truly reusable components that adapt regardless of where they are placed in the layout',
        'Container queries work offline without a network',
        'Container queries eliminate the need for JavaScript resize observers',
      ],
      correct: 1,
      explanation:
        'Media queries respond to the viewport/screen size, not component context. A card component in a narrow sidebar needs different styles than the same card in a wide main area. Container queries (`@container (min-width: 400px)`) solve this: the card adapts to its container\'s size, not the screen size.',
      hint: 'Think: card in narrow sidebar vs card in wide main column — both exist on the same viewport.',
      difficulty: 'advanced',
      tags: ['Container Queries', 'Responsive', 'Components'],
    },
    {
      topic: 'CSS – calc() function',
      prompt: 'What is a practical use case for `calc()` in CSS?',
      options: [
        'To perform JavaScript calculations inside CSS',
        'To mix units in a single expression: e.g. width: calc(100% - 2rem) subtracts a fixed rem margin from a fluid percentage width, which is impossible with a single unit value',
        'To calculate specificity scores',
        'calc() is only supported in modern browsers for grid layouts',
      ],
      correct: 1,
      explanation:
        '`calc()` enables mixing of CSS units in arithmetic expressions. Classic use: `width: calc(100% - 40px)` creates an element that fills its container minus a fixed gap. It supports +, -, *, / operators and can combine em, rem, px, %, vh, vw units.',
      hint: 'The power is mixing incompatible units in one expression.',
      difficulty: 'intermediate',
      tags: ['calc()', 'CSS Functions', 'Layout'],
    },
    {
      topic: 'CSS – clamp() for fluid typography',
      prompt: 'What does `font-size: clamp(1rem, 2.5vw, 2rem)` accomplish?',
      options: [
        'Sets font size to always 2.5vw',
        'Sets font size that scales with viewport width but never drops below 1rem or exceeds 2rem, creating fluid responsive typography without media query breakpoints',
        'Applies three font sizes simultaneously',
        'clamp() is not valid in CSS font-size',
      ],
      correct: 1,
      explanation:
        '`clamp(minimum, preferred, maximum)` clamps a computed value between bounds. For fluid typography, `clamp(1rem, 2.5vw, 2rem)` means: the ideal size is 2.5vw (viewport-relative), but it will never be smaller than 1rem (minimum readability) nor larger than 2rem (maximum visual size).',
      hint: 'clamp: minimum, preferred, maximum.',
      difficulty: 'intermediate',
      tags: ['clamp()', 'Fluid Typography', 'CSS Functions'],
    },
    {
      topic: 'CSS Logical Properties',
      prompt: 'What advantage do CSS logical properties like `margin-inline-start` have over `margin-left`?',
      options: [
        'They are shorter to write than physical properties',
        'They adapt automatically to the text direction (LTR/RTL) and writing mode: margin-inline-start means "margin at the start of the inline axis", which is left in LTR and right in RTL – enabling internationalisation without duplicate CSS',
        'They apply margin to all four sides simultaneously',
        'Logical properties only work in Firefox',
      ],
      correct: 1,
      explanation:
        'Physical properties (`margin-left`, `padding-right`) are hardcoded to physical screen directions. Logical properties (`margin-inline-start`, `padding-block-end`) are relative to the text\'s inline and block axes. In RTL languages (Arabic, Hebrew), `inline-start` maps to the right side automatically, supporting internationalised layouts.',
      hint: 'Logical properties = direction-agnostic; physical properties = always left/right.',
      difficulty: 'advanced',
      tags: ['CSS Logical Properties', 'RTL', 'Internationalisation'],
    },
    {
      topic: 'CSS – pseudo-elements vs pseudo-classes',
      prompt: 'What is the difference between a CSS pseudo-class and a pseudo-element?',
      options: [
        'Both select the same targets; the notation (: vs ::) is just a style preference',
        'Pseudo-classes (e.g. :hover, :focus, :nth-child) select elements in a specific state; pseudo-elements (e.g. ::before, ::after, ::first-line) create or target sub-parts of an element that do not exist in the HTML',
        'Pseudo-elements only work on block-level elements',
        'Pseudo-classes require JavaScript event listeners to work',
      ],
      correct: 1,
      explanation:
        'Pseudo-classes target existing elements based on state (`:hover`, `:checked`, `:disabled`) or position (`:nth-child`). Pseudo-elements create virtual elements that can be styled independently (`:before` and `::after` create generated content nodes; `::first-letter`, `::placeholder`, `::selection` target specific parts of existing content).',
      hint: 'One colon = state; two colons = virtual sub-element.',
      difficulty: 'intermediate',
      tags: ['Pseudo-class', 'Pseudo-element', 'Selectors'],
    },
    {
      topic: 'CSS – will-change',
      prompt: 'What does `will-change: transform` tell the browser, and when should it be used sparingly?',
      options: [
        'It prevents the element from being transformed by animations',
        'It hints to the browser to promote the element to its own compositor layer ahead of time, enabling smoother animations by pre-allocating GPU resources; overuse wastes GPU memory and can cause performance regressions',
        'It disables CSS transitions on the element',
        'It automatically applies hardware acceleration to all properties',
      ],
      correct: 1,
      explanation:
        '`will-change` tells the browser "this element\'s property will change" so it can optimise ahead of time (e.g. create a GPU compositing layer). Use it only on elements that actually animate and remove it after the animation (e.g. with JavaScript) because over-promotion wastes VRAM.',
      hint: 'Use will-change right before animation, remove it after.',
      difficulty: 'advanced',
      tags: ['Performance', 'will-change', 'GPU'],
    },
    {
      topic: 'CSS – prefers-reduced-motion',
      prompt: 'Why should CSS animations respect the `prefers-reduced-motion` media query?',
      options: [
        'To improve performance on all devices',
        'Some users experience motion sickness, vertigo, or seizures from animations; prefers-reduced-motion lets you disable or reduce animations when the user has requested reduced motion in their OS accessibility settings',
        'To comply with GDPR cookie regulations',
        'prefers-reduced-motion is not yet supported in any browser',
      ],
      correct: 1,
      explanation:
        '`@media (prefers-reduced-motion: reduce)` detects the OS "Reduce Motion" setting. Users with vestibular disorders, epilepsy, or motion sensitivity need interfaces to minimise or eliminate animations. WCAG 2.3.3 (AAA) and good practice dictates respecting this preference. At minimum, disable autoplay parallax and flashing animations.',
      hint: 'Motion sickness and vestibular disorders are real accessibility issues.',
      difficulty: 'intermediate',
      tags: ['Accessibility', 'prefers-reduced-motion', 'Animations'],
    },
    {
      topic: 'CSS – aspect-ratio',
      prompt: 'What problem does `aspect-ratio: 16 / 9` solve in CSS?',
      options: [
        'Sets the element\'s width to 16px and height to 9px',
        'Maintains a specific width-to-height proportion as the element scales, eliminating the old percentage padding-top hack for responsive videos and images',
        'Only works for video elements',
        'It requires width and height to both be explicitly set',
      ],
      correct: 1,
      explanation:
        'Before `aspect-ratio`, responsive 16:9 video containers required the "padding-top: 56.25%" hack. The `aspect-ratio` property directly specifies the desired ratio; the browser calculates one dimension from the other. Works on any element for maintaining proportional sizing.',
      hint: 'aspect-ratio replaced the percentage padding-bottom/top responsive embed hack.',
      difficulty: 'intermediate',
      tags: ['aspect-ratio', 'Responsive', 'Video'],
    },
    {
      topic: 'CSS – specificity calculation example',
      prompt: 'Which CSS selector has the highest specificity?',
      options: [
        '.nav li a:hover',
        'ul.navigation > li > a',
        '#header .nav a',
        'div div div a',
      ],
      correct: 2,
      explanation:
        'Specificity calculation: IDs (100), classes/attributes/pseudo-classes (10), elements/pseudo-elements (1). `#header .nav a` = 100 + 10 + 1 = 111. `.nav li a:hover` = 10 + 1 + 1 + 10 = 22. `ul.navigation > li > a` = 1 + 10 + 1 + 1 = 13. `div div div a` = 4. So #header .nav a wins.',
      hint: 'Count each ID, class, and element separately.',
      difficulty: 'intermediate',
      tags: ['Specificity', 'Selectors', 'Cascade'],
    },
    {
      topic: 'CSS – text-overflow',
      prompt: 'What combination of CSS properties creates the "…" ellipsis overflow effect on a single line of text?',
      options: [
        'overflow: hidden alone',
        'overflow: hidden; white-space: nowrap; text-overflow: ellipsis – all three are required',
        'text-overflow: ellipsis alone',
        'white-space: nowrap; word-wrap: break-word',
      ],
      correct: 1,
      explanation:
        'All three work together: `white-space: nowrap` prevents line wrapping; `overflow: hidden` clips the overflowing text; `text-overflow: ellipsis` replaces the clipped text with "…". Omitting any one will prevent the ellipsis from appearing.',
      hint: 'Three properties work together: no-wrap + hide overflow + add ellipsis.',
      difficulty: 'intermediate',
      tags: ['text-overflow', 'Ellipsis', 'Typography'],
    },
    {
      topic: 'CSS – gap in flexbox',
      prompt: 'What does the `gap` property do when applied to a flex container?',
      options: [
        'gap only works in CSS Grid, not Flexbox',
        'gap sets consistent spacing between flex items along both axes without adding margin to the outer edges of the container – cleaner than using margin on individual items',
        'gap adds padding inside each flex item',
        'gap applies only to the main axis of a flex container',
      ],
      correct: 1,
      explanation:
        '`gap` (previously `grid-gap`) is now supported in Flexbox and adds gutters between flex items. Unlike `margin`, gap does not create outer spacing – the container\'s edges are not affected. `row-gap` and `column-gap` allow separate control of each axis.',
      hint: 'gap adds space between items, not around the container.',
      difficulty: 'intermediate',
      tags: ['gap', 'Flexbox', 'Spacing'],
    },
    {
      topic: 'CSS – display: grid vs display: flex',
      prompt: 'When should you use CSS Grid versus Flexbox for a layout?',
      options: [
        'Grid for all layouts; Flexbox is obsolete',
        'Flexbox is for one-dimensional layouts (a row or column of items); Grid is for two-dimensional layouts (rows AND columns simultaneously)',
        'Flexbox is only for navigation bars',
        'Grid and Flexbox are identical in functionality',
      ],
      correct: 1,
      explanation:
        'The rule of thumb: Flexbox for 1D (a row of buttons, a column of items, distributing space in one direction). Grid for 2D (page layouts, card grids, image galleries where you control both rows and columns). In practice, they complement each other: Grid for page structure, Flexbox within components.',
      hint: 'Content-out (Flexbox) vs layout-in (Grid).',
      difficulty: 'beginner',
      tags: ['Flexbox', 'Grid', 'Layout Decisions'],
    },
    {
      topic: 'CSS – CSS reset vs normalize',
      prompt: 'What is the difference between a CSS reset and CSS normalize?',
      options: [
        'They achieve identical results',
        'A CSS reset strips all default browser styles to zero, creating a blank slate; CSS Normalize makes browser styles consistent across browsers while preserving useful defaults',
        'CSS reset improves performance; normalize improves accessibility',
        'Normalize removes all browser defaults; reset preserves them',
      ],
      correct: 1,
      explanation:
        'CSS resets (Eric Meyer) remove all browser default styling, giving you a blank slate. CSS Normalize (Nicolas Gallagher) aims to make browser defaults consistent without removing everything — preserving helpful defaults like `<ul>` indentation and `<h1>` font weight, just making them equal across browsers.',
      hint: 'Reset = zero everything; Normalize = consistent defaults.',
      difficulty: 'intermediate',
      tags: ['CSS Reset', 'Normalize', 'Browser Compatibility'],
    },
    {
      topic: 'CSS – @layer cascade layers',
      prompt: 'What problem do CSS `@layer` cascade layers solve?',
      options: [
        'They allow CSS to load in parallel like lazy loading',
        'They let developers explicitly define the precedence order of stylesheets (e.g. base < components < utilities), resolving specificity conflicts without needing to increase selector specificity',
        'Layers make CSS scoped to individual HTML elements',
        '@layer is a CSS preprocessor feature, not native CSS',
      ],
      correct: 1,
      explanation:
        '`@layer` (CSS Cascade Layers, 2022) lets you declare explicit precedence order for groups of styles. Styles in a later-declared layer override earlier ones regardless of specificity. This prevents the specificity arms race in large stylesheets and makes third-party style isolation cleaner.',
      hint: 'Layers control which block of CSS wins, independent of specificity.',
      difficulty: 'advanced',
      tags: ['@layer', 'Cascade Layers', 'Modern CSS'],
    },
  ],
  { featured: true, aliases: ['css', 'css3', 'css quiz', 'css questions', 'css interview'] }
)
