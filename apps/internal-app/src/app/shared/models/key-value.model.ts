import type { KeyValueLike } from '@ssdev-toolkit/forms-core';

export interface KeyValue extends KeyValueLike {
    active?: boolean;
    description?: string;
    value?: string;
    /** Parent country for geo cascade (states / districts). */
    countryCode?: string;
    /** Parent state for geo cascade (districts). */
    stateCode?: string;
}
