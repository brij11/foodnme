# FoodTech Platform — Design System Reference
## Theme: Fresh Sustainability Minimal (Palette 03)

> **Purpose**: This document is the single source of truth for all design decisions on the FoodTech Knowledge Platform. Use this reference when generating any UI code, components, pages, emails, or visual assets for the platform. Every color, font, spacing value, and component pattern defined here should be followed consistently.

---

## 1. Brand Identity

- **Platform Name**: FoodTech Hub
- **Tagline**: Practical resources for a safer food ecosystem
- **Tone**: Calm, natural, credible. The UI should feel like a modern knowledge platform — not a lifestyle food blog.
- **Audience**: Food technology professionals, QA/QC managers, food safety auditors, students, consultants, and food businesses in India and globally.
- **Positioning**: Warm authority, sustainability-minded, approachable expertise.

---

## 2. Color System

### 2.1 Core Palette

| Token                  | Hex       | Usage                                                                 |
|------------------------|-----------|-----------------------------------------------------------------------|
| `--color-primary`      | `#4C7C59` | Main CTAs, links, navigation active states, primary buttons, key highlights |
| `--color-secondary`    | `#7FB069` | Secondary actions, progress bars, tags, hover states, success indicators |
| `--color-accent`       | `#DDA15E` | Alerts, "featured" badges, sustainability content, warm highlights     |
| `--color-background`   | `#FCFCF8` | Page background — prefer this soft neutral over pure white             |
| `--color-text`         | `#283618` | Primary text, headings, high-emphasis content                          |

### 2.2 Extended Palette

| Token                       | Hex       | Usage                                                        |
|-----------------------------|-----------|--------------------------------------------------------------|
| `--color-muted`             | `#5f6b53` | Body text, descriptions, secondary text, captions            |
| `--color-border`            | `#ece8d7` | Card borders, dividers, table borders, input borders         |
| `--color-card-bg`           | `#ffffff` | Card surfaces, form backgrounds, table backgrounds           |
| `--color-surface-light`     | `#F5F0E8` | Light tinted backgrounds, section backgrounds                |
| `--color-tag-green-bg`      | `#F1F8EC` | Green tag/badge background                                   |
| `--color-tag-green-text`    | `#3F6212` | Green tag/badge text                                         |
| `--color-tag-orange-bg`     | `#FFF3E5` | Orange/standards tag background                              |
| `--color-tag-orange-text`   | `#9A3412` | Orange/standards tag text                                    |
| `--color-tag-safe-bg`       | `#EEF6EE` | Quality/safe tag background                                  |
| `--color-tag-safe-text`     | `#166534` | Quality/safe tag text                                        |
| `--color-tag-neutral-bg`    | `#F6F5ED` | Neutral tag background (read time, meta info)                |
| `--color-tag-neutral-text`  | `#6B7280` | Neutral tag text                                             |
| `--color-error`             | `#B91C1C` | Error states, destructive actions                            |
| `--color-error-bg`          | `#FEF2F2` | Error background                                             |
| `--color-error-border`      | `#EF4444` | Error border                                                 |
| `--color-progress-bg`       | `#eef0e8` | Progress bar track background                                |

### 2.3 Color Usage Ratio

Follow the 70/20/10 rule:
- **~70%** — Neutral backgrounds (`#FCFCF8` and `#ffffff`)
- **~20%** — Primary green (`#4C7C59`) for CTAs, links, key UI elements
- **~10%** — Accent colors (`#7FB069` secondary green + `#DDA15E` earth accent)

### 2.4 CSS Variables Block

