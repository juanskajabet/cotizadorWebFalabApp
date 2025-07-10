import { Component } from '@angular/core';
import { Auth } from '../../auth/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  error = false;

  constructor(private auth: Auth, private router: Router) { }

  onLogin() {
  if (this.auth.login(this.username, this.password)) {
    this.error = false;
    this.router.navigate(['/index']);
  } else {
    this.error = true;
    setTimeout(() => {
      this.error = false;
    }, 3000);
  }
}

}
