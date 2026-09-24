import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EventService } from 'src/app/services/event.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-subject-appear',
  templateUrl: './subject-appear.component.html',
  styleUrls: ['./subject-appear.component.scss'],
})
export class SubjectAppearComponent implements OnInit, OnChanges {
  @Input() event: any = {} as any;
  @Input() userEventId: string = '';
  selectedSubject: any = {} as any;
  eventInstruction: any = {} as any;
  userDetails: any;
  constructor(
    public modalController: ModalController,
    private router: Router,
    private eventService: EventService,
    private firestore: AngularFirestore,
    private userService: UserServiceService
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.getEventInstructions();
    this.ensureDisplayDurations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event']) {
      this.ensureDisplayDurations();
    }
  }

  formatDurationMinutesSeconds(totalSeconds: any): string {
    const raw = Number(totalSeconds);
    if (!Number.isFinite(raw) || raw <= 0) return '-';

    const safeSeconds = Math.max(0, Math.floor(raw));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    if (minutes <= 0) return `${seconds} seconds`;
    if (seconds <= 0) return `${minutes} minutes`;
    return `${minutes} minutes ${seconds} seconds`;
  }

  private ensureDisplayDurations() {
    if (!this.event) return;

    const totalSeconds = Number(this.event?.totalHour);
    if (!String(this.event?.displayTotalHour || '').trim() && Number.isFinite(totalSeconds) && totalSeconds > 0) {
      this.event.displayTotalHour = this.formatDurationMinutesSeconds(totalSeconds);
    }

    const perQuestionSeconds = Number(this.event?.perQuestionHour);
    if (!String(this.event?.displayPerQuestionHour || '').trim() && Number.isFinite(perQuestionSeconds) && perQuestionSeconds > 0) {
      this.event.displayPerQuestionHour = this.formatDurationMinutesSeconds(perQuestionSeconds);
    }
  }

  getSelectedSubject() {
    this.eventService.getSelectedSubject().subscribe(res => {
      this.selectedSubject = res;
    });
  }

  onClickClose() {
    this.modalController.dismiss();
  }

  onClickProceed() {
    this.onClickClose();
    this.eventService.setTestEvent(this.event);
    this.router.navigate(['home/dynamo/question']);
  }

  getEventInstructions() {
    const instructionId =
      this.event?.type === 'QUIZWHIZZ EXAM'
        ? 'QUIZWHIZZ_SUNDAY_CONTEST_COMMON'
        : (this.event?.id || '');
    if (!String(instructionId || '').trim()) return;
    this.firestore.collection("event_instructions", ref => ref.where("id", "==", instructionId)).get().subscribe((data: any) => {
      data.forEach((res: any) => {
        this.eventInstruction = res.data();
      })
    });
  }
}
