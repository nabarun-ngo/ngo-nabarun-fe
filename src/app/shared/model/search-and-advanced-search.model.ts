import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel } from "./universal-input.model";

export type DisplayCondition = (formValues: any) => boolean;

export interface SearchAndAdvancedSearchModel {
  normalSearchPlaceHolder: string;
  normalSearchButtonText?: string;
  showOnlyAdvancedSearch?: boolean;
  disableAdvancedSearchBtn?: boolean;
  advancedSearch?: {
    searchFormFields: {
      formControlName: string;
      defaultValue?: string;
      inputModel: UniversalInputModel;
      validations?: ValidatorFn[];
      hidden?: boolean;
      displayCondition?: DisplayCondition;
    }[];
    title?: string;
    buttonText?: {
      search?: string;
      close?: string;
    };
    hideCloseButton?: boolean;
  },
}