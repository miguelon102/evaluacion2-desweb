import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public username: string = '';
  public isAuthenticated: boolean = false;
  public userGroups: any[] = [];

  constructor(private apiService: ApiService) {
    this.checkSession();
  }

  // Comprueba si al recargar la página nos quedó un token vivo en el navegador
  checkSession() {
    if (localStorage.getItem('knox_token')) {
      this.apiService.post('core/isloggedin/', {}).subscribe({
        next: (response: any) => {
          if (response.ok && response.data && response.data.length > 0) {
            this.username = response.data[0].username;
            this.userGroups = response.data[0].groups || [];
            this.isAuthenticated = true;
          }
        },
        error: () => this.logoutLocal() // Si el token caducó, lo destruimos
      });
    }
  }

  // Destruye la llave de seguridad localmente
  logoutLocal() {
    this.username = '';
    this.isAuthenticated = false;
    this.userGroups = [];
    localStorage.removeItem('knox_token');
  }

  isEditor(): boolean {
    if (!this.userGroups || !Array.isArray(this.userGroups)) return false;
    
    return this.userGroups.some((grupo: any) => {
      if (grupo && typeof grupo === 'object' && grupo.name) {
        return grupo.name.toLowerCase() === 'editor' || grupo.name.toLowerCase() === 'admin';
      }
      if (typeof grupo === 'string') {
        return grupo.toLowerCase() === 'editor' || grupo.toLowerCase() === 'admin';
      }
      return false;
    });
  }
}



