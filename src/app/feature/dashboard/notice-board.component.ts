import { Component } from '@angular/core';

@Component({
  selector: 'app-notice-board',
  templateUrl: './notice-board.component.html',
  styleUrls: ['./notice-board.component.scss']
})
export class NoticeBoardComponent {
  notices = [
    { title: 'Maintenance Downtime', date: '2024-06-14' },
    { title: 'Event: Fundraiser', date: '2024-06-12' },
    { title: 'New Policy', date: '2024-06-10' }
  ];
}
