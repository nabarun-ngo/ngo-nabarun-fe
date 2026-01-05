import { Component, Input, OnInit } from '@angular/core';
import { AlertData } from '../../../model/alert.model';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  protected alertClass: string = '';
  protected alertType: string = '';
  protected hideAlert: boolean = false;
  protected textClass: string = '';


  @Input('alertData')
  alertData!: AlertData;

  ngOnInit(): void {
    if (this.alertData.alertType == 'warning') {
      this.alertClass = 'bg-yellow-400';
      this.textClass = 'text-yellow-800 dark:text-yellow-400 font-bold';
      this.alertType = 'WARNING';
    } else if (this.alertData.alertType == 'error') {
      this.alertClass = 'bg-red-400';
      this.textClass = 'text-red-800 dark:text-red-400 font-bold';
      this.alertType = 'ERROR';
    }
    else if (this.alertData.alertType == 'success') {
      this.alertClass = 'bg-green-400';
      this.textClass = 'text-green-800 dark:text-green-400 font-bold';
      this.alertType = 'SUCCESS';
    }
    else {
      this.alertClass = 'bg-blue-400';
      this.textClass = 'text-blue-800 dark:text-blue-400 font-bold';
      this.alertType = 'INFORMATION';
    }
    if (this.alertData.destroyAfter) {
      setTimeout(() => {
        this.hideAlert = true;
      }, this.alertData.destroyAfter * 1000)
    }
  }


}
