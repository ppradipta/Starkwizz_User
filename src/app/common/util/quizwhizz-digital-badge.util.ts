import * as moment from 'moment-timezone';

export type QuizwhizzContestLevel = 'Turtle Drive' | 'Horse Ride';

export type QuizwhizzBadgeName =
  | 'Candy'
  | 'Popsicle'
  | 'Bubblegum'
  | 'Caramel'
  | 'Beginner'
  | 'Enthusiast'
  | 'Positive Peers'
  | 'Rising Star'
  | 'Lucky Charm'
  | 'Genius'
  | 'Grand Master';

export interface QuizwhizzBadgeRule {
  minInclusive: number;
  maxInclusive: number;
  name: QuizwhizzBadgeName;
  turtleBonusPoint: number;
  horseBonusPoint: number;
}

export interface QuizwhizzDigitalBadgeRecord {
  id: string;
  userId: string;
  boardId: string;
  classId: string;
  contestDate: string; // typically eventEndDate (YYYY-MM-DD)
  contestLevel: QuizwhizzContestLevel;
  percentage: number;
  badgeName: QuizwhizzBadgeName;
  bonusPoint: number;
  totalScore: number;
  totalMarks: number;
  createdAtEpoch: number;
  createdAt: string;
}

export const QUIZWHIZZ_BADGE_RULES: QuizwhizzBadgeRule[] = [
  { minInclusive: 0, maxInclusive: 10, name: 'Candy', turtleBonusPoint: 11, horseBonusPoint: 44 },
  { minInclusive: 11, maxInclusive: 20, name: 'Popsicle', turtleBonusPoint: 22, horseBonusPoint: 88 },
  { minInclusive: 21, maxInclusive: 30, name: 'Bubblegum', turtleBonusPoint: 33, horseBonusPoint: 132 },
  { minInclusive: 31, maxInclusive: 40, name: 'Caramel', turtleBonusPoint: 44, horseBonusPoint: 176 },
  { minInclusive: 41, maxInclusive: 50, name: 'Beginner', turtleBonusPoint: 55, horseBonusPoint: 220 },
  { minInclusive: 51, maxInclusive: 60, name: 'Enthusiast', turtleBonusPoint: 66, horseBonusPoint: 264 },
  { minInclusive: 61, maxInclusive: 70, name: 'Positive Peers', turtleBonusPoint: 77, horseBonusPoint: 308 },
  { minInclusive: 71, maxInclusive: 80, name: 'Rising Star', turtleBonusPoint: 88, horseBonusPoint: 352 },
  { minInclusive: 81, maxInclusive: 90, name: 'Lucky Charm', turtleBonusPoint: 99, horseBonusPoint: 396 },
  { minInclusive: 91, maxInclusive: 95, name: 'Genius', turtleBonusPoint: 111, horseBonusPoint: 444 },
  { minInclusive: 96, maxInclusive: 100, name: 'Grand Master', turtleBonusPoint: 222, horseBonusPoint: 555 },
];

function parseToMoment(input: any): moment.Moment | null {
  if (input == null) return null;
  if (moment.isMoment(input)) return input;
  if (input instanceof Date) return moment(input);
  if (typeof input === 'number') return moment(input);
  if (typeof input === 'object') {
    if (typeof (input as any).toDate === 'function') return moment((input as any).toDate());
    if (typeof (input as any).seconds === 'number') return moment.unix((input as any).seconds);
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const formats = ['YYYY-MM-DD', 'YYYY-MM-DD hh:mm A', 'YYYY-MM-DD HH:mm', moment.ISO_8601 as any];
    let parsed = moment(trimmed, formats, true);
    if (!parsed.isValid()) parsed = moment(trimmed);
    return parsed.isValid() ? parsed : null;
  }
  return null;
}

