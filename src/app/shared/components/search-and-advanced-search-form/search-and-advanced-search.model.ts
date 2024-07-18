import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel } from "../generic/universal-input/universal-input.model";

export interface SearchAndAdvancedSearchModel{
    normalSearchPlaceHolder: string;
    advancedSearch?:{
      searchFormFields:{
        formControlName:string;
        inputModel:UniversalInputModel;
        validations?:ValidatorFn[];
      }[];
    }
  }