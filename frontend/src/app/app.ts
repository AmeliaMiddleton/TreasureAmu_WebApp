import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  // Inject ThemeService here so it initializes and applies the theme immediately
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    // ThemeService effect triggers on construction — nothing extra needed here
  }
}
