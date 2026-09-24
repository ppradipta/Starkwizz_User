import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserDetails } from 'src/app/model/user';
import { UserServiceService } from 'src/app/services/user-service.service';


type OfferCategory = 'Individual' | 'Family' | 'School' | 'Private Institution';

@Component({
  selector: 'app-category-offer',
  templateUrl: './category-offer.component.html',
  styleUrls: ['./category-offer.component.scss'],
})
export class CategoryOfferComponent implements OnInit {
  userDetails: UserDetails = new UserDetails();
  userName: string = '';
  selectedCategory: string = '';
  showIndividualPlan: boolean = false;
  showFamilyPlan: boolean = false;
  showSchoolPlan: boolean = false;
  showPrivateInstitutionPlan: boolean = false;

  plans: Array<{
    key: OfferCategory;
    title: string;
    subtitle: string;
    price?: string;
    badge?: string;
    icon: string;
    features: string[];
    note?: string;
  }> = [
    {
      key: 'Individual',
      title: 'Individual',
      subtitle: 'For one child',
      price: '--/year',
      icon: 'person-circle-outline',
      features: [
        'Single student account',
        'Parent dashboard access',
        'Progress tracking & reports',
        'Suitable for one child only',
      ],
      note: 'Parent reference required',
    },
    {
      key: 'Family',
      title: 'Family',
      subtitle: 'For siblings (up to 3 children)',
      price: '--/year',
      badge: 'MOST POPULAR',
      icon: 'people-circle-outline',
      features: [
        'Multiple independent student accounts',
        'One parent dashboard',
        'Individual progress reports for each child',
        'Best value for families',
      ],
      note: 'Parent reference required • Maximum 3 children',
    },
    {
      key: 'School',
      title: 'School',
      subtitle: 'For schools',
      price: '--/year',
      icon: 'school-outline',
      features: [
        'Individual student accounts',
        'Teacher / admin dashboard',
        'Class-wise performance analytics',
        'Ideal for schools',
      ],
      note: 'School or institute reference required',
    },
    {
      key: 'Private Institution',
      title: 'Coaching Institute',
      subtitle: 'For coaching institutes',
      price: '--/year',
      icon: 'business-outline',
      features: [
        'Individual student accounts',
        'Admin dashboard',
        'Performance analytics',
        'Best for coaching institutions',
      ],
      note: 'Institute reference required',
    },
  ];

  constructor(
    private userService: UserServiceService,
    private firestore: AngularFirestore,
  ) {}

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
      const displayName = (this.userDetails?.displayName || '').trim();
      const fullName = `${this.userDetails?.firstName || ''} ${this.userDetails?.lastName || ''}`.trim();
      const firstName = (this.userDetails?.firstName || '').trim();
      const parentName = (this.userDetails?.parentName || '').trim();

      // Prefer displayName because it is used across the app (and is typically the correct visible name)
      this.userName = displayName || fullName || firstName || parentName;
    });

    this.firestore
      .collection('price_management')
      .doc('prices')
      .valueChanges()
      .subscribe((prices: any) => {
        this.applyPlanPrices(prices);
      });
  }

  private applyPlanPrices(prices: any) {
    if (!prices) return;

    const planByKey = new Map<OfferCategory, (typeof this.plans)[number]>();
    this.plans.forEach((p) => planByKey.set(p.key, p));

    const individualYearly = Number(prices?.individual?.yearly);
    const familyYearly = Number(prices?.family);
    const schoolYearly = Number(prices?.school);
    const privateInstitutionYearly = Number(prices?.privateInstitution);

    const individualPlan = planByKey.get('Individual');
    if (individualPlan) individualPlan.price = this.formatYearPrice(individualYearly);

    const familyPlan = planByKey.get('Family');
    if (familyPlan) familyPlan.price = this.formatYearPrice(familyYearly);

    const schoolPlan = planByKey.get('School');
    if (schoolPlan) schoolPlan.price = this.formatYearPrice(schoolYearly);

    const privateInstitutionPlan = planByKey.get('Private Institution');
    if (privateInstitutionPlan) privateInstitutionPlan.price = this.formatYearPrice(privateInstitutionYearly);
  }

  private formatYearPrice(amount: number) {
    return Number.isFinite(amount) && amount > 0 ? `${amount}/year` : '--/year';
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    console.log('Selected category:', category);
    // Add logic to handle category selection
  }

  onNext() {
    if (this.selectedCategory) {
      console.log('Proceeding with category:', this.selectedCategory);
      if (this.selectedCategory === 'Individual') {
        this.showIndividualPlan = true;
      } else if (this.selectedCategory === 'Family') {
        this.showFamilyPlan = true;
      } else if (this.selectedCategory === 'School') {
        this.showSchoolPlan = true;
      } else if (this.selectedCategory === 'Private Institution') {
        this.showPrivateInstitutionPlan = true;
      }else {
        // Handle other categories or show a message
        console.log('Navigation for other categories not implemented yet');
      }
    } else {
      console.log('Please select a category');
    }
  }
}
