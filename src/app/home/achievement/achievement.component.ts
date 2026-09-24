import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { map, take } from 'rxjs/operators';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserServiceService } from 'src/app/services/user-service.service';
import {
  computePercentage,
  buildQuizwhizzDigitalBadgeRecord,
  getQuizwhizzBadgeAssetPath,
  getQuizwhizzBadgeRule,
  getQuizwhizzContestLevel,
} from 'src/app/common/util/quizwhizz-digital-badge.util';

declare var cordova: any;

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss'],
})
export class AchievementComponent  implements OnInit {
  userDetails: any = {};
  quizwhizzBadges: any[] = [];
  loadingBadges: boolean = true;
  private attemptedBadgeBackfill = new Set<string>();

  constructor(
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private socialSharing: SocialSharing,
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      if (this.userDetails?.id) {
        this.loadQuizwhizzBadges();
      }
    });
  }

  private loadQuizwhizzBadges() {
    this.loadingBadges = true;
    this.firestore
      .collection(FirebaseCollection.QUIZWHIZZ_DIGITAL_BADGES, ref => ref.where('userId', '==', this.userDetails.id))
      .snapshotChanges()
      .pipe(
        map((actions: any[]) =>
          (actions || []).map((a: any) => {
            const data = typeof a?.payload?.doc?.data === 'function' ? a.payload.doc.data() : a?.payload?.doc?.data;
            const docId = String(a?.payload?.doc?.id || '').trim();
            const record: any = { ...(data || {}) };
            if (!record.id && docId) record.id = docId;
            return record;
          })
        )
      )
      .subscribe(
        (badges: any[]) => {
          const list = badges || [];

          // Deduplicate by contestDate (historically we may have multiple docs for the same day).
          // Prefer records that contain real totals (so Result/Terminal Point can be computed correctly).
          const byDate = new Map<string, any>();
          list.forEach((b: any) => {
            const key = String(b?.contestDate || '').trim() || String(b?.id || '').trim();
            const existing = byDate.get(key);
            if (!existing) {
              byDate.set(key, b);
              return;
            }
            const quality =
              (this.getBadgeTotalScore(b) > 0 ? 1 : 0) +
              (this.getBadgeTotalMarks(b) > 0 ? 1 : 0);
            const existingQuality =
              (this.getBadgeTotalScore(existing) > 0 ? 1 : 0) +
              (this.getBadgeTotalMarks(existing) > 0 ? 1 : 0);
            const created = Number(b?.createdAtEpoch ?? 0) || 0;
            const existingCreated = Number(existing?.createdAtEpoch ?? 0) || 0;

            if (quality > existingQuality || (quality === existingQuality && created > existingCreated)) {
              byDate.set(key, b);
            }
          });

          this.quizwhizzBadges = Array.from(byDate.values()).sort(
            (a: any, b: any) => Number(b?.createdAtEpoch ?? 0) - Number(a?.createdAtEpoch ?? 0)
          );
          this.tryBackfillBadgesWithMissingMarks(this.quizwhizzBadges);
          this.loadingBadges = false;
        },
        () => {
          this.quizwhizzBadges = [];
          this.loadingBadges = false;
        }
      );
  }

  private tryBackfillBadgesWithMissingMarks(badges: any[]) {
    const list = Array.isArray(badges) ? badges : [];
    list.forEach((badge) => {
      const id = String(badge?.id || '').trim();
      if (!id || this.attemptedBadgeBackfill.has(id)) return;

      const hasScore = this.getBadgeTotalScore(badge) > 0;
      const hasMarks = this.getBadgeTotalMarks(badge) > 0;
      if (hasScore && hasMarks) return;

      const contestDate = String(badge?.contestDate || '').trim();
      const boardId = String(badge?.boardId || this.userDetails?.boardId || '').trim();
      const classId = String(badge?.classId || this.userDetails?.classId || '').trim();
      const userId = String(badge?.userId || '').trim();
      if (!contestDate || !boardId || !classId || !userId) return;

      this.attemptedBadgeBackfill.add(id);

      const contestId = `quizwhizz_sunday_${contestDate}_${boardId || 'board'}_${classId || 'class'}`;

      // 1) Prefer merged Sunday record when present.
      this.firestore
        .collection(FirebaseCollection.USER_QUIZWHIZZ_EVENTS, (ref) =>
          ref.where('userId', '==', userId).where('eventId', '==', contestId).limit(1)
        )
        .get()
        .pipe(take(1))
        .subscribe(
          (mergedSnap: any) => {
            let merged: any | null = null;
            mergedSnap?.forEach?.((doc: any) => {
              merged = typeof doc?.data === 'function' ? doc.data() : doc?.data;
            });

            const mergedStatus = String(merged?.status ?? merged?.examStatus ?? '').toUpperCase();
            if (merged && mergedStatus === 'COMPLETED') {
              const mergedScore = Number(merged?.totalSecuredMark ?? 0) || 0;
              let mergedMarks =
                Number(merged?.totalMarks ?? 0) ||
                Number(merged?.eventMarks ?? 0) ||
                0;
              if (!mergedMarks) mergedMarks = 50;

              this.saveRebuiltBadge({
                userId,
                boardId,
                classId,
                contestDate,
                createdAtEpoch: Number(badge?.createdAtEpoch ?? 0) || Date.now(),
                totalScore: mergedScore,
                totalMarks: mergedMarks,
              });
              return;
            }

            // 2) Fallback: try finding user attempt records for this date directly (field names vary across older data).
            const tryUserRecordsForDate = (field: 'eventDate' | 'eventEndDate') =>
              new Promise<any[]>((resolve) => {
                this.firestore
                  .collection(FirebaseCollection.USER_QUIZWHIZZ_EVENTS, (ref) =>
                    ref.where('userId', '==', userId).where(field, '==', contestDate)
                  )
                  .get()
                  .pipe(take(1))
                  .subscribe(
                    (snap: any) => {
                      const records: any[] = [];
                      snap?.forEach?.((doc: any) => records.push(doc.data()));
                      resolve(records);
                    },
                    () => resolve([]),
                  );
              });

            (async () => {
              const directCandidates = [
                ...(await tryUserRecordsForDate('eventDate')),
                ...(await tryUserRecordsForDate('eventEndDate')),
              ];
              const completedDirect = (directCandidates || []).filter((r) => {
                const st = String(r?.status ?? r?.examStatus ?? '').toUpperCase();
                return st === 'COMPLETED';
              });
              if (completedDirect.length > 0) {
                let sumScore = 0;
                let sumMarks = 0;
                let sumQuestions = 0;
                completedDirect.forEach((r) => {
                  sumScore += Number(r?.totalSecuredMark ?? 0) || 0;
                  sumMarks += Number(r?.totalMarks ?? 0) || Number(r?.eventMarks ?? 0) || 0;
                  sumQuestions += Number(r?.totalAppearQuesiton ?? 0) || 0;
                });
                if (!Number.isFinite(sumMarks) || sumMarks <= 0) {
                  sumMarks = sumQuestions > 0 ? sumQuestions * 2 : 50;
                }
                if (sumScore > 0) {
                  this.saveRebuiltBadge({
                    userId,
                    boardId,
                    classId,
                    contestDate,
                    createdAtEpoch: Number(badge?.createdAtEpoch ?? 0) || Date.now(),
                    totalScore: sumScore,
                    totalMarks: sumMarks,
                  });
                  return;
                }
              }

              // 3) Fallback: sum per-subject attempts by event ids for that day.
            this.firestore
              .collection(FirebaseCollection.EVENTS, (ref) =>
                ref
                  .where('type', '==', 'QUIZWHIZZ EXAM')
                  .where('eventEndDate', '==', contestDate)
                  .where('classId', '==', classId)
                  .where('boardId', '==', boardId)
              )
              .get()
              .pipe(take(1))
              .subscribe(
                async (eventsSnap: any) => {
                  const eventIds: string[] = [];
                  const marksById = new Map<string, number>();
                  eventsSnap?.forEach?.((doc: any) => {
                    const docId = String(doc?.id || '').trim();
                    const data = typeof doc?.data === 'function' ? doc.data() : doc?.data;
                    if (docId) eventIds.push(docId);
                    if (docId) marksById.set(docId, Number(data?.eventMarks ?? 0) || 0);
                  });

                  if (eventIds.length === 0) return;

                  const userRecords: any[] = [];
                  for (let i = 0; i < eventIds.length; i += 10) {
                    const chunk = eventIds.slice(i, i + 10);
                    // eslint-disable-next-line no-await-in-loop
                    await new Promise<void>((resolve) => {
                      this.firestore
                        .collection(FirebaseCollection.USER_QUIZWHIZZ_EVENTS, (ref) =>
                          ref.where('userId', '==', userId).where('eventId', 'in', chunk)
                        )
                        .get()
                        .pipe(take(1))
                        .subscribe(
                          (snap: any) => {
                            snap?.forEach?.((doc: any) => userRecords.push(doc.data()));
                            resolve();
                          },
                          () => resolve(),
                        );
                    });
                  }

                  const completed = userRecords.filter((r) => {
                    const st = String(r?.status ?? r?.examStatus ?? '').toUpperCase();
                    return st === 'COMPLETED';
                  });
                  if (completed.length === 0) return;

                  let sumScore = 0;
                  let sumMarks = 0;
                  let sumQuestions = 0;
                  completed.forEach((r) => {
                    const score = Number(r?.totalSecuredMark ?? 0) || 0;
                    sumScore += score;
                    const marks =
                      Number(r?.totalMarks ?? 0) ||
                      Number(marksById.get(String(r?.eventId || '').trim()) ?? 0) ||
                      0;
                    sumMarks += marks;
                    sumQuestions += Number(r?.totalAppearQuesiton ?? 0) || 0;
                  });

                  if (!Number.isFinite(sumMarks) || sumMarks <= 0) {
                    sumMarks = sumQuestions > 0 ? sumQuestions * 2 : 50;
                  }

                  if (sumScore <= 0) return;

                  this.saveRebuiltBadge({
                    userId,
                    boardId,
                    classId,
                    contestDate,
                    createdAtEpoch: Number(badge?.createdAtEpoch ?? 0) || Date.now(),
                    totalScore: sumScore,
                    totalMarks: sumMarks,
                  });
                },
                () => undefined,
              );
            })().catch(() => undefined);
          },
          () => undefined,
        );
    });
  }

  private saveRebuiltBadge(args: {
    userId: string;
    boardId: string;
    classId: string;
    contestDate: string;
    createdAtEpoch: number;
    totalScore: number;
    totalMarks: number;
  }) {
    const rebuilt = buildQuizwhizzDigitalBadgeRecord(args);
    if (!rebuilt) return;

    this.firestore
      .collection(FirebaseCollection.QUIZWHIZZ_DIGITAL_BADGES)
      .doc(rebuilt.id)
      .set(rebuilt, { merge: true })
      .catch(() => undefined);
  }

  getBadgeImage(badge: any): string {
    return getQuizwhizzBadgeAssetPath(badge?.badgeName);
  }

  private getBadgeTotalScore(badge: any): number {
    return (
      Number(badge?.totalScore ?? 0) ||
      Number(badge?.totalSecuredMark ?? 0) ||
      0
    );
  }

  private getBadgeTotalMarks(badge: any): number {
    return (
      Number(badge?.totalMarks ?? 0) ||
      Number(badge?.eventMarks ?? 0) ||
      Number(badge?.totalMark ?? 0) ||
      Number(badge?.totalPoints ?? 0) ||
      0
    );
  }

  getBadgeResultPercentage(badge: any): number {
    const totalScore = this.getBadgeTotalScore(badge);
    const totalMarks = this.getBadgeTotalMarks(badge);
    if (totalMarks > 0) {
      const pct = computePercentage(totalScore, totalMarks);
      return Math.round(pct);
    }

    const stored = Number(badge?.percentage);
    return Number.isFinite(stored) ? Math.round(stored) : 0;
  }

  getBadgeTerminalPoint(badge: any): number {
    const totalScore = this.getBadgeTotalScore(badge);

    // Prefer recomputing bonus from totals when possible (some historical records may have `percentage`/`bonusPoint` saved incorrectly).
    const totalMarks = this.getBadgeTotalMarks(badge);
    const contestLevel = (badge?.contestLevel as any) || getQuizwhizzContestLevel(badge?.contestDate);
    if (totalMarks > 0 && contestLevel) {
      const pct = this.getBadgeResultPercentage(badge);
      const rule = getQuizwhizzBadgeRule(pct);
      const recomputedBonus = contestLevel === 'Horse Ride' ? rule.horseBonusPoint : rule.turtleBonusPoint;
      return totalScore + (Number(recomputedBonus) || 0);
    }

    const bonusPoint = Number(badge?.bonusPoint ?? 0) || 0;
    return totalScore + bonusPoint;
  }

  async shareBadge(badge: any) {
    const resultPct = this.getBadgeResultPercentage(badge);
    const terminalPoint = this.getBadgeTerminalPoint(badge);
    const text =
      `Quiz-Whizz Digital Badge\n` +
      `Badge: ${badge?.badgeName ?? '-'}\n` +
      `Contest Level: ${badge?.contestLevel ?? '-'}\n` +
      `Contest Date: ${badge?.contestDate ?? '-'}\n` +
      `Result: ${resultPct}%\n` +
      `Terminal Point: ${terminalPoint}\n` +
      `\nGet Starkwizz: https://play.google.com/store/apps/details?id=com.lavni.starkwizz`;

    const relativeAsset = this.getBadgeImage(badge); // assets/...
    let fileAttachment: string = '';

    // Prefer writing a real file to cache and sharing that path (more reliable than app/www paths).
    try {
      const resp = await fetch(relativeAsset);
      const svgText = await resp.text();
      const base64 = btoa(unescape(encodeURIComponent(svgText)));
      const safeId = String(badge?.id ?? `${badge?.contestDate ?? 'contest'}_${badge?.badgeName ?? 'badge'}`)
        .replace(/[^\w-]/g, '_')
        .slice(0, 64);
      const filename = `quizwhizz-badge-${safeId}.svg`;
      const write = await Filesystem.writeFile({
        path: filename,
        data: 'data:image/svg+xml;base64,' + base64,
        directory: Directory.Cache,
        recursive: true,
      });
      if (write?.uri) fileAttachment = write.uri;
    } catch {
      // ignore and fall back
    }

    try {
      // Android/iOS (Cordova/Capacitor webview with cordova-plugin-file) can access packaged assets via www path.
      if (typeof cordova !== 'undefined' && cordova?.file?.applicationDirectory) {
        const noLeadingSlash = relativeAsset.startsWith('/') ? relativeAsset.slice(1) : relativeAsset;
        if (!fileAttachment) fileAttachment = cordova.file.applicationDirectory + 'www/' + noLeadingSlash;
      }
    } catch {
      // ignore
    }

    this.socialSharing
      .share(text, 'Quiz-Whizz Digital Badge', fileAttachment || '', 'https://play.google.com/store/apps/details?id=com.lavni.starkwizz')
      .catch(() => undefined);
  }

}
