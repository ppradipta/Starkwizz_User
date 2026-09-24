import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { GenerateKeyService } from 'src/app/model/common/common.generatekey';
import { SubjectsView } from 'src/app/model/event';
import { userEvents, UserNotification } from 'src/app/model/user';
import { EventSubscribedDetails, Subjects, UserEventSubscription, UserSubjectSubscription } from 'src/app/model/userSubjectSubscription';

@Injectable({
    providedIn: 'root'
})

export class UserHelperService {
    public subjects = new ReplaySubject<any[]>(1);
    public question = new ReplaySubject<any[]>(1);


    constructor(
        private generateKeyService: GenerateKeyService,
        private dateUtilService: DateUtilService
    ) { }

    setSubjectsList(subject: any) {
        this.subjects.next(subject);
    }
    getSubjectsList() {
        return this.subjects.asObservable();
    }

    setQuestionDetails(question: any) {
        this.question.next(question);
    }
    getQuestionDetails() {
        return this.question.asObservable();
    }

    pushOTPForEmail(email: any) {
        let emailOtp = {
            id: this.generateKeyService.generateUniqueFirestoreId(),
            functionType: 'EMAIL_OTP',
            to: email,
            message: {
                subject: "Starkwizz Email OTP ",
                text: `Never Share this OTP with anyone.Use  ${Math.floor(100009 + Math.random() * 999999).toString()} for email verification.Starkwizz`,
                html: `Never Share this OTP with anyone.Use  ${Math.floor(100009 + Math.random() * 999999).toString()} for email verification.Starkwizz`,
            }
        }
        return emailOtp;
    }

    populateQuizWhizzSubscription(subjectList: any, userDetail: any, totalPrice: any, appliedDiscountAmount: any, totalDiscount: any, payment_id: any, transactionId: any, subscribeUserEmail: any) {
        let userSubjectSubscription = new UserSubjectSubscription();
        userSubjectSubscription.subject = [];
        userSubjectSubscription.id = transactionId;
        userSubjectSubscription.userId = userDetail.id;
        userSubjectSubscription.status = 'SUBSCRIBED';
        userSubjectSubscription.subscribedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
        userSubjectSubscription.expiryDate = this.dateUtilService.addDayToCurrentData(365);
        userSubjectSubscription.subscribeAmount = appliedDiscountAmount
        userSubjectSubscription.totalAmount = totalPrice;
        userSubjectSubscription.paymentId = payment_id;
        userSubjectSubscription.type = 'QUIZWHIZZ';
        let userData = {
            displayName: userDetail.displayName,
            mobileNo: userDetail.mobileNo,
            userId: userDetail.id,
            email: subscribeUserEmail
        }
        subjectList.forEach((subject: any) => {
            if (subject.isChecked) {
                userSubjectSubscription.classId = subject.classId;
                userSubjectSubscription.className = subject.className;
                let subjData: Subjects = {
                    subjectId: subject.id,
                    subjectName: subject.displayName,
                    category: subject.category
                }
                userSubjectSubscription.subject.push(subjData);
            }

        });
        userSubjectSubscription.userDetails = userData;
        return userSubjectSubscription;
    }

