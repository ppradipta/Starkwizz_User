import { Injectable } from '@angular/core';
import { AngularFirestore, QueryDocumentSnapshot } from '@angular/fire/compat/firestore';
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { DateUtilService } from '../common/util/date-util.service';
import { BookAdds } from '../model/bookAdds';
import { FirebaseCollection } from '../model/common/firebase-collection';
import { Event } from '../model/event';
import { OtpDetails } from '../model/otpcode';
import { Child, FriendRequests, Group, GroupUsers, UserDetails, UserProfileDetails } from '../model/user';
import { UserFavourite } from '../model/userFavourite';
import { UserFlow } from '../model/userFlow';
import { Videos } from '../model/video';
import { UtilServiceService } from './util-service.service';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  public userDetails = new ReplaySubject<UserDetails>(1);
  public userProfileDetails = new ReplaySubject<UserProfileDetails>(1);
  setImagesForUploadData = new ReplaySubject<any>(1);
  uploadImageUrl = new ReplaySubject<string>(1);
  public bookDetails = new ReplaySubject<BookAdds>(1);
  isUserSubscribed = new ReplaySubject<boolean>(1);
  videoUserDetails = new ReplaySubject<any>(1);
  token = new BehaviorSubject('');
  emailId = new ReplaySubject<string>(1);
  isFreeTrail = new ReplaySubject<boolean>(1);
  public groupDetails = new ReplaySubject<any>(1);
  public groupImage = new ReplaySubject<any>(1);
  public groupmembers = new ReplaySubject<any[]>(1);
  subscribedSubjectDetails = new ReplaySubject<any>(1);
  pageViewType = new ReplaySubject<string>(1);
  filterContentType = new ReplaySubject<any>(1);
  profileDetails = new ReplaySubject<any>(1);
  chatProfileDetails = new ReplaySubject<any>(1);
  subscribedUserEvents = new ReplaySubject<any[]>(1);
  subscribedUserExamSubjects = new ReplaySubject<any[]>(1);
  discountDetails = new ReplaySubject<any>(1);
  updateExamEvent = new ReplaySubject<any>(1);
  dynamoRules = new ReplaySubject<any[]>(1);
  parameters = new ReplaySubject<any[]>(1);
  quizWhizz = new ReplaySubject<any[]>(1);
  public userReferalType = new ReplaySubject<any>(1);
  public userQuizType = new ReplaySubject<any>(1);
  gstParameter = new ReplaySubject<any[]>(1);
  subscribedUserExamQuiz = new ReplaySubject<any[]>(1);
  quizWhizzEvents = new ReplaySubject<any[]>(1);
  subsDetails = new ReplaySubject<any[]>(1);

  public nextQueryAfterCountry: QueryDocumentSnapshot<any> = {} as QueryDocumentSnapshot<any>;
  public nextQueryAfterState: QueryDocumentSnapshot<any> = {} as QueryDocumentSnapshot<any>;
  public nextQueryAfterDistrict: QueryDocumentSnapshot<any> = {} as QueryDocumentSnapshot<any>;
  public nextQueryAfterCity: QueryDocumentSnapshot<any> = {} as QueryDocumentSnapshot<any>;
  public nextQueryAfterSchool: QueryDocumentSnapshot<any> = {} as QueryDocumentSnapshot<any>;
  public userRanks: ReplaySubject<any[] | undefined> =
    new ReplaySubject(undefined);

  public appearedEvents = new ReplaySubject<any[]>(1);
  userToken: string = '';

  public dynamoSubscription = new ReplaySubject<any>(1);
  public quizzWhizzSubscription = new ReplaySubject<any>(1);
  public eventSubscription = new ReplaySubject<any[]>(1);

  constructor(private firestore: AngularFirestore,
    private utilityService: UtilServiceService,
    private dateUtil: DateUtilService,
    private dateUtilService: DateUtilService,
    private util: UtilServiceService,
  ) {

  }



  setQuizzWhizzEvents(events: any[]) {
    this.quizWhizzEvents.next(events);
  }
  getQuizzWhizzEvents() {
    return this.quizWhizzEvents.asObservable();

  }


  setQuizzWhizzSubscription(quizzWhizzSubscription: any) {
    this.quizzWhizzSubscription.next(quizzWhizzSubscription);
  }
  getQuizzWhizzSubscription() {
    return this.quizzWhizzSubscription.asObservable();

  }


  setEventSubscription(eventSubscription: any) {
    this.eventSubscription.next(eventSubscription);
  }
  getEventSubscription() {
    return this.eventSubscription.asObservable();

  }


  setDynamoSubscription(dynamoSubscription: any) {
    this.dynamoSubscription.next(dynamoSubscription);
  }
  getDynamoSubscription() {
    return this.dynamoSubscription.asObservable();

  }



  getLoginUsers(uid) {
    return new Promise<any>((resolve) => {
      this.firestore.collection('users', ref => ref.where("id", "==", uid)).valueChanges().subscribe(users => resolve(users));
    })
  }

  setGSTParamter(gst: any) {
    this.gstParameter.next(gst);
  }
  getGSTParamter() {
    return this.gstParameter.asObservable();

  }

  setUserReferalType(user: any) {
    this.userReferalType.next(user);
  }
  getUserReferalType() {
    return this.userReferalType.asObservable();
  }


  setUserQuizType(user: any) {
    this.userQuizType.next(user);
  }
  getUserQuizType() {
    return this.userQuizType.asObservable();

  }


  setQuizWhizzSubjectSubscribed(events: any[]) {
    this.quizWhizz.next(events);
  }
  getQuizWhizzSubjectSubscribed() {
    return this.quizWhizz.asObservable();

  }



  setAppearedEvents(appearedEvents: any[]) {
    this.appearedEvents.next(appearedEvents);
  }
  getAppearedEvents() {
    return this.appearedEvents.asObservable();

  }

  setUpdateExamEvent(updateExamEvent: any) {
    this.updateExamEvent.next(updateExamEvent);
  }
  getUpdateExamEvent() {
    return this.updateExamEvent.asObservable();

  }
  intializeUserRanks() {
    this.userRanks.next([]);
  }

  setChatProfileDetails(profileDetails: any) {
    this.profileDetails.next(profileDetails);
  }
  getChatProfileDetails() {
    return this.profileDetails.asObservable();

  }



  setDiscountDetailsForEvent(discountDetails: any) {
    this.discountDetails.next(discountDetails);
  }
  getDiscountDetailsForEvent() {
    return this.discountDetails.asObservable();

  }

  setSubscribedUserExamSubjects(events: any[]) {
    this.subscribedUserExamSubjects.next(events);
  }
  getSubscribedUserExamSubjects() {
    return this.subscribedUserExamSubjects.asObservable();
  }

  setSubscribedUserExamQuiz(events: any[]) {
    this.subscribedUserExamQuiz.next(events);
  }
  getSubscribedUserExamQuiz() {
    return this.subscribedUserExamQuiz.asObservable();
  }


  setSubscribedUserEvents(events: any[]) {
    this.subscribedUserEvents.next(events);
  }
  getSubscribedUserEvents() {
    return this.subscribedUserEvents.asObservable();

  }

  setProfileDetails(profileDetails: any) {
    this.profileDetails.next(profileDetails);
  }
  getProfileDetails() {
    return this.profileDetails.asObservable();

  }


  setFilterContentType(contentType: any) {
    this.filterContentType.next(contentType);
  }
  getFilterContentType() {
    return this.filterContentType.asObservable();

  }

  setPageViewType(page: string) {
    this.pageViewType.next(page);
  }
  getPageViewType() {
    return this.pageViewType.asObservable();

  }

  setSubscribedSubjectDetails(subscribedSubjectDetails: any) {
    this.subscribedSubjectDetails.next(subscribedSubjectDetails);
  }
  getSubscribedSubjectDetails() {
    return this.subscribedSubjectDetails.asObservable();

  }

  setUserDetails(userDetails: UserDetails) {
    this.userDetails.next(userDetails);
  }
  getUserDetails() {
    return this.userDetails.asObservable();
  }

  setUserProfileDetails(userProfileDetails: UserProfileDetails) {
    this.userProfileDetails.next(userProfileDetails);
  }

  getUserProfileDetails() {
    return this.userProfileDetails.asObservable();
  }


  setImageForUpload(imageUri: any) {
    this.uploadImageUrl.next(imageUri);
  }
  getImageForUpload() {
    return this.uploadImageUrl.asObservable();
  }

  setBookDetailsToCollection(bookAdd: any) {
    return this.firestore.collection('myadds').doc(bookAdd.id)
      .set(JSON.parse(JSON.stringify(bookAdd)), { merge: true });
  }

  setBookDetails(bookDetails: BookAdds) {
    this.bookDetails.next(bookDetails);
  }

  getBookDetails() {
    return this.bookDetails.asObservable();
  }

  setUserSubscribeDetails(isUserSubscribed: boolean) {
    this.isUserSubscribed.next(isUserSubscribed);
  }

  getUserSubscribeDetails() {
    return this.isUserSubscribed.asObservable();
  }

  setFreeTrail(isFreeTrail: boolean) {
    this.isFreeTrail.next(isFreeTrail);
  }

  setSubjectDetails(subsDetails: any) {
    this.subsDetails.next(subsDetails);
  }
  getSubjectDetails() {
    return this.subsDetails.asObservable();
  }

  getFreeTrail() {
    return this.isFreeTrail.asObservable();
  }

  setUserDetailsToCollecton(userDetails: any) {
    this.firestore.collection('users').doc(userDetails.id)
      .set(JSON.parse(JSON.stringify(userDetails)), { merge: true });
  }

  setUserProfileDetailsToCollecton(userProfileDetails: any) {
    return this.firestore.collection('users_profile').doc(userProfileDetails.id)
      .set(JSON.parse(JSON.stringify(userProfileDetails)), { merge: true });
  }

  updateUserProfileDetailsToCollecton(userProfile: any) {
    this.firestore.collection('users_profile').doc(userProfile.id)
      .update(JSON.parse(JSON.stringify(userProfile)));
  }



  updateUserDetailsToCollecton(userProfile: any) {
    return this.firestore.collection('users').doc(userProfile.id)
      .update(JSON.parse(JSON.stringify(userProfile)));
  }

  setUserEventsToCollections(quesData: any) {
    return this.firestore.collection('user_events').doc(quesData.id)
      .set(JSON.parse(JSON.stringify(quesData)), { merge: true });
  }

  setUserDynamoEventsToCollections(quesData: any) {
    return this.firestore.collection('user_dyanmo_exam').doc(quesData.id)
      .set(JSON.parse(JSON.stringify(quesData)), { merge: true });
  }

  setUserEventsQuizWhizzToCollections(quesData: any) {
    return this.firestore.collection('user_quizwhizz_events').doc(quesData.id)
      .set(JSON.parse(JSON.stringify(quesData)), { merge: true });
  }

  updatExamStatusToCollection(id: any, status: any) {
    return this.firestore.collection(FirebaseCollection.EVENTS)
      .doc(id).update({
        status: status
      })
  }
  populateUserDetailsToCollection(userDetails: UserDetails) {
    let users: UserDetails = new UserDetails();
    users.id = userDetails.id;
    users.mobileNo = userDetails.mobileNo;
    users.userType = userDetails.userType;
    users.displayName = userDetails.displayName;
    users.creationdate = this.dateUtil.getCurrentDateWithYYYYMMDD();
    users.creationUnixDate = this.dateUtil.getCurrentEpochTime();
    return users;
  }

  populateChildDetailsToCollection(child: Child, userDetails: UserDetails) {
    let children: UserProfileDetails = new UserProfileDetails();
    if (userDetails.userType == "STUDENT") {
      children.id = userDetails.id
      children.displayName = userDetails.displayName;
      children.class = userDetails.className;
      children.imageUrl = '';
      children.dob = userDetails.dateOfBirth;
      children.gender = userDetails.gender;
      children.boardName = userDetails.boardName;
      children.boardId = userDetails.boardId;
      children.classId = userDetails.classId;
      children.className = userDetails.className;
      children.mobileNo = userDetails.mobileNo;
    }
    if (userDetails.userType == "PARENT") {
      children.id = child.id
      children.displayName = child.displayName;
      children.class = child.className;
      children.imageUrl = '';
      children.dob = userDetails.dateOfBirth;
      children.gender = userDetails.gender;
      children.boardName = child.boardName;
      children.boardId = child.boardId;
      children.classId = child.classId;
      children.className = child.className;
      children.mobileNo = userDetails.mobileNo;
      children.parentId = userDetails.id;
    }

    return children;
  }
  setImagesDataForUpload(items: any) {
    this.setImagesForUploadData.next(items);
  }
  getImagesDataForUpload() {
    return this.setImagesForUploadData.asObservable();
  }

  setOtpDetailsToCollecton(otpDetails: OtpDetails) {
    return this.firestore.collection('otp').doc(otpDetails.id)
      .set(JSON.parse(JSON.stringify(otpDetails)), { merge: true });
  }

  setEmailOTPDetailsToCollecton(otpDetails: any) {
    return this.firestore.collection('user_message_mail').doc(otpDetails.id)
      .set(JSON.parse(JSON.stringify(otpDetails)), { merge: true });
  }

  setSubscriptionSubjectsToCollecton(subscribedSubjects: any) {
    this.firestore.collection('user_subscription').doc(subscribedSubjects.id)
      .set(JSON.parse(JSON.stringify(subscribedSubjects)), { merge: true });
  }

  setUserAllSubscription(subscribedSubjects: any) {
    this.firestore.collection('user_all_subscription').doc(subscribedSubjects.id)
      .set(JSON.parse(JSON.stringify(subscribedSubjects)), { merge: true });
  }

  setQuizWhizzSubscriptionToCollecton(quizwhizzSubscription: any) {
    this.firestore.collection('user_subscription_quizwhizz').doc(quizwhizzSubscription.id)
      .set(JSON.parse(JSON.stringify(quizwhizzSubscription)), { merge: true });
  }

  setEventToCollecton(quizwhizzSubscription: any) {
    this.firestore.collection('user_subscription_event').doc(quizwhizzSubscription.id)
      .set(JSON.parse(JSON.stringify(quizwhizzSubscription)), { merge: true });
  }

  setEventsscriptionSubjectsToCollecton(usereventsub: any) {
    this.firestore.collection('user_event_subscription').doc(usereventsub.id)
      .set(JSON.parse(JSON.stringify(usereventsub)), { merge: true });
  }

  setSubscriptionToCollecton(subscription: any) {
    return this.firestore.collection('transaction').doc(subscription.id)
      .set(JSON.parse(JSON.stringify(subscription)), { merge: true });
  }

  setHubEnquiryToCollection(hubEnquiry: any, email: any) {
    if (null != email) {
      let emailContent = {
        id: this.util.generateAlphaNumericId(),
        createDate: this.dateUtilService.getCurrentDateWithTime(),
        createDateUnix: this.dateUtilService.getCurrentEpochTime(),
        to: email,
        type: 'HUB_ENQUIRY',
        status: 'ACTIVE',
        message: {
          subject: `##Starkwizz## Enquiry from ${hubEnquiry.displayName}`,
          html: hubEnquiry.message,
        },
      }
      this.firestore.collection('user_message_mail').add(JSON.parse(JSON.stringify(emailContent)));
    }

    return this.firestore.collection('hub_enquiry').doc(hubEnquiry.id)
      .set(JSON.parse(JSON.stringify(hubEnquiry)), { merge: true });
  }


  setSyllabusEnquiryToCollection(user: any, email: any, address: string) {
    let emailContent: any = {};
    if (null != email) {
      emailContent = {
        id: this.util.generateAlphaNumericId(),
        createDate: this.dateUtilService.getCurrentDateWithTime(),
        createDateUnix: this.dateUtilService.getCurrentEpochTime(),
        name: user.displayName,
        mobileNo: user.mobileNo,
        boardId: user.boardId,
        boardName: user.boardName,
        className: user.className,
        classId: user.classId,
        address: address,
        to: email,
        type: 'SYLLABUS_ENQUIRY',
        status: 'ACTIVE',
        decs: user.message,
        message: {
          subject: `##Starkwizz## Enquiry from ${user.displayName}`,
          html: user.message,
        },
      }
      this.firestore.collection('user_message_mail').add(JSON.parse(JSON.stringify(emailContent)));
    }

    return this.firestore.collection('syllabus_enquiry').doc(emailContent.id)
      .set(JSON.parse(JSON.stringify(emailContent)), { merge: true });
  }

  setUserNotificationData(userNoti: any) {
    this.firestore.collection('user_notification').doc(userNoti.id)
      .set(JSON.parse(JSON.stringify(userNoti)), { merge: true });
  }
  populateVideo(userDetails: UserDetails, videoResp: any) {
    let video: Videos = new Videos();
    video.id = this.utilityService.generateAlphaNumericId();
    video.categoryId = '';
    video.status = 'POSTED';
    video.uploadDate = this.dateUtil.getCurrentDateWithYYYYMMDD();
    video.userId = userDetails.id;
    video.videoLength = '';
    video.imageUrl = '';
    video.publishBy = '';
    video.publishdate = '';
    video.submitForApprovalDate = '';
    video.videoDesc = '';
    video.videoText = videoResp.name;
    video.videoUrl = videoResp.url;
    video.userName = userDetails.displayName;
    video.userImage = userDetails.imageUrl;
    video.classId = userDetails.classId;
    video.className = userDetails.className;
    video.boardId = userDetails.boardId;
    video.boardName = userDetails.boardName;
    return video;
  }


  submitVideoForApproval(video: any) {
    this.firestore.collection('video_upload').doc(video.id).update({
      submitForApprovalDate: this.dateUtil.getCurrentDateWithYYYYMMDD()
    });
  }

  populateEventsForVideo(event: any) {
    let events: Event = new Event();
    events = event
    return events;
  }
  populateUserFavourite(userDetails: UserDetails, videoDetails: any) {
    let userFavourite: UserFavourite = new UserFavourite();
    userFavourite.id = this.utilityService.generateAlphaNumericId();
    userFavourite.likeByUserId = userDetails.id;
    userFavourite.likeByUserName = userDetails.displayName;
    userFavourite.likeByUserImageUrl = userDetails.imageUrl;
    userFavourite.userId = videoDetails.userId;
    userFavourite.userImageUrl = videoDetails.userImage;
    userFavourite.userName = videoDetails.userName;
    userFavourite.videoId = videoDetails.id
    return userFavourite;
  }

  updateLikeToCollection(videos: any) {
    this.firestore.collection(FirebaseCollection.VIDEO_UPLOAD)
      .doc(videos.id).update({
        likes: videos.likes
      })
  }
  setUserFavouriteToCollection(userFavouriteDetails: any) {
    this.firestore.collection('user_favourite').doc(userFavouriteDetails.id)
      .set(JSON.parse(JSON.stringify(userFavouriteDetails)), { merge: true });
  }

  populateUserFlow(userDetails: UserDetails, videoDetails: any) {
    let userFlow: UserFlow = new UserFlow();
    userFlow.id = this.utilityService.generateAlphaNumericId();
    userFlow.flowByUserId = userDetails.id;
    userFlow.flowByUserName = userDetails.displayName;
    userFlow.flowByUserImageUrl = userDetails.imageUrl;
    userFlow.userId = videoDetails.userId;
    userFlow.userImageUrl = videoDetails.userImage;
    userFlow.userName = videoDetails.userName;
    userFlow.videoId = videoDetails.id
    return userFlow;
  }

  setUserFlowToCollection(userFlow: any) {
    this.firestore.collection('user_follow').doc(userFlow.id)
      .set(JSON.parse(JSON.stringify(userFlow)), { merge: true });
  }

  setVideoUserDetails(videoUserDetails: any) {
    this.videoUserDetails.next(videoUserDetails);
  }

  getVideoUserDetails() {
    return this.videoUserDetails.asObservable();
  }


  setSubscribptionEmail(emailId: any) {
    this.emailId.next(emailId);
  }

  getSubscribptionEmail() {
    return this.emailId.asObservable();
  }


  populateFriendRequestData(friend: any, userDetails: any) {
    let friendRequests: FriendRequests = new FriendRequests();
    friendRequests.id = this.utilityService.generateAlphaNumericId();
    friendRequests.sendBy.id = userDetails.id;
    friendRequests.sendBy.displayName = userDetails.displayName;
    friendRequests.sendBy.stateName = userDetails.stateName;
    friendRequests.sendBy.districtName = userDetails.districtName;
    friendRequests.sendBy.cityName = userDetails.cityName;
    friendRequests.sendBy.className = userDetails.className;
    friendRequests.sendBy.boardName = userDetails.boardName;
    friendRequests.sendBy.imageUrl = userDetails.imageUrl;
    friendRequests.sendBy.schoolName = userDetails.schoolName;
    friendRequests.recievedTo.id = friend.id;
    friendRequests.recievedTo.displayName = friend.displayName;
    friendRequests.recievedTo.stateName = friend.stateName;
    friendRequests.recievedTo.districtName = friend.districtName;
    friendRequests.recievedTo.cityName = friend.cityName;
    friendRequests.recievedTo.className = friend.className;
    friendRequests.recievedTo.boardName = friend.boardName;
    friendRequests.recievedTo.imageUrl = friend.imageUrl;
    friendRequests.recievedTo.schoolName = friend.schoolName;
    friendRequests.status = 'REQUESTED'
    return friendRequests;
  }

  sendFriendRequestsToCollection(friendRequest: any) {
    return this.firestore.collection('friend_requests').doc(friendRequest.id)
      .set(JSON.parse(JSON.stringify(friendRequest)), { merge: true });
  }

  updateFriendRequests(userProfile: any) {
    return this.firestore.collection('friend_requests').doc(userProfile.id)
      .update(JSON.parse(JSON.stringify(userProfile)));
  }

  setGroupDetails(groupData: any) {
    this.groupDetails.next(groupData);
  }
  getGroupDetails() {
    return this.groupDetails.asObservable();
  }

  populateGroupDetails(groupDetails: any, userDetails: any, img: any, groupName: any) {
    let groupData: Group = new Group();
    groupData.id = this.utilityService.generateAlphaNumericId();
    groupData.groupImage = img;
    groupData.groupName = groupName;
    groupData.createdById = userDetails.id;
    groupData.createdByName = userDetails.displayName;
    groupData.createdByImageUrl = userDetails.imageUrl;
    groupData.createdDate = this.dateUtil.getCurrentDateWithYYYYMMDD();
    let groupUser: GroupUsers = new GroupUsers();
    groupUser.displayName = userDetails.displayName;
    groupUser.id = userDetails.id;
    groupUser.imageUrl = userDetails.imageUrl;
    groupUser.mobileNo = userDetails.mobileNo;
    groupUser.role = "OWNER";
    groupUser.stateName = userDetails.stateName;
    groupUser.districtName = userDetails.districtName;
    groupUser.cityName = userDetails.cityName;
    groupUser.className = userDetails.className;
    groupUser.boardName = userDetails.boardName;
    groupUser.schoolName = userDetails.schoolName;
    groupData.groupUsersId.push(userDetails.id);
    groupData.groupUsers.push(groupUser);
    groupDetails.forEach((element: any) => {
      let groupUser: GroupUsers = new GroupUsers();
      groupUser.displayName = element.displayName;
      groupUser.id = element.id;
      groupUser.imageUrl = element.imageUrl;
      groupUser.mobileNo = element.mobileNo;
      groupUser.stateName = element.stateName;
      groupUser.districtName = element.districtName;
      groupUser.cityName = element.cityName;
      groupUser.className = element.className;
      groupUser.boardName = element.boardName;
      groupUser.schoolName = element.schoolName;
      groupUser.role = "MEMBER";
      groupData.groupUsers.push(groupUser);
      groupData.groupUsersId.push(element.id);
    });
    return groupData

  }

  setGroupDetailsToCollection(groupDetails: any) {
    return this.firestore.collection('groups').doc(groupDetails.id)
      .set(JSON.parse(JSON.stringify(groupDetails)), { merge: true });
  }

  setGroupImage(image: any) {
    this.groupImage.next(image);
  }
  getGroupImage() {
    return this.groupImage.asObservable();
  }

  setGroupMemberDetails(member: any) {
    this.groupmembers.next(member);
  }
  getGroupMemberDetails() {
    return this.groupmembers.asObservable();
  }
  updateStatusForNotification(message: any, status: string) {
    this.firestore.collection(FirebaseCollection.USER_NOTIFICATION).doc(message.id).update({
      status: status
    });
  }

  deleteAllNotification(userDetails: any) {
    const query = this.firestore
      .collection(FirebaseCollection.USER_NOTIFICATION)
      .ref.where('userId', '==', userDetails.id);
    query.get().then((userOrders: any) => {
      userOrders.forEach((doc: any) => {
        doc.ref.delete();
      })
    })
  }

  updateUserAddressDetailsToCollecton(userProfile: any) {
    if (null != userProfile.referralCode) {
      this.firestore.collection('users').doc(userProfile.id)
        .update({
          stateId: userProfile.stateId,
          stateName: userProfile.stateName,
          districtId: userProfile.districtId,
          districtName: userProfile.districtName,
          cityId: userProfile.cityId,
          cityName: userProfile.cityName,
          schoolId: userProfile.schoolId,
          schoolName: userProfile.schoolName,
          referralCode: userProfile.referralCode
        });
    } else {
      this.firestore.collection('users').doc(userProfile.id)
        .update({
          stateId: userProfile.stateId,
          stateName: userProfile.stateName,
          districtId: userProfile.districtId,
          districtName: userProfile.districtName,
          cityId: userProfile.cityId,
          cityName: userProfile.cityName,
          schoolId: userProfile.schoolId,
          schoolName: userProfile.schoolName
        });
    }

  }

  updateUserProfileAddressDetailsToCollecton(userProfile: any) {
    if (null != userProfile.referralCode) {
      this.firestore.collection('users_profile').doc(userProfile.id)
        .update({
          stateId: userProfile.stateId,
          stateName: userProfile.stateName,
          districtId: userProfile.districtId,
          districtName: userProfile.districtName,
          cityId: userProfile.cityId,
          cityName: userProfile.cityName,
          schoolId: userProfile.schoolId,
          schoolName: userProfile.schoolName,
          referralCode: userProfile.referralCode
        });
    } else {
      this.firestore.collection('users_profile').doc(userProfile.id)
        .update({
          stateId: userProfile.stateId,
          stateName: userProfile.stateName,
          districtId: userProfile.districtId,
          districtName: userProfile.districtName,
          cityId: userProfile.cityId,
          cityName: userProfile.cityName,
          schoolId: userProfile.schoolId,
          schoolName: userProfile.schoolName
        });
    }
  }

  updateUserEmailAfterVerificationToCollecton(userProfile: any, profile: any) {
    this.firestore.collection('users').doc(userProfile.id)
      .update({
        emailId: userProfile.emailId,
        isEmailVerified: true,
        profileType: arrayUnion(profile)
      });
  }

  removeFreeTrailUserAfterPaymentToCollecton(userProfile: any, subscribeType: any) {
    this.firestore.collection('users').doc(userProfile.id)
      .update({
        emailId: userProfile.emailId,
        profileType: arrayRemove(subscribeType)
      });
  }


  updateUserAfterPaymentToCollecton(userProfile: any, subscribeType: any, txnid: string) {
    this.firestore.collection('users').doc(userProfile.id)
      .update({
        emailId: userProfile.emailId,
        profileType: arrayUnion(subscribeType),
        subscriptionIds: arrayUnion(txnid)
      });
  }

  setUserApprovalDetailsToCollecton(userapprovaldetails: any) {
    return this.firestore.collection('user_approval').doc(userapprovaldetails.id)
      .set(JSON.parse(JSON.stringify(userapprovaldetails)), { merge: true });
  }

  processEventNotification(eventDetail: any, functionTypeValue: any) {
    if (null != eventDetail.token) {
      let userData = {
        name: eventDetail.userDisplayName,
        id: eventDetail.userId,
        token: eventDetail.token != null ? eventDetail.token : this.userToken
      }
      let createEventNotification: any = {
        creationDate: this.dateUtil.getCurrentDateWithTime(),
        eventType: eventDetail.type,
        eventId: eventDetail.eventId,
        eventName: eventDetail.eventName,
        types: "PUSH",
        functionType: functionTypeValue,
        msgText: null,
        title: null,
        receivers: [] = [userData],
        receiversId: [] = [userData.id],
        userDetail: userData
      }
      if (createEventNotification.functionType === 'EVENT_COMPLETED') {
        createEventNotification.msgText = `Dear ${eventDetail.userDisplayName}, You have successfully completed ${eventDetail.eventName}.`;
        createEventNotification.title = `Event Completed`;
      }
      if (createEventNotification.functionType === 'EVENT_SUBSCRIBED') {
        createEventNotification.msgText = `Dear ${eventDetail.userDisplayName}, You have paid successfully for ${eventDetail.eventName}.`;
        createEventNotification.title = `Event Subscribed`;
      }
      return this.firestore.collection('user_message_push')
        .add(JSON.parse(JSON.stringify(createEventNotification)));
    }
    return null;
  }
  processEventSMS(eventDetail: any, phoneNo: any, functionTypeValue: any) {
    if (null != phoneNo) {
      let userData = {
        name: eventDetail.userDisplayName,
        id: eventDetail.userId,
        phoneNo: phoneNo,
        token: eventDetail.token != null ? eventDetail.token : this.userToken
      }
      let createEventNotification: any = {
        creationDate: this.dateUtil.getCurrentDateWithTime(),
        eventType: eventDetail.type,
        eventId: eventDetail.eventId,
        eventName: eventDetail.eventName,
        types: "SMS",
        functionType: functionTypeValue,
        body: null,
        to: null,
        userDetail: userData
      }
      if (createEventNotification.functionType === 'EVENT_COMPLETED') {
        createEventNotification.body = `You have successfully completed ${eventDetail.eventName}.`;
        createEventNotification.to = userData.phoneNo;
      }
      if (createEventNotification.functionType === 'EVENT_SUBSCRIBED') {
        createEventNotification.body = `Dear ${eventDetail.userDisplayName}, You have paid successfully for ${eventDetail.eventName}.`;
        createEventNotification.to = userData.phoneNo;
      }
      return this.firestore.collection('user_message_sms')
        .add(JSON.parse(JSON.stringify(createEventNotification)));
    }
    return null;
  }

  processProfileUpdateNotification(userdetails: any, functionTypeValue: any, changeparam: any) {
    if (null != userdetails.token) {
      let userData = {
        name: userdetails.displayName,
        id: userdetails.userId,
        token: userdetails.token != null ? userdetails.token : this.userToken
      }
      let createEventNotification: any = {
        creationDate: this.dateUtil.getCurrentDateWithTime(),
        types: "PUSH",
        functionType: functionTypeValue,
        msgText: null,
        title: null,
        receivers: [] = [userData],
        receiversId: [] = [userData.id],
        userDetail: userData
      }
      if (createEventNotification.functionType === 'USER_PROFILE_KYC') {
        createEventNotification.msgText = `Dear ${userdetails.displayName},Your Profile strength is 100% , Now enjoy seamless features.`;
        createEventNotification.title = `Profile KYC`;
      }
      if (createEventNotification.functionType === 'USER_REGISTRATION') {
        createEventNotification.msgText = `Dear ${userdetails.displayName},You have registered successfully. Your Starkwizz ID is ${userdetails.applicationId}`;
        createEventNotification.title = `Registration`;
      }
      if (createEventNotification.functionType === 'USER_PROFILE_KYC_PENDING') {
        createEventNotification.msgText = `Dear ${userdetails.displayName},Your Profile strength is 50% , Please complete your profile to enjoy seamless features. Please ignore if already done.`;
        createEventNotification.title = `Profile KYC`;
      }
      if (createEventNotification.functionType === 'USER_PROFILE_CHANGE_REQUEST') {
        if (null != changeparam.boardName && null != changeparam.className) {
          createEventNotification.msgText = `Dear ${userdetails.displayName},You have requested for change Board name from ${userdetails.boardName} to ${changeparam.boardName} and Class Name from ${userdetails.className} to ${changeparam.className} .`;
          createEventNotification.title = `Profile Change Request`;
        }
        else if (null != changeparam.boardName) {
          createEventNotification.msgText = `Dear ${userdetails.displayName},You have requested for change Board name from ${userdetails.boardName} to ${changeparam.boardName}.`;
          createEventNotification.title = `Profile Change Request`;
        }
        else if (null != changeparam.className) {
          createEventNotification.msgText = `Dear ${userdetails.displayName},You have requested for change Class name from ${userdetails.className} to ${changeparam.className}.`;
          createEventNotification.title = `Profile Change Request`;
        }
      }
      return this.firestore.collection('user_message_push')
        .add(JSON.parse(JSON.stringify(createEventNotification)));
    }
    return null;
  }


  processProfileUpdateSMS(userdetails: any, phoneNo: any, functionTypeValue: any, changeparam: any) {
    if (null != phoneNo) {
      let userData = {
        name: userdetails.displayName,
        id: userdetails.userId,
        phoneNo: phoneNo,
        token: userdetails.token != null ? userdetails.token : this.userToken
      }
      let createEventNotification: any = {
        creationDate: this.dateUtil.getCurrentDateWithTime(),
        types: "SMS",
        functionType: functionTypeValue,
        body: null,
        to: null,
        userDetail: userData
      }
      if (createEventNotification.functionType === 'USER_PROFILE_KYC') {
        createEventNotification.body = `Dear ${userdetails.displayName},Your Profile strength is 100% , Now enjoy seamless features.`;
        createEventNotification.to = userData.phoneNo;
      }
      if (createEventNotification.functionType === 'USER_REGISTRATION') {
        createEventNotification.body = `Dear ${userdetails.displayName},You have sucessfully register with us.Acess to events and dynamo,have fun.`;
        createEventNotification.to = userData.phoneNo;
      }
      if (createEventNotification.functionType === 'USER_PROFILE_KYC_PENDING') {
        createEventNotification.body = `Dear ${userdetails.displayName},Your Profile strength is 50% , Please complete your profile to enjoy seamless features. Please ignore if already done.`;
        createEventNotification.to = userData.phoneNo;
      }
      if (createEventNotification.functionType === 'USER_PROFILE_CHANGE_REQUEST') {
        createEventNotification.body = `Dear ${userdetails.displayName}, Your Profile strength is 50% , Please complete your profile to enjoy seamless features. Please ignore if already done.`;
        createEventNotification.to = userData.phoneNo;
      }
      if (createEventNotification.functionType === 'USER_PROFILE_CHANGE_REQUEST') {
        if (null != changeparam.boardName && null != changeparam.className) {
          createEventNotification.body = `Dear ${userdetails.displayName},You have requested for change Board name from ${userdetails.boardName} to ${changeparam.boardName} and Class Name from ${userdetails.className} to ${changeparam.className}.`;
          createEventNotification.to = userData.phoneNo;
        }
        else if (null != changeparam.boardName) {
          createEventNotification.body = `Dear ${userdetails.displayName},You have requested for change Board name from ${userdetails.boardName} to ${changeparam.boardName}.`;
          createEventNotification.to = userData.phoneNo;
        }
        else if (null != changeparam.className) {
          createEventNotification.body = `Dear ${userdetails.displayName},You have requested for change Class name from ${userdetails.className} to ${changeparam.className}.`;
          createEventNotification.to = userData.phoneNo;
        }
      }

      return this.firestore.collection('user_message_sms')
        .add(JSON.parse(JSON.stringify(createEventNotification)));
    }
    return null;
  }



  getRanksCountryWise(eventId: any, eventType: string) {
    this.getRanksAccordingToCountry(eventId, eventType).subscribe(hresult => {
      if (!hresult.empty) {
        this.nextQueryAfterCountry = hresult.docs[hresult.docs.length - 1] as
          QueryDocumentSnapshot<any>;
        this.userRanks.next(hresult.docs);
      }
    });
  }


  getRanksStateyWise(eventId: any, stateId: any, eventType: string) {
    this.getRanksAccordingToState(eventId, stateId, eventType).subscribe(hresult => {
      if (!hresult.empty) {
        this.nextQueryAfterState = hresult.docs[hresult.docs.length - 1] as
          QueryDocumentSnapshot<any>;
        this.userRanks.next(hresult.docs);
      }
    });
  }

  getRanksDistrictWise(eventId: any, districtId: any, eventType: string) {
    this.getRanksAccordingToDistrict(eventId, districtId, eventType).subscribe(hresult => {
      if (!hresult.empty) {
        this.nextQueryAfterDistrict = hresult.docs[hresult.docs.length - 1] as
          QueryDocumentSnapshot<any>;
        this.userRanks.next(hresult.docs);
      }
    });
  }


  getRanksCityWise(eventId: any, cityId: any, districtId: any, eventType: string) {
    this.getRanksAccordingToCity(eventId, cityId, districtId, eventType).subscribe(hresult => {
      if (!hresult.empty) {
        this.nextQueryAfterCity = hresult.docs[hresult.docs.length - 1] as
          QueryDocumentSnapshot<any>;
        this.userRanks.next(hresult.docs);
      }
    });
  }


  getRanksSchoolWise(eventId: any, schoolId: any, eventType: string) {
    this.getRanksAccordingToSchool(eventId, schoolId, eventType).subscribe(hresult => {
      if (!hresult.empty) {
        this.nextQueryAfterSchool = hresult.docs[hresult.docs.length - 1] as
          QueryDocumentSnapshot<any>;
        this.userRanks.next(hresult.docs);
      }
    });
  }


  private getRanksAccordingToCountry(eventId: any, eventType: string) {
    if (eventType == 'QUIZWHIZZ EXAM') {
      if (this.nextQueryAfterCountry) {
        return this.firestore.collection<any>("user_quizwhizz_all_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterCountry)).get();
      } else {
        return this.firestore.collection<any>("user_quizwhizz_all_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .orderBy('calculateRank')).get();
      }

    } else {
      if (this.nextQueryAfterCountry) {
        return this.firestore.collection<any>("user_event_all_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterCountry)).get();
      } else {
        return this.firestore.collection<any>("user_event_all_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .orderBy('calculateRank')).get();
      }
    }
  }


  private getRanksAccordingToState(eventId: any, stateId: any, eventType: string) {
    if (eventType == 'QUIZWHIZZ EXAM') {
      if (this.nextQueryAfterState) {
        return this.firestore.collection<any>("user_quizwhizz_state_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('stateId', '==', stateId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterState)).get();
      } else {
        return this.firestore.collection<any>("user_quizwhizz_state_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('stateId', '==', stateId)
            .orderBy('calculateRank')).get();
      }
    } else {
      if (this.nextQueryAfterState) {
        return this.firestore.collection<any>("user_event_state_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('stateId', '==', stateId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterState)).get();
      } else {
        return this.firestore.collection<any>("user_event_state_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('stateId', '==', stateId)
            .orderBy('calculateRank')).get();
      }
    }

  }


  private getRanksAccordingToCity(eventId: any, cityId: any, districtId: any, eventType: string) {
    if (eventType == 'QUIZWHIZZ EXAM') {
      if (this.nextQueryAfterCity) {
        return this.firestore.collection<any>("user_quizwhizz_city_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('districtId', '==', districtId)
            .where('cityId', '==', cityId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterCity)).get();
      } else {
        return this.firestore.collection<any>("user_quizwhizz_city_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('cityId', '==', cityId)
            .where('districtId', '==', districtId)
            .orderBy('calculateRank')).get();
      }
    } else {
      if (this.nextQueryAfterCity) {
        return this.firestore.collection<any>("user_event_city_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('districtId', '==', districtId)
            .where('cityId', '==', cityId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterCity)).get();
      } else {
        return this.firestore.collection<any>("user_event_city_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('cityId', '==', cityId)
            .where('districtId', '==', districtId)
            .orderBy('calculateRank')).get();
      }
    }

  }


  private getRanksAccordingToDistrict(eventId: any, districtId: any, eventType: string) {
    if (eventType == 'QUIZWHIZZ EXAM') {
      if (this.nextQueryAfterDistrict) {
        return this.firestore.collection<any>("user_quizwhizz_district_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('districtId', '==', districtId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterDistrict)).get();
      } else {
        return this.firestore.collection<any>("user_quizwhizz_district_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .orderBy('calculateRank')).get();
      }
    } else {
      if (this.nextQueryAfterDistrict) {
        return this.firestore.collection<any>("user_event_district_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('districtId', '==', districtId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterDistrict)).get();
      } else {
        return this.firestore.collection<any>("user_event_district_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .orderBy('calculateRank')).get();
      }
    }
  }


  private getRanksAccordingToSchool(eventId: any, schoolId: any, eventType: string) {
    if (eventType == 'QUIZWHIZZ EXAM') {
      if (this.nextQueryAfterSchool) {
        return this.firestore.collection<any>("user_quizwhizz_school_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('schoolId', '==', schoolId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterSchool)).get();
      } else {
        return this.firestore.collection<any>("user_quizwhizz_school_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('schoolId', '==', schoolId)
            .orderBy('calculateRank')).get();
      }
    } else {
      if (this.nextQueryAfterSchool) {
        return this.firestore.collection<any>("user_event_school_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('schoolId', '==', schoolId)
            .orderBy('calculateRank')
            .startAfter(this.nextQueryAfterSchool)).get();
      } else {
        return this.firestore.collection<any>("user_event_school_ranks", ref =>
          ref.where('status', '==', 'COMPLETED')
            .where('eventId', '==', eventId)
            .where('schoolId', '==', schoolId)
            .orderBy('calculateRank')).get();
      }
    }
  }


  // public getDynamoRules(boardId: string, classId: string) {
  //   this.firestore.collection<any>("dynamo_rules", ref =>
  //     ref.where('classId', '==', classId)
  //       .where('boardId', '==', boardId)
  //       .orderBy('sequence')).get().subscribe(hresult => {
  //         if (!hresult.empty) {
  //           this.dynamoRules.next(hresult.docs);
  //         }
  //       });

  // }


  public getAllEventParamters() {
    this.firestore.collection(FirebaseCollection.PARAMETER, ref => ref.where("filterfor", "==", 'EVENT').where("id", "==", 'scholastic'))
      .get().subscribe(data => {
        data.forEach(res => {
          let records = res.data() as any['values'];
          this.parameters.next(records.values);
        })
      });
  }

  public getEventParameters() {
    return this.parameters.asObservable();
  }




  public getGSTParamters() {
    this.firestore.collection(FirebaseCollection.PARAMETER, ref => ref.where("id", "==", 'gst'))
      .get().subscribe(data => {
        data.forEach(res => {
          let records = res.data() as any
          this.gstParameter.next(records.value);
        })
      });
  }

  getAllApprove(storeId: string) {
    return new Promise<any>((resolve) => {
      this.firestore.collection('users', ref => ref
      ).get()
        .subscribe((result: any) => {
          let users: any[] = [];
          if (!result.empty) {
            result.forEach(item => {
              let user = item.data();
              users.push(user);
            });
          }
          resolve(users);
        });
    })
  }


  // private buildRequestAndProcess(raw: string) {
  //   const myHeaders = new Headers();
  //   myHeaders.append("Authorization", "App 878a77a1fae6bdeac416d5baa885011b-edd4ea0a-c728-4358-9240-73c3b8e871ff");
  //   myHeaders.append("Content-Type", "application/json");
  //   myHeaders.append("Accept", "application/json");
  //   const requestOptions: any = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw,
  //     redirect: "follow"
  //   };

  //   fetch("https://9lgykv.api.infobip.com/whatsapp/1/message/template", requestOptions)
  //     .then((response) => response.text())
  //     .then((result) => console.log(result))
  //     .catch((error) => console.error(error));
  // }



  // processMessageForLoginUser(sendTo, placeHolder1) {
  //   const raw = JSON.stringify({
  //     messages: [
  //       {
  //         from: "15557307637",
  //         to: this.formatMobileNo(sendTo),
  //         //  messageId: "ed28c60f-e4f1-4313-aa9e-850c7baac218",
  //         content: {
  //           templateName: "starkwizz_login_user",
  //           templateData: {
  //             body: {
  //               placeholders: [placeHolder1]
  //             }
  //           },
  //           language: "en"
  //         }
  //       }
  //     ]
  //   });
  //   this.buildRequestAndProcess(raw);
  // }

  // formatMobileNo(mobileNUmber) {
  //   if (mobileNUmber.length > 10) {
  //     if (mobileNUmber.startsWith("+91")) {
  //       return mobileNUmber.replace(/\/r/, '+');
  //     }
  //   }
  //   return 91 + "" + mobileNUmber;
  // }


  updatePorfilePic(user, result) {
    this.firestore.collection('users').doc(user.id).update({
      imageUrl: result?.url
    })
  }



}


