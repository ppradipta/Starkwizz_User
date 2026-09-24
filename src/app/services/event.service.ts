import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { ReplaySubject, map } from "rxjs";
import { Event } from "../model/event";
import { DateUtilService } from "../common/util/date-util.service";
import { UtilServiceService } from "./util-service.service";

@Injectable({
  providedIn: 'root'
})
export class EventService {
  event = new ReplaySubject<any>(1);
  selectedSubject = new ReplaySubject<any>(1);
  selectedHub = new ReplaySubject<any>(1);
  segmentValue = new ReplaySubject<string>(1);
  exam = new ReplaySubject<any>(1);
  eventsForSelectedSubject = new ReplaySubject<Event[]>(1);
  quizWhizzSubjectEvents = new ReplaySubject<any[]>(1);
  qizWhizzSubject = new ReplaySubject<any>(1);
  rankEvent = new ReplaySubject<any>(1);
  resultDetails = new ReplaySubject<any>(1);
  eventDetails = new ReplaySubject<any>(1);
  dynamoExams = new ReplaySubject<any[]>(1);
  comboSubscription = new ReplaySubject<any[]>(1);
  appreadDetails = new ReplaySubject<any[]>(1);
  constructor(
    private firestore: AngularFirestore,
    private dateUtilService: DateUtilService,
    private util: UtilServiceService,
  ) { }


  setDynamoExamForSelectedSubject(events: any[]) {
    this.dynamoExams.next(events);
  }

  getDynamoExamForSelectedSubject() {
    return this.dynamoExams.asObservable();
  }


  setResultDetails(results: any) {
    this.resultDetails.next(results);
  }

  getResultDetails() {
    return this.resultDetails.asObservable();
  }

  setAllAppreadedEvents(events: any[]) {
    this.eventDetails.next(events);
  }

  getAllAppreadedEvents() {
    return this.eventDetails.asObservable();
  }


  setAppreadedEvents(events: any[]) {
    this.appreadDetails.next(events);
  }

  geAppreadedEvents() {
    return this.appreadDetails.asObservable();
  }


  setQuizWhizzSubjectEvents(events: any[]) {
    this.quizWhizzSubjectEvents.next(events);
  }

  getQuizWhizzSubjectEvents() {
    return this.quizWhizzSubjectEvents.asObservable();
  }


  setQizWhizzSubject(events: any) {
    this.qizWhizzSubject.next(events);
  }

  getQizWhizzSubject() {
    return this.qizWhizzSubject.asObservable();
  }



  setRankEvent(event: any) {
    this.rankEvent.next(event);
  }

  getRankEvent() {
    return this.rankEvent.asObservable();
  }

  setEventsForSelectedSubject(events: Event[]) {
    this.eventsForSelectedSubject.next(events);
  }

  getEventsForSelectedSubject() {
    return this.eventsForSelectedSubject.asObservable();
  }


  setTestEvent(event: any) {
    this.event.next(event);
  }

  getTestEvent() {
    return this.event.asObservable();
  }

  setSelectedSubject(items: any) {
    this.selectedSubject.next(items);
  }
  getSelectedSubject() {
    return this.selectedSubject.asObservable();
  }

  setHubDetails(items: any) {
    this.selectedHub.next(items);
  }
  getHubDetails() {
    return this.selectedHub.asObservable();
  }

  setSegmentValue(segmentValue: string) {
    this.segmentValue.next(segmentValue);
  }

  getSegmentValue() {
    return this.segmentValue.asObservable();
  }

  setExamForSchedule(exam: any) {
    this.exam.next(exam);
  }

  getExamForSchedule() {
    return this.exam.asObservable();
  }

  setComboOfferSubs(data: any) {
    this.comboSubscription.next(data);
  }
  getComboOfferSubs() {
    return this.comboSubscription.asObservable();
  }


  checkEligibilityForQuatorOneTest(testEvts: any[], modules: any[]) {
    const percentageValue = (100 * testEvts.length) / modules.length;
    return percentageValue > 25
  }


  calculateSubjectForQuatorTest(testEvts: any[], modules: any[]) {
    let selectedModules = [];
    let subjectCount = Math.round((25 * modules.length) / 100);
    for (let i = 0; i < subjectCount; i++) {
      let module = {
        id: modules[i].id,
        displayName: modules[i].name
      }
      if (module && module.id) {
        selectedModules.push(module);
      }
    }
    return selectedModules;
  }



