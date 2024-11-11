import { PageEvent } from "@angular/material/paginator";
import { Paginator } from "src/app/core/component/paginator";
import { AccordionButton, AccordionCell, AccordionList, AccordionRow } from "./accordion-list.model";
import { DetailedView, DetailedViewField } from "../detailed-view/detailed-view.model";
import { KeyValue, WorkDetail } from "src/app/core/api/models";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, take } from "rxjs";
import { FileUpload } from "../file-upload/file-upload.component";

export abstract class Accordion<NumType> extends Paginator {
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

  protected abstract prepareHighLevelView(data: NumType, options?: { [key: string]: any }): AccordionCell[];
  protected abstract prepareDetailedView(data: NumType, options?: { [key: string]: any }): DetailedView[];
  protected abstract prepareDefaultButtons(data: NumType, options?: { [key: string]: any }): AccordionButton[];

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
  addContentRow(data: NumType) {
    let row = {
      columns: this.prepareHighLevelView(data),
      detailed: this.prepareDetailedView(data),
      buttons: this.prepareDefaultButtons(data)
    } as AccordionRow;
    this.accordionList.contents.push(row);
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
      return m;
    });
  }
  // protected hideCreateForm() {
  //   this.accordionList.addContent = undefined;
  // }

  showForm(rowIndex: number, section_ids: string[]) {
    this.accordionList.contents[rowIndex].detailed.filter(f => section_ids.includes(f.section_html_id!)).map(m => {
      console.log(m)
      m.show_form = true;
      m.hide_section = false;
      m.content?.map(m => {
        //m.hide_field = false;
        return m;
      })
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
        m.section_form?.reset();
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
    let subject = new BehaviorSubject<FileUpload[]>([]);
    if (create) {
      this.accordionList.addContent?.detailed.find(f => f.section_html_id == sectionId)?.doc?.docChange.subscribe(subject);
    }else{
      this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == sectionId)?.doc?.docChange.subscribe(subject);
    }
    return subject.value;
  }
 

  // protected updateButtonText(id: string, name: string): void {
  //   this.accordionList.contents.map(m1 => {
  //     m1.buttons?.filter(f => f.button_id == id).map(m => {
  //       m.button_name = name;
  //       return m;
  //     });
  //     return m1;
  //   })
  // }

  // protected updateContent(rowIndex: number, sectionId: string, updates: { highLevelInfo?: AccordionCell[], detailedInfo?: DetailedViewField[] }) {
  //   if (updates.highLevelInfo) {

  //   } else if (updates.detailedInfo) {
  //     let content_index = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == sectionId);
  //     this.accordionList.contents[rowIndex].detailed[content_index].content?.map(m => {
  //       let info = updates.detailedInfo?.find(f => f.field_html_id == m.field_html_id);
  //       if (info) {
  //         m.field_value = info.field_value;
  //       }
  //       return m;
  //     })
  //   }
  // }

  


} 