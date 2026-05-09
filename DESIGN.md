---
name: LA Science Fair Design System
colors:
  surface: "#fbf9f8"
  surface-dim: "#dbdad9"
  surface-bright: "#fbf9f8"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f5f3f3"
  surface-container: "#efeded"
  surface-container-high: "#e9e8e7"
  surface-container-highest: "#e4e2e2"
  on-surface: "#1b1c1c"
  on-surface-variant: "#43474f"
  inverse-surface: "#303031"
  inverse-on-surface: "#f2f0f0"
  outline: "#737780"
  outline-variant: "#c3c6d1"
  surface-tint: "#3a5f94"
  primary: "#001e40"
  on-primary: "#ffffff"
  primary-container: "#003366"
  on-primary-container: "#799dd6"
  inverse-primary: "#a7c8ff"
  secondary: "#575f65"
  on-secondary: "#ffffff"
  secondary-container: "#dbe3ea"
  on-secondary-container: "#5d656b"
  tertiary: "#002131"
  on-tertiary: "#ffffff"
  tertiary-container: "#00374f"
  on-tertiary-container: "#0ea6e3"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#d5e3ff"
  primary-fixed-dim: "#a7c8ff"
  on-primary-fixed: "#001b3c"
  on-primary-fixed-variant: "#1f477b"
  secondary-fixed: "#dbe3ea"
  secondary-fixed-dim: "#bfc8ce"
  on-secondary-fixed: "#151d22"
  on-secondary-fixed-variant: "#40484d"
  tertiary-fixed: "#c6e7ff"
  tertiary-fixed-dim: "#81cfff"
  on-tertiary-fixed: "#001e2d"
  on-tertiary-fixed-variant: "#004c6b"
  background: "#fbf9f8"
  on-background: "#1b1c1c"
  surface-variant: "#e4e2e2"
typography:
  headline-xl:
    fontFamily: Public Sans
    fontSize: 40px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.3"
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 28px
    fontWeight: "600"
    lineHeight: "1.3"
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style

The brand personality of this design system is authoritative, intellectual, and highly organized. It is designed to serve a dual audience: the academic rigor required by judges and educators, and the clarity required by students and parents. The visual language leans into a **Modern Corporate** aesthetic with a strong emphasis on **Minimalism**.

The UI should evoke a sense of calm and focus, achieved through "breathable" layouts and a strict adherence to a logic-driven information hierarchy. Emotional responses should center on trust, precision, and the excitement of scientific discovery without falling into "childish" tropes. The style avoids heavy ornamentation, favoring thin lines, structured grids, and high-quality typography to communicate professional standards.

## Colors

The palette is rooted in a "Science Blue" foundation. The primary color (#003366) provides the "academic weight," used for navigation, headings, and primary actions. To maintain a modern feel, the system is primarily white-space driven, utilizing a clean white background to allow content to be the focal point.

- **Primary:** Deep Blue for trust and legacy.
- **Secondary:** A pale ice-blue for background fills and subtle sectioning.
- **Tertiary:** A bright, technical cyan used sparingly for data highlights or success states.
- **Neutrals:** A spectrum of grays that prioritize legibility over style, ensuring high contrast for body text and soft definition for UI borders.

## Typography

This design system utilizes two high-performance sans-serifs. **Public Sans** is chosen for headings for its institutional and stable character, conveying official status. **Inter** is used for body text and UI labels due to its exceptional legibility in data-dense environments and forms.

The type scale is generous to ensure accessibility for all age groups. Headlines use a slight negative letter-spacing to appear tighter and more professional, while body text uses a 1.6x line height to optimize for long-form academic reading. All labels for form fields and data points should use the uppercase styling of the `label-md` token for clear distinction.

## Layout & Spacing

The system employs a **Fixed Grid** philosophy for desktop to maintain a professional, journal-like layout, centering content within a 1280px max-width container. On mobile devices, the layout transitions to a fluid model with 20px side margins.

Spacing follows a strict 8px base unit. Vertical rhythm is critical: use `stack-xl` to separate major content sections (e.g., Timeline vs. Submission Feed), and `stack-md` for internal component spacing (e.g., between a label and an input). Generous whitespace is not "empty space" here—it is a functional tool to prevent cognitive overload during the fair's registration and judging phases.

## Elevation & Depth

Depth is communicated through **Low-contrast outlines** and **Tonal layering** rather than heavy shadows. This reflects the flat, modern academic style.

- **Surface Tiers:** The main background is white. Secondary content containers (like a sidebar or a feed item) use the surface color (#F8FAFC) with a 1px border (#D1D5DB).
- **Subtle Shadows:** Only "floating" elements like dropdown menus or active modals use a shadow. Use a very soft, highly diffused 10% opacity blue-tinted shadow (0px 4px 20px rgba(0, 51, 102, 0.1)).
- **Interactive States:** Buttons and cards should not "pop" with depth; instead, they should shift in background color or border weight to indicate state changes.

## Shapes

This design system uses a **Soft** shape language (0.25rem base radius). This subtle rounding takes the edge off the "strict" academic feel, making the interface more approachable for students while maintaining a serious architectural structure. Buttons and input fields use the standard `rounded` token, while larger content cards or timeline containers may use `rounded-lg` (0.5rem) to differentiate them from smaller UI elements.

## Components

- **Structured Forms:** Input fields must have visible, persistent labels using `label-md`. Use a 1px border (#D1D5DB) that thickens to 2px in the primary deep blue upon focus. Validation errors should be clear and utilize a technical red, not a bright neon red.
- **Clear Timelines:** Use a vertical 2px track in the secondary blue. Completed milestones are marked with the primary deep blue, while upcoming milestones are hollow circles with a 2px border.
- **Organized Content Feeds:** Cards should be used for student project feeds. These cards have no shadow, a 1px border, and a white background. Title text should be prominent, followed by a meta-data row (Category, Grade, Status) using `label-md`.
- **Buttons:**
  - _Primary:_ Solid deep blue (#003366) with white text.
  - _Secondary:_ Ghost style with a 1px deep blue border and deep blue text.
- **Data Chips:** Small, rectangular chips with the `rounded` radius used for project categories (e.g., "Biology," "Physics"). Use the secondary background color with primary blue text.