  calculateSubjectForQuatorFourTest(testEvts: any[], modules: any[]) {
    let selectedModules = [];
    for (let i = 0; i < testEvts.length; i++) {
      let module = {
        id: testEvts[i].moduleId,
        displayName: testEvts[i].moduleName
      }
      selectedModules.push(module);
    }
    selectedModules = selectedModules.filter(function (element) {
      return element !== undefined;
    });
    return selectedModules;
  }

  calculateSubjectForBenMarkTest(modules: any[]) {
    let selectedModules = [];
    for (let i = 0; i < modules.length; i++) {
      let module = {
        id: modules[i].id,
        displayName: modules[i].displayName
      }
      selectedModules.push(module);
    }
    selectedModules = selectedModules.filter(function (element) {
      return element !== undefined;
    });
    return selectedModules;
  }

  checkEligibilityForQuatorTwoTest(testEvts: any[], modules: any[]) {
    const percentageValue = (100 * testEvts.length) / modules.length;
    return percentageValue > 50
  }


  checkEligibilityForQuatorThreeTest(testEvts: any[], modules: any[]) {
    const percentageValue = (100 * testEvts.length) / modules.length;
    return percentageValue > 75
  }

  checkEligibilityForQuatorFourTest(testEvts: any[], modules: any[]) {
    const percentageValue = (100 * testEvts.length) / modules.length;
    return percentageValue > 98
  }


  getLinkedPublisherForUser(user: any) {
    return this.firestore.collection<any>('user_prefrence_publisher', ref =>
      ref.where("className", "==", user.className)
        // .where("userId", "==", user.id)
        .where("boardName", "==", user.boardName)).snapshotChanges().pipe(
          map(actions => actions.map(a => {
            return a.payload.doc.data() as any;
          }))
        );
  }


  setUserPublisherPrefrenceToCollections(prefrence: any) {
    return this.firestore.collection('user_prefrence_publisher').doc(prefrence.id)
      .set(JSON.parse(JSON.stringify(prefrence)), { merge: true });
  }


  generateRewardNotLastSunday(point) {
    if (point >= 1 && point <= 10) {
      let rewardDetail = {
        status: 'CANDY',
        turtleDriveBonusPoint: 11,
      }
      return rewardDetail;
    } else if (point >= 11 && point <= 20) {
      let rewardDetail = {
        status: 'POPSICLE',
        turtleDriveBonusPoint: 22,
      }
      return rewardDetail;
    } else if (point >= 21 && point <= 30) {
      let rewardDetail = {
        status: 'BUBBLEGUM',
        turtleDriveBonusPoint: 33,
      }
      return rewardDetail;
    } else if (point >= 31 && point <= 40) {
      let rewardDetail = {
        status: 'CARAMEL',
        turtleDriveBonusPoint: 44,
      }
      return rewardDetail;
    } else if (point >= 41 && point <= 50) {
      let rewardDetail = {
        status: 'BEGINNER',
        turtleDriveBonusPoint: 55,
      }
      return rewardDetail;
    } else if (point >= 51 && point <= 60) {
      let rewardDetail = {
        status: 'ENTHUSIAST',
        turtleDriveBonusPoint: 66,
      }
      return rewardDetail;
    } else if (point >= 61 && point <= 70) {
      let rewardDetail = {
        status: 'POSITIVE PEERS',
        turtleDriveBonusPoint: 77,
      }
      return rewardDetail;
    } else if (point >= 71 && point <= 80) {
      let rewardDetail = {
        status: 'RISING STAR',
        turtleDriveBonusPoint: 88,
      }
      return rewardDetail;
    } else if (point >= 81 && point <= 90) {
      let rewardDetail = {
        status: 'LUCKY CHARM',
        turtleDriveBonusPoint: 99,
      }
      return rewardDetail;
    } else if (point >= 91 && point <= 95) {
      let rewardDetail = {
        status: 'GENIUS',
        turtleDriveBonusPoint: 111,
      }
      return rewardDetail;
    } else if (point >= 96 && point <= 100) {
      let rewardDetail = {
        status: 'GRAND MASTER',
        turtleDriveBonusPoint: 222,
      }
      return rewardDetail;
    }
  }

