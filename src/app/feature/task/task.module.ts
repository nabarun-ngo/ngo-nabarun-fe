import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskRoutingModule } from './task-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaskSearchPipe } from './task.pipe';



@NgModule({
  declarations: [
    TaskListComponent,
    TaskSearchPipe
  ],
  imports: [
    CommonModule,
    TaskRoutingModule,
    SharedModule,
  ],
  providers:[
    TaskSearchPipe
  ]
})
export class TaskModule { }
