import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private started = false;
  private presented = false;
  private readonly lastShownVersionKey = 'app_update_last_shown_version_number';

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
  ) { }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.authService.getTypeParam('APP_UPDATE').pipe(take(1)).subscribe({
      next: (details: any[]) => this.maybePrompt(details?.[0]),
      error: () => {
        // Ignore update check failures (offline, permission, etc.)
      },
    });
  }

  private async maybePrompt(appDetails: any): Promise<void> {
    if (this.presented) return;

    const remoteVersionNumber = Number(appDetails?.values?.versionNumber);
    const localVersionNumber = Number(environment.versionNumber);

    if (!Number.isFinite(remoteVersionNumber) || !Number.isFinite(localVersionNumber)) return;
    if (remoteVersionNumber <= localVersionNumber) return;

    const lastShown = Number(localStorage.getItem(this.lastShownVersionKey));
    if (Number.isFinite(lastShown) && lastShown === remoteVersionNumber) return;

    this.presented = true;
    localStorage.setItem(this.lastShownVersionKey, String(remoteVersionNumber));

    const versionLabel = appDetails?.values?.version ?? String(remoteVersionNumber);
    const updateUrl: string | undefined = appDetails?.values?.url;
    const buttonText = updateUrl ? 'Update' : 'OK';

    const alert = await this.alertController.create({
      message: `Get the latest App Version (${versionLabel}). Updates available for you`,
      cssClass: 'customAlert updateVersion',
      header: 'Update App',
      backdropDismiss: false,
      buttons: [{
        text: buttonText,
        handler: () => {
          if (updateUrl) window.open(updateUrl);
        },
      }],
    });

    await alert.present();
  }
}

