import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { PagedNotice, Notice } from '../model/notice.model';
import { PagedMeeting, Meeting, formatMeetingDate } from '../model/meeting.model';
import { mapNoticeToDto, mapDtoToMeeting, mapPagedDtoToPagedMeeting } from '../model/communication.mapper';
import { MeetingControllerService, UserControllerService } from 'src/app/core/api-client/services';
import { MeetingDefaultValue } from '../communication.const';
import { mapPagedUserDtoToPagedUser } from '../../member/models/member.mapper';
import { User } from '../../member/models/member.model';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {


  constructor(private readonly meetingController: MeetingControllerService,
    private readonly userController: UserControllerService
  ) { }

  /**
   * Fetch notices with pagination
   * TODO: Replace with actual API call when NoticeControllerService is available in api-client
   */
  fetchNotices(
    page?: number,
    size?: number,
  ): Observable<PagedNotice> {
    // Placeholder - implement when API endpoint is available
    // Example implementation:
    // return this.noticeController.getAllNotice({
    //   pageIndex: page || NoticeDefaultValue.pageNumber,
    //   pageSize: size || NoticeDefaultValue.pageSize,
    //   filter: { status: ['ACTIVE'] }
    // }).pipe(
    //   map((d) => d.responsePayload),
    //   map(mapPagedDtoToPagedNotice)
    // );

    return of({
      content: [],
      totalSize: 0,
      pageIndex: page || 0,
      pageSize: size || 20,
    } as PagedNotice);
  }

  /**
   * Get notice detail by ID
   * TODO: Implement API call when endpoint is available
   */
  getNoticeDetail(id: string): Observable<Notice> {
    // Placeholder - implement when API endpoint is available
    return new Observable(observer => {
      observer.error('Get notice detail API endpoint not yet available');
      observer.complete();
    });
  }

  /**
   * Create a new notice
   * TODO: Replace with actual API call when NoticeControllerService is available in api-client
   */
  createNotice(noticeData: Partial<Notice>): Observable<Notice> {
    // Map domain model to DTO format
    const noticeDto = mapNoticeToDto(noticeData);

    // Set default values for create
    if (!noticeDto.noticeStatus) {
      noticeDto.noticeStatus = 'ACTIVE';
    }
    if (noticeDto.hasMeeting === undefined) {
      noticeDto.hasMeeting = false;
    }

    // Placeholder - implement when API endpoint is available
    // Example implementation:
    // return this.noticeController.createNotice({ body: noticeDto }).pipe(
    //   map((d) => d.responsePayload),
    //   map(mapDtoToNotice)
    // );

    // For now, return a mock response with generated ID
    const createdNotice: Notice = {
      id: 'notice-' + Date.now().toString(),
      title: noticeDto.title || '',
      description: noticeDto.description || '',
      noticeDate: noticeDto.noticeDate || new Date().toISOString().split('T')[0],
      noticeStatus: noticeDto.noticeStatus as any,
      hasMeeting: noticeDto.hasMeeting,
      meeting: noticeDto.meeting ? mapDtoToMeeting(noticeDto.meeting) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return of(createdNotice);
  }

  /**
   * Update a notice
   * TODO: Replace with actual API call when NoticeControllerService is available in api-client
   */
  updateNotice(id: string, noticeData: Partial<Notice>): Observable<Notice> {
    // Map domain model to DTO format
    const noticeDto = mapNoticeToDto(noticeData);

    // Placeholder - implement when API endpoint is available
    // Example implementation:
    // return this.noticeController.updateNotice({
    //   id: id,
    //   body: noticeDto
    // }).pipe(
    //   map((d) => d.responsePayload),
    //   map(mapDtoToNotice)
    // );

    // For now, return a mock response with updated data
    const updatedNotice: Notice = {
      id: id,
      title: noticeDto.title || '',
      description: noticeDto.description || '',
      noticeDate: noticeDto.noticeDate || new Date().toISOString().split('T')[0],
      noticeStatus: noticeDto.noticeStatus as any,
      hasMeeting: noticeDto.hasMeeting,
      meeting: noticeDto.meeting ? mapDtoToMeeting(noticeDto.meeting) : undefined,
      createdAt: noticeData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return of(updatedNotice);
  }

  /**
   * Fetch meetings with pagination
   * TODO: Implement API call when endpoint is available
   */
  fetchMeetings(
    page?: number,
    size?: number,
  ): Observable<PagedMeeting> {
    return this.meetingController.listMeetings({
      pageIndex: page || MeetingDefaultValue.pageNumber,
      pageSize: size || MeetingDefaultValue.pageSize,
    }).pipe(
      map((d) => d.responsePayload),
      map(mapPagedDtoToPagedMeeting)
    );
  }

  /**
   * Get meeting detail by ID
   * TODO: Implement API call when endpoint is available
   */
  getMeetingDetail(id: string): Observable<Meeting> {
    // Placeholder - implement when API endpoint is available
    return new Observable(observer => {
      observer.error('Get meeting detail API endpoint not yet available');
      observer.complete();
    });
  }

  /**
   * Create a new meeting
   * TODO: Replace with actual API call when MeetingControllerService is available in api-client
   */
  createMeeting(meetingData: Partial<Meeting>): Observable<any> {
    return this.meetingController.createMeeting({
      body: {
        agenda: meetingData.agenda!,
        attendees: meetingData.attendees!,
        description: meetingData.description!,
        endTime: formatMeetingDate(meetingData.meetingDate!, meetingData.endTime!),
        location: meetingData.location!,
        startTime: formatMeetingDate(meetingData.meetingDate!, meetingData.startTime!),
        summary: meetingData.summary!,
        type: meetingData.type!,
      }
    }).pipe(
      map((d) => d.responsePayload),
      map(mapDtoToMeeting)
    );
  }

  /**
   * Update a meeting
   * TODO: Replace with actual API call when MeetingControllerService is available in api-client
   */
  updateMeeting(id: string, meetingData: Partial<Meeting>): Observable<Meeting> {
    const body: any = { ...meetingData };

    if (meetingData.startTime) {
      body.startTime = meetingData.startTime instanceof Date
        ? meetingData.startTime.toISOString()
        : formatMeetingDate(meetingData.meetingDate!, meetingData.startTime as unknown as string);
    }

    if (meetingData.endTime) {
      body.endTime = meetingData.endTime instanceof Date
        ? meetingData.endTime.toISOString()
        : formatMeetingDate(meetingData.meetingDate!, meetingData.endTime as unknown as string);
    }

    return this.meetingController.updateMeeting({
      id: id,
      body: body
    }).pipe(
      map((d) => d.responsePayload),
      map(mapDtoToMeeting)
    );
  }

  /**
   * Get reference data for notices
   * TODO: Implement when API endpoint is available
   */
  getNoticeRefData(): Observable<any> {
    return of({});
  }

  /**
   * Get reference data for meetings
   * TODO: Implement when API endpoint is available
   */
  getMeetingRefData(): Observable<any> {
    return of({});
  }

  fetchUserList(): Observable<User[]> {
    return this.userController.listUsers({
      pageIndex: 0,
      pageSize: 100000,
    }).pipe(
      map((d) => d.responsePayload),
      map(mapPagedUserDtoToPagedUser),
      map((d) => d.content!)
    );
  }

  cancelMeeting(id: string) {
    return this.meetingController.updateMeeting({
      id: id,
      body: {
        cancelEvent: true
      }
    });
  }
}