    populateSubjectSubscription(subjectList: any, userDetail: any, totalPrice: number, appliedDiscountAmount: number, totalDiscount: number, discountType: string, payment_id: any, transactionId: any, subscribeUserEmail: any, type: string, expiryDate: string, subscriptionType: string) {
        let userSubjectSubscription = new UserSubjectSubscription();
        userSubjectSubscription.subject = [];
        userSubjectSubscription.id = transactionId;
        userSubjectSubscription.userId = userDetail.id;
        userSubjectSubscription.email = subscribeUserEmail;
        userSubjectSubscription.applicationId = userDetail.applicationId;
        userSubjectSubscription.boardName = userDetail.boardName;
        userSubjectSubscription.boardId = userDetail.boardId;
        userSubjectSubscription.className = userDetail.className;
        userSubjectSubscription.classId = userDetail.classId;
        userSubjectSubscription.schoolName = userDetail.schoolName;
        userSubjectSubscription.schoolId = userDetail.schoolId;
        userSubjectSubscription.cityName = userDetail.cityName;
        userSubjectSubscription.cityId = userDetail.cityId;
        userSubjectSubscription.districtName = userDetail.districtName;
        userSubjectSubscription.districtId = userDetail.districtId;
        userSubjectSubscription.stateName = userDetail.stateName;
        userSubjectSubscription.stateId = userDetail.stateId;
        userSubjectSubscription.status = subscriptionType;
        userSubjectSubscription.subscribedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
        userSubjectSubscription.expiryDate = expiryDate;
        userSubjectSubscription.subscribeAmount = appliedDiscountAmount
        userSubjectSubscription.discountAmount = totalDiscount;
        userSubjectSubscription.totalAmount = totalPrice;
        userSubjectSubscription.discountType = discountType;
        userSubjectSubscription.paymentId = payment_id;
        userSubjectSubscription.type = type;
        userSubjectSubscription.mobileNo = userDetail.mobileNo;
        userSubjectSubscription.email = subscribeUserEmail;
        userSubjectSubscription.subscriptionType = subscriptionType;
        let userData = {
            displayName: userDetail.displayName,
            mobileNo: userDetail.mobileNo,
            userId: userDetail.id,
            email: subscribeUserEmail

        }
        userSubjectSubscription.userDetails = userData;
        return userSubjectSubscription

    }


    populateQuizSubscription(quizSubscription: any, userDetail: any, totalPrice: number, appliedDiscountAmount: number, totalDiscount: number, discountType: string, payment_id: any, transactionId: any, subscribeUserEmail: any, type: string, expiryDate: any, subscriptionType: string) {
        let userQuizSubscription = new UserSubjectSubscription();
        userQuizSubscription.id = transactionId;
        userQuizSubscription.userId = userDetail.id;
        userQuizSubscription.email = subscribeUserEmail;
        userQuizSubscription.applicationId = userDetail.applicationId;
        userQuizSubscription.boardName = userDetail.boardName;
        userQuizSubscription.boardId = userDetail.boardId;
        userQuizSubscription.className = userDetail.className;
        userQuizSubscription.classId = userDetail.classId;
        userQuizSubscription.schoolName = userDetail.schoolName;
        userQuizSubscription.schoolId = userDetail.schoolId;
        userQuizSubscription.cityName = userDetail.cityName;
        userQuizSubscription.cityId = userDetail.cityId;
        userQuizSubscription.districtName = userDetail.districtName;
        userQuizSubscription.districtId = userDetail.districtId;
        userQuizSubscription.stateName = userDetail.stateName;
        userQuizSubscription.stateId = userDetail.stateId;
        userQuizSubscription.status = subscriptionType;
        userQuizSubscription.subscribedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
        userQuizSubscription.expiryDate = expiryDate;
        userQuizSubscription.subscribeAmount = appliedDiscountAmount
        userQuizSubscription.discountAmount = totalDiscount;
        userQuizSubscription.totalAmount = totalPrice;
        userQuizSubscription.discountType = discountType;
        userQuizSubscription.paymentId = payment_id;
        userQuizSubscription.type = type;
        userQuizSubscription.mobileNo = userDetail.mobileNo;
        userQuizSubscription.details = quizSubscription;
        userQuizSubscription.subscriptionType = subscriptionType;
        let userData = {
            displayName: userDetail.displayName,
            mobileNo: userDetail.mobileNo,
            userId: userDetail.id,
            email: subscribeUserEmail
        }
        userQuizSubscription.userDetails = userData;
        return userQuizSubscription

    }

