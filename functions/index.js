/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const pug = require('pug');
var moment = require('moment-timezone');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();
const user_message = db.collection('user_message');
const users = db.collection('users');
// const cron = require('node-cron');

let emailSender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info@starkwizz.com',
        pass: 'geacxkjralwbryls'
    }
});


// function buildRequestAndProcess(infobipDetails) {
//     const myHeaders = new Headers();
//     myHeaders.append("Authorization", "App 426b41c52abae2fc5ae93db8c3078566-51ea9010-9842-4c01-bc52-b6e71067355b");
//     myHeaders.append("Content-Type", "application/json");
//     myHeaders.append("Accept", "application/json");
//     const requestOptions = {
//         method: "POST",
//         headers: myHeaders,
//         body: infobipDetails,
//         redirect: "follow"
//     };

//     fetch("https://9lgykv.api.infobip.com/whatsapp/1/message/template", requestOptions)
//         .then((response) => response.text())
//         .then((result) => console.log(result))
//         .catch((error) => console.error(error));
// }

// function sendWhatsUpMessage(mobileNumber, customerName) {
//     const infobipDetails = JSON.stringify({
//         messages: [
//             {
//                 from: "15557307637",
//                 to: '91' + mobileNumber,
//                 content: {
//                     templateName: "starkwizz_user_registration",
//                     templateData: {
//                         body: {
//                             placeholders: [customerName, '+91-6371469050']
//                         }
//                     },
//                     language: "en"
//                 }
//             }
//         ]
//     });
//     buildRequestAndProcess(infobipDetails);
// }


// function sendWhatsUpMessageSubscription(mobileNumber, customerName, subsType, amount) {
//     const infobipDetails = JSON.stringify({
//         messages: [
//             {
//                 from: "15557307637",
//                 to: '91' + mobileNumber,
//                 content: {
//                     templateName: "starkwizz_user_subscription",
//                     templateData: {
//                         body: {
//                             placeholders: [customerName, subsType, amount]
//                         }
//                     },
//                     language: "en"
//                 }
//             }
//         ]
//     });
//     buildRequestAndProcess(infobipDetails);
// }

// function sendWhatsUpMessageSubscriptionCancel(mobileNumber, customerName, reason) {
//     const infobipDetails = JSON.stringify({
//         messages: [
//             {
//                 from: "15557307637",
//                 to: '91' + mobileNumber,
//                 content: {
//                     templateName: "starkwizz_user_cancel_subscriptions",
//                     templateData: {
//                         body: {
//                             placeholders: [customerName, reason]
//                         }
//                     },
//                     language: "en"
//                 }
//             }
//         ]
//     });
//     buildRequestAndProcess(infobipDetails);
// }

// function sendWhatsUpMessageSyllabusEnquiry(mobileNumber, customerName, board, className) {
//     const infobipDetails = JSON.stringify({
//         messages: [
//             {
//                 from: "15557307637",
//                 to: '91' + mobileNumber,
//                 content: {
//                     templateName: "starkwizz_user_syllabus_enquiry",
//                     templateData: {
//                         body: {
//                             placeholders: [customerName, board, className]
//                         }
//                     },
//                     language: "en"
//                 }
//             }
//         ]
//     });
//     buildRequestAndProcess(infobipDetails);
// }

// function sendWhatsUpMessageQuizwhizzReward(mobileNumber, customerName, board, className) {
//     const infobipDetails = JSON.stringify({
//         messages: [
//             {
//                 from: "15557307637",
//                 to: '91' + mobileNumber,
//                 content: {
//                     templateName: "starkwizz_user_reward_point",
//                     templateData: {
//                         body: {
//                             placeholders: [customerName, board, className]
//                         }
//                     },
//                     language: "en"
//                 }
//             }
//         ]
//     });
//     buildRequestAndProcess(infobipDetails);
// }


