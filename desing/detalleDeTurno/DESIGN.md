# Design System Document: Security Management Architecture

## 1. Overview & Creative North Star: "The Sentinel’s Lens"

In the high-stakes environment of security management, cognitive load is the enemy. This design system moves away from the cluttered, "boxed-in" aesthetic of traditional enterprise software. Our Creative North Star is **The Sentinel’s Lens**: an interface that feels like a precision instrument—authoritative, expansive, and hyper-legible.

We break the "standard dashboard" mold by replacing rigid 1px containment lines with **Tonal Architecture**. By using layered surfaces and intentional asymmetry, we guide the eye to critical alerts without visual noise. This is not just a dashboard; it is a high-end editorial experience for mission-critical data.

---

## 2. Colors & Surface Philosophy

The palette is rooted in a deep, authoritative `primary` (#000666) to establish trust, while `secondary` blues and `tertiary` greens provide the functional clarity needed for rapid monitoring.

### The "No-Line" Rule
To achieve a premium, custom feel, **1px solid borders are strictly prohibited** for sectioning. Boundaries are defined through background color shifts.
- **Example:** A `surface_container_low` sidebar sitting against a `surface` main content area creates a clean, architectural break without the "cheap" look of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of layered materials.
- **Base Layer:** `surface` (#f9f9fb)
- **Primary Layout Blocks:** `surface_container_low` (#f3f3f5)
- **Interactive Elements/Cards:** `surface_container_lowest` (#ffffff)
- **Deep Context/Modals:** `surface_container_high` (#e8e8ea)

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating elements like temporary filter panels or hover-state tooltips. Use a semi-transparent `surface` color with a `backdrop-filter: blur(12px)`. For main CTAs, use a subtle linear gradient from `primary` (#000666) to `primary_container` (#1a237e) at a 135° angle to add "soul" and depth to the action.

---

## 3. Typography: Editorial Authority

We utilize **Inter** for its neutral, high-readability character, but we apply it with editorial intentionality—high contrast in scale and weight to establish an immediate information hierarchy.

- **Display (Large/Medium):** Reserved for high-level security posture KPIs. Use `display-md` (2.75rem) with `-0.02em` letter spacing for a "command center" feel.
- **Headlines:** Use `headline-sm` (1.5rem) for major module titles (e.g., "Active Incident Feed").
- **Body:** `body-md` (0.875rem) is our workhorse for data density.
- **Labels:** `label-sm` (0.6875rem) must be used in `ALL CAPS` with `+0.05em` letter spacing for metadata and table headers to distinguish them from actionable data.

---

## 4. Elevation & Depth: Tonal Layering

We convey importance through light and layering, not structural lines.

- **The Layering Principle:** Instead of a shadow, place a `surface_container_lowest` card on a `surface_container_low` background. This creates a "soft lift" that feels integrated into the OS.
- **Ambient Shadows:** For floating modals (e.g., incident details), use a highly diffused shadow: `box-shadow: 0 12px 40px rgba(26, 28, 29, 0.06)`. The shadow is a tinted version of `on_surface` to mimic natural light.
- **The "Ghost Border" Fallback:** If accessibility requires a container edge (e.g., in high-density data tables), use a **Ghost Border**: `outline_variant` at 15% opacity.

---

## 5. Components

### Action Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `DEFAULT` (0.25rem) radius. White text (`on_primary`).
- **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
- **Tertiary:** Ghost style. No background; `secondary` (#0056c5) text weight 600.

### Status Badges (The "Signal" System)
Status badges use a high-contrast pill shape (`full` roundedness) with a 10% opacity background of the signal color and a 100% opacity text color for maximum legibility.
- **Active:** `tertiary_container` (Green) text.
- **Overtime/Late:** `error` (Red) text.
- **Pending:** `on_secondary_fixed_variant` (Blue) text.

### Data Tables & Lists
- **Forbid Dividers:** Do not use horizontal lines between rows. Use `spacing-2` (0.4rem) of vertical white space and a subtle background hover state (`surface_container_high`).
- **Density:** Use `body-sm` for table content to allow for high-density viewing without crowding. Headers use `label-md` in `outline` color.

### Robust Filter Panels
- Filter panels should slide in as a "Sheet" using `surface_container_lowest`. 
- Use `xl` (0.75rem) roundedness for the inner corners to soften the enterprise edge.

### Input Fields
- **Style:** Subtle `surface_container_low` fill. No border. On focus, transition to a `secondary` 1px bottom-border only. This maintains the "No-Line" rule while providing clear interactive feedback.

---

## 6. Do's and Don'ts

### Do
- **DO** use asymmetry. Large data visualizations can be offset by smaller, dense metadata lists to create visual interest.
- **DO** use the `spacing-8` (1.75rem) and `spacing-10` (2.25rem) tokens to create "breathing room" between major modules.
- **DO** use `tertiary` (Success Green) sparingly to highlight "All Clear" states.

### Don't
- **DON'T** use 100% black text. Always use `on_surface` (#1a1c1d) for a softer, more professional contrast.
- **DON'T** use 1px dividers to separate card content. Use a `surface_variant` background shift or increased padding.
- **DON'T** use standard "drop shadows" on buttons. If a button needs elevation, use a subtle glow of its own primary color.

---

## 7. Spacing Logic
Our spacing follows a tight 0.2rem increment scale to allow for the data density required by security professionals.
- **Component Internals:** Use `spacing-2` (0.4rem) or `spacing-3` (0.6rem).
- **Module Spacing:** Use `spacing-6` (1.3rem) to group related security metrics.
- **Page Margins:** Use `spacing-12` (2.75rem) to ensure the interface feels expansive and premium.