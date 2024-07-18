import { Component, Input } from '@angular/core';
import { getErrorMessage, injectNgControl } from 'src/app/core/service/form.service';
import { UniversalInputModel } from 'src/app/shared/components/generic/universal-input/universal-input.model'; 


@Component({
  selector: 'app-universal-input,[app-universal-input]',
  templateUrl: './universal-input.component.html',
  styleUrls: ['./universal-input.component.scss']
})
export class UniversalInputComponent {

  protected errorMessage=getErrorMessage
  protected ngControl = injectNgControl();

  @Input({required:true}) 
  inputModel!:UniversalInputModel;

}
