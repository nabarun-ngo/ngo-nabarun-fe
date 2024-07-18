import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchAndAdvancedSearchModel } from './search-and-advanced-search.model';

@Component({
  selector: 'app-search-and-advanced-search-form',
  templateUrl: './search-and-advanced-search-form.component.html',
  styleUrls: ['./search-and-advanced-search-form.component.scss']
})
export class SearchAndAdvancedSearchFormComponent implements OnInit {

  search!: SearchAndAdvancedSearchModel;

  @Output() onSearch: EventEmitter<{
    advancedSearch: boolean,
    reset: boolean,
    value: any
  }> = new EventEmitter();
  searchformGroup: FormGroup = new FormGroup({});


  @Input({ required: true }) set searchInput(input: SearchAndAdvancedSearchModel) {

    input.advancedSearch?.searchFormFields.forEach(e => {
      this.searchformGroup.setControl(e.formControlName, new FormControl('', e.validations));
    })
    this.search = input;
  };

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

  }
}
