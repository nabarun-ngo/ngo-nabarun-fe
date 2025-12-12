import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SearchAndAdvancedSearchModel } from '../../model/search-and-advanced-search.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { isEmptyObject, removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from './search-event.model';



@Component({
  selector: 'app-search-and-advanced-search-form',
  templateUrl: './search-and-advanced-search-form.component.html',
  styleUrls: ['./search-and-advanced-search-form.component.scss'],
})
export class SearchAndAdvancedSearchFormComponent implements OnInit {

  isSearchDisabled = true;
  adv_search: boolean = false;
  colLength!: number;

  constructor(@Inject(MAT_DIALOG_DATA) input: SearchAndAdvancedSearchModel, private sharedData: SharedDataService) {
    this.inputInit(input);
  }

  search!: SearchAndAdvancedSearchModel;

  @Output() onSearch: EventEmitter<SearchEvent> = new EventEmitter();
  searchformGroup: FormGroup = new FormGroup({});


  @Input({ required: true }) set searchInput(input: SearchAndAdvancedSearchModel) {
    this.inputInit(input);

  };

  inputInit(input: SearchAndAdvancedSearchModel) {
    input.advancedSearch?.searchFormFields.forEach(e => {
      this.searchformGroup.setControl(e.formControlName, new FormControl('', e.validations));
    })
    this.search = input;
    let len = input.advancedSearch?.searchFormFields?.length!;
    if (len == 1 || (len % 2) == 0) {
      this.colLength = len;
    } else {
      this.colLength = len + 1;
    }
  }

  ngOnInit(): void {
    this.searchformGroup.valueChanges.subscribe(d => {
      this.isSearchDisabled = !this.searchformGroup.valid || isEmptyObject(removeNullFields(d));
      //console.log(isEmptyObject(removeNullFields(d)))
      //console.log('Disabled',this.isSearchDisabled)

    })
  }

  advSearch() {
    if (this.searchformGroup.valid) {
      this.onSearch.emit({ advancedSearch: true, reset: false, value: this.searchformGroup.value })
    }
  }

  normalSearch($event: Event) {
    let input = $event.target as HTMLInputElement;
    this.onSearch.emit({ advancedSearch: false, reset: false, value: input.value, buttonName: 'CLOSE' })
    this.sharedData.setSearchValue(input.value);
  }

  advSearchReset() {
    this.searchformGroup.reset()
    this.onSearch.emit({ advancedSearch: true, reset: true, value: this.searchformGroup.value, buttonName: 'SEARCH' })
    this.adv_search = false
  }

  clickAdvSearchBtn() {
    this.adv_search = true
    this.onSearch.emit({ advancedSearch: false, reset: false, value: {}, buttonName: 'ADVANCED_SEARCH' })

  }
}


