import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-notice-create-or-update',
  templateUrl: './notice-create-or-update.component.html',
  styleUrls: ['./notice-create-or-update.component.scss']
})
export class NoticeCreateOrUpdateComponent implements OnInit {

  noticeForm!: FormGroup<any>;
isUpdate: any;
  ngOnInit(): void {
    this.noticeForm= new FormGroup({
      title:new FormControl('14',[Validators.required]),
      description:new FormControl('dfdf',[Validators.required]),
    });

  }

//   <main class="p-4 m-4 bg-gray-200 rounded-lg">
//   <div class="flex flex-col">
//       <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
//           <div class="mt-10 sm:mt-0">
//               <div class="md:grid md:grid-cols-3 md:gap-6">
//                   <div class="md:col-span-1">
//                       <div class="px-4 sm:px-0">
//                           <h3 class="text-lg font-medium leading-6 text-gray-900">Create Notice</h3>
//                           <p class="mt-1 text-sm text-gray-600">
//                               <b>NOTE :</b> Fields marked with <span class="text-blue-600">* </span> are mandatory.
//                           </p>
//                       </div>
//                   </div>
//                   <div class="mt-5 md:mt-0 md:col-span-2">
//                       <form [formGroup]="noticeForm">
//                           <div class="shadow overflow-hidden sm:rounded-md">
//                               <div class="px-4 py-5 bg-white sm:p-6">
//                                   <div class="grid grid-cols-6 gap-6">
//                                       <div class="col-span-6 sm:col-span-6">
//                                          <app-universal-input formControlName="title" [inputModel]="{
//                                           inputType:'text',
//                                           tagName:'input',
//                                           labelName:'Title'
//                                          }"></app-universal-input>
//                                       </div>
//                                       <!-- <div class="col-span-6 sm:col-span-6">
//                                           <label for="description" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" *ngIf="isRequiredField('noticeDescription')">* </span>
//                                               Notice description
//                                           </label>
//                                           <div class="mt-1">
//                                               <angular-editor formControlName="noticeDescription" [config]="descriptionConfig"></angular-editor>
          
//                                               <div class="mt-2" *ngIf="NBF.noticeDescription.touched && NBF.noticeDescription.invalid">
//                                                   <div class="text-red-500" *ngIf="NBF.noticeDescription.errors?.required">
//                                                       Notice description is required.
//                                                   </div>
//                                                   <div class="text-red-500" *ngIf="NBF.noticeDescription.errors?.minlength">
//                                                       Notice description should have atlease 50 characters.
//                                                   </div>
//                                                   <div class="text-red-500" *ngIf="NBF.noticeDescription.errors?.maxlength">
//                                                       Notice description should not have more than 1500 characters.
//                                                   </div>
//                                               </div>
//                                           </div>
//                                       </div>
//                                       <div class="col-span-6 sm:row-start-auto sm:col-span-3">
//                                           <label for="noticeDate" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" *ngIf="isRequiredField('noticeDate')">* </span> Notice date</label>
//                                           <div class="relative">
//                                               <input type="text" formControlName="noticeDate" [matDatepicker]="noticeDate" readonly placeholder="Select event date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
//                                               <div class="absolute top-0 right-0">
//                                                   <mat-datepicker-toggle [for]="noticeDate" class="sm:border-none">
//                                                   </mat-datepicker-toggle>
//                                                   <mat-datepicker #noticeDate></mat-datepicker>
//                                               </div>
//                                           </div>
//                                           <div class="mt-2" *ngIf="NBF.noticeDate.touched && NBF.noticeDate.invalid">
//                                               <div class="text-red-500" *ngIf="NBF.noticeDate.errors?.required">
//                                                   Notice date is required.
//                                               </div>
//                                           </div>
//                                       </div>
//                                       <div class="col-span-6 sm:col-span-3" *ngIf="!isUpdate">
//                                           <label for="last_name" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" *ngIf="isRequiredField('publishAsRole')">* </span> Publish as</label>
//                                           <select formControlName="publishAsRole" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
//                                               <option value="" disabled selected hidden>Select role</option>    
//                                               <option value="{{role}}"  *ngFor="let role of roles; let i=index"  >{{role}}</option>
//                                               </select>
//                                           <div class="mt-2" *ngIf="NBF.publishAsRole.touched && NBF.publishAsRole.invalid">
//                                               <div class="text-red-500" *ngIf="NBF.publishAsRole.errors?.required">
//                                                   Publish as is required.
//                                               </div>
          
//                                           </div>
//                                       </div>
//                                       <div class="col-span-6 sm:col-span-6" *ngIf="isUpdate">
//                                           <label for="last_name" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" *ngIf="isRequiredField('noticeVisibility')">* </span> Notice visibility </label>
//                                           <div class="mt-2 space-y-4">
//                                               <div class="flex items-center " *ngIf="false">
//                                                   <input id="publish_publicly" name="noticeVisibility" formControlName="noticeVisibility" value="{{noticeMetaData.states.public}}" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
//                                                   <label for="publish_publicly" class="ml-3 block text-sm font-medium text-gray-700">
//                                                       Public
//                                                   </label>
//                                                   <div class="mx-2">
//                                                       <div class="tooltip">
//                                                           <div class="flex items-stretch">
//                                                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 self-center text-gray-900" viewBox="0 0 20 20" fill="currentColor">
//                                                                   <path fill-rule="evenodd"
//                                                                   d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                                                                   clip-rule="evenodd" />
//                                                               </svg>
//                                                           </div>
//                                                           <div class="right">
//                                                               <p>Notice will be displayed publicly to everyone.</p>
//                                                               <i></i>
//                                                           </div>
//                                                       </div>
//                                                   </div>
//                                               </div>
//                                               <div class="flex items-center">
//                                                   <input id="publish_internally" name="noticeVisibility" formControlName="noticeVisibility" value="{{noticeMetaData.states.internal}}" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
//                                                   <label for="publish_internally" class="ml-3 block text-sm font-medium text-gray-700">
//                                                       Internal
//                                                   </label>
//                                                   <div class="mx-2">
//                                                       <div class="tooltip">
//                                                           <div class="flex items-stretch">
//                                                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 self-center text-gray-900" viewBox="0 0 20 20" fill="currentColor">
//                                                                   <path fill-rule="evenodd"
//                                                                   d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                                                                   clip-rule="evenodd" />
//                                                               </svg>
//                                                           </div>
//                                                           <div class="right">
//                                                               <p>Notice will be displayed only to Volunteers of Nabarun's members.</p>
//                                                               <i></i>
//                                                           </div>
//                                                       </div>
//                                                   </div>
//                                               </div>
//                                               <div class="flex items-center">
//                                                   <input id="draft" name="noticeVisibility" formControlName="noticeVisibility" value="{{noticeMetaData.states.hidden}}" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
//                                                   <label for="draft" class="ml-3 block text-sm font-medium text-gray-700">
//                                                       Hidden
//                                                   </label>
//                                                   <div class="mx-2">
//                                                       <div class="tooltip">
//                                                           <div class="flex items-stretch">
//                                                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 self-center text-gray-900" viewBox="0 0 20 20" fill="currentColor">
//                                                                   <path fill-rule="evenodd"
//                                                                   d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                                                                   clip-rule="evenodd" />
//                                                               </svg>
//                                                           </div>
//                                                           <div class="right">
//                                                               <p>Notice will be displayed only to creator of this notice.</p>
//                                                               <i></i>
//                                                           </div>
//                                                       </div>
//                                                   </div>
//                                               </div>
//                                           </div>
//                                       </div>
//                                       <div class="col-span-6 sm:col-span-6">
//                                           <div class="flex justify-start">
//                                               <label class="block text-sm text-gray-900">
//                                                   <span class="text-blue-600" >* </span>
//                                                   Would you like to create a meeting in Google Meet?</label>
//                                               <label for="meeting_yes" class="ml-2 block text-sm text-gray-900">
//                                               <input id="meeting_yes" formControlName="needMeeting" name="needMeeting" type="radio" value="true"
//                                                   class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
//                                               <span class="ml-2">Yes</span>
//                                               </label>
          
//                                               <label for="meeting_no" class="ml-2 block text-sm text-gray-900 ">
//                                               <input id="meeting_no" formControlName="needMeeting" name="needMeeting" type="radio" value="false"
//                                                   class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
//                                               <span class="ml-2">No</span>
//                                               </label>
//                                           </div>
//                                       </div> 
//                                   </div>
//                               </div>
//                              <div class="px-4 py-5 bg-white sm:p-6" *ngIf="NBF.needMeeting.value && NBF.needMeeting.value === 'true'">
//                                   <div class="grid grid-cols-6 gap-6" formGroupName="meetingInfo">
//                                       <div class="col-span-6 sm:col-span-6">
//                                           <label for="meettitle" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" >* </span>Meeting summary</label>
//                                           <input type="text" id="meettitle" formControlName="meetingSummary" placeholder="Meeting summary" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
//                                       </div>
//                                       <div class="col-span-6 sm:col-span-6">
//                                           <label for="description" class="block text-sm font-medium text-gray-700">
//                                               Meeting agenda
//                                           </label>
//                                           <div class="mt-1">
//                                               <angular-editor formControlName="meetingAgenda" [config]="meetingAgendaConfig"></angular-editor>
//                                           </div>
//                                       </div>
          
//                                       <div class="col-span-6 sm:row-start-auto sm:col-span-3">
//                                           <label for="meetingDate" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600">* </span> Meeting date</label>
//                                           <div class="relative">
//                                               <input type="text" formControlName="meetingDate" [matDatepicker]="meetingDate" readonly placeholder="Select meeting date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
//                                               <div class="absolute top-0 right-0">
//                                                   <mat-datepicker-toggle [for]="meetingDate" class="sm:border-none">
//                                                   </mat-datepicker-toggle>
//                                                   <mat-datepicker #meetingDate></mat-datepicker>
//                                               </div>
//                                           </div>
          
//                                       </div>
//                                       <div class="col-span-6 sm:col-span-3">
//                                           <label for="meetlocation" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" >* </span>Meeting location</label>
//                                           <input type="text" formControlName="meetingLocation" id="meetlocation" placeholder="Enter meeting location" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
//                                       </div>
//                                       <div class="col-span-6 sm:col-span-3">
//                                           <label for="last_name" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" >* </span>Start time </label>
//                                           <div class="relative">
//                                               <input type="text" formControlName="meetingStartTime" placeholder="Select start time" [ngxTimepicker]="startTime" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" readonly>
//                                               <div class="absolute top-1 right-2">
//                                                   <ngx-material-timepicker-toggle [for]="startTime"></ngx-material-timepicker-toggle>
//                                                   <ngx-material-timepicker #startTime [format]="24"></ngx-material-timepicker>
//                                               </div>
//                                           </div>
          
//                                       </div>
//                                       <div class="col-span-6 sm:col-span-3">
//                                           <label for="last_name" class="block text-sm font-medium text-gray-700">
//                                               <span class="text-blue-600" >* </span> End time </label>
//                                           <div class="relative">
//                                               <input type="text" formControlName="meetingEndTime" placeholder="Select end time" [ngxTimepicker]="endTime" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" readonly>
//                                               <div class="absolute top-1 right-2">
//                                                   <ngx-material-timepicker-toggle [for]="endTime"></ngx-material-timepicker-toggle>
//                                                   <ngx-material-timepicker #endTime [format]="24"></ngx-material-timepicker>
//                                               </div>
//                                           </div>
//                                       </div> -->
//                                   </div>
//                               </div>
//                              <!-- <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
//                                       <button (click)="discardDraft()" *ngIf="isDraft" type="button" matToolTip="Discard draft" class="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                                           Discard draft
//                                       </button>
//                                   </div>
//                                   <div class="flex justify-end px-2">
//                                       <button (click)="saveAsDraftNotice()" type="button" *ngIf="!isUpdate" matToolTip=" Save as draft" class="bg-white py-2 mx-1 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                                           Save as draft
//                                       </button>
//                                       <button (click)="publishNotice()" type="button" *ngIf="!isUpdate" class="inline-flex justify-center py-2 mx-1 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center">
//                                           Publish
//                                       </button>
//                                   </div> 
//                                   <button class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
//                                       Update
//                                   </button>
//                               </div> -->
//                           </div>
//                       </form>
//                   </div>
//               </div>
//           </div>
//       </div>
//   </div>
//   <button  class="block uppercase w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:shadow-outline focus:bg-gray-300 hover:shadow-xs p-3 my-4">
//       BACK TO NOTICES</button>
// </main>

}
