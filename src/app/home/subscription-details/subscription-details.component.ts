import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DateUtilService } from 'src/app/common/util/date-util.service';
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
  comboOffer: any = null;
  activeComboOffer: any = null;
  allComboOffers: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private userService: UserServiceService,
    private navCtrl: NavController,
    private router: Router,
    public dateUtilService: DateUtilService
  ) { }

  ngOnInit() {
    this.loadUserDetails();
    this.loadComboOffersAndPrices();
  }

  loadUserDetails() {
    this.userService.getUserDetails().subscribe((userData) => {
      if (userData) {
        this.userDetails = userData;
        this.getSubscriptionData();
      }
    });
  }

  // Load combo offers from combo_offers_subscription collection and fallback prices
  loadComboOffersAndPrices() {
    // 1. Fetch active combo offer from combo_offers_subscription
    this.firestore
      .collection(FirebaseCollection.COMBO_OFFERS_SUBSCRIPTION, (ref) =>
        ref.where('status', '==', 'ACTIVE')
      )
      .valueChanges()
      .subscribe((comboOffers: any[]) => {
        if (comboOffers && comboOffers.length > 0) {
          this.activeComboOffer = comboOffers[0];
          if (this.subscriptionData) {
            this.calculatePlanPrice();
          }
        }
      });

    // 2. Fetch all combo offers to match by comboOfferId or code if applicable
    this.firestore
      .collection(FirebaseCollection.COMBO_OFFERS_SUBSCRIPTION)
      .valueChanges()
      .subscribe((allOffers: any[]) => {
        this.allComboOffers = allOffers || [];
        if (this.subscriptionData) {
          this.calculatePlanPrice();
        }
      });

    // 3. Fallback: category prices from price_management collection
    this.firestore
      .collection('price_management')
      .doc('prices')
      .valueChanges()
      .subscribe((prices: any) => {
        this.prices = prices;
        if (this.subscriptionData) {
          this.calculatePlanPrice();
        }
      });
  }

  // Get the plan name from combo offer or subscription data
  getPlanName(): string {
    if (this.isFreeTrialSubscription()) return 'Free Trial';

    if (this.comboOffer?.name) {
      return this.comboOffer.name;
    }
    if (this.subscriptionData?.comboOfferName) {
      return this.subscriptionData.comboOfferName;
    }
    if (this.activeComboOffer?.name && this.isComboSubscription()) {
      return this.activeComboOffer.name;
    }
    if (this.subscriptionData?.planCategory) {
      return this.subscriptionData.planCategory;
    }
    if (this.subscriptionData?.offerType === 'ALL' || this.isComboSubscription()) {
      return 'Combo Offer';
    }
    return (
      this.subscriptionData?.offerType ||
      this.subscriptionData?.subsType ||
      'Combo Offer'
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

  isComboSubscription(): boolean {
    const offerType = String(this.subscriptionData?.offerType ?? '').toUpperCase();
    const subsType = String(this.subscriptionData?.subsType ?? '').toUpperCase();
    const paymentFor = Array.isArray(this.subscriptionData?.paymentfor)
      ? this.subscriptionData.paymentfor.map((p: any) => String(p ?? '').toUpperCase())
      : [];

    return (
      offerType === 'ALL' ||
      offerType === 'COMBO' ||
      subsType === 'SUBSCRIBE' ||
      (paymentFor.includes('DYNAMO') && paymentFor.includes('QUIZWHIZZ')) ||
      Boolean(this.subscriptionData?.comboOfferId)
    );
  }

  // Calculate plan price dynamically from corresponding Combo Offer Price
  calculatePlanPrice() {
    if (!this.subscriptionData) {
      this.planPrice = 0;
      return;
    }

    if (this.isFreeTrialSubscription()) {
      this.planPrice = 0;
      return;
    }

    // 1. If explicit planPrice or comboOfferPrice is present on subscription record
    if (this.subscriptionData.planPrice != null && Number(this.subscriptionData.planPrice) > 0) {
      this.planPrice = Number(this.subscriptionData.planPrice);
      return;
    }
    if (this.subscriptionData.comboOfferPrice != null && Number(this.subscriptionData.comboOfferPrice) > 0) {
      this.planPrice = Number(this.subscriptionData.comboOfferPrice);
      return;
    }

    // 2. Map via comboOfferId or comboOfferCode in allComboOffers
    if ((this.subscriptionData.comboOfferId || this.subscriptionData.comboOfferCode) && this.allComboOffers?.length > 0) {
      const matched = this.allComboOffers.find(
        (o: any) =>
          (this.subscriptionData.comboOfferId && o.id === this.subscriptionData.comboOfferId) ||
          (this.subscriptionData.comboOfferCode && (o.code === this.subscriptionData.comboOfferCode || o.id === this.subscriptionData.comboOfferCode))
      );
      if (matched) {
        this.comboOffer = matched;
        const price = Number(matched.totalPrice) || this.sumOfferApplicablesPrice(matched);
        if (price > 0) {
          this.planPrice = price;
          return;
        }
      }
    }

    // 3. Map to active combo offer if it is a combo subscription
    if (this.activeComboOffer && this.isComboSubscription()) {
      this.comboOffer = this.activeComboOffer;
      const price = Number(this.activeComboOffer.totalPrice) || this.sumOfferApplicablesPrice(this.activeComboOffer);
      if (price > 0) {
        this.planPrice = price;
        return;
      }
    }

    // 4. Calculate from paymentForDetails (offerApplicables saved during payment)
    if (Array.isArray(this.subscriptionData.paymentForDetails) && this.subscriptionData.paymentForDetails.length > 0) {
      const sum = this.subscriptionData.paymentForDetails.reduce(
        (acc: number, item: any) => acc + (Number(item?.price) || 0),
        0
      );
      if (sum > 0) {
        this.planPrice = sum;
        return;
      }
    }

    // 5. Check totalAmount from user_subscription (which was saved with comboOffer.totalPrice)
    if (this.subscriptionData.totalAmount != null && Number(this.subscriptionData.totalAmount) > 0) {
      this.planPrice = Number(this.subscriptionData.totalAmount);
      return;
    }

    // 6. Fallback to activeComboOffer if available
    if (this.activeComboOffer) {
      this.comboOffer = this.activeComboOffer;
      const price = Number(this.activeComboOffer.totalPrice) || this.sumOfferApplicablesPrice(this.activeComboOffer);
      if (price > 0) {
        this.planPrice = price;
        return;
      }
    }

    // 7. Fallback to category prices from price_management
    const planName = this.getPlanName();
    const prices = this.prices;
    if (planName && prices) {
      const lower = planName.toLowerCase();
      if (lower.includes('individual')) {
        this.planPrice = Number(prices?.individual?.yearly) || 0;
      } else if (lower.includes('family')) {
        this.planPrice = Number(prices?.family) || 0;
      } else if (lower.includes('school')) {
        this.planPrice = Number(prices?.school) || 0;
      } else if (lower.includes('private')) {
        this.planPrice = Number(prices?.privateInstitution) || 0;
      }
    }
  }

  private sumOfferApplicablesPrice(offer: any): number {
    if (!offer || !Array.isArray(offer.offerApplicables)) return 0;
    return offer.offerApplicables.reduce(
      (sum: number, item: any) => sum + (Number(item?.price) || 0),
      0
    );
  }

  async getSubscriptionData() {
    if (!this.userDetails?.id) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;

    try {
      // 1. Check transaction collection for user's successful transactions
      const txnQuery = this.firestore.collection(FirebaseCollection.TRANSACTION).ref
        .where('userid', '==', this.userDetails.id)
        .where('status', '==', 'SUCCESS');

      const txnSnapshot = await txnQuery.get();
      let latestTxn: any = null;

      if (!txnSnapshot.empty) {
        const txns: any[] = [];
        txnSnapshot.forEach((doc: any) => {
          txns.push(doc.data());
        });

        // Sort descending by dateUnix / startDateUnix / txnDate
        txns.sort((a, b) => {
          const timeA = a.dateUnix || a.startDateUnix || (a.txnDate ? this.dateUtilService.getUnixTime(a.txnDate) : 0);
          const timeB = b.dateUnix || b.startDateUnix || (b.txnDate ? this.dateUtilService.getUnixTime(b.txnDate) : 0);
          return timeB - timeA;
        });

        latestTxn = txns[0];
      }

      // 2. Check user_subscription collection
      const userSubQuery = this.firestore.collection(FirebaseCollection.USER_SUBSCRIPTION).ref
        .where('userId', '==', this.userDetails.id);
      const userSubSnapshot = await userSubQuery.get();
      let userSubData: any = null;

      if (!userSubSnapshot.empty) {
        userSubSnapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.status === 'SUBSCRIBE' || data.status === 'SUCCESS' || !userSubData) {
            userSubData = data;
          }
        });
      }

      if (latestTxn) {
        this.subscriptionData = { ...latestTxn };
        if (userSubData?.totalAmount && !this.subscriptionData.planPrice) {
          this.subscriptionData.totalAmount = userSubData.totalAmount;
        }
        this.hasSubscription = true;
      } else if (userSubData) {
        this.subscriptionData = { ...userSubData };
        this.hasSubscription = true;
      } else {
        this.hasSubscription = false;
        this.subscriptionData = null;
      }

      // Calculate the plan price
      this.calculatePlanPrice();
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getFormattedStartDate(): string {
    const raw = this.subscriptionData?.startDate || this.subscriptionData?.txnDate || this.subscriptionData?.date;
    if (!raw) return 'N/A';
    return this.dateUtilService.formatToDDMMYYYY(raw) || 'N/A';
  }

  getFormattedEndDate(): string {
    if (this.isFreeTrialSubscription()) {
      return this.dateUtilService.formatToDDMMYYYY(this.subscriptionData?.endDate) || 'N/A';
    }
    // Regardless of when a user purchases the subscription, the subscription's fixed end date must be 30 March 2028 (30/03/2028)
    return this.dateUtilService.getFixedSubscriptionEndDate();
  }

  getPlanValidity(): string {
    if (this.isFreeTrialSubscription()) {
      return 'Free Trial';
    }
    const rawStart = this.subscriptionData?.startDate || this.subscriptionData?.txnDate || this.subscriptionData?.date;
    if (!rawStart) return 'N/A';
    const days = this.dateUtilService.calculatePlanValidityDays(rawStart, '30/03/2028');
    if (this.isSubscriptionExpired()) {
      return 'Expired';
    }
    if (days === 0) {
      return 'Expires Today';
    }
    if (days === 1) {
      return '1 Day';
    }
    return `${days} Days`;
  }

  getPlanPeriod(): string {
    const start = this.getFormattedStartDate();
    const end = this.getFormattedEndDate();
    if (start === 'N/A' || end === 'N/A') return 'N/A';
    return `${start} - ${end}`;
  }

  getPurchasedDateTime(): string {
    return this.subscriptionData?.txnDate || this.subscriptionData?.date || this.getFormattedStartDate();
  }

  getAcademicYear(): string {
    const rawStart = this.subscriptionData?.startDate || this.subscriptionData?.txnDate || this.subscriptionData?.date;
    let startYear = '2026';
    if (rawStart) {
      const m = this.dateUtilService.toMoment(rawStart);
      if (m && m.isValid()) {
        startYear = m.format('YYYY');
      }
    } else if (this.subscriptionData?.year) {
      startYear = String(this.subscriptionData.year);
    } else if ((this.userDetails as any)?.year) {
      startYear = String((this.userDetails as any).year);
    }
    return `${startYear} - 2028`;
  }

  isSubscriptionExpired(): boolean {
    if (this.isFreeTrialSubscription()) {
      return this.dateUtilService.isExpired(this.subscriptionData?.endDate);
    }
    const rawEnd = this.subscriptionData?.endDate || this.dateUtilService.getFixedSubscriptionEndDate();
    return this.dateUtilService.isExpired(rawEnd) || this.dateUtilService.isFixedSubscriptionEnded();
  }

  isSubscriptionActive(): boolean {
    return this.hasSubscription && !this.isSubscriptionExpired() && !this.isFreeTrialSubscription();
  }

  getSubscriptionStatus(): string {
    if (this.isSubscriptionExpired()) {
      return 'EXPIRED';
    }
    if (this.subscriptionData?.status === 'SUCCESS' || this.subscriptionData?.status === 'SUBSCRIBE') {
      return 'ACTIVE';
    }
    return this.subscriptionData?.status || 'ACTIVE';
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
