import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, GalleryImageOptions, ImageOptions } from '@capacitor/camera';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { Location } from 'src/app/model/location';
import { FileService } from 'src/app/services/file.service';
import { LoadingService } from 'src/app/services/loading.service';
import { LocationService } from 'src/app/services/location.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { UtilServiceService } from 'src/app/services/util-service.service';

const IMAGE_DIR_PROFILE = 'Starkwizz-profile-images';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileData: any;
  generalEdit = false;
  personaEdit = false;
  locationEdit = false;
  stateList: any = [] = [];
  districts: any[] = [];
  cities: any[] = [];
  schools: any = [] = [];
  institutes: any = [] = [];
  userLocation: Location = new Location();
  interests: any[] = [];
  selectedInterest: any = [] = [];
  socialLinkEdit = false;
  dateOfBirth: any = new Date();
  userApproval: any = null;
  imgViewType: string = 'DEFAULT';
  images: any[] = [];
  constructor(
    private navCtrl: NavController,
    private fileService: FileService,
    private userService: UserServiceService,
    private firestore: AngularFirestore,
    private router: Router,
    private locationService: LocationService,
    private loading: LoadingService,
    private dateUtil: DateUtilService,
    private alertController: AlertController,
    private util: UtilServiceService,
  
  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.profileData = userData;
        this.dateOfBirth = this.dateUtil.getFormatDateT(this.profileData.dateOfBirth);
      }
    });
    this.getLocation();
    this.getInterest();
    this.checkProfileChangeRequest();
  }

  checkProfileChangeRequest() {
    this.firestore.collection("user_approval", ref => ref.where("status", "==", 'REQUESTED').where('userId', '==', this.profileData.id)).get().subscribe(data => {
      if (!data.empty) {
        data.forEach((res: any) => {
          this.userApproval = res.data();
        })
      }

    });
  }

  goBack() {
    //this.navCtrl.back();
    this.router.navigate(['home/tabs']);
  }

  onClickEditProfile() {
    this.loading.presentLoading(2000);
    this.generalEdit = !this.generalEdit;
    if (this.profileData.stateId && this.profileData.stateName) {
      this.stateList = [{
        displayName: this.profileData.stateName,
        id: this.profileData.stateId
      }];
    }

    if (this.profileData.districtId && this.profileData.districtName) {
      this.districts = [{
        displayName: this.profileData.districtName,
        id: this.profileData.districtId
      }];
    }
    if (this.profileData.cityId && this.profileData.cityName) {
      this.cities = [{
        displayName: this.profileData.cityName,
        id: this.profileData.cityId
      }];
    }
    if (this.profileData.schoolId && this.profileData.schoolName) {
      this.schools = [{
        displayName: this.profileData.schoolName,
        id: this.profileData.schoolId
      }];
    }
    if (this.profileData.instituteId && this.profileData.instituteName) {
      this.institutes = [{
        displayName: this.profileData.instituteName,
        id: this.profileData.instituteId
      }];
    }

    if (!this.generalEdit) {
      if (this.stateList.length > 0) {
        let state = this.stateList.find((st:any) => st.id == this.profileData.stateId);
        if (state) {
          this.profileData.stateName = state.displayName;
        }
      }
      if (this.districts.length > 0) {
        let district = this.districts.find((st:any) => st.id == this.profileData.districtId);
        if (district) {
          this.profileData.districtName = district.displayName;
        }
      }

      if (this.cities.length > 0) {
        let city:any = this.cities.find((st:any) => st.id == this.profileData.cityId);
        if (city) {
          this.profileData.cityName = city.displayName;
        }
      }

      if (this.schools.length > 0) {
        let school = this.schools.find((st:any) => st.id == this.profileData.schoolId);
        if (school) {
          this.profileData.schoolName = school.displayName;
        }
      }
      if (this.profileData.userType == "STUDENT") {
        this.userService.updateUserDetailsToCollecton(this.profileData);
        this.userService.updateUserProfileDetailsToCollecton(this.profileData);
      } else {
        this.userService.updateUserProfileDetailsToCollecton(this.profileData);
      }

      this.userService.setUserDetails(this.profileData);

    }

  }

  onClickEditPersona() {

    this.personaEdit = !this.personaEdit;
    if (!this.personaEdit) {
      this.loading.presentLoading(2000);
      if (this.selectedInterest.length > 0) {
        this.profileData.interests = [];
        this.profileData.interests = this.selectedInterest;
      }
      this.profileData.dateOfBirth = this.dateUtil.getFormatDate(this.dateOfBirth);
      if (this.profileData.userType == "STUDENT") {
        this.userService.updateUserDetailsToCollecton(this.profileData);
        this.userService.updateUserProfileDetailsToCollecton(this.profileData);
      } else {
        this.userService.updateUserProfileDetailsToCollecton(this.profileData);
      }
      this.userService.setUserDetails(this.profileData);
    } else {
      this.selectedInterest = this.profileData.interests;
      //this.interests=[...this.interests,...this.profileData.interests];
      if (this.profileData.interests && this.profileData.interests.length > 0) {
        this.profileData.interests.forEach((intr:any) => {
          let index = this.interests.findIndex(it => it.id === intr.id);
          if (index != -1) {
            this.interests[index] = intr;
          }
        });
      }
    }
  }

  onClickEditLocation() {
    this.locationEdit = !this.locationEdit;
    if (!this.locationEdit) {
      this.profileData.address = this.userLocation.formattedAddress;
      if (this.profileData.userType == "STUDENT") {
        this.userService.updateUserDetailsToCollecton(this.profileData);
        this.userService.updateUserProfileDetailsToCollecton(this.profileData);
      } else {
        this.userService.updateUserProfileDetailsToCollecton(this.profileData);
      }
      this.userService.setUserDetails(this.profileData);
    }
  }



  selectState(event:any) {
    this.loading.presentLoading(2000);
    this.stateList = [];
    this.profileData.stateId = null;
    this.profileData.stateName = null;
    this.profileData.districtName = null;
    this.profileData.districtId = null;
    this.profileData.districtName = null;
    this.profileData.cityId = null;
    this.profileData.cityName = null;
    this.profileData.schoolId = null;
    this.profileData.schoolName = null;
    this.profileData.instituteId = null;
    this.profileData.instituteName = null;

    this.firestore.collection('state').get().subscribe((staes: any) => {
      if (!staes.empty) {
        staes.forEach((state:any) => {
          this.stateList.push(state.data());
        });

        this.stateList = this.stateList.sort((a:any, b:any) => {
          if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
            return 1;
          if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
            return -1;
          return 0;
        });
      }
    });
  }
  selectDistrict(event:any) {
    this.loading.presentLoading(2000);
    this.districts = [];
    this.profileData.districtName = null;
    this.profileData.districtId = null;
    this.profileData.cityId = null;
    this.profileData.cityName = null;
    this.profileData.schoolId = null;
    this.profileData.schoolName = null;
    this.profileData.instituteId = null;
    this.profileData.instituteName = null;
    this.firestore.collection("district", ref => ref.where("stateid", "==", this.profileData.stateId)).get().subscribe(data => {
      data.forEach(res => {
        this.districts.push(res.data());
      })
      this.districts = this.districts.sort((a, b) => {
        if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
          return 1;
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
          return -1;
        return 0;
      });
    });
  }
  selectCity(event:any) {
    this.loading.presentLoading(2000);
    this.cities = [];
    this.schools = [];
    this.profileData.cityId = null;
    this.profileData.cityName = null;
    this.profileData.schoolId = null;
    this.profileData.schoolName = null;
    this.profileData.instituteId = null;
    this.profileData.instituteName = null;
    this.firestore.collection("cities", ref => ref.where("districtid", "==", this.profileData.districtId)).get().subscribe(data => {
      data.forEach(res => {
        this.cities.push(res.data());
      });

      this.cities = this.cities.sort((a, b) => {
        if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
          return 1;
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
          return -1;
        return 0;
      });
    });
  }

  selectSchool(event:any) {
    this.loading.presentLoading(2000);
    this.schools = [];
    this.institutes = [];
    this.profileData.schoolId = null;
    this.profileData.schoolName = null;
    this.profileData.instituteId = null;
    this.profileData.instituteName = null;

    const districtId = this.profileData.districtId;
    if (!districtId) return;

    this.firestore
      .collection('school', ref => ref.where('districtid', '==', districtId))
      .get()
      .subscribe(
        (data: any) => {
          const schoolList: any[] = [];
          data.forEach((res: any) => {
            schoolList.push(res.data());
          });

          let filtered = schoolList;
          if (this.profileData.boardName) {
            filtered = filtered.filter(s => s.board === this.profileData.boardName);
          }

          this.schools = filtered.sort((a: any, b: any) => {
            const aName = (a?.displayName || '').toString().toLowerCase();
            const bName = (b?.displayName || '').toString().toLowerCase();
            if (aName > bName) return 1;
            if (aName < bName) return -1;
            return 0;
          });
        },
        (err: any) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load schools', err);
        }
      );
  }

  selectInstitute(event:any) {
    this.loading.presentLoading(2000);
    this.institutes = [];
    this.profileData.instituteId = null;
    this.profileData.instituteName = null;
    this.firestore.collection("institute", ref => ref
      .where("districtid", "==", this.profileData.districtId)
      .where("board", "==", this.profileData.boardName)
    ).get().subscribe(data => {
      data.forEach(res => {
        this.institutes.push(res.data());
      });

      this.institutes = this.institutes.sort((a:any, b:any) => {
        if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
          return 1;
        if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
          return -1;
        return 0;
      });
    });
  }


  fileChangeEvent(event: any) {
    let items = {
      imageUrl: event,
      userId: this.profileData.id,
      userType: this.profileData.userType,
      imageType: 'PHOTOS'
    }
    this.userService.setImagesDataForUpload(items);
    this.router.navigate(['imageUpload']);
  }

  launchLocationPage() {
    this.router.navigate(['./home/location']);
  }

  getLocation() {
    this.locationService.getLocation().subscribe((location: Location) => {
      this.userLocation = location;
    });
  }

  getInterest() {
    this.firestore.collection("interests").get().subscribe(data => {
      data.forEach(res => {
        this.interests.push(res.data());
      })
    });
  }


  onClickEditSocialNetwork() {
    this.socialLinkEdit = !this.socialLinkEdit;
    if (!this.socialLinkEdit) {
      if (this.profileData.userType == "STUDENT") {
        this.userService.updateUserDetailsToCollecton(this.profileData);
      } else {
        this.userService.updateUserProfileDetailsToCollecton(this.profileData);
      }
      this.userService.setUserDetails(this.profileData);
    }
  }

  uploadProfileImage(event:any) {
    let items = {
      imageUrl: event,
      userId: this.profileData.id,
      userType: this.profileData.userType,
      imageType: 'PROFILE-IMAGE'
    }
    this.userService.setImagesDataForUpload(items);
    this.router.navigate(['imageUpload']);
  }

  submitDate() {
    this.profileData.dateOfBirth = this.dateOfBirth;
  }

  changerequest() {
    this.router.navigate(['./home/profile/change-request']);
  }
  
  goToSchoolInfo() {
    this.router.navigate(['./home/profile/school-info']);
  }

  async presentAlertForImageUplaod() {
    const alert = await this.alertController.create({
      message: 'Upload Using files or Camera',
      cssClass: 'customAlert',
      header: "Confirm",
      buttons: [{
        text: 'Camera',
        role: 'Camera',
        cssClass: 'secondary',
        handler: (blah) => {
          this.opencamera();
        }
      }, {
        text: 'Gallery',
        role: 'Gallery',
        handler: () => {
          this.openGallery();
        }
      }]
    });
    await alert.present();
  }

  async opencamera() {
    this.images = [];
    const options: ImageOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    }
    const image = await Camera.getPhoto(options);
    if (image) {
      this.fileService.saveImageAndProceeForView(IMAGE_DIR_PROFILE, image, this.images);
      this.imgViewType = 'UPDATE';
    }

  }

  async openGallery() {
    this.images = [];
    const options: GalleryImageOptions = {
      quality: 90,
      correctOrientation: true,
      presentationStyle: 'fullscreen',
      limit: 1
    };
    const pickupImages: any = await Camera.pickImages(options);
    if (null != pickupImages && null != pickupImages.photos && pickupImages.photos.length > 0) {
      pickupImages.photos.forEach(photo => {
        if (photo) {
          this.imgViewType = 'UPDATE';
          this.fileService.saveImageAndProceeForView(IMAGE_DIR_PROFILE, photo, this.images);
          this.presentAlertForProfileImageUplaod();
        }
      });
    }
  }

  async presentAlertForProfileImageUplaod() {
    this.loading.present();
    const alert = await this.alertController.create({
      message: 'Are you sure! want to change profile image',
      cssClass: 'customAlert',
      header: "Confirm",
      buttons: [{
        text: 'Cancel',
        role: 'Cancel',
        cssClass: 'secondary',
        handler: (blah) => {
          this.imgViewType = 'DEFAULT';
          this.alertController.dismiss();
        }
      }, {
        text: 'Confirm',
        role: 'Confirm',
        handler: () => {
          if (this.images && this.images.length > 0) {
            this.fileService.uploadImage(this.images[0]).then((url: any) => {
              this.userService.updatePorfilePic(this.profileData, url);
              this.profileData.imageUrl = url?.url;
              this.userService.setUserDetails(this.profileData);
              this.util.showToast(('Image updated sucessfully!!!'), 'success', 'bottom');
            })
          }
        }
      }]
    });
    await alert.present();
  }
}
