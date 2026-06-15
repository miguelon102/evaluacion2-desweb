import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatTooltip } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login.form',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule, CommonModule, MatCardModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  serverMessage = '';
  
  username = new FormControl('', [Validators.required, Validators.minLength(4)]);
  password = new FormControl('', [Validators.required, Validators.minLength(4)]);

  controlsGroup = new FormGroup({
    username: this.username,
    password: this.password,
  });

  constructor(
    private apiService: ApiService, 
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.serverMessage = '';

    this.apiService.post('core/knox_login/', this.controlsGroup.value).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0 && response.data[0].token) {
          const token = response.data[0].token;
          localStorage.setItem('knox_token', token);
          
          this.authService.username = this.username.value!; 
          this.authService.isAuthenticated = true;
          
          // LA LÍNEA CLAVE: Guardamos los grupos que nos envía el profesor
          this.authService.userGroups = response.data[0].groups;
          
          this.serverMessage = '¡Login Correcto!';
          this.router.navigate(['/map']); 
        } else {
          this.serverMessage = 'Login realizado pero no se recibió token.';
        }
      },
      error: (error: any) => {
        console.error('Error de login capturado:', error);
        let msg = 'Error de conexión.';
        if (error.error && error.error.messages) {
          msg = JSON.stringify(error.error.messages);
        } else if (error.error && error.error.non_field_errors) {
          msg = error.error.non_field_errors[0];
        }
        this.serverMessage = `Acceso denegado: ${msg}`;
      }
    });
  }
}



