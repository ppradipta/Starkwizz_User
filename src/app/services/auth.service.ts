import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, map } from 'rxjs';
import { UserServiceService } from './user-service.service';
export class AuthInfo {
  constructor(public $uid: string) { }
  isLoggedIn() {
    return !!this.$uid;
  }
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  appVerifier: any;
  static UNKNOWN_USER = new AuthInfo({} as any);
  public authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(AuthService.UNKNOWN_USER);
  confirmationResult: firebase.auth.ConfirmationResult = {} as firebase.auth.ConfirmationResult;
  constructor(
    private fireAuth: AngularFireAuth,
    private userService: UserServiceService,
    private db: AngularFirestore,

  ) { }

    recaptcha() {
    this.appVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
      size: 'invisible',
      callback: (response: any) => {
        console.log('resp', response);


      },
      'expired-callback': (exp: any) => {
        console.log('exp', exp);
      }
    });
  }

  async signInWithPhoneNumber(phoneNumber) {
    try {
      if (!this.appVerifier) this.recaptcha();
      const confirmationResult = await this.fireAuth.signInWithPhoneNumber(phoneNumber, this.appVerifier);
      this.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch (e) {
      throw (e);
    }
  }


  // public signInWithPhoneNumber(recaptchaVerifier: any, phoneNumber: any) {
  //   this.fireAuth.settings.then(result => {
  //     result.appVerificationDisabledForTesting = true;
  //   });
  //   return new Promise<any>((resolve, reject) => {
  //     this.fireAuth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
  //       .then((confirmationResult) => {
  //         this.confirmationResult = confirmationResult;
  //         resolve(confirmationResult);
  //       }).catch((error) => {
  //         console.log(error);
  //         reject('SMS not sent');
  //       });
  //   });
  // }

  public signInWithEmailPassword(email: any, password: any) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(email, password).then((confirmationResult) => {
        resolve(confirmationResult);
      }).catch((error) => {
        console.log(error);
        reject('SMS not sent');
      });
    });
  }

  public async enterVerificationCode(code: any) {
    return new Promise<any>((resolve, reject) => {
      this.confirmationResult.confirm(code).then(async (result) => {
        const user = result.user;
        resolve(user);
      }).catch((error) => {
        reject(error.message);
      });

    });
  }

  public login(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch(err => {
          this.authInfo$.next(AuthService.UNKNOWN_USER);
          reject(`login failed ${err}`);
        });
    });
  }

  public resetPassword(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.sendPasswordResetEmail(email)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(`reset failed ${err}`);
        });
    });
  }

  public checkAuth() {
    return new Promise((resolve, reject) => {
      this.fireAuth.onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        } else {
          this.userService.setUserDetails({} as any);
          this.logout();
          //localStorage.clear();
          this.userService.setUserDetails({} as any);
          resolve(false);
        }
      }).catch(err => {
        reject(`reset failed ${err}`);
      });
    });
  }
  public logout(): Promise<void> {
    this.authInfo$.next(AuthService.UNKNOWN_USER);
    // this.userService.setUserDetails({} as any);
    return this.fireAuth.signOut();
  }

  getTypeParam(type) {
    return this.db.collection<any>('parameter_types', ref =>
      ref.where("type", "==", type)).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          return a.payload.doc.data() as any;
        }))
      );
  }

  
  getComboSubscription() {
    return this.db.collection<any>('combo_offers_subscription', ref =>
      ref.where("status", "==", 'ACTIVE')).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          return a.payload.doc.data() as any;
        }))
      );
  }

  getFreeTrialSubscription(boardId: string, classId:string) {
    return this.db.collection<any>('freeTrial_subscription', ref =>
      ref.where("boardId", "==", boardId)
      .where("classId", "==", classId)).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          return a.payload.doc.data() as any;
        }))
      );
  }
}
