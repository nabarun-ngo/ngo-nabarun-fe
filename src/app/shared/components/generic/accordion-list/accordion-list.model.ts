import { DetailedView } from "../detailed-view/detailed-view.model";

export interface AccordionList{
    headers?:AccordionCell[];
    addContent?:AccordionRow;
    contents: AccordionRow[];
}

export interface AccordionRow{
    index:number;
    columns:AccordionCell[];
    detailed: DetailedView[];
    buttons?:AccordionButton[];
}
export interface AccordionCell{
    html_id?:string;
    type?: 'date'|'text'
    value:string;
    rounded?:boolean;
    bgColor?:string;
    textColor?:string;
    case?:'uppercase'|'lowercase'
    font?:'normal'|'bold'
}

export interface AccordionButton{
    button_name:string;
    button_id:string;
}

