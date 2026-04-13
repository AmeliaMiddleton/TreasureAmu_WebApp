import { Injectable, signal, effect } from '@angular/core';
import { THEMES, Theme, DEFAULT_THEME_ID } from '../../../theme.config';

const STORAGE_KEY = 'treasureamu-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes = THEMES;
  readonly activeTheme = signal<Theme>(this.loadInitialTheme());

  constructor() {
    // Apply CSS variables whenever theme changes
    effect(() => {
      this.applyTheme(this.activeTheme());
    });
  }

  setTheme(themeId: string): void {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      this.activeTheme.set(theme);
      try {
        localStorage.setItem(STORAGE_KEY, themeId);
      } catch {
        // Storage not available — no-op
      }
    }
  }

  private loadInitialTheme(): Theme {
    let savedId = DEFAULT_THEME_ID;
    try {
      savedId = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID;
    } catch {
      // Storage not available
    }
    return THEMES.find(t => t.id === savedId) ?? THEMES[0];
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty('--color-bg-page',        c.bgPage);
    root.style.setProperty('--color-bg-card',        c.bgCard);
    root.style.setProperty('--color-bg-alt',         c.bgAlt);
    root.style.setProperty('--color-text-primary',   c.textPrimary);
    root.style.setProperty('--color-text-secondary', c.textSecondary);
    root.style.setProperty('--color-accent-text',    c.accentText);
    root.style.setProperty('--color-accent-fill',    c.accentFill);
    root.style.setProperty('--color-cta-bg',         c.ctaBg);
    root.style.setProperty('--color-cta-text',       c.ctaText);
    root.style.setProperty('--color-cta-hover',      c.ctaHover);
    root.style.setProperty('--color-input-border',   c.inputBorder);
    root.style.setProperty('--color-input-focus',    c.inputFocus);
    root.style.setProperty('--color-error',          c.error);
    root.style.setProperty('--color-success',        c.success);
    root.style.setProperty('--color-focus-ring',     c.focusRing);
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-theme-dark', String(theme.isDark));
  }
}
