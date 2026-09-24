import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Location } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location.service';

declare var google:any;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
  autocompleteService: any;
  places: any = [];
  currentLat = null;
  currentLong = null;
  location: Location = new Location();

  constructor(
    private navController: NavController,
    private locationService: LocationService,
    private toastController: ToastController,
  ) {
  }

  ngOnInit() {
    this.getLocation();

  }
  goBack() {
    this.navController.back();
  }

  async locateMe() {
    this.locationService.locationStatus().then(result => {
      if (result) {
        this.locationService.locateMe();
      } else {
        this.locationService.checkLocationEnabled();
      }

    });
  }


  async presentToast(msg:any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'dark',
      cssClass: 'customDarkToaster'
    });
    toast.present();
  }


  searchPlace() {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    if (null != this.location.formattedAddress && this.location.formattedAddress.length > 0) {

      let config = {
        types: ['geocode'],
        input: this.location.formattedAddress
      }

      this.autocompleteService.getPlacePredictions(config, (predictions:any, status:any) => {

        if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {

          this.places = [];

          predictions.forEach((prediction:any) => {
            this.places.push(prediction);
          });
        }

      });

    } else {
      this.places = [];
    }

  }

  async selectPlace(place:any) {
    this.location.formattedAddress = place.description;
    this.getGeoLocation(place.description).subscribe(data => {
      this.location.lat = data.lat();
      this.location.lng = data.lng();
      this.locationService.setLocation(this.location);
      this.goBack();
    });


  }
  getGeoLocation(address: string): Observable<any> {
    let geocoder = new google.maps.Geocoder();
    return Observable.create((observer:any) => {
      geocoder.geocode({
        'address': address
      }, (results:any, status:any) => {
        if (status == google.maps.GeocoderStatus.OK) {
          observer.next(results[0].geometry.location);
          observer.complete();
        } else {
          console.log('Error: ', results, ' & Status: ', status);
          observer.error();
        }
      });
    });
  }

  getLocation() {
    this.locationService.getLocation().subscribe((location: Location) => {
      this.location = location;
    });
  }




}