```css
:root {
  /* Core */
  --color-primary: #4C7C59;
  --color-secondary: #7FB069;
  --color-accent: #DDA15E;
  --color-background: #FCFCF8;
  --color-text: #283618;
  
  /* Extended */
  --color-muted: #5f6b53;
  --color-border: #ece8d7;
  --color-card-bg: #ffffff;
  --color-surface-light: #F5F0E8;
  
  /* Tags */
  --color-tag-green-bg: #F1F8EC;
  --color-tag-green-text: #3F6212;
  --color-tag-orange-bg: #FFF3E5;
  --color-tag-orange-text: #9A3412;
  --color-tag-safe-bg: #EEF6EE;
  --color-tag-safe-text: #166534;
  --color-tag-neutral-bg: #F6F5ED;
  --color-tag-neutral-text: #6B7280;
  
  /* Feedback */
  --color-error: #B91C1C;
  --color-error-bg: #FEF2F2;
  --color-error-border: #EF4444;
  --color-success: #7FB069;
  --color-success-bg: #F1F8EC;
  --color-warning: #DDA15E;
  --color-warning-bg: #FFF3E5;
  --color-info: #4C7C59;
  --color-info-bg: #EEF6EE;
  
  /* Misc */
  --color-progress-bg: #eef0e8;
  --shadow-card: 0 10px 30px rgba(40, 54, 24, 0.06);
  --shadow-dropdown: 0 4px 16px rgba(40, 54, 24, 0.1);
}
```

---

## 3. Typography

### 3.1 Font Stack

| Role              | Font Family       | Google Fonts Import                     | Fallback Stack                          |
|-------------------|-------------------|-----------------------------------------|-----------------------------------------|
| **Display / Hero**| Fraunces          | `Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800` | `Georgia, 'Times New Roman', serif` |
| **Headings / UI** | Inter             | `Inter:wght@400;500;600;700;800`        | `ui-sans-serif, system-ui, sans-serif`  |
| **Body / Content**| IBM Plex Sans     | `IBM+Plex+Sans:wght@300;400;500;600;700`| `ui-sans-serif, system-ui, sans-serif`  |
| **Code / Mono**   | IBM Plex Mono     | `IBM+Plex+Mono:wght@400;500`            | `ui-monospace, SFMono-Regular, Menlo, monospace` |

### 3.2 Google Fonts Import

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 3.3 Typography Scale

| Element         | Font          | Size    | Weight | Line Height | Letter Spacing | Color              | Notes                                        |
|-----------------|---------------|---------|--------|-------------|----------------|--------------------|----------------------------------------------|
| H1 / Hero       | Fraunces      | 2.5rem  | 700    | 1.1         | -0.03em        | `--color-text`     | Use ONLY for main hero headlines              |
| H2 / Section    | Inter         | 1.5rem  | 700    | 1.2         | -0.02em        | `--color-text`     | Section titles, page headers                  |
| H3 / Subsection | Inter         | 1.15rem | 700    | 1.3         | -0.01em        | `--color-text`     | Card titles, subsection headings              |
| H4 / Label      | Inter         | 0.95rem | 600    | 1.35        | 0              | `--color-text`     | Small card titles, form section headers       |
| Body            | IBM Plex Sans | 0.95rem | 400    | 1.7         | 0              | `--color-muted`    | Articles, descriptions, paragraphs            |
| Body Small      | IBM Plex Sans | 0.85rem | 400    | 1.6         | 0              | `--color-muted`    | Card descriptions, helper text                |
| Caption         | IBM Plex Sans | 0.75rem | 500    | 1.5         | 0.02em         | `--color-muted`    | Timestamps, metadata, "8 min read"            |
| Overline        | Inter         | 0.65rem | 700    | 1.4         | 0.14em         | `--color-primary`  | UPPERCASE. Section labels, category tags      |
| Button Text     | Inter         | 0.82rem | 700    | 1           | 0.01em         | (varies)           | All button labels                             |
| Nav Link        | IBM Plex Sans | 0.85rem | 500    | 1           | 0              | `--color-muted`    | Navigation items                              |
| Tag / Badge     | Inter         | 0.68rem | 700    | 1           | 0.03em         | (varies)           | All tags and badges                           |
| Stat Number     | Inter         | 2rem    | 800    | 1           | -0.02em        | `--color-primary`  | Dashboard statistics                          |
| Stat Label      | IBM Plex Sans | 0.65rem | 500    | 1           | 0.06em         | `--color-muted`    | UPPERCASE. Below stat numbers                 |

