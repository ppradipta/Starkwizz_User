import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { FirebaseCollection } from 'src/app/model/common/firebase-collection';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss'],
})
export class SubscriptionDetailsComponent implements OnInit {
  userDetails: UserDetails = new UserDetails();
  subscriptionData: any = null;
  hasSubscription: boolean = false;
  isLoading: boolean = true;
  planPrice: number = 0;
  prices: any = null;

  constructor(
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private navCtrl: NavController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUserDetails();
    this.loadPlanPrices();
  }

  loadUserDetails() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
        this.getSubscriptionData();
      }
    });
  }

  // Load plan prices from price_management collection
  loadPlanPrices() {
    this.firestore
      .collection('price_management')
      .doc('prices')
      .valueChanges()
      .subscribe((prices: any) => {
        this.prices = prices;
        // If subscription data is already loaded, calculate the plan price
        if (this.subscriptionData) {
          this.calculatePlanPrice();
        }
      });
  }

  // Get the plan name from subscription data
  getPlanName(): string {
    if (this.isFreeTrialSubscription()) return 'Free Trial';

    return (
      this.subscriptionData?.planCategory ||
      this.subscriptionData?.offerType ||
      this.subscriptionData?.subsType ||
      ''
    );
  }

  isFreeTrialSubscription(): boolean {
    const subsType = String(this.subscriptionData?.subsType ?? '').toLowerCase();
    const paymentMode = String(this.subscriptionData?.paymentmode ?? '').toLowerCase();
    const isFreeTrial = Boolean(this.subscriptionData?.isFreeTrial);

    return isFreeTrial || subsType === 'freetrial' || paymentMode === 'freetrial';
  }

  private isFreeTrialUserProfile(): boolean {
    const profileTypes = (this.userDetails?.profileType ?? []).map((t: any) => String(t ?? '').toUpperCase());
    return profileTypes.includes('FREETRAIL') || profileTypes.includes('FREETRIAL');
  }

  // Calculate plan price based on plan name
  calculatePlanPrice() {
    const planName = this.getPlanName();
    const prices = this.prices;

    if (!planName || !prices) {
      this.planPrice = 0;
      return;
    }

    // Map plan names to their prices
    // Check for exact match first, then case-insensitive match
    if (planName === 'Individual' || planName.toLowerCase() === 'individual') {
      // Get yearly price for individual plan
      this.planPrice = Number(prices?.individual?.yearly) || 0;
    } else if (planName === 'Family' || planName.toLowerCase() === 'family') {
      this.planPrice = Number(prices?.family) || 0;
    } else if (planName === 'School' || planName.toLowerCase() === 'school') {
      this.planPrice = Number(prices?.school) || 0;
    } else if (
      planName === 'PrivateInstitution' ||
      planName.toLowerCase() === 'privateinstitution'
    ) {
      this.planPrice = Number(prices?.privateInstitution) || 0;
    } else {
      // Default to 0 if plan not recognized
      this.planPrice = 0;
    }
  }

  getSubscriptionData() {
    // Check multiple subscription collections to find any active subscription
    this.checkSubscriptionCollection(FirebaseCollection.USER_SUBSCRIPTION);
    this.checkSubscriptionCollection(FirebaseCollection.QUIZWHIZZ_SUBSCRIPTION);
    this.checkSubscriptionCollection(FirebaseCollection.COMBO_OFFERS_SUBSCRIPTION);
    this.checkSubscriptionCollection(FirebaseCollection.TRANSACTION);
  }

  checkSubscriptionCollection(collectionName: string) {
    if (this.hasSubscription) return; // Already found a subscription

    const query = this.firestore.collection(collectionName);
    query.ref
      .where('userid', '==', this.userDetails.id)
      .get()
      .then((subj: any) => {
        if (!subj.empty) {
          subj.forEach((data: any) => {
            let result = data.data();
            // Check if subscription is active
            if (result.status === 'SUCCESS') {
              this.subscriptionData = result;
              this.hasSubscription = true;
              // Calculate plan price after getting subscription data
              if (this.prices) {
                this.calculatePlanPrice();
              }
            }
          });
        }
        // Only set loading to false after checking all collections
        if (collectionName === FirebaseCollection.COMBO_OFFERS_SUBSCRIPTION) {
          this.isLoading = false;
        }
      })
      .catch((error) => {
        console.error('Error fetching subscription from', collectionName, ':', error);
        // Only set loading to false after checking all collections
        if (collectionName === FirebaseCollection.COMBO_OFFERS_SUBSCRIPTION) {
          this.isLoading = false;
        }
      });
  }

  goBack() {
    this.navCtrl.back();
  }

  goToSubscription() {
    const hideFreeTrial = this.isFreeTrialSubscription() || this.isFreeTrialUserProfile();
    this.router.navigate(['home/combo-offer'], {
      queryParams: {
        hideFreeTrial: hideFreeTrial ? 'true' : 'false',
      },
      queryParamsHandling: 'merge',
    });
  }
}
