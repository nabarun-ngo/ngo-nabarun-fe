import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-and-advanced-search-form',
  templateUrl: './search-and-advanced-search-form.component.html',
  styleUrls: ['./search-and-advanced-search-form.component.scss']
})
export class SearchAndAdvancedSearchFormComponent implements OnInit{
  
  normalSearchPlaceHolder!: string;

  ngOnInit(): void {
    this.normalSearchPlaceHolder='Enter donation number, donor name , donation type, donation status to begin search';
  }
}
