import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { EventService } from 'src/app/services/event.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

type DashboardSegment = 'ALL' | 'DYNAMO' | 'QUIZWHIZZ' | 'EVENTS';
type DashboardSource = 'DYNAMO' | 'QUIZWHIZZ' | 'EVENTS';

interface DashboardRecord {
  source: DashboardSource;
  id: string;
  eventId: string;
  type: string;
  eventName: string;
  eventCode: string;
  subjectName: string;
  category: string;
  status: string;
  totalScore: number | null;
  totalExamTimeSeconds: number | null;
  completedAtText: string;
  completedAtEpoch: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  segment: DashboardSegment = 'ALL';
  isLoading: boolean = true;
  private userId: string | null = null;
  private destroy$ = new Subject<void>();

  rawCounts = { dynamo: 0, quizwhizz: 0, userEvents: 0 };

  dynamo: DashboardRecord[] = [];
  quizwhizz: DashboardRecord[] = [];
  events: DashboardRecord[] = [];

  constructor(
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private eventService: EventService,
    private router: Router,
    private dateUtilService: DateUtilService,
    private util: UtilServiceService,
  ) {}

  ngOnInit() {
    this.userService
      .getUserDetails()
      .pipe(
        filter((u: any) => !!u?.id),
        takeUntil(this.destroy$),
      )
      .subscribe((u: any) => {
        if (this.userId === u.id) return;
        this.userId = u.id;
        this.loadCompletedRecords(u.id);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  doRefresh(event: any) {
    if (this.userId) {
      this.loadCompletedRecords(this.userId);
    }
    event?.target?.complete?.();
  }

  trackById(_index: number, item: DashboardRecord) {
    return item.id;
  }

  private loadCompletedRecords(userId: string) {
    this.isLoading = true;

    const dynamo$ = this.firestore
      .collection('user_dyanmo_exam', (ref) => ref.where('userId', '==', userId))
      .snapshotChanges()
      .pipe(map((snaps: any[]) => snaps.map((s: any) => ({ id: s.payload.doc.id, ...(s.payload.doc.data() ?? {}) }))));

    const quizwhizz$ = this.firestore
      .collection('user_quizwhizz_events', (ref) => ref.where('userId', '==', userId))
      .snapshotChanges()
      .pipe(map((snaps: any[]) => snaps.map((s: any) => ({ id: s.payload.doc.id, ...(s.payload.doc.data() ?? {}) }))));

    // Contains both EVENT and EXAM. Keep only EVENT in UI (per requirement).
    const events$ = this.firestore
      .collection('user_events', (ref) => ref.where('userId', '==', userId))
      .snapshotChanges()
      .pipe(map((snaps: any[]) => snaps.map((s: any) => ({ id: s.payload.doc.id, ...(s.payload.doc.data() ?? {}) }))));

    combineLatest([dynamo$, quizwhizz$, events$])
      .pipe(
        map(([dynamo, quizwhizz, events]) => {
          this.rawCounts = {
            dynamo: Array.isArray(dynamo) ? dynamo.length : 0,
            quizwhizz: Array.isArray(quizwhizz) ? quizwhizz.length : 0,
            userEvents: Array.isArray(events) ? events.length : 0,
          };

          return {
            dynamo: this.mergeAndSort([
            ...this.normalizeRecords(
              (dynamo as any[]).filter((r: any) => this.isCompleted(r)),
              'DYNAMO',
            ),
            ...this.normalizeRecords(
              (events as any[]).filter(
                (e: any) =>
                  this.isCompleted(e) &&
                  e?.type !== 'EVENT',
              ),
              'DYNAMO',
            ),
            ]),
            quizwhizz: this.normalizeRecords(
            (quizwhizz as any[]).filter((r: any) => this.isCompleted(r)),
            'QUIZWHIZZ',
            ),
            events: this.normalizeRecords(
            (events as any[]).filter((e: any) => this.isCompleted(e) && e?.type === 'EVENT'),
            'EVENTS',
            ),
          };
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ dynamo, quizwhizz, events }) => {
        this.dynamo = dynamo;
        this.quizwhizz = quizwhizz;
        this.events = events;
        this.isLoading = false;
      });
  }

  private isCompleted(record: any): boolean {
    const status = String(record?.status ?? '').trim().toUpperCase();
    const examStatus = String(record?.examStatus ?? '').trim().toUpperCase();
    return status === 'COMPLETED' || examStatus === 'COMPLETED';
  }

  private mergeAndSort(records: DashboardRecord[]): DashboardRecord[] {
    const mapByKey = new Map<string, DashboardRecord>();
    (Array.isArray(records) ? records : []).forEach((r) => {
      const key = `${r.type}|${r.eventId}|${r.id}`;
      mapByKey.set(key, r);
    });
    return Array.from(mapByKey.values()).sort((a, b) => (b.completedAtEpoch ?? 0) - (a.completedAtEpoch ?? 0));
  }

  private normalizeRecords(records: any[], source: DashboardSource): DashboardRecord[] {
    const normalized = (Array.isArray(records) ? records : [])
      .map((r: any) => {
        const completedEpoch = Number(r?.completedAtEpoch ?? 0) || 0;
        const appearedUnix = Number(r?.appearedDateUnix ?? 0) || 0;
        const completedAtEpoch = Math.max(completedEpoch, appearedUnix);

        const completedAtText =
          r?.completedAt ??
          (r?.appearedDate ? this.dateUtilService.formatDisplayDate(r.appearedDate, 'Do MMM, YYYY') : '') ??
          '';

        const totalScoreRaw = r?.totalSecuredMark ?? r?.totalCorrectMark ?? r?.totalScore ?? null;
        const totalScore = totalScoreRaw == null ? null : Number(totalScoreRaw);

        const totalExamTimeSecondsRaw = r?.totalExamTime ?? null;
        const totalExamTimeSeconds = totalExamTimeSecondsRaw == null ? null : Number(totalExamTimeSecondsRaw);

        const id = String(r?.id ?? '');
        const rawEventId = r?.eventId;
        const eventId =
          rawEventId != null && String(rawEventId).trim() !== ''
            ? String(rawEventId)
            : source === 'DYNAMO'
              ? id
              : '';

        const record: DashboardRecord = {
          source,
          id,
          eventId,
          type: String(r?.type ?? ''),
          eventName: String(r?.eventName ?? ''),
          eventCode: String(r?.eventCode ?? ''),
          subjectName: String(r?.subjectName ?? ''),
          category: String(r?.category ?? ''),
          status: String(r?.status ?? ''),
          totalScore: Number.isFinite(totalScore as any) ? (totalScore as number) : null,
          totalExamTimeSeconds: Number.isFinite(totalExamTimeSeconds as any) ? (totalExamTimeSeconds as number) : null,
          completedAtText: String(completedAtText ?? ''),
          completedAtEpoch,
        };

        return record;
      })
      .filter((r: DashboardRecord) => !!r.id && !!r.eventId);

    return normalized.sort((a, b) => (b.completedAtEpoch ?? 0) - (a.completedAtEpoch ?? 0));
  }

  async openRecord(record: DashboardRecord) {
    if (!record?.eventId || !record?.id) {
      this.util.showToast('Record not found.', 'danger', 'bottom');
      return;
    }

    try {
      const snap: any = await this.firestore
        .collection('events')
        .doc(record.eventId)
        .get()
        .pipe(take(1))
        .toPromise();
      if (snap?.exists) {
        const event = snap.data() ?? {};
        event.id = record.eventId;
        this.eventService.setTestEvent(event);
      }
    } catch {
      // Continue navigation even if event definition is missing.
    }

    this.router.navigate([
      'home/dynamo/finalScore',
      { eventId: record.eventId, userEventId: record.id, type: record.type },
    ]);
  }

  getSectionTitle(source: DashboardSource): string {
    if (source === 'DYNAMO') return 'Completed Dynamo Exams';
    if (source === 'QUIZWHIZZ') return 'Completed Quiz-Whizz Contests';
    return 'Completed Events';
  }

  getSectionCount(source: DashboardSource): number {
    if (source === 'DYNAMO') return this.dynamo.length;
    if (source === 'QUIZWHIZZ') return this.quizwhizz.length;
    return this.events.length;
  }

  getRecordsForSource(source: DashboardSource): DashboardRecord[] {
    if (source === 'DYNAMO') return this.dynamo;
    if (source === 'QUIZWHIZZ') return this.quizwhizz;
    return this.events;
  }

  shouldShowSource(source: DashboardSource): boolean {
    if (this.segment === 'ALL') return true;
    if (this.segment === 'DYNAMO') return source === 'DYNAMO';
    if (this.segment === 'QUIZWHIZZ') return source === 'QUIZWHIZZ';
    return source === 'EVENTS';
  }

  getScoreText(record: DashboardRecord): string {
    if (record.totalScore == null) return '';
    return `${record.totalScore} pt`;
  }

  getTimeText(record: DashboardRecord): string {
    if (record.totalExamTimeSeconds == null) return '';
    if (record.source === 'DYNAMO') {
      const mins = Math.ceil(record.totalExamTimeSeconds / 60);
      return `${mins} min`;
    }
    return `${record.totalExamTimeSeconds} sec`;
  }
}