// exports.onCreateUserSubscription = functions.firestore
//     .document('transaction/{id}')
//     .onCreate((snap, context) => {
//         const newValue = snap.data();
//         console.log('newValue: ', newValue);
//         if (newValue.status === 'SUCCESS') {
//             let cusMob = newValue.mobileNo.replace("+91", "");
//             console.log('cusMob: ', cusMob);
//             let subsType = '';
//             if (newValue.paymentfor?.length >= 3) {
//                 subsType = newValue.paymentfor[0] + " " + "," + " " + newValue.paymentfor[1] + " " + "&" + " " + newValue.paymentfor[2];
//             } else if (newValue.paymentfor?.length >= 2 && newValue.paymentfor?.length < 3) {
//                 subsType = newValue.paymentfor[0] + " " + "&" + " " + newValue.paymentfor[1];
//             } else if (newValue.paymentfor?.length >= 1 && newValue.paymentfor?.length < 2) {
//                 subsType = newValue.paymentfor[0];
//             }
//             sendWhatsUpMessageSubscription(cusMob, newValue.displayName, subsType, newValue.amount);
//         }
//     });


// exports.onCreateUserReward = functions.firestore
//     .document('user_quizwhizz_exam_reward/{id}')
//     .onCreate((snap, context) => {
//         const newValue = snap.data();
//         if (newValue.status === 'ACTIVE') {
//             let cusMob = newValue.mobileNo.replace("+91", "");
//             console.log('cusMob: ', cusMob);
//             sendWhatsUpMessageQuizwhizzReward(cusMob, newValue.name, newValue.point, newValue.totalPoint);
//         }
//     });






//////////////////////// Functional Service For Email /////////////////////////////////////////////////////
function populateEmailForStrakwizzReg(newValue) {
    const compiledFunction = pug.compileFile('templates/regestration.pug');
    let htmlTemplate = compiledFunction({
        subject_text: 'Registration Successful!',
        name: newValue.displayName,
        mobileno: newValue.mobileNo,
    })
    console.log('htmlTemplate: ', htmlTemplate);

    return buildEMail = {
        to: [newValue.emailId],
        subject: 'Welcome to Starkwizz Account Successfully for registration!',
        html: htmlTemplate,
        id: newValue.id,
        status: newValue.status,
        date: moment().format('YYYY-MM-DD hh:mm A'),
        role: 'STARKWIZZ'
    }

}

function populateEmailForTransaction(newValue) {
    const compiledFunction = pug.compileFile('templates/payment.pug');
    let htmlTemplate = compiledFunction({
        subject_text: 'Payment Confirmed! Thank you for choosing Starkwizz!',
        name: newValue.name,
        amount: newValue.amount,
        amountText: newValue.amountText,
    })
    return buildEMail = {
        to: [newValue.emailId],
        subject: 'Payment Confirmed! Thank you for choosing Starkwizz',
        html: htmlTemplate,
        id: newValue.id,
        status: newValue.status,
        date: moment().format('YYYY-MM-DD hh:mm A'),
        role: 'STARKWIZZ'
    }
}

function populateEmailForSubscription(newValue) {
    const compiledFunction = pug.compileFile('templates/subscription.pug');
    let startDate = moment(newValue.startDate).format('DD-MM-YYYY');
    let endDate = moment(newValue.endDate).format('DD-MM-YYYY');
    let htmlTemplate = compiledFunction({
        subject_text: 'Subscription Successful!',
        name: newValue.name,
        endDate: endDate,
        startDate: startDate,
    })
    return buildEMail = {
        to: [newValue.emailId],
        subject: 'Successfully subscription! Thank you for choosing Starkwizz',
        html: htmlTemplate,
        id: newValue.id,
        status: newValue.status,
        date: moment().format('YYYY-MM-DD hh:mm A'),
        role: 'STARKWIZZ'
    }
}


function populateEmailForUserBirthDay(newValue) {
    const compiledFunction = pug.compileFile('templates/birthday.pug');

    let htmlTemplate = compiledFunction({
        subject_text: `Happy Birthday ${newValue.displayName}`,
        name: newValue.displayName,
        mobileno: newValue.mobileNo,
        text: `Dear ${newValue.displayName},\n\nWishing you a fantastic birthday! 🎂\n\nBest wishes,\nYour Starkwizz`,
    })

    return buildEMail = {
        to: [newValue.emailId],
        subject: 'Starkwizz wishes you a very Happy Birthday!',
        html: htmlTemplate,
        id: newValue.id,
        status: newValue.status,
        date: moment().format('YYYY-MM-DD hh:mm A'),
        role: 'STARKWIZZ'
    }

}

