import { Injectable } from '@angular/core';
import { AngularFirestore, QueryDocumentSnapshot } from '@angular/fire/compat/firestore';
import { ReplaySubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VideoUploadService {

    public nextQueryAfter: QueryDocumentSnapshot<any>={} as QueryDocumentSnapshot<any>;
    public uploadedVideos: ReplaySubject<any[] | undefined> =
        new ReplaySubject(undefined);
    public lastPlayVideo = new ReplaySubject<any>(1);

    public nextImageQueryAfter: QueryDocumentSnapshot<any>={} as QueryDocumentSnapshot<any>;
    public uploadedImages: ReplaySubject<any[] | undefined> =
        new ReplaySubject(undefined);

    constructor(private firestore: AngularFirestore) {
    }


    setLastPlayVideos(video:any) {
        this.lastPlayVideo.next(video);
    }
    getLastPlayVideos() {
        return this.lastPlayVideo.asObservable();

    }
    pauseAllVideos() {
        this.lastPlayVideo.subscribe(playvideo => {
            if (playvideo) {
                playvideo.pause();
            }
        });

    }

    getAllUploadedVideoDetails() {
        this.getAllUploadedVideoDetailsForApprovedStatus().subscribe(hresult => {
            if (!hresult.empty) {
                this.nextQueryAfter = hresult.docs[hresult.docs.length - 1] as
                    QueryDocumentSnapshot<any>;
                this.uploadedVideos.next(hresult.docs);
            }
        });
    }

    getAllUploadedVideoDetailsForApprovedStatus() {
        if (this.nextQueryAfter) {
            return this.firestore.collection<any>("video_upload", ref =>
                ref.where('status', '==', 'APPROVED')
                    .startAfter(this.nextQueryAfter)).get();
        } else {
            return this.firestore.collection<any>("video_upload", ref =>
                ref.where('status', '==', 'APPROVED')).get();
        }

    }


    getAllUploadedImageDetails() {
        this.getAllUploadedImageDetailsForApprovedStatus().subscribe(hresult => {
            if (!hresult.empty) {
                this.nextImageQueryAfter = hresult.docs[hresult.docs.length - 1] as
                    QueryDocumentSnapshot<any>;
                this.uploadedImages.next(hresult.docs);
            }
        });
    }

    getAllUploadedImageDetailsForApprovedStatus() {
        if (this.nextImageQueryAfter) {
            return this.firestore.collection<any>("image_upload", ref =>
                ref.where('status', '==', 'APPROVED')
                    .startAfter(this.nextImageQueryAfter)).get();
        } else {
            return this.firestore.collection<any>("image_upload", ref =>
                ref.where('status', '==', 'APPROVED')).get();
        }

    }
}
