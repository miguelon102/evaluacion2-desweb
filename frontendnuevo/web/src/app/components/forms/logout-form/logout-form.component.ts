import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout.form',
  standalone: true,
  templateUrl: './logout-form.component.html',
  styleUrl: './logout-form.component.scss'
})
export class LogoutFormComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Le pedimos a Django que destruya el token en su base de datos
    this.apiService.post('core/logout/', {}).subscribe({
      next: () => this.finalizar(),
      error: () => this.finalizar()
    });
  }

  finalizar() {
    // Destruimos la llave del navegador y volvemos a inicio
    this.authService.logoutLocal();
    this.router.navigate(['/home']);
  }
}