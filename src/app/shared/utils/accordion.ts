import { PageEvent } from "@angular/material/paginator";
import { Paginator } from "src/app/shared/utils/paginator";
import { AccordionButton, AccordionCell, AccordionData, AccordionList, AccordionRow } from "../model/accordion-list.model";
import { DetailedView, DetailedViewField } from "../model/detailed-view.model";
import { KeyValue, WorkDetail } from "src/app/core/api/models";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, take } from "rxjs";
import { FileUpload } from "../components/generic/file-upload/file-upload.component";
import { Component, Input, OnInit } from "@angular/core";

@Component({
  template: 'app-base-accordion',
})
export abstract class Accordion<NumType> extends Paginator implements OnInit{
  abstract ngOnInit(): void;
  
  private accordionList: AccordionList = {
    contents: [],
    searchValue: ''
  };
  private actionButtons: AccordionButton[] = [
    {
      button_id: 'CANCEL',
      button_name: 'Cancel'
    },
    {
      button_id: 'CONFIRM',
      button_name: 'Confirm'
    }
  ];
  private functionButtons: AccordionButton[] = [];
  protected activeButtonId: string |undefined = undefined;
  protected abstract prepareHighLevelView(data: NumType, options?: { [key: string]: any }): AccordionCell[];
  protected abstract prepareDetailedView(data: NumType, options?: { [key: string]: any }): DetailedView[];
  protected abstract prepareDefaultButtons(data: NumType, options?: { [key: string]: any }): AccordionButton[];
  protected abstract onClick(event:{ buttonId: string; rowIndex: number; }):void;
  protected abstract onAccordionOpen(event: { rowIndex: number }):void;
  public readonly itemList: NumType[]=[];

  @Input({ required: false }) set accordionData(page: AccordionData<NumType>) { 
    if (page) {
      this.setContent(page.content!, page.totalSize);
    }
  }

  getAccordionList() {
    return this.accordionList;
  }
  /**
   * 
   * @param headers 
   * Set header row details
   */
  setHeaderRow(headers: AccordionCell[]) {
    this.accordionList.headers = headers;
  }

  /**
   * 
   * @param data 
   */
  setRefData(data: { [name: string]: KeyValue[]; } | undefined) {
    this.accordionList.refData = data;
  }

  /**
   * 
   */
  clearContents() {
    this.accordionList.contents.splice(0);
    this.itemList.splice(0);   
  }

  setContent(dataList: NumType[], totalSize?: number) {
    this.clearContents()
    if(dataList){
      dataList.forEach(e => {
        this.addContentRow(e);
      })
    }
   
    this.itemLengthSubs.next(totalSize!);
  }

  /**
   * 
   * @param data 
   */
  addContentRow(data: NumType,insert_top:boolean = false) {
    let row = {
      columns: this.prepareHighLevelView(data),
      detailed: this.prepareDetailedView(data),
      buttons: this.prepareDefaultButtons(data)
    } as AccordionRow;
    //console.log(row);
    if (insert_top) {
      this.accordionList.contents.unshift(row);
      this.itemList.unshift(data);
    }else{
      this.accordionList.contents.push(row);
      this.itemList.push(data);
    }
  }

  updateContentRow(data: NumType, rowIndex: number) {
    let row = {
      columns: this.prepareHighLevelView(data),
      detailed: this.prepareDetailedView(data),
      buttons: this.prepareDefaultButtons(data)
    } as AccordionRow;
    this.accordionList.contents[rowIndex] = row;
    this.itemList[rowIndex] = data;
  }

  removeContentRow(rowIndex: number) {
    this.accordionList.contents.splice(rowIndex, 1);
    this.itemList.splice(rowIndex, 1);
  }