### 3.4 Typography Rules

1. **Fraunces is hero-only.** Never use Fraunces for body text, card titles, navigation, or UI elements. It appears ONLY in the main hero/display headline on each page.
2. **Inter for all interactive UI.** Buttons, tags, navigation, form labels, table headers, stat numbers — all use Inter.
3. **IBM Plex Sans for all readable content.** Blog articles, card descriptions, form helper text, nav links, body paragraphs — all use IBM Plex Sans.
4. **Never mix roles.** Don't use a body font where a heading font belongs and vice versa.

### 3.5 CSS Variables — Typography

```css
:root {
  --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-heading: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

---

## 4. Spacing System

Use a consistent 4px base grid:

| Token     | Value  | Usage                                                |
|-----------|--------|------------------------------------------------------|
| `--sp-1`  | 4px    | Tight gaps (tag text padding, icon margins)           |
| `--sp-2`  | 8px    | Small gaps (between tags, inline spacing)             |
| `--sp-3`  | 12px   | Component internal padding (tag padding)              |
| `--sp-4`  | 16px   | Standard gap (grid gaps, card inner padding)          |
| `--sp-5`  | 20px   | Card body padding, section gap small                  |
| `--sp-6`  | 24px   | Card padding, navbar padding                          |
| `--sp-8`  | 32px   | Section padding, component grid gap                   |
| `--sp-10` | 40px   | Large section padding                                 |
| `--sp-12` | 48px   | Page top/bottom padding                               |
| `--sp-16` | 64px   | Major section separators                              |

---

## 5. Border & Radius System

| Token                | Value  | Usage                                       |
|----------------------|--------|---------------------------------------------|
| `--radius-sm`        | 8px    | Small buttons, inputs, small tags            |
| `--radius-md`        | 12px   | Buttons, form inputs, selects, alerts        |
| `--radius-lg`        | 16px   | Cards, table containers, modals              |
| `--radius-xl`        | 20px   | Page sections, demo containers               |
| `--radius-full`      | 999px  | Tags, badges, pills, avatars                 |
| `--border-default`   | 1px solid var(--color-border) | Standard borders          |
| `--border-input`     | 1.5px solid var(--color-border) | Form input borders      |

---

## 6. Component Specifications

### 6.1 Navbar

```
Layout:        Flex, space-between, vertically centered
Height:        ~56px
Padding:       16px 32px
Background:    #ffffff
Border bottom: 1px solid var(--color-border)
Logo:          Inter, 800 weight, color var(--color-primary), letter-spacing -0.02em
Nav links:     IBM Plex Sans, 500 weight, 0.85rem, color var(--color-muted)
Active link:   color var(--color-text), opacity 1
CTA button:    Background var(--color-primary), color #fff, Inter 700, 0.8rem, radius 10px, padding 9px 20px
```

### 6.2 Buttons

| Variant     | Background          | Text Color          | Border                                | Hover                          |
|-------------|---------------------|---------------------|---------------------------------------|--------------------------------|
| Primary     | `--color-primary`   | `#ffffff`           | none                                  | darken 8%, translateY(-1px)    |
| Secondary   | `#ffffff`           | `--color-secondary` | 1px solid `--color-secondary`         | bg `--color-tag-safe-bg`       |
| Accent      | `--color-accent`    | `#ffffff`           | none                                  | darken 8%                      |
| Ghost       | transparent         | `--color-primary`   | none, underline, offset 3px           | darken text 10%                |
| Disabled    | `--color-border`    | `--color-muted`     | none                                  | no change, cursor not-allowed  |

