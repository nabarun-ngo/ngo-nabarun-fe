import { FormGroup, Validators } from "@angular/forms";
import { EventDetail } from "src/app/core/api/models";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";

export const eventDetailSection = (data: EventDetail) : DetailedView=>{
    return {
        section_name: 'Event Details',
        section_type: 'key_value',
        section_form: new FormGroup({}),
        section_html_id: 'event-detail',
        content: [
          {
            field_name: 'Event Id',
            field_value: data ? data.id! : '',
            field_html_id: 'event-id',
            hide_field: !data,
          },
          {
            field_name: 'Event Title',
            field_value: data ? data.eventTitle! : '',
            field_html_id: 'event-title',
            editable: true,
            form_control_name: 'eventTitle',
            form_input_validation: [Validators.required],
            form_input: {
              html_id: 'event-title',
              placeholder: 'Event Title',
              inputType: 'text',
              tagName: 'input',
            },
          },
          {
            field_name: 'Event Description',
            field_value: data ? data.eventDescription! : '',
            field_html_id: 'event-description',
            editable: true,
            form_control_name: 'eventDescription',
            form_input_validation: [Validators.required],
            form_input: {
              html_id: 'event-description',
              placeholder: 'Event Description',
              inputType: '',
              tagName: 'textarea',
            },
          },
          {
            field_name: 'Event Location',
            field_value: data ? data.eventLocation! : '',
            field_html_id: 'event-location',
            editable: true,
            form_control_name: 'eventLocation',
            form_input_validation: [Validators.required],
            form_input: {
              html_id: 'event-location',
              placeholder: 'Event Location',
              inputType: 'text',
              tagName: 'input',
            },
          },
          {
            field_name: 'Event Date',
            field_value: data ? data.eventDate! : '',
            field_display_value: data ? date(data.eventDate!) : '',
            field_html_id: 'event-date',
            editable: true,
            form_control_name: 'eventDate',
            form_input_validation: [Validators.required],
            form_input: {
              html_id: 'event-date',
              placeholder: 'Event Date',
              inputType: 'date',
              tagName: 'input',
            },
          },
          {
            field_name: 'Event Budget',
            field_value: data?.eventBudget! + '',
            field_display_value: '₹ ' + data?.eventBudget!,
            field_html_id: 'event-budget',
            editable: true,
            form_control_name: 'eventBudget',
            form_input_validation: [],
            form_input: {
              html_id: 'event-budget',
              placeholder: 'Event Budget',
              inputType: 'number',
              tagName: 'input',
            },
          },
          {
            field_name: 'Created By',
            field_value: data ? data.createdBy?.fullName! : '',
            field_html_id: 'created-by',
            hide_field: !data,
          },
        ],
      }
};