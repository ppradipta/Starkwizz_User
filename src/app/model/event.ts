export class Event {
    public id: string = '';
    public name: string = '';
    public eventCode: string = '';
    public subjectId: string = '';
    public subjectName: string = '';
    public moduleId: string = '';
    public moduleName: string = '';
    public category: string = ''; // Diagnostic , Progressive, Proficiency
    public categoryId: string = '';
    public type: string = ''; // EXAM, EVENT
    public status: string = ''; // Active, Inactive, Completed
    public startTime: string = '';
    public endTime: string = '';
    public creationDate: string = '';
    public startDate: string = '';
    public endDate: string = '';
    public classId: string = '';
    public className: string = '';
    public boardId: string = '';
    public boardName: string = '';
    public questions: any[] = []
    public imageUrl: string = '';
    public colorCode: string = '';
    public answerUrl: string = '';
    public totalHour: number = 0;
    public perQuestionHour: number = 0;
    public videoUrl: string = '';
    public videoName: string = '';
    public perQuestionMinutes: number = 0;
    public description: string = '';
    public eventMarks: string = '';
    public eventEndDate: string = '';
    public line1: string = '';
    public questionPattern: string = '';
    public questionToAttemp: number = 10;
    public passMark: number = 0;
    public eventStartDate: string = '';
    public eventMonth: string = '';
    public eventName: string = '';
    
}


export class QuestionAppearanceView {
    id: string = '';
    sequence: string = '';
    correctAnswer: string = '';
}

export class ModuleView {
    id: string = '';
    name: string = '';
}

export class EventView {
    public id: string = '';
    public name: string = '';
    public subject: SubjectsView[] = [];
}

export class SubjectsView {
    public subjectId: string = '';
    public subjectName: string = '';
    public moduleId: string = '';
    public moduleName: string = '';
    public category: string = ''; // Diagnostic , Progressive, Proficiency
    public type: string = ''; // Exam, Event
    public status: string = ''; // Active, Inactive, Completed
}
export class HubEnquiry {
    id: string = '';
    name: string = '';
    email: string = '';
    message: string = '';
}

export class EventInstructions {
    id: string = '';
    eventId: string = '';
    instruction: string = '';
}