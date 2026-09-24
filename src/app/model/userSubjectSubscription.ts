
export class UserSubjectSubscription {
    public subject: Subjects[] = [];
    public id: string = '';
    public userId: string = '';
    public className: string = '';
    public classId: string = '';
    public status: string = '';
    public subscribedDate: string = '';
    public expiryDate: any;
    public subscribeAmount: number = 0;
    public discountAmount: number = 0;
    public totalAmount: number = 0;
    public discountType: string = '';
    public subscibedSubjectCount: number = 0;
    public applicationDiscounts: any = {};
    public referralDiscount: any = {};
    public paymentId: string = '';
    public mobileNo: number = 0;
    public userDetails: UserData = new UserData();
    public email: string = '';
    public type: string = '';
    public applicationId: string = '';
    public boardName: string = '';
    public boardId: string = '';
    public schoolName: string = '';
    public schoolId: string = '';
    public cityName: string = '';
    public cityId: string = '';
    public districtName: string = '';
    public districtId: string = '';
    public stateName: string = '';
    public stateId: string = '';
    public details: any;
    public subscriptionType: string = '';

}

export class Subjects {
    public subjectId: string = '';
    public subjectName: string = '';
    public category: string = '';
}
export class UserData {
    userId: string = '';
    mobileNo: number = 0;
    displayName: string = '';
    email: string = '';
}


export class UserEventSubscription {
    public events: EventSubscribedDetails[] = [];
    public id: string = '';
    public userId: string = '';
    public className: string = '';
    public classId: string = '';
    public status: string = '';
    public subscribedDate: string = '';
    public subscribedDateUnix: any;
    public expiryDate: any;
    public expiryDateUnix: any;
    public subscribeAmount: string = '';
    public discountAmount: string = '';
    public totalAmount: string = '';
    public discountId: string = '';
    public paymentId: string = '';
    public date: string = '';
    public dateUnix: number = 0;
    public userDetails: UserData = new UserData();
}

export class EventSubscribedDetails {
    public eventId: string = '';
    public eventCode: string = '';
    public eventName: string = '';
    public subjectId: string = '';
    public subjectName: string = '';
    public category: string = ''; // Diagnostic , Progressive, Proficiency
    public status: string = '';
    public imageUrl: string = '';
    public colorCode: string = '';
    public eventDate: string = '';
    public eventDateUnix: number;
    public startTime: string = '';
    public endTime: string = '';
    public totalHour: number = 0;
    public eventMarks: string = '';
    public eventEndDate: string = '';
    public eventStartDate: string = '';
    public price: number = 0;

}