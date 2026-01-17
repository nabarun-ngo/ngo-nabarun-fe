import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel } from "./universal-input.model";

export interface SearchAndAdvancedSearchModel {
  normalSearchPlaceHolder: string;
  normalSearchButtonText?: string;
  showOnlyAdvancedSearch?: boolean;
  disableAdvancedSearchBtn?: boolean;
  advancedSearch?: {
    searchFormFields: {
      formControlName: string;
      inputModel: UniversalInputModel;
      validations?: ValidatorFn[];
      hidden?: boolean;
    }[];
    title?: string;
    buttonText?: {
      search?: string;
      close?: string;
    };
    hideCloseButton?: boolean;
  },


}