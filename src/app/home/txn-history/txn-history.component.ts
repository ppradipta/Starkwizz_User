import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { DateUtilService } from 'src/app/common/util/date-util.service';
import { UserServiceService } from 'src/app/services/user-service.service';
import { SubjectModuleListComponent } from '../dynamo/subject-module-list/subject-module-list.component';

@Component({
  selector: 'app-txn-history',
  templateUrl: './txn-history.component.html',
  styleUrls: ['./txn-history.component.scss'],
})
export class TxnHistoryComponent implements OnInit {
  userDetails: any;
  txnHistory: any[] = [];
  constructor(private userService: UserServiceService, private router: Router,
    private dateUtilService: DateUtilService,
    private bottomSheet: MatBottomSheet,
    private firestore: AngularFirestore) { }

  ngOnInit() {
    this.userService.getUserDetails().subscribe((userData) => {
      this.userDetails = userData;
    });
    this.getTxnHistory();
  }


  getTxnHistory() {
    const query = this.firestore.collection('transaction').ref
      .where("userid", "==", this.userDetails.id)
     .orderBy("endDateUnix","desc");
    query.get().then((txnRecords: any) => {
      this.txnHistory = [];
      if (!txnRecords.empty) {
        txnRecords.forEach((data:any) => {
          let txn: any = data.data();
          txn.expiredDays = this.dateUtilService.getExpiredDays(txn.endDate);
          this.txnHistory.push(txn);
        });
        this.txnHistory = this.dateUtilService.sortingBasedSubscriptionDate(this.txnHistory);
      }

    });
  }

  checkForEachModules(txnsubj:any) {
    let type = 'TXNHISTORY';
    let subject = {
      id: txnsubj.subjectId,
      displayName: txnsubj.subjectName
    }
    this.bottomSheet.open(SubjectModuleListComponent, {
      data: {
        subject,
        type
      },
      panelClass: 'bottom-sheet'
    });

    // this.bottomSheet._openedBottomSheetRef.afterDismissed().subscribe((data: any) => {

    // });
  }

  gotoDynamo() {
    this.router.navigate(['home/dynamo'], { queryParams: { subscription: 'EXPIRED' }});
  }
}
