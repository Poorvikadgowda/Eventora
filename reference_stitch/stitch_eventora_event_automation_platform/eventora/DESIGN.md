---
name: Eventora
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#43474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#49607c'
  primary: '#00152a'
  on-primary: '#ffffff'
  primary-container: '#102a43'
  on-primary-container: '#7a92b0'
  inverse-primary: '#b0c9e8'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#001815'
  on-tertiary: '#ffffff'
  tertiary-container: '#002f2a'
  on-tertiary-container: '#28a094'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b0c9e8'
  on-primary-fixed: '#011d35'
  on-primary-fixed-variant: '#314863'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a modern, professional, and reliable SaaS aesthetic tailored for Eventora, an automated event management platform. The target audience includes corporate event planners, enterprise organizers, and operational teams who require efficiency, precision, and clarity. 

The visual style blends **Minimalism** with **Corporate / Modern** principles, relying on crisp surface contrasts, deliberate whitespace, and structured data hierarchy. The emotional response is one of calm confidence, control, and absolute dependability. Every interface element is engineered to reduce cognitive load during high-stakes event coordination.

## Colors

The color architecture is anchored by a commanding Deep Navy (`#102A43`) for primary brand touchpoints and high-emphasis structure, paired with Electric Blue (`#2563EB`) as the interactive accent for primary actions and active states. Teal (`#0D9488`) serves as a functional tertiary color, highlighting successful states, metrics, and automated workflows.

The canvas utilizes a crisp off-white background (`#FFFFFF`), while containers and secondary surfaces employ a light slate (`#F8FAFC` to `#F1F5F9`) to establish subtle planar separation. Text elements rely on dark slate (`#334155`) for high readability, avoiding harsh pure blacks to maintain a softer, executive-tier reading experience.

## Typography

Typography is strictly utilitarian yet refined, utilizing **Inter** to ensure absolute legibility across dense data tables, metrics panels, and analytical dashboards. 

Font weights are intentionally constrained to 400 (Regular), 500 (Medium), and 600/700 (Semi-bold/Bold) to maintain clean visual hierarchy. Large display headings feature slightly tighter letter-spacing (`-0.02em`) to deliver an authoritative, engineered feel, while body and label scales prioritize neutral, highly accessible proportions.

## Layout & Spacing

The layout model relies on a responsive **12-column fluid grid** system optimized for desktop-first SaaS workflows, gracefully collapsing down to single-column stacks on mobile viewports. 

A consistent 8px/16px baseline rhythm governs all spatial relationships. Outer margins scale from 1rem on mobile devices up to 2rem on desktop canvases, ensuring ample breathing room around complex dashboard modules. Component padding and element gaps strictly follow the defined `space-*` scale to maintain structural harmony across cards, navigation drawers, and data grids.

## Elevation & Depth

Visual hierarchy is conveyed primarily through tonal surface layering supplemented by **ambient shadows**. Surfaces are stacked using a clear progression from pure white backgrounds (`#FFFFFF`) to light slate container tiers (`#F8FAFC`). 

Shadows are calibrated to be exceptionally soft and low-opacity, utilizing tinted dark navy values rather than muddy blacks (e.g., `0 4px 12px -2px rgba(16, 42, 67, 0.08)`). This approach eliminates harsh visual noise, allowing interactive cards and floating toolbars to sit comfortably above the base canvas with natural, diffused depth.

## Shapes

The shape language uses a consistent **Rounded** approach (`rounded` level 2). Standard UI elements such as inputs, buttons, and dropdowns feature a baseline 0.5rem corner radius, while primary containers and data cards scale up to `rounded-xl` (1.5rem) to project a friendly yet professional enterprise tone. 

Sharp 0px corners are reserved exclusively for structural table dividers and full-bleed image containers, ensuring a deliberate contrast between soft framing and crisp data content.

## Components

### Buttons
Primary buttons utilize the Electric Blue (`#2563EB`) background with white typography and rounded-md corners, transitioning to Deep Navy on hover. Secondary buttons employ a ghost style with a subtle slate border and dark slate text. Destructive actions utilize muted red highlights only when necessary.

### Chips & Badges
Pill-shaped or softly rounded (rounded-full) indicators used for event status tags (e.g., "Confirmed", "Draft", "Live"). They pair light tinted backgrounds with matching dark text or Teal accents for successful automated states.

### Checkboxes & Radio Buttons
Constructed with a crisp 2px border in slate gray, transitioning to Electric Blue with white check icons upon selection. Focus states feature a soft blue ring for accessibility compliance.

### Input Fields
Built with light slate backgrounds (`#F8FAFC`), subtle borders, and `rounded-lg` corners. Labels sit externally above the field in medium weight dark slate, with helper text positioned below.

### Cards
Core structural elements for the dashboard. Styled with white surfaces, `rounded-xl` corners, subtle ambient shadows, and generous internal padding (`space-lg`) to organize metrics, attendee lists, and event modules.

### Additional SaaS Components
- **Data Tables:** Feature alternating subtle row tinting, sticky headers, and inline action menus.
- **Metric Tiles:** Compact cards displaying key performance indicators with percentage change badges (Teal for positive growth).
- **Timeline / Workflow Stepper:** Visual indicators mapping out automated event sequences and scheduling milestones.