import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-form',
  standalone: true,
  imports: [],
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
    // Intentamos avisar al backend de que cerramos sesión
    this.apiService.post('core/logout/', {}).subscribe({
      next: () => this.finalizar(),
      error: () => this.finalizar() // Si falla, cerramos igual por seguridad
    });
  }

  finalizar() {
    this.authService.logoutLocal();
    this.router.navigate(['/home']);
  }
}