**All buttons:** Inter, 700 weight, 0.82rem, padding 11px 20px, border-radius 12px.
**Small buttons:** 0.72rem, padding 6px 14px, border-radius 8px.

### 6.3 Tags / Badges

| Variant       | Background               | Text Color                |
|---------------|--------------------------|---------------------------|
| Sustainability| `--color-tag-green-bg`   | `--color-tag-green-text`  |
| Standards     | `--color-tag-orange-bg`  | `--color-tag-orange-text` |
| Quality       | `--color-tag-safe-bg`    | `--color-tag-safe-text`   |
| Neutral       | `--color-tag-neutral-bg` | `--color-tag-neutral-text`|
| Outline Green | transparent              | `--color-primary`         |
| Outline Accent| transparent              | `--color-accent`          |

**All tags:** Inter, 700 weight, 0.68rem, padding 6px 12px, border-radius 999px.
**Outline tags:** add 1.5px solid border using the text color.

### 6.4 Cards

```
Background:    var(--color-card-bg) (#ffffff)
Border:        1px solid var(--color-border)
Border radius: 16px
Padding:       20px
Shadow:        var(--shadow-card) — use sparingly, mostly for elevated/hover state
```

**Card types and their content structure:**

#### Article Card
- Tag row (category tag + read time tag)
- Title: Inter, 700 weight, 1rem
- Description: IBM Plex Sans, 0.82rem, color muted
- Optional: Author/date caption

#### Job Card
- Title row: Title (Inter 700) + Salary (color accent, Inter 700)
- Company: IBM Plex Sans, 0.78rem, muted
- Tag row: employment type + experience + skill tags

#### Expert Card
- Layout: flex row, gap 16px
- Avatar: 52x52px, radius 14px, bg primary, color white, Inter 700
- Name: Inter, 700 weight
- Role: IBM Plex Sans, 0.78rem, muted
- Rating: stars in accent color + review count in muted

#### Stat Card
- Label: Inter, 0.9rem, 600 weight
- Value: Inter, 2rem, 800 weight, color primary
- Description: IBM Plex Sans, 0.8rem, muted
- Progress bar: 8px height, radius 999px, track color `--color-progress-bg`, fill color `--color-secondary`

### 6.5 Form Elements

```
Input/Select:
  Background:     #ffffff
  Border:         1.5px solid var(--color-border)
  Border radius:  12px
  Padding:        11px 14px
  Font:           IBM Plex Sans, 0.85rem
  Color:          var(--color-text)
  Focus border:   var(--color-primary)
  Placeholder:    var(--color-muted), opacity 0.5

Label:
  Font:           Inter, 0.72rem, 600 weight
  Letter spacing: 0.03em
  Color:          var(--color-text)
  Margin bottom:  6px

Helper text:
  Font:           IBM Plex Sans, 0.72rem
  Color:          var(--color-muted), opacity 0.45

Toggle (on state):
  Background:     var(--color-primary)
  Width:          44px, Height: 24px
  Knob:           18px circle, white, 3px offset
  Label:          IBM Plex Sans, 0.82rem, 500 weight
```

### 6.6 Alerts / Notifications

| Type    | Background              | Text Color          | Border Left Color     | Icon |
|---------|-------------------------|---------------------|-----------------------|------|
| Success | `--color-success-bg`    | `--color-secondary` | `--color-secondary`   | ✓    |
| Info    | `--color-info-bg`       | `--color-primary`   | `--color-primary`     | ℹ    |
| Warning | `--color-warning-bg`    | `--color-accent`    | `--color-accent`      | ⚠    |
| Error   | `--color-error-bg`      | `--color-error`     | `--color-error-border`| ✕    |

**All alerts:** padding 14px 18px, border-radius 12px, border-left 4px solid, IBM Plex Sans 0.82rem, 500 weight, flex row with icon.

### 6.7 Tables