function populateEmailForCancelSubscription(newValue, subject) {
    const compiledFunction = pug.compileFile('templates/cancel-subscription.pug');

    let htmlTemplate = compiledFunction({
        subject_text: subject,
        name: newValue.name,
        reason: newValue.reason,
    })

    return buildEMail = {
        to: [newValue.userEmail],
        subject: subject,
        html: htmlTemplate,
        id: newValue.id,
        status: newValue.status,
        date: moment().format('YYYY-MM-DD hh:mm A'),
        role: 'STARKWIZZ'
    }

}

function populateEmailForMySyllabusEnquiry(newValue, subject) {
    const compiledFunction = pug.compileFile('templates/my-syllabus.pug');

    let htmlTemplate = compiledFunction({
        subject_text: subject,
        name: newValue.name,
        boardName: newValue.boardName,
        className: newValue.className,
        decs: newValue.decs,
    })

    return buildEMail = {
        to: [newValue.to],
        subject: subject,
        html: htmlTemplate,
        id: newValue.id,
        status: newValue.status,
        date: moment().format('YYYY-MM-DD hh:mm A'),
        role: 'STARKWIZZ'
    }

}



exports.onCreateUserRegistration = functions.firestore
    .document('users/{id}')
    .onCreate(async (snap, context) => {
        const newValue = snap.data();
        console.log('newValue: ', newValue);

        const mobileNo = (newValue?.mobileNo || '').toString().trim();
        const emailId = (newValue?.emailId || '').toString().trim().toLowerCase();

        if (mobileNo) {
            try {
                const existingUsers = await db.collection('users').where('mobileNo', '==', mobileNo).get();
                let conflictUserId = null;
                existingUsers.forEach((doc) => {
                    if (doc.id === context.params.id || conflictUserId) return;
                    const data = doc.data() || {};
                    const existingEmail = (data.emailId || '').toString().trim().toLowerCase();
                    if (existingEmail && emailId && existingEmail !== emailId) {
                        conflictUserId = doc.id;
                    }
                });

                if (conflictUserId) {
                    logger.warn('Duplicate mobile number detected (existing users); deleting user doc', {
                        userId: context.params.id,
                        mobileNo,
                        emailId,
                        conflictUserId,
                    });

                    await snap.ref.delete();
                    try {
                        await admin.auth().deleteUser(context.params.id);
                    } catch (err) {
                        logger.warn('Failed to delete auth user for duplicate mobile', err);
                    }
                    return;
                }
            } catch (err) {
                logger.error('Failed to validate mobile/email uniqueness against users collection', err);
            }

            const registryRef = db.collection('mobile_registry').doc(encodeURIComponent(mobileNo));
            try {
                const hasConflict = await db.runTransaction(async (t) => {
                    const regSnap = await t.get(registryRef);
                    if (!regSnap.exists) {
                        t.create(registryRef, {
                            mobileNo: mobileNo,
                            emailId: emailId || '',
                            userId: context.params.id,
                            createdAt: FieldValue.serverTimestamp(),
                        });
                        return false;
                    }

                    const regData = regSnap.data() || {};
                    const existingEmail = (regData.emailId || '').toString().trim().toLowerCase();
                    if (existingEmail && emailId && existingEmail !== emailId) {
                        return true;
                    }

                    if (!existingEmail && emailId) {
                        t.update(registryRef, {
                            emailId: emailId,
                            userId: context.params.id,
                            updatedAt: FieldValue.serverTimestamp(),
                        });
                    }

                    return false;
                });

                if (hasConflict) {
                    logger.warn('Duplicate mobile number detected; deleting user doc', {
                        userId: context.params.id,
                        mobileNo,
                        emailId,
                    });

                    await snap.ref.delete();
                    try {
                        await admin.auth().deleteUser(context.params.id);
                    } catch (err) {
                        logger.warn('Failed to delete auth user for duplicate mobile', err);
                    }
                    return;
                }
            } catch (err) {
                logger.error('Failed to validate mobile/email uniqueness', err);
            }
        }

        if (newValue.status === 'CREATED') {
            console.log('newValue.status: ', newValue.status);
            // let cusMob = newValue.mobileNo.replace("+91", "");
            // sendWhatsUpMessage(cusMob, newValue.displayName);
            const emailDetails = populateEmailForStrakwizzReg(newValue);
            admin.firestore().collection('email_messages').add(emailDetails);
        }
    });

