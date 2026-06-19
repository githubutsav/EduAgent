---
name: Dimension Smart
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#cbc3d5'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#948e9f'
  outline-variant: '#494453'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#3a0092'
  primary-container: '#a07cfe'
  on-primary-container: '#350086'
  inverse-primary: '#6a44c4'
  secondary: '#ffb2ba'
  on-secondary: '#630a22'
  secondary-container: '#822437'
  on-secondary-container: '#ff97a4'
  tertiary: '#ecc161'
  on-tertiary: '#3f2e00'
  tertiary-container: '#b48d33'
  on-tertiary-container: '#392900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#5228ab'
  secondary-fixed: '#ffd9dc'
  secondary-fixed-dim: '#ffb2ba'
  on-secondary-fixed: '#400011'
  on-secondary-fixed-variant: '#822437'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#ecc161'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
  background-deep: '#090A0F'
  surface-glass: rgba(18, 19, 26, 0.8)
  text-primary: '#FFFFFF'
  text-muted: '#8B90A0'
  border-subtle: rgba(255, 255, 255, 0.1)
  ai-glow: '#5B5BD6'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-xs:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  section-gap-lg: 8rem
  section-gap-md: 4rem
  gutter: 1.5rem
  card-padding: 2rem
---

## Brand & Style

This design system embodies a premium, futuristic aesthetic that is both highly technical and deeply human. It is designed to evoke a sense of "Delightful Intelligence"—where every interaction feels precise, calm, and advanced. 

The visual direction follows a **Modern Dark** movement, characterized by deep midnight backgrounds, vibrant signature gradients, and high-fidelity glassmorphism. It avoids the harshness of typical developer tools by using soft, blurred background "halos" and generous whitespace, creating a focused environment for learning and AI interaction.

**Key Aesthetic Principles:**
- **Calm Authority:** A palette that prioritizes legibility and ocular comfort.
- **Tech-Forward Humanism:** Cutting-edge visual effects (glass, blurs, gradients) applied with restraint to keep the focus on human-centric education.
- **Precision:** Tight typography and crisp, low-opacity borders that suggest high-quality engineering.

## Colors

The palette is anchored by **Deep Midnight**, providing a cinematic foundation for content. The primary text is high-contrast white, while secondary information uses a slate gray to maintain hierarchy and reduce visual noise.

**Signature Gradient:**
The design system uses a specific three-stop horizontal sweep for headlines and primary actions:
- `from-[#A07CFE]` (Purple) 
- `via-[#FE8495]` (Pink) 
- `to-[#FFD270]` (Warm Yellow)

**Functional Colors:**
- **Background Glows:** Large, 300px+ radial gradients of `#A07CFE` at 5-10% opacity should be placed behind key hero sections and cards to create depth.
- **Activity Status:** Use `#008080` (Teal) or `#F4B860` (Gold) for "Live" indicators and AI energy metrics, reflecting the brand's intelligent nature.

## Typography

The typography system leverages **Geist** for headlines and UI labels to provide a technical, modern edge, while **Inter** is used for body copy to ensure maximum readability in dense education contexts.

**Styling Rules:**
- **Hero Headlines:** Always use `tracking-tighter` (-0.04em). Often implemented as a mix of solid white and the signature gradient text.
- **Labels & Badges:** Use `uppercase` and `tracking-widest` for secondary metadata (e.g., "CHAPTER 01").
- **Body Text:** Maintain a `leading-relaxed` (1.6) line height to ensure comfortable reading of educational material against the dark background.

## Layout & Spacing

The layout philosophy centers on a **Fixed Grid** with generous "breathing room." Content is constrained to a centered 1280px container to maintain focus.

**Grid Structures:**
- **Bento Grids:** Used for feature highlights, following a 3 or 4-column structure with 24px gaps.
- **Split Sections:** 2-column layouts where text is typically on the left and high-fidelity UI mockups are on the right.
- **Vertical Rhythm:** Sections are separated by large 128px (8rem) paddings to prevent visual clutter and signal the transition between topics.

**Mobile Reflow:**
On mobile devices, all grids collapse to a single column. Spacing is reduced to `py-16` (4rem) to maintain momentum while scrolling.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Diffuse Shadows** rather than traditional solid colors.

- **Surface Layers:** The base is the Deep Midnight background. Cards and floating panels use a frosted glass effect (`backdrop-blur-xl`) with a 3% white fill.
- **Outlines:** Instead of heavy shadows, use "Ghost Borders"—1px solid lines at `white/10` opacity. This gives components a sharp, defined edge.
- **Depth:** Use deep, diffuse shadows for primary floating elements (e.g., `shadow-[0_20px_50px_rgba(0,0,0,0.5)]`).
- **Interaction:** On hover, borders should transition from `white/10` to `white/25`, and the background blur may slightly increase to suggest elevation.

## Shapes

The design system utilizes **Rounded** (0.5rem base) to **Pill-shaped** geometry to balance the technical nature of the UI with a friendly, human-centric feel.

- **Main Cards:** Use `rounded-2xl` (1rem) for most surface containers.
- **Action Elements:** Buttons and badges should be fully `rounded-full` (pill-shaped) to distinguish them as interactive touchpoints.
- **UI Mockups:** Use `rounded-3xl` (1.5rem) for large browser or application frame simulations to create a distinct, modern silhouette.

## Components

### Buttons
- **Primary:** Background uses the signature Purple-to-Yellow gradient. Text is white or high-contrast dark. Shape is `rounded-full`.
- **Secondary:** Transparent background with a `white/10` border. On hover, background becomes `white/5`.
- **Interactions:** Subtle `scale-105` on hover with a 300ms ease-out transition.

### Cards & Mockups
- **Base Style:** `bg-[#12131A]/80`, `backdrop-blur-xl`, `border border-white/10`.
- **Shadow:** Deep, low-opacity black shadows.
- **Content:** Generous inner padding (`p-8`).

### Input Fields
- **Style:** Dark, semi-transparent background (`white/5`), subtle white border. 
- **Focus:** Border glows with the primary purple color; text cursor follows a "typing effect" animation for AI-driven inputs.

### Badges & Tags
- **Style:** Pill-shaped (`rounded-full`), small `text-xs` Geist font, uppercase with wide tracking.
- **Variant:** Often transparent with a thin `white/15` border.

### Progress & Metrics
- **Energy Bars:** Use a horizontal gradient fill that animates its width on load. Include a soft glow effect on the leading edge of the progress bar to simulate "AI Activity."

### Scroll Reveal
- All major components should utilize a "Fade Up" animation (move 20px up while fading from 0% to 100% opacity) when entering the viewport.