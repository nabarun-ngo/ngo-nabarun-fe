import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchAndAdvancedSearchModel } from './search-and-advanced-search.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-search-and-advanced-search-form',
  templateUrl: './search-and-advanced-search-form.component.html',
  styleUrls: ['./search-and-advanced-search-form.component.scss'],
})
export class SearchAndAdvancedSearchFormComponent implements OnInit {
  adv_search: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) input: SearchAndAdvancedSearchModel) {
    this.inputInit(input);
  }

  search!: SearchAndAdvancedSearchModel;

  @Output() onSearch: EventEmitter<{
    advancedSearch: boolean,
    reset: boolean,
    value: any
  }> = new EventEmitter();
  searchformGroup: FormGroup = new FormGroup({});


  @Input({ required: true }) set searchInput(input: SearchAndAdvancedSearchModel) {

    this.inputInit(input);
  };

  inputInit(input: SearchAndAdvancedSearchModel) {
    input.advancedSearch?.searchFormFields.forEach(e => {
      this.searchformGroup.setControl(e.formControlName, new FormControl('', e.validations));
    })
    this.search = input;
  }

  ngOnInit(): void {
    //this.normalSearchPlaceHolder='Enter donation number, donor name , donation type, donation status to begin search';
  }

  advSearch() {
    if (this.searchformGroup.valid) {
      this.onSearch.emit({ advancedSearch: true, reset: false, value: this.searchformGroup.value })
    }
  }

  normalSearch($event: Event) {
    let input = $event.target as HTMLInputElement;
    this.onSearch.emit({ advancedSearch: false, reset: false, value: input.value })
  }

  advSearchReset() {
    this.searchformGroup.reset()
    this.onSearch.emit({ advancedSearch: true, reset: true, value: this.searchformGroup.value })
    this.adv_search=false
  }
}


