import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/compat/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { LoadingService } from 'src/app/services/loading.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent implements OnInit {
  ref: AngularFireStorageReference = {} as AngularFireStorageReference;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageSelected: boolean = false;
  imagedataSubscribe: any;
  imageURL: string = '';
  userId: string = '';
  imageType: string = '';
  images: any[] = [];
  hubDetailId: string = '';
  type: string = '';
  userType: any;
  profileData: any;
  event: any;
  question: any;
  constructor(
    public router: Router,
    private storage: AngularFireStorage,
    private navCtrl: Location,
    private route: ActivatedRoute,
    public firestore: AngularFirestore,
    private userService: UserServiceService,
    private loading: LoadingService,
    private modalController: ModalController
  ) { }


  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.profileData = userData;
    });
    this.getImagesData();
  }

  getImagesData() {
    this.imagedataSubscribe = this.userService.getImagesDataForUpload().subscribe(data => {
      if (null != data) {
        this.imageChangedEvent = data.imageUrl;
        this.type = data.type;
        this.userId = data.userId;
        this.userType = data.userType;
        this.imageType = data.imageType;
        this.hubDetailId = data.hubDetailId;
        this.question = data.question;
        this.event = data.event;
        this.fileChangeEvent(this.imageChangedEvent);
        this.imageCropped(this.imageChangedEvent);
      }


    })

  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.imageSelected = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;

  }

  cancel() {
    if (this.imageType == 'QUESTION-ANS-IMG') {
      this.modalController.dismiss();
    } else {
      this.navCtrl.back();
    }

  }

  saveUserImg() {
    this.loading.present();
    let encodeImg = this.croppedImage.split(',')[1];
    var cacheMetaData = {
      cacheControl: 'public,max-age=40000',
    }
    if (this.imageType == 'PHOTOS') {
      this.ref = this.storage.ref('personal-images/' + this.userId + '/' + new Date());
      this.ref.putString(encodeImg, 'base64', cacheMetaData).then(data => {
        this.ref.getDownloadURL().subscribe(iurl => {
          let img = {
            url: iurl,
            type: this.imageType
          }
          if (this.userType.toLocaleLowerCase() == 'student') {
            this.savePhotos(img);
          }
          this.navCtrl.back();
        });
      });
    } else if (this.imageType == 'MY_ADD') {
      this.ref = this.storage.ref('photos' + new Date());
      this.ref.putString(encodeImg, 'base64', cacheMetaData).then(data => {
        this.ref.getDownloadURL().subscribe(iurl => {
          let img = {
            url: iurl,
            type: this.imageType
          }
          this.userService.setImageForUpload(iurl);
          this.loading.dismiss();
          this.navCtrl.back();
        });
      });
    }
    else if (this.imageType == 'PROFILE-IMAGE') {
      this.ref = this.storage.ref('profile-image/' + this.userId);
      this.ref.putString(encodeImg, 'base64', cacheMetaData).then(data => {
        this.ref.getDownloadURL().subscribe(iurl => {
          this.saveUserProfileImg(iurl);
          this.navCtrl.back();
        });
      });
    }

    else if (this.imageType == 'GROUP-IMAGE') {
      this.ref = this.storage.ref('group-image/' + new Date());
      this.ref.putString(encodeImg, 'base64', cacheMetaData).then(data => {
        this.ref.getDownloadURL().subscribe(iurl => {
          this.userService.setGroupImage(iurl);
          this.navCtrl.back();
        });
      });
    }
    else if (this.imageType == 'QUESTION-ANS-IMG') {
      this.modalController.dismiss(encodeImg);
    }
  }

  saveUserProfileImg(imageURL: any) {
    this.firestore.collection('users').doc(this.userId).update({
      imageUrl: imageURL
    });
    this.profileData.imageUrl = imageURL;
    this.userService.setUserDetails(this.profileData);
  }

  savePhotos(images: any) {
    this.firestore.collection('users').doc(this.userId).update({
      'images': firebase.firestore.FieldValue.arrayUnion(images)
    });
    if (null == this.profileData.images) {
      this.profileData.images = [];
    }
    this.profileData.images.push(images);
    this.userService.setUserDetails(this.profileData)
  }

  populateImage(imageURL: string) {
    let hub: any = {};
    let images = {
      photos: imageURL
    }
    hub.photos.push(imageURL);

    return hub;
  }

  saveHubDetailsPhoto(imageURL: any) {
    let images = this.populateImage(imageURL);
    this.firestore.collection('hubDetails').doc(this.hubDetailId)
      .set(JSON.parse(JSON.stringify(images)), { merge: true });


  }
  goBack() {
    this.navCtrl.back();
  }
}
