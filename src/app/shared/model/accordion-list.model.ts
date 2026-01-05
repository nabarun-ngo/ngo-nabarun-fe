import { DetailedView } from "./detailed-view.model";
import { PipeTransform } from "@angular/core";
import { KeyValue } from "./key-value.model";

/**
 * Root accordion state container.
 * Used by the base Accordion class to render and mutate UI state.
 */
export interface AccordionList {

    /** Header row definition (static, optional) */
    headers?: AccordionCell[];

    /**
     * Temporary row used in "create mode".
     * Exists only while creating a new entry.
     */
    addContent?: AccordionRow;

    /** Rendered accordion rows */
    contents: AccordionRow[];

    /** Reference / lookup data shared across sections */
    refData?: { [name: string]: KeyValue[] };



    /**
     * Optional pipe used for client-side search.
     * Must implement PipeTransform (NOT @Pipe decorator)
     */
    searchPipe?: PipeTransform;

    /** Current search input value */
    searchValue: string;

    /** 
     * Whether rows can be selected for bulk actions.
     * If true, checkboxes will be rendered.
     */
    selectable?: boolean;
}

/**
 * A single accordion row (collapsed + expanded view)
 */
export interface AccordionRow {

    /** Whether the row is selected */
    selected?: boolean;

    /**
     * Optional index.
     * NOTE:
     * - Managed externally by the accordion component
     * - Not required during creation
     */
    index?: number;

    /** High-level (collapsed) cells */
    columns: AccordionCell[];

    /** Expanded detailed sections */
    detailed: DetailedView[];

    /** Row-level action buttons */
    buttons?: AccordionButton[];
}

/**
 * Single display cell in the accordion header row
 */
export interface AccordionCell {

    html_id?: string;

    type?: 'date' | 'text' | 'user' | 'icon';

    /** Raw value to render */
    value: string;

    /** UI styling helpers */
    rounded?: boolean;
    bgColor?: string;
    textColor?: string;
    case?: 'uppercase' | 'lowercase';
    font?: 'normal' | 'bold';

    /** Whether to show formatted display value */
    showDisplayValue?: boolean;

    /** Reference data section key */
    refDataSection?: string;

    /** Arbitrary UI props */
    props?: { [key: string]: any };
}

/**
 * Action button definition used at row or section level
 */
export interface AccordionButton {

    button_name: string;
    button_id: string;

    /** Arbitrary button metadata */
    props?: { [key: string]: any };
}

/**
 * Paginated data container supplied to Accordion input
 */
export interface AccordionData<NumType> {

    pageIndex?: number;
    pageSize?: number;
    totalSize?: number;

    /**
     * Page content.
     * Optional to allow lazy / async loading.
     */
    content?: NumType[];
}
