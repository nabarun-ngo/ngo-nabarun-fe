import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';

@Component({
    selector: 'app-page-title',
    templateUrl: './page-title.component.html',
    styleUrls: ['./page-title.component.scss'],
    standalone: false
})
export class PageTitleComponent implements OnInit{
  pageName!:string;

  constructor(private sharedDataService:SharedDataService){}

  ngOnInit(): void {
    this.sharedDataService.pageName.subscribe(name=>this.pageName=name);
  }
}
