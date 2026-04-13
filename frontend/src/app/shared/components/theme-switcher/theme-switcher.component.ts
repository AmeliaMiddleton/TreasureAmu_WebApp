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
            [style.background]="theme.colors.ctaBg"
            [attr.aria-label]="'Switch to ' + theme.name + ' theme'"
            [attr.aria-pressed]="themeService.activeTheme().id === theme.id"
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
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
      padding: 0;
    }
    .theme-swatch:hover {
      transform: scale(1.15);
    }
    .theme-swatch--active {
      border-color: var(--color-text-primary);
      transform: scale(1.2);
    }
    /* Focus style for keyboard navigation */
    .theme-swatch:focus-visible {
      outline: 3px solid var(--color-focus-ring);
      outline-offset: 2px;
    }
  `],
})
export class ThemeSwitcherComponent {
  readonly themeService = inject(ThemeService);
}
