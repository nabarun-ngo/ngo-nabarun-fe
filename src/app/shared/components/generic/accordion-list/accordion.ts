import { PageEvent } from "@angular/material/paginator";
import { Paginator } from "src/app/core/component/paginator";
import { AccordionButton, AccordionCell, AccordionList, AccordionRow } from "./accordion-list.model";
import { DetailedView } from "../detailed-view/detailed-view.model";
import { KeyValue } from "src/app/core/api/models";

export abstract class Accordion<NumType> extends Paginator {
  protected accordionList: AccordionList = {
    contents: []
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


  protected setHeaderRow(headers: AccordionCell[]) {
    this.accordionList.headers = headers;
  }

  protected setRefData(data: {[name: string]: KeyValue[];} | undefined) {
    this.accordionList.refData = data;
  }

  protected clearContents() {
    this.accordionList.contents.splice(0);
  }
  protected addContentRow(data: NumType) {
    let row = {
      columns: this.prepareHighLevelView(data),
      detailed: this.prepareDetailedView(data),
      buttons: this.prepareDefaultButtons(data)
    } as AccordionRow;
    this.accordionList.contents.push(row);
  }

  protected showCreateForm(data?: NumType) {
    let row = {
      columns: this.prepareHighLevelView(data!, { create: true }),
      detailed: this.prepareDetailedView(data!, { create: true }),
      buttons: this.prepareDefaultButtons(data!, { create: true })
    } as AccordionRow;
    this.accordionList.addContent = row;
    this.accordionList.addContent.detailed.map(m => {
      //console.log(m)
      m.show_form = true;
      m.hide_section = false;
      m.content?.map(m => {
        m.hide_field = false;
        return m;
      })
      return m;
    });
  }
  protected hideCreateForm() {
    this.accordionList.addContent = undefined;
  }

  protected showForm(rowIndex: number, section_ids: string[]) {
    this.accordionList.contents[rowIndex].detailed.filter(f => section_ids.includes(f.section_html_id!)).map(m => {
      console.log(m)
      m.show_form = true;
      m.hide_section = false;
      m.content?.map(m => {
        m.hide_field = false;
        return m;
      })
      return m;
    });
    this.functionButtons = [];
    this.accordionList.contents[rowIndex].buttons?.forEach(b => {
      this.functionButtons.push(b)
    });
    this.accordionList.contents[rowIndex].buttons?.splice(0);
    this.actionButtons.forEach(b => {
      this.accordionList.contents[rowIndex].buttons?.push(b);
    })

  }
  protected hideForm(rowIndex: number) {
    this.accordionList.contents[rowIndex].detailed.map(m => {
      m.show_form = false;
      m.section_form?.reset();
      return m;
    });
    this.accordionList.contents[rowIndex].buttons?.splice(0);
    //console.log(this.functionButtons)
    this.functionButtons.forEach(b => {
      this.accordionList.contents[rowIndex].buttons?.push(b);
    })

  }

  protected updateButtonText(id: string, name: string): void {
    this.accordionList.contents.map(m1 => {
      m1.buttons?.filter(f => f.button_id == id).map(m => {
        m.button_name = name;
        return m;
      });
      return m1;
    })
  }

  // protected updateHighLevelInfo(rowIndex: number,updates:{highLevelInfo?: AccordionCell[], detailedInfo?: DetailedView[]}) {
  //   //this.accordionList.contents.push(row)
  // }

}