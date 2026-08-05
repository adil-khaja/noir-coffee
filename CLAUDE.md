# NOIR COFFEE — Development Rules

These are the working rules for this project. Follow them for every
change, not just the ones that look "visual."

## Design system

1. Always read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) before modifying UI.
2. `DESIGN_SYSTEM.md` is the visual source of truth.
3. The brand name is **NOIR COFFEE**.
4. Never rename the brand or invent another brand name.
5. Use **Sora** for headings/display.
6. Use **Space Grotesk** for body/UI.
7. Do not introduce additional fonts.
8. Use only the defined design tokens (colors, spacing, radius, type
   scale) from `DESIGN_SYSTEM.md`.
9. Do not introduce random colors.
10. Keep the visual design bright, modern and editorial.
11. Do not turn the website into a traditional dark coffee website.

## Code structure

12. Use React components instead of one giant component.
13. Reuse existing components.
14. Don't modify unrelated files.

## Motion & WebGL

15. Don't add generic fade/slide animations everywhere.
16. Use GSAP, ScrollTrigger, Lenis and Three.js intentionally.
17. Prioritize visual interaction over text animation.
18. Keep WebGL performant and responsive.
19. Respect accessibility and `prefers-reduced-motion`.

## Process

20. Before implementing a large change, inspect the existing code first.