  protected addSectionInAccordion(section_detail: DetailedView, rowIndex: number, create?: boolean) {
    section_detail.content?.forEach(m1 => {
      section_detail.section_form?.setControl(m1.form_control_name!, new FormControl(m1.field_value, m1.form_input_validation));
    })
    if (create) {
      let indexAddDet = this.accordionList.addContent?.detailed.findIndex(f => f.section_html_id == section_detail.section_html_id)!;
      if (indexAddDet == -1) {
        this.accordionList.addContent?.detailed.push(section_detail);
      } else if (this.accordionList.addContent) {
        this.accordionList.addContent.detailed[indexAddDet] = section_detail;
      }
    } else {
      let indexAddDet = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == section_detail.section_html_id);
      if (indexAddDet == -1) {
        this.accordionList.contents[rowIndex].detailed.push(section_detail);
      } else {
        this.accordionList.contents[rowIndex].detailed[indexAddDet] = section_detail;
      }
    }

  }

  protected removeSectionInAccordion(section_id: string, rowIndex: number, create?: boolean) {
    if (create) {
      let indexAddDet = this.accordionList.addContent?.detailed.findIndex(f => f.section_html_id == section_id)!;
      if (indexAddDet != -1) {
        this.accordionList.addContent?.detailed.splice(indexAddDet, 1);
      }
    } else {
      let indexAddDet = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == section_id);
      if (indexAddDet != -1) {
        this.accordionList.contents[rowIndex]?.detailed.splice(indexAddDet, 1);
      }
    }
  }

  protected getSectionInAccordion(section_id: string, rowIndex: number, create?: boolean) {
    if (create) {
      let indexAddDet = this.accordionList.addContent?.detailed.findIndex(f => f.section_html_id == section_id)!;
      return this.accordionList.addContent?.detailed[indexAddDet];
    } else {
      let indexAddDet = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == section_id);
      return this.accordionList.contents[rowIndex]?.detailed[indexAddDet];
    }
  }

  getSectionForm(sectionId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.section_form;
    } else {
      return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.section_form;
    }
  }

  protected getSectionField(sectionId: string, fieldId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.content?.find(f => f.field_html_id == fieldId)!;
    }
    return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.content?.find(f => f.field_html_id == fieldId)!;
  }

  protected addSectionField(sectionId: string, field_detail: DetailedViewField, rowIndex: number, create?: boolean) {
    if (create) {
      let section = this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId);
      let indexAddDet = section?.content?.findIndex(f => f.field_html_id == field_detail.field_html_id)!;
      if (indexAddDet == -1) {
        console.log(section,1)
        section?.section_form?.setControl(field_detail.form_control_name!, new FormControl(field_detail.field_value, field_detail.form_input_validation));
        section?.content?.push(field_detail)
        console.log(section?.content)
      } else {
        console.log(section,2)
        section!.content![indexAddDet] = field_detail;
      }
    } else {
      let section = this.accordionList?.contents[rowIndex].detailed.find(f => f.section_html_id == sectionId);
      let indexAddDet = section?.content?.findIndex(f => f.field_html_id == field_detail.field_html_id)!;
      if (indexAddDet == -1) {
        section?.section_form?.setControl(field_detail.form_control_name!, new FormControl(field_detail.field_value, field_detail.form_input_validation));
        section?.content?.push(field_detail)
      } else {
        section!.content![indexAddDet] = field_detail;
      }
    }
  }

  
  protected removeSectionField(sectionId: string, field_id: string, rowIndex: number, create?: boolean) {
    if (create) {
      let section = this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId);
      let field = section?.content?.find(f => f.field_html_id == field_id);
      let fieldIndex = section?.content?.findIndex(f => f.field_html_id == field_id)!;
      if (fieldIndex != -1) {
        section?.section_form.removeControl(field?.form_control_name!);
        section?.content?.splice(fieldIndex, 1);
      }

    } else {
      let section = this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId);
      let field = section?.content?.find(f => f.field_html_id == field_id);
      let fieldIndex = section?.content?.findIndex(f => f.field_html_id == field_id)!;
      if (fieldIndex != -1) {
        section?.section_form.removeControl(field?.form_control_name!);
        section?.content?.splice(fieldIndex, 1);
      }
    }
  }

  showCreateForm(data?: NumType, options?: { [key: string]: any, create?: boolean }) {
    if (!options) {
      options = {};
    }
    options.create = true;
    let row = {
      columns: this.prepareHighLevelView(data!, options),
      detailed: this.prepareDetailedView(data!, options),
      buttons: this.prepareDefaultButtons(data!, options)
    } as AccordionRow;
    this.accordionList.addContent = row;
    return this.accordionList.addContent.detailed.map(m => {
      //console.log(m)
      m.show_form = true;
      if (m.hide_section != true) {
        m.hide_section = false;
      }
      m.content?.map(m => {
        if (m.hide_field != true) {
          m.hide_field = false;
        }
        return m;
      })
      if(m.section_type == 'doc_list'){
        m.doc!.docList= new BehaviorSubject<FileUpload[]>([]);
        m.doc!.docChange.subscribe(m.doc!.docList)
        console.log("Testt")
      }
      return m;
    });
  }

  showEditForm(rowIndex: number, section_ids: string[]) {
    this.accordionList.contents[rowIndex].detailed.filter(f => section_ids.includes(f.section_html_id!)).map(m => {
      console.log(m)
      m.show_form = true;
      m.hide_section = false;
      m.content?.map(m => {
        //m.hide_field = false;
        return m;
      })
      if(m.section_type == 'doc_list'){
        m.doc!.docList= new BehaviorSubject<FileUpload[]>([]);
        m.doc!.docChange.subscribe(m.doc!.docList)
      }
      return m;
    });
    //console.log(this.accordionList.contents)
    this.functionButtons = [];
    this.accordionList.contents[rowIndex].buttons?.forEach(b => {
      this.functionButtons.push(b)
    });

    this.accordionList.contents[rowIndex].buttons?.splice(0);
    //console.log(this.accordionList.contents[rowIndex].buttons, this.functionButtons)
    this.actionButtons.forEach(b => {
      this.accordionList.contents[rowIndex].buttons?.push(b);
    })
    //console.log(this.accordionList.contents[rowIndex].buttons, this.actionButtons)
  }
  hideForm(rowIndex: number, create?: boolean) {
    if (create) {
      this.accordionList.addContent = undefined;
    } else {
      this.accordionList.contents[rowIndex].detailed.map(m => {
        m.show_form = false;
        //EXPERIMENTAL//m.section_form?.reset();
        return m;
      });
      this.accordionList.contents[rowIndex].buttons?.splice(0);
      this.functionButtons.forEach(b => {
        this.accordionList.contents[rowIndex].buttons?.push(b);
      })
    }
    
  }

  getSectionAccordion(sectionId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.accordion?.object;
    }
    return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.accordion?.object;
  }

  getSectionDocuments(sectionId: string, rowIndex: number, create?: boolean) {
    if (create) {
      return this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.doc?.docList.value;
    }else{
      return this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.doc?.docList.value;
    }
  }

  removeButton(buttonId: string, rowIndex: number, create?: boolean) {
    if (create) {
      let index = this.accordionList.addContent?.buttons?.findIndex(f => f.button_id == buttonId)!;
      return this.accordionList.addContent?.buttons?.splice(index,1);
    }else{
      let index = this.accordionList.contents[rowIndex]?.buttons?.findIndex(f => f.button_id == buttonId)!;
      return this.accordionList.contents[rowIndex]?.buttons?.splice(index,1);
    }
  }
} 