export function getQuizwhizzContestLevel(dateInput: any): QuizwhizzContestLevel | null {
  const dt = parseToMoment(dateInput);
  if (!dt) return null;

  const endOfMonth = dt.clone().endOf('month');
  const dayOfWeek = endOfMonth.day(); // 0=Sun ... 6=Sat
  const lastSunday = endOfMonth.clone().subtract(dayOfWeek === 0 ? 0 : dayOfWeek, 'days').format('YYYY-MM-DD');
  const eventDay = dt.format('YYYY-MM-DD');

  return eventDay === lastSunday ? 'Horse Ride' : 'Turtle Drive';
}

export function getQuizwhizzBadgeRule(percentage: number): QuizwhizzBadgeRule {
  const pct = Number.isFinite(percentage) ? Math.max(0, Math.min(100, Math.round(percentage))) : 0;
  const found = QUIZWHIZZ_BADGE_RULES.find(r => pct >= r.minInclusive && pct <= r.maxInclusive);
  return found ?? QUIZWHIZZ_BADGE_RULES[0];
}

export function computePercentage(totalScore: number, totalMarks: number): number {
  const marks = Number(totalMarks);
  const score = Number(totalScore);
  if (!Number.isFinite(marks) || marks <= 0) return 0;
  if (!Number.isFinite(score) || score <= 0) return 0;
  return Math.max(0, Math.min(100, (score * 100) / marks));
}

export function buildQuizwhizzDigitalBadgeRecord(args: {
  userId: string;
  boardId: string;
  classId: string;
  contestDate: string;
  createdAtEpoch: number;
  totalScore: number;
  totalMarks: number;
}): QuizwhizzDigitalBadgeRecord | null {
  const contestLevel = getQuizwhizzContestLevel(args.contestDate);
  if (!contestLevel) return null;

  const percentage = computePercentage(args.totalScore, args.totalMarks);
  const rule = getQuizwhizzBadgeRule(percentage);
  const bonusPoint = contestLevel === 'Horse Ride' ? rule.horseBonusPoint : rule.turtleBonusPoint;

  const safeKey = String(args.contestDate || '').replace(/[^\w-]/g, '_');
  const id = `${args.userId}_${args.classId}_${args.boardId}_${safeKey}`;

  return {
    id,
    userId: args.userId,
    boardId: args.boardId,
    classId: args.classId,
    contestDate: String(args.contestDate || '').trim(),
    contestLevel,
    percentage: Math.round(percentage),
    badgeName: rule.name,
    bonusPoint,
    totalScore: Number(args.totalScore) || 0,
    totalMarks: Number(args.totalMarks) || 0,
    createdAtEpoch: Number(args.createdAtEpoch) || moment().valueOf(),
    createdAt: moment(Number(args.createdAtEpoch) || moment().valueOf()).format('YYYY-MM-DD HH:mm'),
  };
}

export function getQuizwhizzBadgeAssetPath(badgeName: QuizwhizzBadgeName | string | null | undefined): string {
  const key = String(badgeName || '').trim().toLowerCase();
  switch (key) {
    case 'candy':
      return 'assets/images/quizwhizz-badges/candy_banner1.png';
    case 'popsicle':
      return 'assets/images/quizwhizz-badges/Popsicle_banner1.png';
    case 'bubblegum':
      return 'assets/images/quizwhizz-badges/bubblegum_banner1.png';
    case 'caramel':
      return 'assets/images/quizwhizz-badges/caramel_banner1.png';
    case 'beginner':
      return 'assets/images/quizwhizz-badges/beginner_banner1.png';
    case 'enthusiast':
      return 'assets/images/quizwhizz-badges/enthusiast_banner1.png';
    case 'positive peers':
      return 'assets/images/quizwhizz-badges/positive-peers_banner1.png';
    case 'rising star':
      return 'assets/images/quizwhizz-badges/rising_star_banner1.png';
    case 'lucky charm':
      return 'assets/images/quizwhizz-badges/lucky_charm_banner1.png';
    case 'genius':
      return 'assets/images/quizwhizz-badges/genius_banner1.png';
    case 'grand master':
      return 'assets/images/quizwhizz-badges/grand_master_banner1.png';
    default:
      return 'assets/images/quizwhizz-badges/candy_banner1.png';
  }
}
