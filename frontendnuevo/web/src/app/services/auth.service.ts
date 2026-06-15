import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public username: string = '';
  public isAuthenticated: boolean = false;
  public userGroups: any = null; // Aquí guardaremos los grupos que manda el profesor

  constructor() {}

  // Función que usaremos para ocultar o mostrar botones
  isEditor(): boolean {
    if (!this.userGroups) return false;
    
    // Si el profesor manda un diccionario (ej: {"editor": true})
    if (this.userGroups['editor'] === true || this.userGroups['admin'] === true) {
      return true;
    }
    
    // Si el profesor manda un array (ej: ["editor"])
    if (Array.isArray(this.userGroups)) {
      return this.userGroups.includes('editor') || this.userGroups.includes('admin');
    }
    
    return false;
  }
}



