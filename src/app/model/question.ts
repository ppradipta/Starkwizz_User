
export class Questions {
    public id: string='';
    public questionType: string=''; // TEXT, IMAGE
    public type: string=''; // Single/ multi etc
    public text: string='';
    public hint: string='';
    public url: string='';
    public options: Options[] = [];
    public answers: string[] = [];
    public mark: number=0;
    public point: number=0;
    public class: ClassView = new ClassView();
    public subject: SubjectView = new SubjectView();
    public module: ModuleView = new ModuleView();
    public perQuestionTimer: number=0;
    public isnegativeallow: boolean = false;
    public hintText: string='';
    public ansExplanationId: string='';
    public questionExplanationId: string='';
    public animationType:string='';
    public examPassStatus:string='';
}

export class Options {
    public id: string='';
    public type: string=''; // TEXT, IMAGE
    public text: string='';
    public url: string='';
    public sequence: string='';
    public isCorrect: string='';

}

export class ClassView {
    id: string='';
    displayName: string='';
}

export class SubjectView {
    id: string='';
    displayName: string='';
}

export class ModuleView {
    id: string='';
    displayName: string='';
}