    populateUserEventData(question: any, testEvent: any, userDetails: any, operation: string, type: any, category: string) {
        let userEvent = new userEvents();
        if (operation == 'UPDATE') {
            testEvent.eventAppearEndTime = this.dateUtilService.getCurrentTimeWith12hrFormat();
            if (question.mode == 'SKIPPED') {
                testEvent.totalSkipQuestions += 1;
            }
            if (question.mode == "APPTEMPTED") {
                testEvent.totalAppearQuesiton += 1;
            }
            testEvent.totalQuestion += 1;

            let qData = {
                id: question.id,
                userSelectedOption: question.selectedOption,
                mark: question.mark,
                status: question.status,
                startTime: question.questionStartTime,
                endTime: question.questionEndTime
            }
            testEvent.questions.push(qData);
            testEvent.userId = userDetails.id;
            //testEvent.totalEventAppearTime = this.dateUtilService.getTimeDifferenceInMins(testEvent.eventAppearStartTime, testEvent.eventAppearEndTime);
            testEvent.totalExamTime = (this.dateUtilService.getTimeDifferenceInMins(testEvent.eventAppearStartTime, testEvent.eventAppearEndTime) * 60);
            if (question.status == 'CORRECT') {
                testEvent.totalCorrect += 1;
                testEvent.totalMarks += question.mark;
            }
            else if (question.status == 'WRONG') {
                testEvent.totalInCorrect += 1;
            }
            return testEvent;
        }
        else if (operation == 'STARTED') {
             if (type == 'DYNAMO EXAM') {
                 userEvent = testEvent;
                 userEvent.status = "STARTED";
                 userEvent.examStatus = "STARTED";
                 userEvent.eventId = testEvent.id;
                 userEvent.eventAppearStartTime = this.dateUtilService.getCurrentTimeWith12hrFormat();
                 userEvent.eventStartTime = testEvent.startTime;
                 userEvent.eventEndTime = testEvent.endTime;
                 userEvent.appearedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
                 userEvent.appearedDateUnix = this.dateUtilService.getUnixTime(userEvent.appearedDate);
                 userEvent.eventDateUnix = this.dateUtilService.getUnixTime(testEvent.eventDate);
                 userEvent.mobileNo = userDetails.mobileNo;
                 userEvent.schoolId = userDetails.schoolId;
                 userEvent.schoolName = userDetails.schoolName;
                 userEvent.cityId = userDetails.cityId;
                userEvent.cityName = userDetails.cityName;
                userEvent.stateId = userDetails.stateId;
                userEvent.stateName = userDetails.stateName;
                userEvent.districtId = userDetails.districtId;
                userEvent.districtName = userDetails.districtName;
                userEvent.applicableType = testEvent.applicableType;
                userEvent.isDownloadAnsAllow = testEvent.isDownloadAnsAllow;
                userEvent.isLeaderBoardAllow = testEvent.isLeaderBoardAllow;
                userEvent.isReviewAnsAllow = testEvent.isReviewAnsAllow;
                userEvent.isPublishRankAllow = false;
                userEvent.totalMarks = Number(testEvent.eventMarks);
                return userEvent;
            } else {
                userEvent.id = this.generateKeyService.generateUniqueFirestoreId();
                userEvent.userId = userDetails.id;
                userEvent.userDisplayName = userDetails.displayName;
                userEvent.eventId = testEvent.id;
                userEvent.eventName = testEvent.eventName;
                userEvent.eventCode = testEvent.eventCode;
                 userEvent.status = "STARTED";
                 userEvent.examStatus = "STARTED";
                 userEvent.eventAppearStartTime = this.dateUtilService.getCurrentTimeWith12hrFormat();
                 userEvent.eventStartTime = testEvent.startTime;
                 userEvent.eventEndTime = testEvent.endTime;
                 userEvent.appearedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
                 userEvent.appearedDateUnix = this.dateUtilService.getUnixTime(userEvent.appearedDate);
                 userEvent.type = type;
                 userEvent.moduleName = testEvent.moduleName;
                 userEvent.moduleId = testEvent.moduleId;
                 userEvent.totalHour = testEvent.totalHour;
                userEvent.eventDate = testEvent.eventDate;
                userEvent.eventDateUnix = this.dateUtilService.getUnixTime(testEvent.eventDate);
                userEvent.boardId = testEvent.boardId;
                userEvent.boardName = testEvent.boardName;
                userEvent.className = testEvent.className;
                userEvent.classId = testEvent.classId;
                userEvent.moduleName = testEvent.moduleName;
                userEvent.subjectName = testEvent.subjectName;
                userEvent.subjectId = testEvent.subjectId;
                userEvent.category = testEvent.category;
                userEvent.categoryId = testEvent.categoryId;
                userEvent.mobileNo = userDetails.mobileNo;
                userEvent.schoolId = userDetails.schoolId;
                userEvent.schoolName = userDetails.schoolName;
                userEvent.cityId = userDetails.cityId;
                userEvent.cityName = userDetails.cityName;
                userEvent.stateId = userDetails.stateId;
                userEvent.stateName = userDetails.stateName;
                userEvent.districtId = userDetails.districtId;
                userEvent.districtName = userDetails.districtName;
                userEvent.applicableType = testEvent.applicableType;
                userEvent.isDownloadAnsAllow = testEvent.isDownloadAnsAllow;
                userEvent.isLeaderBoardAllow = testEvent.isLeaderBoardAllow;
                userEvent.isReviewAnsAllow = testEvent.isReviewAnsAllow;
                userEvent.isPublishRankAllow = testEvent.isPublishRankAllow;
                userEvent.totalMarks = Number(testEvent.eventMarks);
                return userEvent;
            }
        }
    }