```
Container:      white bg, radius 16px, 1px border
Header row:     Inter, 0.65rem, 700 weight, uppercase, letter-spacing 0.06em, color muted
Body cells:     IBM Plex Sans, 0.82rem, color text
Row border:     1px solid var(--color-border)
Cell padding:   12px 14px
Status dots:    8px circle (::before pseudo), color matches status
```

### 6.8 Statistics Row

```
Layout:         Flex row, equal width items, center-aligned text
Number:         Inter, 1.6rem-2rem, 800 weight, color primary/accent/secondary
Label:          IBM Plex Sans, 0.65rem, 500 weight, uppercase, letter-spacing 0.06em, color muted
```

---

## 7. Layout & Grid

### 7.1 Page Structure

```
Max width:          1200px (content), 1400px (full-bleed sections)
Page padding:       24px horizontal (mobile), 48px (desktop)
Section spacing:    64px between major sections
Content width:      720px for article/blog content
Sidebar width:      320px (if used)
```

### 7.2 Grid System

```
Component grid:     2 columns, 1px gap (border illusion), 1 column on mobile (<768px)
Card grid:          3 columns (desktop), 2 columns (tablet), 1 column (mobile)
Card gap:           24px
```

### 7.3 Breakpoints

| Name     | Width    | Notes                              |
|----------|----------|------------------------------------|
| Mobile   | < 640px  | Single column, stacked nav         |
| Tablet   | < 768px  | 2-column grids, condensed nav      |
| Desktop  | < 1024px | Full layout                        |
| Wide     | ≥ 1200px | Max content width reached          |

---

## 8. Imagery & Iconography Guidelines

### 8.1 Photography

