import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatIconModule, MatTooltip, NgClass],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  // Detector para poner los botones en columna si estamos en móvil
  @Input() isMobile: boolean = false;
  @Output() linkClicked = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}




