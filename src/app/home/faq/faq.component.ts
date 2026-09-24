import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent  implements OnInit {

  faqs: Array<{question: string; answer: string; open?: boolean}> = [
    {
      question: 'What is Starkwizz and how does it help school children?',
      answer: '<strong>Starkwizz</strong> is an academic evaluation app designed to help the school children consistently assess their knowledge, identify gaps, and improve academic performance. With features like <strong> Dynamo, QuizWhizz, and Event</strong>; it ensures year-round learning, reduce last minute exam cramming, and builds confidence through regular <strong> revision, practice and tests </strong>.',
      open: false
    },
    {
      question: 'Is Starkwizz App Free or Paid?',
      answer: 'We offer <strong> “free basic access” </strong> with limited features. Premium subscriptions unlock advanced analytics, unlimited evaluations, and priority event registrations.',
      open: false
    },
    {
      question: 'Can I cancel my Starkwizz subscription and receive a full refund?',
      answer: 'Yes, you can cancel your subscription and request a refund within <strong> 120 hours (5 days) </strong> of the cooling-off period after subscribing. <br /> <strong> Note: </strong> <ul> <li>The subscription amount includes GST (Goods and Service Tax).</li> <li>Upon cancellation, the refund will be processed <strong> after deducting the GST portion </strong>, as per government tax regulation.</li> </ul> ',
      open: false
    },
    {
      question: 'Can a child use the app offline?',
      answer: 'No, all the platforms <strong> require internet connectivity </strong>. But downloaded contents are possible for review offline.',
      open: false
    },
    {
      question: 'What devices are supported to Starkwizz?',
      answer: 'Starkwizz works on <strong> “Android, iOS, and Web browsers” </strong>. Progress syncs across devices for seamless service.',
      open: false
    },
    {
      question: 'How do I register my child?',
      answer: 'For <strong> Android </strong>user - download the app from the <strong> Google Play Store </strong>, create your child account or create a parent account and add your child’s details for complete their general and academic profile to start the application. <br /> *Need more help? <br /> Contact us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@starkwizz.com" style="color: blue;" target="_blank" rel="noopener noreferrer" >support@starkwizz.com</a> or call +91 6371469050',
      open: false
    },
    {
      question: 'Is my child’s data safe?',
      answer: 'Absolutely, we are using World’s No. – 1 trusted <strong> Google Firebase (Cloud Storage) </strong> for hosting and running the Starkwizz application. Definitely, <strong> Firebase </strong> is generally considered a secure platform, offering various security features and best practices. Hence, we comply with strict data privacy laws and never share user’s information with third parties at any circumstances.',
      open: false
    },
    {
      question: 'How does the Dynamo platform help students?',
      answer: 'Dynamo is a <strong> five (5) steps test and evaluation series </strong>, allow students to evaluate themselves on different subjects and chapters at their own pace, ensuring continuous learning and improvement.',
      open: false
    },
    {
      question: 'Is the assessment aligned with school syllabi?',
      answer: 'Yes, the assessments in the Dynamo section are designed as per the <strong> standard academic curriculum </strong> for <strong> class 3 to 10 </strong>.',
      open: false
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Some features work offline, but the full experience requires an internet connection.',
      open: false
    },
    {
      question: 'Can parents able to monitor their child’s academic performance on Starkwizz? Can a child able to track his/her progress on Starkwizz?',
      answer: 'Yes, <strong> both parents and children can monitor and tracking academic progress</strong>. <br /> Parents or Children receive detailed <strong> “Performance dashboards” </strong> showing: <ul> <li>Strengths or weaknesses in a chapter or subject.</li> <li>Detailed performance report and progress trends over time.</li> <li>Comparisons with grade-level benchmarks.</li> </ul>',
      open: false
    },
    {
      question: 'What is Quiz Whizz platform and how does it work?',
      answer: 'Quiz Whizz is a weekly quiz competition program held every <strong> Sunday </strong>, hosts online quizzes on <strong> “GK, Current Affairs, and Mental Ability” </strong>. This program sharpens <strong> critical thinking, general awareness, and problem-solving skills </strong>, preparing children for competitive exams and real-world challenges.',
      open: false
    },
    {
      question: 'What is Event platform?',
      answer: 'Event platform offers scheduled and surprised <strong> “Talent Search Exams and Scholarships” </strong> across all academic subjects, on the <strong> holidays </strong> in an academic year. Children can compete with thousands rather than forty or fifty classroom students at different level (<strong> national, state, district and school level </strong>) and earn <strong> rewards and recognitions </strong>, along with boosting their academic profile and confidence.',
      open: false
    },
    {
      question: 'Can the user receive notifications prior to an event?',
      answer: 'Yes, the user can enable notifications to get <strong> updates on upcoming events </strong>.',
      open: false
    },
    {
      question: 'Are the Quizzes and/or Events competitions are timed?',
      answer: 'Yes! Quiz Whizz and Events platforms simulate real-exam environments with timers to <strong> improve time management skill and reduce exam anxiety </strong>.',
      open: false
    },
    {
      question: 'When will the results for Quiz Whizz and Events be available to children?',
      answer: 'Results of Quiz Whizz and Event including leaderboard is available at Starkwizz <strong> immediately after the competition or event concludes </strong>. Children can view their performance in the app’s dashboard and leaderboard. While ranks are typically displayed in the leaderboard within <strong> 24 hours </strong> post completion of a Event or Quiz Whizz competition. <br /> <strong> *Note: </strong> <ul> <li>Ranks are finalized after cross-verifying all participants’ scores.</li> <li>Certificates or rewards (if applicable) are shared via email or app notifications within 5-7 working days post-results.</li> </ul>',
      open: false
    },
    {
      question: 'What if my child misses a Quiz Whizz competition or an Event examination due to illness or bad internet or technical error or other unavoidable reasons?',
      answer: 'We understand that unexpected situations arise! Here’s how <strong> Starkwizz ensure flexibility, not penalties </strong>. <br /> In an event that a child does not attempt a Quiz Whizz competition or an Event examination due to illness, bad internet, technical issues, or other adverse circmstances beyond their control, may contact our support team for rescheduling the competition or event with a good cause within next 3 working days from the date of competition or event. <br /> <strong> *Note: </strong> <ul> <li>Missed Sunday quizzes or event exam can be attempted later and the scores will reflect in the dashboard, but the rankings and reward (if) apply is applicable for the scheduled participants only.</li> <li>In some cases, the competition or event missed with good cause may be disregarded.</li> </ul>',
      open: false
    },
    {
      question: 'Can Starkwizz replace tuition classes?',
      answer: 'While it complements tuition by providing structured practice, we recommend using Starkwizz alongside school or coaching for holistic development.',
      open: false
    },
    {
      question: 'How can Starkwizz help if my child’s school or coaching center skips regular tests to prioritize completing the syllabus?',
      answer: 'Starkwizz bridges this gap by providing <strong> structured, syllabus-aligned evaluation program </strong> year-round. With features like <strong> five (5) steps test series </strong> (chapter wise – multi chapter-wise and subject-wise) in the <strong> Dynamo </strong> platform, your child can: <ul> <li>Revision and practice regularly to retain concepts.</li> <li>Identify weaknesses early through continuous assessments.</li> <li>Stay exam-ready without relying solely on schools or coaching centers.</li> <li>Stay consistent in their studies rather than last-minute exam preparation.</li> </ul>',
      open: false
    },
    {
      question: 'What are the key points, which make Starkwizz different from other online or offline test platforms?',
      answer: 'Starkwizz is really a unique and all in one application with innovative concepts and features: <ul> <li>The <strong> Dynamo </strong> platform enables <strong> Five (5) steps test series </strong> with <strong> chapter-wise, multi chapters-wise, and subject-wise evaluations </strong> to ensure students learn incrementally.</li> <li><strong> Dynamo </strong> test series <strong> allows re-evaluations </strong> to address gaps until children score <strong> 100% test score </strong> to confirm mastery.</li> <li><strong>Real time reports, highlights weakness.</strong></li> <li><strong>Year-round tracking </strong> to prevent last-minute cramming.</li> <li><strong>Quiz Whizz </strong> builds <strong> mental ability, GK, and current affairs </strong> skills through weekly competitions.</li> <li>The <strong> Event </strong> section promote <strong> talent search exams </strong> and <strong> scholarships </strong> to test all-round abilities.</li> <li> <strong>Curriculum-mapped evaluations </strong> for Standard 4-10, adhering to state and board syllabi.</li> </ul>',
      open: false
    },
     {
      question: 'Can I get a refund if I’m not satisfied?',
      answer: 'Yes. <br /> For <strong> Quarterly and Yearly plans </strong>, we offer a <strong> 7-day no-questions-asked refund </strong>, provided your child has used <strong> less than 20% of thew content </strong> and has <strong> not attempted talent exams or certificates</strong>.',
      open: false
    },
     {
      question: 'Can I get a refund after cancelled my monthly subscriptions?',
      answer: 'No. <br /> Monthly plans can be <strong> cancelled anytime </strong>, but <strong> refunds are not available </strong> once the subscription starts.Your access will continue till the end of the billing period.',
      open: false
    },
     {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel easily either directly contact with Starkwizz’s service team via telephonically or send a cancellation and/or refund request through e-mail, along with the details of purchased plan and personal details. <ul> <li>From App – Profile – Subscription</li> <li>Cancel via telephonic contact (+91 63714 69050)</li> <li>Or email support (<a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@starkwizz.com" style="color: blue;" target="_blank" rel="noopener noreferrer">support@starkwizz.com</a>)</li> </ul> <br /> Cancellation stops future billing. You’ll still have access until the plan expires.',
      open: false
    },
     {
      question: 'How long does a refund take to process?',
      answer: 'If approved, refunds are processed within <strong> 7-10 working days to the original payment method </strong>.Taxes and payment gateway charges (if any) are non-refundable.',
      open: false
    },
     
  ];

  constructor() { }

  ngOnInit() {}

  toggle(index: number) {
    const isOpen = this.faqs[index].open;
    this.faqs.forEach(f => f.open = false);
    this.faqs[index].open = !isOpen;
  }

}