// function sendBirthdayEmails() {
//     const today = dayjs().format('MM-DD');

//     users.forEach(user => {
//         const userBirthday = dayjs(user.dateOfBirth).format('MM-DD');

//         if (userBirthday === today) {
//             console.log('user: ', user);

//             const emailDetails = populateEmailForUserBirthDay(user);
//             admin.firestore().collection('email_messages').add(emailDetails);
//         }
//     });
// }

// Run daily at 9:00 AM
// cron.schedule('0 9 * * *', () => {
//      const today = dayjs().format('MM-DD');

//     users.forEach(user => {
//         const userBirthday = dayjs(user.dateOfBirth).format('MM-DD');

//         if (userBirthday === today) {
//             console.log('user: ', user);

//             const emailDetails = populateEmailForUserBirthDay(user);
//             admin.firestore().collection('email_messages').add(emailDetails);
//         }
//     });
// });


// exports.onUpdateUserRegistration = functions.firestore
//     .document('users/{id}')
//     .onUpdate(async (change, context) => {
//         try {
//             let newValue = change.after.data();

//             let currentDate = moment().format('DD-MM');
//             let userBirthDate = moment(newValue.dateOfBirth).format('DD-MM');

//             if (currentDate === userBirthDate) {
//                 console.log('newValue: ', newValue);

//                 const emailDetails = populateEmailForUserBirthDay(newValue);
//                 admin.firestore().collection('email_messages').add(emailDetails);
//             }

//             return;
//         } catch (error) {
//             console.log('Unable to Process onUpdate', error);
//         }
//     });


exports.onCreateTransaction = functions.firestore
    .document('transaction/{id}')
    .onCreate((snap, context) => {
        const newValue = snap.data();
        console.log('newValue: ', newValue);
        if (newValue.status === 'SUCCESS') {
            const emailDetails = populateEmailForTransaction(newValue);
            admin.firestore().collection('email_messages').add(emailDetails);

            const emailDetail = populateEmailForSubscription(newValue);
            admin.firestore().collection('email_messages').add(emailDetail);
        }
    });


exports.onCreateUserCancelSubscription = functions.firestore
    .document('cancel_subscription/{id}')
    .onCreate((snap, context) => {
        const newValue = snap.data();
        if (newValue.status === 'ACTIVE') {
            console.log('newValue: ', newValue);
            // let cusMob = newValue.mobileNo.replace("+91", "");
            // sendWhatsUpMessageSubscriptionCancel(cusMob, newValue.name, newValue.reason);
            let subject = 'Request Created For Cancel Subscription!';
            console.log('subject: ', subject);
            const emailDetails = populateEmailForCancelSubscription(newValue, subject);
            admin.firestore().collection('email_messages').add(emailDetails);
        }
    });

