import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassOfEducation } from '../model/class';

@Injectable({
    providedIn: 'root'
})
export class ClassService {

    private classCollection: AngularFirestoreCollection<ClassOfEducation>= {} as AngularFirestoreCollection<ClassOfEducation>;
    classEducations$: Observable<ClassOfEducation[]>= {} as  Observable<ClassOfEducation[]>;

    constructor(private firestore: AngularFirestore) {
        this.getBoardOfEducation();
    }

    getBoardOfEducation() {
        this.classCollection = this.firestore.collection<ClassOfEducation>('classes');
        this.classEducations$ = this.classCollection.snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as ClassOfEducation;
                return {
                    ...data
                };
            }))
        );
    }

}