    populateEventSubject(event: any) {
        let subject = new SubjectsView();
        subject.subjectId = event.subjectId;
        subject.subjectName = event.subjectName;
        subject.type = event.type;
        subject.status = event.status;
        subject.moduleName = event.moduleName;
        subject.moduleId = event.moduleId;
        subject.category = event.category;

        return subject;
    }

    populateUserNotificationForSubjectsubscription(userDetail: any) {
        let userNoti = new UserNotification();
        userNoti.id = this.generateKeyService.generateUniqueFirestoreId();
        userNoti.userId = userDetail.id;
        userNoti.token = userDetail.token;
        userNoti.displayName = userDetail.displayName;
        userNoti.status = 'ACTIVE';
        userNoti.title = 'Subject Subscribed Successfulyy !!!'
        userNoti.msgText = `hi ${userNoti.displayName}, You have successfully subscribed subjects successfully`;
        userNoti.creationDate = this.dateUtilService.getCurrentDateWithTime();

        return userNoti;
    }

    populateUserNotificationForReschedule(userDetail: any) {
        let userNoti = new UserNotification();
        userNoti.id = this.generateKeyService.generateUniqueFirestoreId();
        userNoti.userId = userDetail.id;
        userNoti.token = userDetail.token;
        userNoti.displayName = userDetail.displayName;
        userNoti.status = 'ACTIVE';
        userNoti.title = 'Event Rescheduled SucessFully !!!'
        userNoti.msgText = `hi ${userNoti.displayName}, You have successfully Rescheduled your event`;
        userNoti.creationDate = this.dateUtilService.getCurrentDateWithTime();

        return userNoti;
    }


    populateUserNotiForExmFinished(userDetail: any, userEventData: any) {
        let userNoti = new UserNotification();
        userNoti.id = this.generateKeyService.generateUniqueFirestoreId();
        userNoti.userId = userDetail.id;
        userNoti.token = userDetail.token;
        userNoti.type = userEventData.type;
        userNoti.displayName = userDetail.displayName;
        userNoti.status = 'ACTIVE';
        userNoti.title = 'Exam Finished'
        if (userEventData.type == 'EXAM' || userEventData.type == 'DYNAMO EXAM') {
            userNoti.msgText = `Dear ${userDetail.displayName}, You have successfully completed ${userEventData.eventName}.`;
        } else {
            userNoti.msgText = `Dear ${userDetail.displayName}, You have successfully completed ${userEventData.eventName},Your rank will publish soon.`;
        }
        userNoti.creationDate = this.dateUtilService.getCurrentDateWithTime();
        return userNoti;
    }