  generateRewardLastSunday(point) {
    if (point >= 1 && point <= 10) {
      let rewardDetail = {
        status: 'CANDY',
        horseRideBonusPoint: 44
      }
      return rewardDetail;
    } else if (point >= 11 && point <= 20) {
      let rewardDetail = {
        status: 'POPSICLE',
        horseRideBonusPoint: 88
      }
      return rewardDetail;
    } else if (point >= 21 && point <= 30) {
      let rewardDetail = {
        status: 'BUBBLEGUM',
        horseRideBonusPoint: 132
      }
      return rewardDetail;
    } else if (point >= 31 && point <= 40) {
      let rewardDetail = {
        status: 'CARAMEL',
        horseRideBonusPoint: 176
      }
      return rewardDetail;
    } else if (point >= 41 && point <= 50) {
      let rewardDetail = {
        status: 'BEGINNER',
        horseRideBonusPoint: 220
      }
      return rewardDetail;
    } else if (point >= 51 && point <= 60) {
      let rewardDetail = {
        status: 'ENTHUSIAST',
        horseRideBonusPoint: 264
      }
      return rewardDetail;
    } else if (point >= 61 && point <= 70) {
      let rewardDetail = {
        status: 'POSITIVE PEERS',
        horseRideBonusPoint: 308
      }
      return rewardDetail;
    } else if (point >= 71 && point <= 80) {
      let rewardDetail = {
        status: 'RISING STAR',
        horseRideBonusPoint: 352
      }
      return rewardDetail;
    } else if (point >= 81 && point <= 90) {
      let rewardDetail = {
        status: 'LUCKY CHARM',
        horseRideBonusPoint: 396
      }
      return rewardDetail;
    } else if (point >= 91 && point <= 95) {
      let rewardDetail = {
        status: 'GENIUS',
        horseRideBonusPoint: 444
      }
      return rewardDetail;
    } else if (point >= 96 && point <= 100) {
      let rewardDetail = {
        status: 'GRAND MASTER',
        horseRideBonusPoint: 555
      }
      return rewardDetail;
    }
  }

  updateUserRewardPointCollecton(userDetails: any, mark: number, reward: any) {
    let total: any;
    let type: any;
    let point: any;
    if (reward.turtleDriveBonusPoint > 0) {
      total = reward.turtleDriveBonusPoint + mark;
      type = 'TURTLE_DRIVE';
      point = reward.turtleDriveBonusPoint;
    } else if (reward.horseRideBonusPoint > 0) {
      total = reward.horseRideBonusPoint + mark;
      type = 'HORSE_RIDING';
      point = reward.turtleDriveBonusPoint;
    }
    let rewardDetail = {
      id: this.util.generateAlphaNumericId(),
      createDate: this.dateUtilService.getCurrentDateWithTime(),
      createDateUnix: this.dateUtilService.getCurrentEpochTime(),
      rewardName: reward.status,
      type: type,
      point: Number(point),
      totalPoint: Number(total),
      securedMark: mark,
      eventDate: reward.eventDate,
      eventName: reward.eventName,
      userName: userDetails.displayName,
      userEmail: userDetails.emailId,
      mobileNo: userDetails.mobileNo,
      userId: userDetails.id,
      month: this.dateUtilService.getCurrentMonth(),
      year: this.dateUtilService.getCurrentYear(),
      status: 'ACTIVE',
      userDetail: {
        id: userDetails.id,
        name: userDetails.displayName,
        email: userDetails.emailId,
        mobileNo: userDetails.mobileNo,
        classId: userDetails.classId,
        className: userDetails.className,
        boardId: userDetails.boardId,
        boardName: userDetails.boardName,
        dateOfBirth: userDetails.dateOfBirth,
        gender: userDetails.gender,
        districtId: userDetails.districtId,
        districtName: userDetails.districtName,
        schoolId: userDetails.schoolId,
        stateId: userDetails.stateId,
        stateName: userDetails.stateName,
      }
    }

    this.firestore.collection('user_quizwhizz_exam_reward').doc(rewardDetail.id)
      .set(JSON.parse(JSON.stringify(rewardDetail)), { merge: true });
  }

}