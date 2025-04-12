import { Component, Input } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { KeyValue } from 'src/app/core/api/models';
import { getErrorMessage, injectNgControl } from 'src/app/core/service/form.service';
import { inputType, UniversalInputModel } from 'src/app/shared/model/universal-input.model';


@Component({
  selector: 'app-universal-input,[app-universal-input]',
  templateUrl: './universal-input.component.html',
  styleUrls: ['./universal-input.component.scss']
})
export class UniversalInputComponent {

  protected errorMessage = getErrorMessage
  protected ngControl = injectNgControl();

  autocompleteList!: KeyValue[];
  inputModel!: UniversalInputModel;

  @Input({ required: true, alias: 'inputModel' })
  set model(_model: UniversalInputModel) {
    //console.log(_model)
    this.inputModel = _model;
    if (_model.autocomplete) {
      // console.log(_model.selectList)
     // this.autocompleteList = _model.selectList!;
       //console.log(this.autocompleteList)
    }
  }

  specialInputTypes: inputType[] = ['date', 'editor', 'radio', 'time', 'phone', 'check']



  displayFn(id: string): string {
    if(this.inputModel && this.inputModel.selectList){
      return this.inputModel.selectList.find(f => f.key == id)?.displayValue!;
    }
    return '';
  }
  

}
