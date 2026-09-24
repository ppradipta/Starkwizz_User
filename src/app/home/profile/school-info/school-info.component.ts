import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { LocationService } from 'src/app/services/location.service';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-school-info',
  templateUrl: './school-info.component.html',
  styleUrls: ['./school-info.component.scss'],
})
export class SchoolInfoComponent implements OnInit {
  profileData: any = {};
  stateList: any = [] = [];
  districts: any[] = [];
  cities: any[] = [];
  schools: any = [] = [];
  institutes: any = [] = [];
  actionSheetState = {
    header: 'States',
  };
  actionSheetDistrict = {
    header: 'Districts',
  };
  actionSheetCity = {
    header: 'Cities',
  };
  actionSheetSchool = {
    header: 'Schools',
  };
  actionSheetInstitute = {
    header: 'Institutes',
  };
  constructor(
    private navCtrl: NavController,
    private loading: LoadingService,
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private locationService: LocationService,

  ) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.profileData = userData;
      }
    });
  }

  goBack() {
    this.navCtrl.back();
  }


  selectState(event: any) {
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

    this.firestore.collection('state', ref => ref.orderBy("name", "asc")).get().subscribe((staes: any) => {
      if (!staes.empty) {
        staes.forEach((state: any) => {
          let stateData: any = state.data();
          let index = this.stateList.findIndex(sl => sl.name == stateData.name);
          if (index == -1) {
            this.stateList.push(stateData);
          }

        });

        // this.stateList = this.stateList.sort((a: any, b: any) => {
        //   if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
        //     return 1;
        //   if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
        //     return -1;
        //   return 0;
        // });

      }
    });
  }
  selectDistrict(event: any) {
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
    this.firestore.collection("district", ref => ref.where("stateid", "==", this.profileData.stateId).orderBy("name", "asc")).get().subscribe(data => {
      data.forEach(res => {
        let districtData: any = res.data();
        let index = this.districts.findIndex(sl => sl.name == districtData.name);
        if (index == -1) {
          this.districts.push(districtData);
        }
      })
      // this.districts = this.districts.sort((a, b) => {
      //   if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
      //     return 1;
      //   if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
      //     return -1;
      //   return 0;
      // });
    });
  }
  selectCity(event: any) {
    this.loading.presentLoading(2000);
    this.cities = [];
    this.schools = [];
    this.profileData.cityId = null;
    this.profileData.cityName = null;
    this.profileData.schoolId = null;
    this.profileData.schoolName = null;
    this.profileData.instituteId = null;
    this.profileData.instituteName = null;
    this.firestore.collection("cities", ref => ref.where("districtid", "==", this.profileData.districtId).orderBy("name", "asc")).get().subscribe(data => {
      data.forEach(res => {
        let cityData: any = res.data();
        let index = this.cities.findIndex(sl => sl.name == cityData.name);
        if (index == -1) {
          this.cities.push(cityData);
        }
      });

      // this.cities = this.cities.sort((a, b) => {
      //   if (a.displayName.toLowerCase() > b.displayName.toLowerCase())
      //     return 1;
      //   if (a.displayName.toLowerCase() < b.displayName.toLowerCase())
      //     return -1;
      //   return 0;
      // });
    });
  }

  selectSchool(event: any) {
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
            const schoolData: any = res.data();
            const index = schoolList.findIndex(sl => sl.name === schoolData.name);
            if (index === -1) {
              schoolList.push(schoolData);
            }
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

  selectInstitute(event: any) {
    this.loading.presentLoading(2000);
    this.institutes = [];
    this.profileData.instituteId = null;
    this.profileData.instituteName = null;

    const districtId = this.profileData.districtId;
    if (!districtId) return;

    this.firestore
      .collection('institute', ref => ref.where('districtid', '==', districtId))
      .get()
      .subscribe(
        (data: any) => {
          const instituteList: any[] = [];
          data.forEach((res: any) => {
            const instituteData: any = res.data();
            const index = instituteList.findIndex(sl => sl.name === instituteData.name);
            if (index === -1) {
              instituteList.push(instituteData);
            }
          });

          let filtered = instituteList;
          if (this.profileData.boardName) {
            filtered = filtered.filter(inst => inst.board === this.profileData.boardName);
          }
          if (this.profileData.cityId) {
            filtered = filtered.filter(inst => inst.cityid === this.profileData.cityId);
          }

          this.institutes = filtered.sort((a: any, b: any) => {
            const aName = (a?.displayName || '').toString().toLowerCase();
            const bName = (b?.displayName || '').toString().toLowerCase();
            if (aName > bName) return 1;
            if (aName < bName) return -1;
            return 0;
          });
        },
        (err: any) => {
          // eslint-disable-next-line no-console
          console.error('Failed to load institutes', err);
        }
      );
  }

  onClickProceed() {
    if (this.stateList.length > 0) {
      let state = this.stateList.find((st: any) => st.id == this.profileData.stateId);
      if (state) {
        this.profileData.stateName = state.displayName;
      }
    }
    if (this.districts.length > 0) {
      let district = this.districts.find((st: any) => st.id == this.profileData.districtId);
      if (district) {
        this.profileData.districtName = district.displayName;
      }
    }

    if (this.cities.length > 0) {
      let city: any = this.cities.find((st: any) => st.id == this.profileData.cityId);
      if (city) {
        this.profileData.cityName = city.displayName;
      }
    }

    if (this.schools.length > 0) {
      let school = this.schools.find((st: any) => st.id == this.profileData.schoolId);
      if (school) {
        this.profileData.schoolName = school.displayName;
      }
    }

    if (this.institutes.length > 0) {
      let institute = this.institutes.find((st: any) => st.id == this.profileData.instituteId);
      if (institute) {
        this.profileData.instituteName = institute.displayName;
      }
    }
    if (this.profileData.userType == "STUDENT") {
      this.userService.updateUserDetailsToCollecton(this.profileData);
      this.userService.updateUserProfileDetailsToCollecton(this.profileData);
    } else {
      this.userService.updateUserProfileDetailsToCollecton(this.profileData);
    }

    this.userService.setUserDetails(this.profileData);
    this.navCtrl.back();
  }

}
