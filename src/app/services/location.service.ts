import { Injectable } from "@angular/core";
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
//import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { AlertController, ToastController } from "@ionic/angular";
import { ReplaySubject } from "rxjs";
import { Location } from "../model/location";

//declare var google;

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    public currentLatLong = new ReplaySubject<any>(1);
    public locationDetail = new ReplaySubject<Location>(1);

    apiResponse: any;
    //latlong: { lat: any; lng: any; };
    constructor(
       // public geolocation: Geolocation,
        public diagnostic: Diagnostic,
        public locationAccuracy: LocationAccuracy,
        public alertCtrl: AlertController,
        private androidPermissions: AndroidPermissions,
        private toastController: ToastController
    ) {

    }

    getLocation() {
        return this.locationDetail.asObservable();
    }


    async locateMe() {
        // this.geolocation.getCurrentPosition().then((resp) => {
        //     let latitude = resp['coords'].latitude;
        //     let longitude = resp['coords'].longitude;
        //     let location = new Location();
        //     location.lat = latitude;
        //     location.lng = longitude;
        //     this.setLocation(location);
        // }).catch((error) => {
        //     console.log('Error getting location', error);
        // });
    }

    async watchLocationChange() {
        // this.geolocation.watchPosition().subscribe((position) => {
        //     let latitude = position['coords'].latitude;
        //     let longitude = position['coords'].longitude;
        //     let location: Location = new Location();
        //     location.lat = latitude;
        //     location.lng = longitude;
        //     this.latlong = {
        //         lat: latitude,
        //         lng: longitude
        //     }

        // });

    }


    public async setLocation(locationDetail: Location) {
        // let formattedAddress = await this.convertLatLngToAddres(locationDetail.lat, locationDetail.lng);
        // locationDetail.formattedAddress = formattedAddress;
        // this.locationDetail.next(locationDetail);
        // this.latlong = {
        //     lat: locationDetail.lat,
        //     lng: locationDetail.lng
        // }
    }


    /*******************************************************************************************
      @PURPOSE : 	Convert Lat Lng To Addres
    /*****************************************************************************************/
    // convertLatLngToAddres(lat, lng) {
    //     let promise = new Promise((resolve, reject) => {
    //         let geocoder = new google.maps.Geocoder;
    //         let latlng = { lat: lat, lng: lng };
    //         geocoder.geocode({ 'location': latlng }, (results, status) => {
    //             if (results) {
    //                 resolve(results[1].formatted_address);
    //             }
    //             // console.log(results[1].formatted_address); // read data from here
    //             // console.log(results); // read data from here
    //             // console.log(status);
    //         });
    //     });
    //     return promise;
    // }

    // async showToast(msg) {
    //     const toast = await this.toastController.create({
    //         message: msg,
    //         duration: 2000,
    //         color: 'dark',
    //         cssClass: 'customDarkToaster'
    //     });
    //     toast.present();
    // }

    // async presentAlert(msg) {
    //     const alert = await this.alertCtrl.create({
    //         message: msg,
    //         buttons: [
    //             {
    //                 text: 'OK',
    //                 handler: () => {
    //                     this.alertCtrl.dismiss();
    //                 }
    //             }
    //         ]
    //     })

    //     await alert.present();
    // }

    async locationStatus() {
        return new Promise((resolve, reject) => {
            this.diagnostic.isLocationEnabled().then((isEnabled) => {
                console.log(isEnabled);
                if (isEnabled === false) {
                    resolve(false);
                } else if (isEnabled === true) {
                    resolve(true);
                }
            })
                .catch((e) => {
                    // this.showToast('Please turn on Location');
                    reject(false);
                });
        });
    }

    async checkLocationEnabled() {
        return new Promise((resolve, reject) => {
            this.diagnostic.isLocationEnabled().then((isEnabled) => {
                console.log(isEnabled);
                if (isEnabled === false) {
                    this.turnOnGps();
                    resolve(false);
                } else if (isEnabled === true) {
                    this.checkGPSPermission().then((response) => {
                        this.apiResponse = response;
                        if (this.apiResponse === false) {
                            reject(false);
                        } else {
                            resolve(this.apiResponse);
                        }
                    })
                        .catch((e) => {
                            console.log(e, 'checkGPSPermission-checkLocationEnabled');
                            reject(false);
                        });
                }
            })
                .catch((e) => {
                    this.turnOnGps();
                    reject(false);
                });
        });
    }

    async checkGPSPermission() {
        return new Promise((resolve, reject) => {
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
                result => {
                    console.log(result.hasPermission);
                    if (result.hasPermission) {
                        console.log('hasPermission-YES');
                        //If having permission show 'Turn On GPS' dialogue
                        this.askToTurnOnGPS().then((response) => {
                            console.log(response, 'askToTurnOnGPS-checkGPSPermission');
                            if (this.apiResponse === false) {
                                reject(this.apiResponse);
                            } else {
                                resolve(this.apiResponse);
                            }
                        });
                    } else {
                        console.log('hasPermission-NO');
                        //If not having permission ask for permission
                        this.requestGPSPermission().then((response) => {
                            console.log(response, 'requestGPSPermission-checkGPSPermission');
                            this.apiResponse = response;
                            if (this.apiResponse === false) {
                                reject(this.apiResponse);
                            } else {
                                resolve(this.apiResponse);
                            }
                        });
                    }
                },
                err => {
                    alert(err);
                    reject(false);
                });
        });
    }


    async requestGPSPermission() {
        return new Promise((resolve, reject) => {
            this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                if (canRequest) {
                    console.log("4");
                } else {
                    //Show 'GPS Permission Request' dialogue
                    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(() => {
                        // call method to turn on GPS
                        this.askToTurnOnGPS().then((response) => {
                            console.log(response, 'askToTurnOnGPS-requestGPSPermission');
                            this.apiResponse = response;
                            if (this.apiResponse === false) {
                                reject(this.apiResponse);
                            } else {
                                resolve(this.apiResponse);
                            }
                        });
                    },
                        error => {
                            //Show alert if user click on 'No Thanks'
                            alert('requestPermission Error requesting location permissions ' + error);
                            reject(false);
                        });
                }
            });
        });
    }

    async askToTurnOnGPS() {
        return new Promise((resolve, reject) => {
            this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then((resp) => {
                console.log(resp, 'location accuracy');
                // When GPS Turned ON call method to get Accurate location coordinates
                if (resp['code'] === 0) {
                    resolve(this.apiResponse);
                    this.getLocationCoordinates().then((cords) => {
                        console.log(cords, 'coords');
                        this.apiResponse = cords;
                        if (this.apiResponse === false) {
                            reject(false);
                        } else {
                            resolve(this.apiResponse);
                        }
                    });
                }
                // error => {
                //     alert('Error requesting location permissions');
                //     reject(false);
                // }
            });
        });
    }

    async getLocationCoordinates() {
        // return new Promise((resolve, reject) => {
        //     this.geolocation.getCurrentPosition().then((resp) => {
        //         let location = new Location();
        //         location.lat = resp.coords.latitude;
        //         location.lng = resp.coords.longitude;
        //         this.setLocation(location);
        //         console.log(resp, 'get locc');
        //         resolve(location);
        //     }).catch((error) => {
        //         alert('Error getting location');
        //         reject(false);
        //     });
        // });
    }


    turnOnGps() {
        this.locationAccuracy.canRequest().then((canRequest: boolean) => {
            if (canRequest) {
                this.locationAccuracy
                    .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
                    .then(
                        () => {

                        },
                        error => {
                            // this.commonService.presentErrorToast('Error getting location');
                        }
                    );
            } else {
                this.locationAccuracy
                    .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
                    .then(
                        () => {
                        },
                        error => {
                            // this.commonService.presentErrorToast('Error getting location');
                        }
                    );
            }
        });
    }

}