exports.onUpdateUserCancelSubscription = functions.firestore
    .document('cancel_subscription/{id}')
    .onUpdate(async (change, context) => {
        try {
            let newValue = change.after.data();

            if (newValue.status === 'PENDING') {
                // let cusMob = newValue.mobileNo.replace("+91", "");
                // sendWhatsUpMessageSubscriptionCancel(cusMob, newValue.name, newValue.reason);
                let subject = 'Request Pending For Cancel Subscription!';
                const emailDetails = populateEmailForCancelSubscription(newValue, subject);
                admin.firestore().collection('email_messages').add(emailDetails);
            } else if (newValue.status === 'APPROVE') {
                // let cusMob = newValue.mobileNo.replace("+91", "");
                // sendWhatsUpMessageSubscriptionCancel(cusMob, newValue.name, newValue.reason);
                let subject = 'Request Confirmed For Cancel Subscription!';
                const emailDetails = populateEmailForCancelSubscription(newValue, subject);
                admin.firestore().collection('email_messages').add(emailDetails);
            } else if (newValue.status === 'REJECT') {
                // let cusMob = newValue.mobileNo.replace("+91", "");
                // sendWhatsUpMessageSubscriptionCancel(cusMob, newValue.name, newValue.reason);
                let subject = 'Request Rejected For Cancel Subscription!';
                const emailDetails = populateEmailForCancelSubscription(newValue, subject);
                admin.firestore().collection('email_messages').add(emailDetails);
            }

            return;
        } catch (error) {
            console.log('Unable to Process onUpdate', error);
        }
    });

exports.onCreateSyllabusEnquiry = functions.firestore
    .document('syllabus_enquiry/{id}')
    .onCreate((snap, context) => {
        const newValue = snap.data();
        if (newValue.status === 'ACTIVE') {
            console.log('newValue: ', newValue);
            // let cusMob = newValue.mobileNo.replace("+91", "");
            // sendWhatsUpMessageSyllabusEnquiry(cusMob, newValue.name, newValue.boardName, newValue.className);
            let subject = 'Request Created For My Syllabus!';
            console.log('subject: ', subject);
            const emailDetails = populateEmailForMySyllabusEnquiry(newValue, subject);
            admin.firestore().collection('email_messages').add(emailDetails);
        }
    });


exports.onUpdateSyllabusEnquiry = functions.firestore
    .document('syllabus_enquiry/{id}')
    .onUpdate(async (change, context) => {
        try {
            let newValue = change.after.data();

            if (newValue.status === 'PENDING') {
                // let cusMob = newValue.mobileNo.replace("+91", "");
                // sendWhatsUpMessageSyllabusEnquiry(cusMob, newValue.name, newValue.boardName, newValue.className);
                let subject = 'Request Pending For My Syllabus!';
                const emailDetails = populateEmailForMySyllabusEnquiry(newValue, subject);
                admin.firestore().collection('email_messages').add(emailDetails);
            } else if (newValue.status === 'APPROVE') {
                // let cusMob = newValue.mobileNo.replace("+91", "");
                // sendWhatsUpMessageSyllabusEnquiry(cusMob, newValue.name, newValue.boardName, newValue.className);
                let subject = 'Request Confirmed For My Syllabus!';
                const emailDetails = populateEmailForMySyllabusEnquiry(newValue, subject);
                admin.firestore().collection('email_messages').add(emailDetails);
            } else if (newValue.status === 'REJECT') {
                // let cusMob = newValue.mobileNo.replace("+91", "");
                // sendWhatsUpMessageSyllabusEnquiry(cusMob, newValue.name, newValue.boardName, newValue.className);
                let subject = 'Request Rejected For My Syllabus!';
                const emailDetails = populateEmailForMySyllabusEnquiry(newValue, subject);
                admin.firestore().collection('email_messages').add(emailDetails);
            }

            return;
        } catch (error) {
            console.log('Unable to Process onUpdate', error);
        }
    });




exports.onCreateEmailActivity = functions.firestore
    .document('email_messages/{id}')
    .onCreate(async (snap, context) => {
        try {
            const emailDetails = snap.data();
            sendEMail(emailDetails);
        } catch (error) {
            console.log('Unable to Process email_messages', error);
        }
    });
