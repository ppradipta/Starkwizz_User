import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/compat/storage';
//import { File } from '@awesome-cordova-plugins/file/ngx';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { UserServiceService } from 'src/app/services/user-service.service';
const MEDIA_IMAGE_FOLDER_NAME = 'starkwizz-question-ans-img';
//var imgFile: File = new File();



@Component({
  selector: 'app-question-ans-image-preview',
  templateUrl: './question-ans-image-preview.component.html',
  styleUrls: ['./question-ans-image-preview.component.scss'],
})
export class QuestionAnsImagePreviewComponent implements OnInit {
  ref: AngularFireStorageReference={} as AngularFireStorageReference;
  @Input() imgurl: any;
  @Input() userevent: any;
  @Input() question: any;

  userDetails: any;
  uploadPercent: Observable<number>= {} as Observable<number>;
  uploadTask: any;
  url: string='';
  uploadedFile: any;
  ansImagesURL: string='';
  constructor(private modalController: ModalController, private navCtrl: Location, private storage: AngularFireStorage, private userService: UserServiceService) {

    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
  }

  ngOnInit() {
this.ansImagesURL='';
  }


  onClickClose() {
    this.modalController.dismiss();
  }

  backToPage() {
    this.modalController.dismiss();
  }

  uploadImagesForQuestion() {
    this.uploadImageToStorage();
  }


  uploadImageToStorage() {
    this.ansImagesURL='';
    var cacheMetaData = {
      cacheControl: 'public,max-age=40000',
    }
    const filePath = `${this.userDetails.id}/${this.userevent.id}/question/${this.question.id}/answer/${new Date().getTime()}`;
    this.ref = this.storage.ref(filePath);
    this.ref.putString(this.imgurl, 'base64', cacheMetaData).then(data => {
      this.ref.getDownloadURL().subscribe(iurl => {
        this.ansImagesURL = iurl;
        this.modalController.dismiss(this.ansImagesURL);
      });
    });

  }


}
