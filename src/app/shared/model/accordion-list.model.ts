import { KeyValue } from "src/app/core/api/models";
import { DetailedView } from "./detailed-view.model";
import { Pipe } from "@angular/core";

export interface AccordionList{
    headers?:AccordionCell[];
    addContent?:AccordionRow;
    contents: AccordionRow[];
    refData?:{[name:string]:KeyValue[]};
    searchPipe?:Pipe,
    searchValue:string
}

export interface AccordionRow{
    index:number;
    columns:AccordionCell[];
    detailed: DetailedView[];
    buttons?:AccordionButton[];
}
export interface AccordionCell{
    html_id?:string;
    type?: 'date'|'text'|'user'| 'icon'
    value:string;
    rounded?:boolean;
    bgColor?:string;
    textColor?:string;
    case?:'uppercase'|'lowercase'
    font?:'normal'|'bold';
    showDisplayValue?:boolean;
    refDataSection?:string;
    props ? :{[key:string] : any};
}

export interface AccordionButton{
    button_name:string;
    button_id:string;
    props ? :{[key:string] : any};
}

export interface AccordionData<NumType>{
    currentSize?: number;
    nextPageIndex?: number;
    pageIndex?: number;
    pageSize?: number;
    prevPageIndex?: number;
    totalPages?: number;
    totalSize?: number;
    content?: Array<NumType>;
}