function sendEMail(emailDetails) {
    const mailOptions = {
        from: 'Starkwizz<info@starkwizz.com>', // Something like: Jane Doe <janedoe@gmail.com>
        to: emailDetails.to,
        // to: 'sudhanshu.lenka2008@gmail.com',
        // to: 'rahilkhal1997@gmail.com',
        subject: emailDetails.subject, // email subject
        html: emailDetails.html,
    };
    // returning result
    console.log('..........sendEMail......');
    return emailSender.sendMail(mailOptions, (erro, info) => {
        console.log('sendEMail  info', info);
        console.log('sendEMail erro', erro);
        if (erro) {
            console.log(erro);
            return 'fail';
        }
        return 'Sucess';
    });
}



























async function populateNotificationForActivity(order) {
    console.log('populateNotificationForActivity call from event');
    if (order.activityDetails.length > 0) {
        let reciverDetails = order.activityDetails[order.activityDetails.length - 1];
        // console.log('populateNotificationForActivity activity details ', JSON.stringify(reciverDetails));
        if (reciverDetails) {
            let msg = reciverDetails.msg
            let notification = {
                creationDate: moment().format('YYYY-MM-DD hh:mm A'),
                status: 'ACTIVE',
                orderId: order.id,
                orderNo: order.orderNo,
                message: msg,
                orderStatus: order.orderStatus,
                title: reciverDetails?.name,
                unixTime: moment().unix(),
                inAppNotiStatus: 'CREATED',
                role: 'USER',
                userId: order.createdByDetails.id
            }
            if (reciverDetails.token) {
                notification.token = reciverDetails.token;
            } else {
                notification.token = null;
            }
            console.log('populateNotificationForActivity sendNotification activity createdby token ', notification.token);
            if (notification.token) {
                sendNotification(notification, notification.title, notification.message);
            }

            const users = await branchUser.where("branch.id", "==", order.applicableStoreId).get();
            console.log('Query to branch user  ');
            if (!users.empty) {
                console.log('branch user record found');
                users.forEach(doc => {
                    const record = doc.data();
                    console.log('branch user data found and token push');
                    if (record?.token) {
                        notification.token = record?.token;
                        console.log('populateNotificationForActivity sendNotification branchUser token ', notification.token);
                        if (notification.token) {
                            sendNotification(notification, notification.title, notification.message);
                        }
                    }

                })
            }
        } else {
            console.log('No activity details found ')
        }

        // user_message.add(JSON.parse(JSON.stringify(notification))).then(result=>{
        //     console.log('user_message added sucessfully')
        // },error=>{
        //     console.log('user_message unable to add')
        // });
    } else {
        console.log('No token avilable')
    }
}



// exports.onCreateUserMessage = functions.firestore
//     .document('user_message/{id}')
//     .onCreate((snap, context) => {
//         const newValue = snap.data();
//         console.log("onCreateUserMessage user_message", newValue.orderStatus);
//         sendNotification(newValue, newValue.title, newValue.message);
//     });


function sendNotification(newValue, title, msgText) {
    console.log("sendToDevice token {} ", newValue.token);
    let notificationPayload = {
        notification: {
            title: title,
            body: msgText
        },
        data: {
            orderId: newValue.orderId,
            orderNo: newValue.orderNo,
            orderStatus: newValue.orderStatus
        },
        android: {
            priority: 'high',
            notification: {
                imageUrl: 'https://starkwizz-admin.web.app/assets/images/logo.png',
                color: '#7e55c3',
                defaultSound: true,
                notificationCount: 1,
                click_action: 'FCM_PLUGIN_ACTIVITY',
            }
        },
        apns: {
            payload: {
                aps: {
                    'mutable-content': 1
                }
            },
            fcm_options: {
                image: 'https://starkwizz-admin.web.app/assets/images/logo.png',
            }
        },
        webpush: {
            headers: {
                image: 'https://starkwizz-admin.web.app/assets/images/logo.png',
            }
        },
        token: newValue.token,
    };

    if (null != notificationPayload.token) {
        console.log('sendToDevice send notification with payload ');
        admin.messaging().send(notificationPayload)
            .then((response) => {
                console.log('Successfully sent message:', response);
                return response;
            }).catch((error) => {
                console.log('Error sending message:', error);
                return response;
            });
    } else {
        console.log('Error sending message: token null');
        return null;
    }
    return null;
}

