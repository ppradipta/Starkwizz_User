import { CountdownConfig } from "ngx-countdown";

export class UserDetails {
    public id: string = '';
    public userType?: string = '';
    public firstName?: string = '';
    public lastName?: string = '';
    public gender: string = '';
    public dateOfBirth: string = '';
    public boardName: string = '';
    public boardId: string = '';
    public className: string = '';
    public classId: string = '';
    public emailId: string = '';
    public isEmailVerified: boolean = false;
    public mobileNo: string = '';
    public displayName: string = '';
    public imageUrl: string = '';
    public parentName: string = '';
    public child?: Child[] = [];
    public stateId: string = '';
    public stateName: string = '';
    public districtId: string = '';
    public districtName: string = '';
    public cityId: string = '';
    public cityName: string = '';
    public schoolId: string = '';
    public schoolName: string = '';
    public followUsers: string[] = [];
    public interests: any[] = [];
    public applicationId: string = '';
    public profileType: string[] = [];
    public isAllowPushNotification: boolean = false;
    public profileAccess?: string;
    public token: string = '';
    public applicableClasses: any[] = [];
    public creationdate: string = '';
    public referralCode: string = '';
    public parentId: string = '';
    public creationUnixDate: number = 0;
    public createdBy: string = '';
    public userLinkType: string = '';
    public userId: string = '';
    public subscrtionDetails: any[] = [];
    public relationType: string = '';
    public altarnativeNumber: string = '';
    public message: string = '';
    public status: string = '';
}

export class Child {
    id: string = '';
    displayName: string = '';
    imageUrl: string = '';
    boardName: string = '';
    boardId: string = '';
    classId: string = '';
    className: string = '';
    applicationId: string = '';
}

export class UserProfileDetails {
    parentId: string = '';
    id: string = '';
    firstName?: string;
    lastName?: string;
    emaiId: string = '';
    isEmailVerify: boolean = false;
    mobileNo: string = '';
    displayName: string = '';
    imageUrl: string = '';
    class: string = '';
    dob: string = '';
    gender: string = '';
    boardName: string = '';
    boardId: string = '';
    classId: string = '';
    className: string = '';


}

export class userEvents {
    id: string = '';
    userId: string = '';
    userDisplayName: string = '';
    eventId: string = '';
    eventName: string = '';
    eventCode: string = '';
    eventStartTime: string = '';
    eventEndTime: string = '';
    eventAppearStartTime: string = '';
    eventAppearEndTime: String = '';
    totalSkipQuestions: number = 0;
    totalAppearQuesiton: number = 0;
    totalQuestion: number = 0;
    mode: string = ''; // attempted, skip
    questions: Questions[] = [];
    status: string = ''; // STARTED/INPROGRESS/COMPLETED
    examStatus: string = '';
    appearedDate: string = '';
    appearedDateUnix: number;
    type: string = '';//EXAM/EVENT
    moduleName: string = '';
    moduleId: string = '';
    totalHour: string = '';
    totalEventAppearTime: number = 0;
    eventDate: string = '';
    eventDateUnix: number;
    boardName: string = '';
    boardId: string = '';
    className: string = '';
    classId: string = '';
    subjectName: string = '';
    subjectId: string = '';
    category: string = '';
    mobileNo: number = 0;
    schoolId: string = '';
    schoolName: string = '';
    stateId: string = '';
    stateName: string = '';
    districtId: string = '';
    districtName: string = '';
    cityId: string = '';
    cityName: string = '';
    totalExamTime: number = 0;
    totalMarks: number = 0;
    totalInCorrect: number = 0;
    totalCorrect: number = 0;
    scheduledDate: string = '';
    scheduledTime: string = '';
    schdulestatus: string = '';
    colorCode: string = '';
    timerConfig: CountdownConfig = {} as CountdownConfig;
    applicableType: string = '';
    isDownloadAnsAllow: boolean = false;
    isLeaderBoardAllow: boolean = false;
    isReviewAnsAllow: boolean = false;
    isPublishRankAllow: boolean = false;
    categoryId: string = '';
}

export class Questions {
    id: string = '';
    userSelectedOption: string = '';
    mark: number = 0;
    status: string = ''; //correct/wrong/skip
    startTime: string = '';
    endTime: string = '';
}

export class FriendRequests {
    id: string = '';
    sendBy: Sendby = new Sendby();
    recievedTo: RecievedTo = new RecievedTo();
    status: string = '';

}

export class Sendby {
    id: string = '';
    imageUrl: string = '';
    displayName: string = '';
    className: string = '';
    boardName: string = '';
    stateName: string = '';
    districtName: string = '';
    cityName: string = '';
    schoolName: string = '';
}
export class RecievedTo {
    id: string = '';
    imageUrl: string = '';
    displayName: string = '';
    className: string = '';
    boardName: string = '';
    stateName: string = '';
    districtName: string = '';
    cityName: string = '';
    schoolName: string = '';

}

export class UserNotification {
    id: string = '';
    userId: string = '';
    token: string = '';
    displayName: string = '';
    title: string = '';
    msgText: string = '';
    status: string = '';
    creationDate: string = '';
    type: string = '';
}
export class Group {
    id: string = '';
    groupName: string = '';
    groupImage: string = '';
    groupUsers: GroupUsers[] = [];
    createdById: string = '';
    createdByName: string = '';
    createdByImageUrl: string = '';
    createdDate: string = '';
    groupUsersId: string[] = [];
}

export class GroupUsers {
    id: string = '';
    imageUrl: string = '';
    displayName: string = '';
    mobileNo: string = '';
    role: string = '';
    stateName: string = '';
    districtName: string = '';
    cityName: string = '';
    className: string = '';
    boardName: string = '';
    schoolName: string = '';
}