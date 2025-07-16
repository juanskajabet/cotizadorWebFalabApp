import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private isLoggedIn = false;

  login(username: string, password: string): boolean {
  if (username.trim() === 'fablab' && password.trim() === 'fablab') {
    this.isLoggedIn = true;
    return true;
  }
  return false;
}


  logout() {
    this.isLoggedIn = false;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

}
