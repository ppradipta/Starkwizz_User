import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BoardOfEducation } from '../model/board';

@Injectable({
    providedIn: 'root'
})
export class BoardService {

    private boardCollection: AngularFirestoreCollection<BoardOfEducation>={} as AngularFirestoreCollection<BoardOfEducation>;
    boardEducations$: Observable<BoardOfEducation[]>= {} as  Observable<BoardOfEducation[]>;

    constructor(private firestore: AngularFirestore) {
        this.getBoardOfEducation();
    }

    getBoardOfEducation() {
        this.boardCollection = this.firestore.collection<BoardOfEducation>('board_of_education');
        this.boardEducations$ = this.boardCollection.snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as BoardOfEducation;
                return {
                    ...data
                };
            }))
        );
    }

}
