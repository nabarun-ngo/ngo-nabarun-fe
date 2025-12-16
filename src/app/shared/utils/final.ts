export type Final2<T extends (...args: any[]) => any> =
    T & { __finalBrand?: never };