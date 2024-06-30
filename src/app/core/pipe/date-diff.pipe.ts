import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateDiff'
})
export class DateDiffPipe implements PipeTransform {

  transform(value: Date): string {
    let diffSec = (new Date().getTime()-value.getTime())/1000;
    if(diffSec < 60){
      return Math.floor(diffSec) +' sec';
    }else if(diffSec >= 60 && diffSec<3600){
      return Math.floor(diffSec/60) +' min';
    }else if(diffSec >= 3600 && diffSec<86400){
      return Math.floor(diffSec/3600) +' hour';
    }else if(diffSec >= 86400 && diffSec<31536000){
      return Math.floor(diffSec/86400) +' day';
    }
    return Math.floor(diffSec/31536000)  +' year';
  }

}
