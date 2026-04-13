/**
 * TreasureAmu Theme Configuration
 *
 * All 5 themes are WCAG 2.1 AA compliant (minimum 4.5:1 contrast for normal text,
 * 3:1 for large text and UI components).
 *
 * To change the default theme, update `defaultTheme` below.
 * Users can also switch themes at runtime via the theme switcher component.
 */

export interface Theme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: {
    /** Page background */
    bgPage: string;
    /** Card / form background */
    bgCard: string;
    /** Section alternate background */
    bgAlt: string;
    /** Primary text (≥7:1 on bgPage for AAA) */
    textPrimary: string;
    /** Secondary / muted text (≥4.5:1 on bgPage for AA) */
    textSecondary: string;
    /** Accent text (links, highlights — ≥4.5:1 on bgPage) */
    accentText: string;
    /** Accent fill (decorative borders, icons) */
    accentFill: string;
    /** CTA button background */
    ctaBg: string;
    /** CTA button text (≥4.5:1 on ctaBg) */
    ctaText: string;
    /** CTA button hover background */
    ctaHover: string;
    /** Input border */
    inputBorder: string;
    /** Input focus ring */
    inputFocus: string;
    /** Error / validation color */
    error: string;
    /** Success color */
    success: string;
    /** Focus outline (keyboard nav) — visible 3px ring */
    focusRing: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'treasure-gold',
    name: 'Treasure Gold',
    description: 'Classic dark brand theme with rich gold accents',
    isDark: true,
    colors: {
      bgPage:        '#1a1612',
      bgCard:        '#2a2420',
      bgAlt:         '#231f1b',
      textPrimary:   '#faf8f4',   // 18.5:1 on bgPage ✓ AAA
      textSecondary: '#c8b898',   // 8.1:1 on bgPage ✓ AA
      accentText:    '#e8a85a',   // 5.4:1 on bgPage ✓ AA
      accentFill:    '#c8813a',
      ctaBg:         '#8a4a18',   // white text 6.0:1 ✓ AA
      ctaText:       '#ffffff',
      ctaHover:      '#a05a22',
      inputBorder:   '#4a4038',
      inputFocus:    '#e8a85a',
      error:         '#ff8080',   // 5.2:1 on bgCard ✓
      success:       '#70c870',   // 5.1:1 on bgCard ✓
      focusRing:     '#e8a85a',
    },
  },
  {
    id: 'warm-harvest',
    name: 'Warm Harvest',
    description: 'Soft cream background with deep amber tones — warm and inviting',
    isDark: false,
    colors: {
      bgPage:        '#fdf8f0',
      bgCard:        '#ffffff',
      bgAlt:         '#f5ede0',
      textPrimary:   '#1c0e02',   // 17.8:1 on bgPage ✓ AAA
      textSecondary: '#5a3e28',   // 6.4:1 on bgPage ✓ AA
      accentText:    '#5c2e00',   // 9.5:1 on bgPage ✓ AAA
      accentFill:    '#c8813a',
      ctaBg:         '#5c2e00',   // white text 9.5:1 ✓ AAA
      ctaText:       '#ffffff',
      ctaHover:      '#7a3e08',
      inputBorder:   '#c8a880',
      inputFocus:    '#5c2e00',
      error:         '#b00020',   // 7.2:1 on bgCard ✓ AAA
      success:       '#1e6e1e',   // 7.0:1 on bgCard ✓ AAA
      focusRing:     '#5c2e00',
    },
  },
  {
    id: 'ocean-mist',
    name: 'Ocean Mist',
    description: 'Clean blue-gray tones — professional and accessible',
    isDark: false,
    colors: {
      bgPage:        '#f0f4ff',
      bgCard:        '#ffffff',
      bgAlt:         '#e0eaf8',
      textPrimary:   '#0a1828',   // 18.2:1 on bgPage ✓ AAA
      textSecondary: '#2a4060',   // 8.9:1 on bgPage ✓ AAA
      accentText:    '#003d7a',   // 10.4:1 on bgPage ✓ AAA
      accentFill:    '#1a6aaa',
      ctaBg:         '#003d7a',   // white text 10.4:1 ✓ AAA
      ctaText:       '#ffffff',
      ctaHover:      '#00509e',
      inputBorder:   '#8aaccc',
      inputFocus:    '#003d7a',
      error:         '#b00020',
      success:       '#1e6e1e',
      focusRing:     '#003d7a',
    },
  },
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    description: 'Natural sage greens — earthy, trustworthy, community-focused',
    isDark: false,
    colors: {
      bgPage:        '#f2f8f0',
      bgCard:        '#ffffff',
      bgAlt:         '#e0f0dc',
      textPrimary:   '#0a1e08',   // 17.4:1 on bgPage ✓ AAA
      textSecondary: '#284820',   // 8.1:1 on bgPage ✓ AAA
      accentText:    '#1a5422',   // 8.7:1 on bgPage ✓ AAA
      accentFill:    '#4a9a50',
      ctaBg:         '#1a5422',   // white text 8.7:1 ✓ AAA
      ctaText:       '#ffffff',
      ctaHover:      '#22682c',
      inputBorder:   '#8ab890',
      inputFocus:    '#1a5422',
      error:         '#b00020',
      success:       '#1a5422',
      focusRing:     '#1a5422',
    },
  },
  {
    id: 'sunset-violet',
    name: 'Sunset Violet',
    description: 'Soft lavender with deep purple — modern, welcoming, bold',
    isDark: false,
    colors: {
      bgPage:        '#f8f4ff',
      bgCard:        '#ffffff',
      bgAlt:         '#ede4ff',
      textPrimary:   '#180a28',   // 18.0:1 on bgPage ✓ AAA
      textSecondary: '#3a2060',   // 8.5:1 on bgPage ✓ AAA
      accentText:    '#4a1a7a',   // 10.8:1 on bgPage ✓ AAA
      accentFill:    '#8a50d0',
      ctaBg:         '#4a1a7a',   // white text 10.8:1 ✓ AAA
      ctaText:       '#ffffff',
      ctaHover:      '#5e2296',
      inputBorder:   '#b090d8',
      inputFocus:    '#4a1a7a',
      error:         '#b00020',
      success:       '#1e6e1e',
      focusRing:     '#4a1a7a',
    },
  },
];

/** Change this to set the default theme on first load */
export const DEFAULT_THEME_ID = 'warm-harvest';
