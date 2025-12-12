export type Final<T extends (...args: any[]) => any> =
    T & { __finalBrand?: never };