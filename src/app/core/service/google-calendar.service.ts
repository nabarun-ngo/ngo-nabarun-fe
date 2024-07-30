import { Injectable } from '@angular/core';
import { GoogleAuthService } from './google-auth.service';
import { MeetingDetail } from '../api/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService extends GoogleAuthService {
  createCalendarEvent(meeting: MeetingDetail | undefined, foreignId?: string | undefined) {
   console.log(meeting)
    let attendees:gapi.client.calendar.EventAttendee[]=[]
    meeting?.meetingAttendees?.forEach(ma=>{
      attendees.push({
        displayName:ma.fullName,
        email:ma.email
      })
    })
    return gapi.client.calendar.events.insert({
      resource: {
        summary:meeting?.meetingSummary,
        location:meeting?.meetingLocation,
        description:meeting?.meetingSummary,
        start: {
          dateTime: this.getDateTime(new Date(meeting?.meetingDate!),meeting?.meetingStartTime!),
          timeZone:'Asia/Kolkata'
        },
        end: {
           dateTime:this.getDateTime(new Date(meeting?.meetingDate!),meeting?.meetingEndTime!),
           timeZone:'Asia/Kolkata'
        },
        attendees: environment.production ? attendees : [{displayName:'Souvik',email:'souviksarrkar362@gmail.com'}],
        recurrence:['RRULE:FREQ=DAILY;COUNT=1'],
        conferenceData: meeting?.meetingType == 'OFFLINE' ? undefined :{
          createRequest:{
            conferenceSolutionKey:{
              type: 'hangoutsMeet'
            },
            requestId:foreignId
          }
        }
      },
      calendarId: 'primary',
      conferenceDataVersion:1
    }).then();
  }


  private getDateTime(date:Date,time:string){
    console.log(date,time)//'2024-07-28T21:00:00+05:30'
    let year =date.getFullYear();
    let month = date.getMonth()+1;
    let day=date.getDate();
    return year+ '-'+month+'-'+day+'T'+time+':00+05:30';
  }

  // listUpcomingEvents() {
  //   //const appendPre = this.appendPre.bind(this);
  //   gapi.client.calendar.events
  //     .list({
  //       calendarId: 'primary',
  //       timeMin: new Date().toISOString(),
  //       showDeleted: false,
  //       singleEvents: true,
  //       maxResults: 10,
  //       orderBy: 'startTime',
  //     })
  //     .then((response) => {
  //       this.zone.run(() => {
  //         const events = response.result.items!;
  //         //appendPre('Upcoming events:');

  //         if (events.length > 0) {
  //           for (const event of events) {
  //             let when = event.start!.dateTime;
  //             if (!when) {
  //               when = event.start!.date;
  //             }
  //             //appendPre(event.summary + ' (' + when + ')');
  //           }
  //         } else {
  //           //appendPre('No upcoming events found.');
  //         }
  //       });
  //     });
  // }
}
