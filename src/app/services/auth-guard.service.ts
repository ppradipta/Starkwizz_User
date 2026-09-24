import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { UserServiceService } from './user-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  token = new BehaviorSubject('');
  constructor(private authService: AuthService, private router: Router, private userService: UserServiceService) { }

  canActivate(route: ActivatedRouteSnapshot): any {
    return this.authService.checkAuth().then((user:any)=> {
      if (user) {
        return true;
      } else {
        this.router.navigate(['login']);
      }
      return null;
    }).catch(error => {
      console.log(error);
      this.router.navigate(['login']);
    });
  }


  seFCMtToken(value: string) {
    this.token.next(value)
  }
  getFCMToken() {
    return this.token.asObservable();
  }
}
