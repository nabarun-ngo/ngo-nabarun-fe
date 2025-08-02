import { Component, Input, OnInit } from '@angular/core';
import { AlertData } from '../../../model/alert.model';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  protected alertClass!: string;
  protected alertType!: string;
  protected display: boolean = true;


  @Input('alertData')
  alertData!: AlertData;

  ngOnInit(): void {
    if (this.alertData.alertType == 'warning') {
      this.alertClass = 'bg-yellow-400';
      this.alertType = 'WARNING';
    } else if (this.alertData.alertType == 'error') {
      this.alertClass = 'bg-red-400';
      this.alertType = 'ERROR';
    }
    else if (this.alertData.alertType == 'success') {
      this.alertClass = 'bg-green-400';
      this.alertType = 'SUCCESS';
    }
    else {
      this.alertClass = 'bg-blue-400';
      this.alertType = 'INFORMATION';
    }
    if (this.alertData.destroyAfter) {
      setTimeout(() => {
        this.display = false;
      }, this.alertData.destroyAfter * 1000)
    }
  }


}
