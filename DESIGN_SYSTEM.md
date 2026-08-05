# NOIR COFFEE — Design System

This document is the single source of truth for how NOIR COFFEE looks,
feels, and moves. Anything visual added to this project should be
checked against it before it's built.

> **The brand name is NOIR COFFEE.** Do not rename it (e.g. "First
> Pour") or invent an alternate name anywhere in the product.

---

## 1. Brand Personality

Modern, energetic, editorial, playful, human, experimental.

## 2. Visual Direction

Despite the name, NOIR COFFEE does **not** use a traditional dark
coffee aesthetic. The direction is:

- Bright
- Clean
- Modern
- Editorial
- Experimental
- Interactive
- Awwwards-inspired

The visual experience should come primarily from **strong typography,
art-directed photography, Three.js/WebGL, GSAP, Lenis, and interactive
transitions** — not generic AI-layout patterns or excessive card grids.
The site should feel like a modern creative digital experience, not a
generic coffee shop template.

---

## 3. Color System

| Name | Hex | Usage |
|---|---|---|
| Paper | `#F5F5F2` | Primary page background |
| White | `#FFFFFF` | Secondary background / surfaces |
| Ink | `#111111` | Primary text color |
| Electric Blue | `#2457FF` | Main brand accent |
| Soft Blue | `#DCE6FF` | Subtle backgrounds, supporting areas |
| Orange | `#FF7043` | Sparingly, for small highlights |
| Gray | `#6B6B6B` | Secondary / muted text |
| Line | `#D8D8D3` | Borders, dividers, hairlines |

**Rules:**
- Paper is the primary page background.
- Ink is the primary text color.
- Electric Blue is the main brand accent.
- Soft Blue is used for subtle backgrounds and supporting areas.
- Orange is used sparingly for small highlights only.
- Do not introduce random/off-system colors.
- Dark, full-bleed editorial moments (e.g. a cinematic hero, a
  centerpiece WebGL section) may use **Ink** as the section
  background, with Paper/White text — this is an explicit exception,
  not a default. Most of the page stays bright per the Visual
  Direction above; dark sections are used sparingly, for deliberate
  cinematic emphasis only.

---

## 4. Typography

**Display / headings:** Sora
**Body / UI:** Space Grotesk
**Editorial display (sparingly):** Fraunces

Fraunces is a third, deliberately limited exception — used only for
oversized, one-off editorial statements (a cinematic hero scene, a
large pull-quote-style statement). It never replaces Sora for the
brand wordmark/logo lockup, section headings, or anything structural,
and never replaces Space Grotesk for UI. Don't reach for it by
default — most "large statement" text still stays Sora.

| Use case | Font |
|---|---|
| Brand wordmark / logo lockup | Sora |
| Hero headings | Sora |
| Section headings | Sora |
| Large numbers | Sora |
| Editorial statement moments | Fraunces (sparingly — see above) |
| Navigation | Space Grotesk |
| Body text | Space Grotesk |
| Buttons | Space Grotesk |
| Menu items | Space Grotesk |
| Labels | Space Grotesk |
| Supporting text | Space Grotesk |
| UI elements | Space Grotesk |

### Type Scale

| Style | Desktop | Mobile | Font / Weight |
|---|---|---|---|
| Display XL | 96–120px | 64px | Sora 700 |
| Display | 72–88px | 56px | Sora 700 |
| H1 | 72px | 48px | Sora 700 |
| H2 | 48–64px | 40px | Sora 600 |
| H3 | 28–36px | 28px | Sora 600 |
| Body Large | 20px | 18px | Space Grotesk 400 |
| Body | 16px | 16px | Space Grotesk 400 |
| Small | 14px | 14px | Space Grotesk 500 |
| Label | 12px | 12px | Space Grotesk 600 |

---

## 5. Layout

- **Max content width:** 1440px
- **Page padding:** 48px desktop / 32px tablet / 20px mobile

| Breakpoint | Grid |
|---|---|
| Desktop | 12 columns |
| Tablet | 8 columns |
| Mobile | 4 columns |

---

## 6. Spacing Scale

Use only these values. Do not invent one-off spacing values unless
there's a specific design reason to.

```
4  8  12  16  24  32  48  64  80  96  128  160
```

---

## 7. Border Radius

| Element | Radius |
|---|---|
| Small UI | 4px |
| Cards | 8px |
| Images | 12px |
| Large visual elements | 16px |
| Pill buttons | 999px |

---

## 8. Buttons

**Primary**
- Electric Blue background
- White text
- Space Grotesk, medium/semibold weight
- Pill shape (`999px` radius)
- Subtle interactive hover

**Secondary**
- Transparent background
- Ink text
- Animated underline (no fill/border)

---

## 9. Imagery

Photography should feel bright, natural, tactile, editorial, human.

**Subjects:** coffee, coffee preparation, bakery, desserts, café
interiors, people, ingredients, hands, natural light.

**Avoid:** generic stock photography, extremely dark coffee
photography, overly staged imagery, excessive HDR.

**Recurring frame motif — the arch:** used as a soft vignette/mask
around photography in cinematic moments (e.g. the hero), not a hard
crop. Implemented as a design-layer overlay (SVG/CSS), not something
that has to be shot into the photo itself — any well-composed interior
or product shot can be framed with it after the fact.

---

## 10. WebGL / Three.js

Three.js is a **major** visual experience on this site, not a minor
decoration.

**Aesthetic:** organic, fluid, interactive, curious, playful, tactile,
experimental.

**Potential visual language:** coffee beans, particles, fluid forms,
abstract geometry, distortion, displacement, depth, mouse interaction,
scroll interaction.

**WebGL color palette** — primarily:

```
#2457FF   Electric Blue
#DCE6FF   Soft Blue
#111111   Ink
#F5F5F2   Paper
#FF7043   Orange (sparingly)
```

Do not use random/neon colors outside this palette.

---

## 11. Motion

**Technology:** GSAP, ScrollTrigger, Lenis, Three.js.

| Motion type | Duration |
|---|---|
| Micro interactions | 150–300ms |
| UI transitions | 400–800ms |
| Cinematic visual animations | 1–3s |

Motion should be intentional, not decorative. **Do not** add generic
fade-up / slide-up animations to every section.

**Prioritize:**
- Visual transformations
- WebGL interaction
- Mouse interaction
- Scroll-driven animation
- Image movement
- Fluid transitions

---

## 12. Accessibility

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Good color contrast
- Image alt text
- Respect `prefers-reduced-motion`

---

## 13. Responsive Design

The site must work on desktop, laptop, tablet, and mobile. WebGL
should reduce complexity on mobile where necessary for performance.

---

## 14. Performance

Do not sacrifice performance for visual effects. Optimize:

- Three.js object count
- Image sizes
- Animation loops
- Event listeners
- WebGL effects

---

## 15. Component Principles

- Use reusable React components.
- Do not create one huge `App.jsx` file.
- Build components progressively, as needed.
