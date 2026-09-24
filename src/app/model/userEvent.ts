export class UserEvent {
userId: string='';
eventId:string='';
status: string=''; // appeared,  skipped, in-progress
attemptedQuestionCount: number=0;
skippedQuestionCount:number=0;
 attemptedQuestion:QuestionAttempted[] =[];
 
}


export class QuestionAttempted {
    id: string='';
    attemptStartTime: string='';
    attemptEndTime:string='';
    status: string=''; // appeared, skipped, reappear
    mark:number=0;
    pointsEarned:number=0;
    marksEarned: number=0;
    totalTimeSpent: number=0;
    correctAnswer: string='';
    attemptedAnswer: string='';
}