    populateUserNotiForNewUser(userDetail: any) {
        let userNoti = new UserNotification();
        userNoti.id = this.generateKeyService.generateUniqueFirestoreId();
        userNoti.userId = userDetail.id;
        userNoti.token = userDetail.token;
        userNoti.displayName = userDetail.displayName;
        userNoti.status = 'ACTIVE';
        userNoti.title = 'Welcome !!'
        userNoti.msgText = `hi ${userNoti.displayName}, welcome to starkwizz`;
        userNoti.creationDate = this.dateUtilService.getCurrentDateWithTime();

        return userNoti;
    }

    populateFreeTrailData(userDetails: any) {
        let freeTrail = new UserSubjectSubscription();
        freeTrail.id = this.generateKeyService.generateUniqueFirestoreId();
        freeTrail.status = 'FREE_TRAIL';
        freeTrail.userId = userDetails.id;

        return freeTrail
    }




    populateEventSubscriptionDetails(events: any, userDetail: any, totalPrice: any, subscribeAmount: any, totalDiscount: any, discount: any, payment_id: any, transactionId: any) {
        let userEventsSubscription = new UserEventSubscription();
        userEventsSubscription.events = [];
        userEventsSubscription.id = transactionId;
        userEventsSubscription.userId = userDetail.id;
        userEventsSubscription.classId = userDetail.classId;
        userEventsSubscription.className = userDetail.className;
        userEventsSubscription.status = 'EVENT_SUBSCRIBED';
        userEventsSubscription.date = this.dateUtilService.getCurrentDateWithTime();
        userEventsSubscription.dateUnix = this.dateUtilService.getCurrentEpochTime();
        userEventsSubscription.subscribedDate = this.dateUtilService.getCurrentDateWithYYYYMMDD();
        userEventsSubscription.subscribedDateUnix = this.dateUtilService.getUnixTime(userEventsSubscription.subscribedDate);
        userEventsSubscription.expiryDate = this.dateUtilService.addDayToCurrentData(365);
        userEventsSubscription.expiryDateUnix = this.dateUtilService.getUnixTime(userEventsSubscription.expiryDate);
        userEventsSubscription.subscribeAmount = subscribeAmount
        userEventsSubscription.discountAmount = totalDiscount;
        userEventsSubscription.totalAmount = totalPrice;
        userEventsSubscription.discountId = null != discount ? discount.id : null;
        userEventsSubscription.paymentId = payment_id;
        events.forEach((event: any) => {
            let subscribedEvent: EventSubscribedDetails = {
                eventId: event.id,
                eventCode: event.eventCode,
                eventName: event.eventName,
                subjectId: event.subjectId,
                subjectName: event.subjectName,
                category: event.category,
                status: 'SUBSCRIBED',
                imageUrl: event.imageUrl,
                colorCode: event.colorCode,
                eventDate: event.eventDate,
                eventDateUnix: this.dateUtilService.getUnixTime(event.eventDate),
                startTime: event.startTime,
                endTime: event.endTime,
                totalHour: event.totalHour,
                eventMarks: event.eventMarks,
                eventEndDate: event.eventEndDate,
                eventStartDate: event.eventStartDate,
                price: event.price
            }
            userEventsSubscription.events.push(subscribedEvent);
        });
        let userData = {
            displayName: userDetail.displayName,
            mobileNo: userDetail.mobileNo,
            userId: userDetail.id,
            email: userDetail.emailId

        }
        userEventsSubscription.userDetails = userData;
        return userEventsSubscription

    }

}
