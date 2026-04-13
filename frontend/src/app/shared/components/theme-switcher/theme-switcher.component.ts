import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-switcher" role="group" aria-label="Select color theme">
      <span class="theme-switcher__label" id="theme-label">Theme:</span>
      <div class="theme-switcher__options" aria-labelledby="theme-label">
        @for (theme of themeService.themes; track theme.id) {
          <button
            class="theme-swatch"
            [class.theme-swatch--active]="themeService.activeTheme().id === theme.id"
            [style.--swatch-color]="theme.colors.ctaBg"
            [attr.aria-label]="'Switch to ' + theme.name + ' theme'"
            [attr.aria-pressed]="themeService.activeTheme().id === theme.id ? 'true' : 'false'"
            [title]="theme.name + ' — ' + theme.description"
            (click)="themeService.setTheme(theme.id)"
          ></button>
        }
      </div>
    </div>
  `,
  styles: [`
    .theme-switcher {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .theme-switcher__label {
      font-size: 13px;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    .theme-switcher__options {
      display: flex;
      gap: 6px;
    }
    .theme-swatch {
      /* 44×44 touch target (WCAG 2.5.5) with 24px visual circle */
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      position: relative;
      flex-shrink: 0;
    }
    /* Colored circle rendered via pseudo-element */
    .theme-swatch::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--swatch-color);
      transform: translate(-50%, -50%);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .theme-swatch:hover::before {
      transform: translate(-50%, -50%) scale(1.15);
    }
    .theme-swatch--active::before {
      transform: translate(-50%, -50%) scale(1.2);
      box-shadow: 0 0 0 2px var(--color-text-primary);
    }
    /* Focus style for keyboard navigation */
    .theme-swatch:focus-visible {
      outline: 3px solid var(--color-focus-ring);
      outline-offset: 2px;
      border-radius: 50%;
    }
  `],
})
export class ThemeSwitcherComponent {
  readonly themeService = inject(ThemeService);
}