- Use **muted, professional photography**: labs, ingredients, production lines, quality inspection scenes
- **Avoid** vibrant food photography (that's food blogging, not food technology)
- **Avoid** stock photos with over-saturated colors or overly casual vibes
- Color-correct photos to feel slightly desaturated and warm to match the palette
- Prefer photos that show process, equipment, people in professional settings

### 8.2 Icons

- Use a consistent icon library (recommended: Lucide, Phosphor, or Heroicons)
- Icon stroke width: 1.5px–2px
- Default icon color: `--color-muted`
- Active/primary icon color: `--color-primary`
- Icon size in UI: 20px default, 16px in tags/small contexts, 24px in feature sections

### 8.3 Illustrations (if used)

- Flat, minimal line illustrations
- Use palette colors only — primary green, secondary green, accent earth
- No gradients, no 3D effects
- Match the calm, professional tone

---

## 9. Hover & Interaction States

| Element         | Default State               | Hover State                                | Active/Focus State              |
|-----------------|-----------------------------|--------------------------------------------|----------------------------------|
| Primary Button  | bg primary                  | darken 8%, translateY(-1px), brightness(1.06) | darken 12%                      |
| Secondary Button| bg white, border secondary  | bg tag-safe-bg                             | darken border 10%                |
| Ghost Link      | text primary, underline     | darken text 10%                            | darken text 15%                  |
| Card            | no shadow                   | shadow-card, translateY(-2px)              | —                                |
| Nav Link        | opacity 0.55                | opacity 0.8                                | opacity 1, color text            |
| Table Row       | transparent                 | bg surface-light at 50% opacity            | —                                |
| Form Input      | border-color border         | border-color muted                         | border-color primary, ring 2px   |
| Tag             | default bg                  | brightness(0.95)                           | —                                |

---

## 10. Dark Mode Considerations (Future)

If implementing dark mode, use these mappings:

| Light Token              | Dark Value  |
|--------------------------|-------------|
| `--color-background`     | `#1a1c16`  |
| `--color-card-bg`        | `#242620`  |
| `--color-text`           | `#e8e6df`  |
| `--color-muted`          | `#9ca38f`  |
| `--color-border`         | `#3a3d32`  |
| `--color-primary`        | `#6fa87a`  |
| `--color-secondary`      | `#95c47e`  |
| `--color-accent`         | `#e8b76e`  |
| `--color-surface-light`  | `#2a2d22`  |

---

## 11. Platform Components Mapping

How the design system maps to each FoodTech platform section:

| Platform Section       | Key Components Used                                      |
|------------------------|----------------------------------------------------------|
| **Knowledge Hub**      | Article cards, tags (Blog/Guide), overline labels, body typography |
| **FoodTech Jobs**      | Job cards, table (job board), status dots, salary accent  |
| **Templates & Resources** | Card grid, download buttons (primary), tag filters, stat cards |
| **Expert Profiles**    | Expert cards, avatar, star ratings, tags (specialization) |
| **Services**           | Hero section, CTA buttons, form elements, consulting intake |
| **Blog / Articles**    | Fraunces hero headline, IBM Plex Sans body, caption metadata |
| **Navigation**         | Navbar component, Inter font, primary CTA                 |
| **Dashboard (future)** | Stat cards, progress bars, tables, alerts                 |

---

## 12. Do's and Don'ts

### Do
- Use `#FCFCF8` as page background (not pure white) for warmth
- Keep cards on white with subtle borders
- Use Fraunces ONLY for the main hero headline per page
- Use earth accent (`#DDA15E`) sparingly — only for "featured" or "new" highlights
- Maintain generous whitespace between sections
- Use muted professional photography
- Keep tables, forms, and data UI clean and minimal

### Don't
- Don't use Fraunces for card titles, nav items, or body text
- Don't use more than 2 accent colors on a single page section
- Don't use pure black (`#000000`) for text — always use `#283618`
- Don't use saturated food photography or lifestyle imagery
- Don't apply heavy box shadows — keep them subtle or omit entirely
- Don't use bright neon greens — the palette intentionally uses muted, natural greens
- Don't mix this palette with other palette colors (blue, teal, etc.)
- Don't use gradient backgrounds — stick to flat, solid surfaces

---

## 13. Sample Code Patterns

### 13.1 HTML — Full CSS Variables Setup

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<style>
:root {
  --color-primary: #4C7C59;
  --color-secondary: #7FB069;
  --color-accent: #DDA15E;
  --color-background: #FCFCF8;
  --color-text: #283618;
  --color-muted: #5f6b53;
  --color-border: #ece8d7;
  --color-card-bg: #ffffff;
  --color-surface-light: #F5F0E8;
  
  --font-display: 'Fraunces', Georgia, serif;
  --font-heading: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;
  
  --shadow-card: 0 10px 30px rgba(40, 54, 24, 0.06);
}

body {
  font-family: var(--font-body);
  background: var(--color-background);
  color: var(--color-text);
}

h1 { font-family: var(--font-display); }
h2, h3, h4 { font-family: var(--font-heading); }
</style>
```

### 13.2 React — Tailwind Config (if using Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#4C7C59',
        secondary: '#7FB069',
        accent: '#DDA15E',
        background: '#FCFCF8',
        'text-main': '#283618',
        muted: '#5f6b53',
        border: '#ece8d7',
        'surface-light': '#F5F0E8',
        'tag-green': { bg: '#F1F8EC', text: '#3F6212' },
        'tag-orange': { bg: '#FFF3E5', text: '#9A3412' },
        'tag-safe': { bg: '#EEF6EE', text: '#166534' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'tag': '999px',
      },
    },
  },
}
```

---

## 14. Version History

| Version | Date       | Changes                                      |
|---------|------------|----------------------------------------------|
| 1.0     | 2026-03-17 | Initial theme document — Fresh Sustainability Minimal palette, typography, components, guidelines |

---

*This document should be referenced for ALL design and code generation tasks related to the FoodTech Hub platform. When building any page, component, or UI element, always cross-check colors, fonts, spacing, and component patterns against this reference.*
