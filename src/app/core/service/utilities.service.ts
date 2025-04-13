import { DatePipe } from "@angular/common";

export const getGreetings = (name:string) :string =>{
    var hour = new Date().getHours();
    if(hour>=5 && hour<12){
     return 'good morning, '+name;
    } else if(hour>=12 && hour<18){
      return 'good afternoon, '+name;
    }else{
      return 'good evening, '+name;
    }
}

export const isEmpty = (str: string): boolean =>{
  return (!str || str.length === 0);
}

export const date = (dateString: string | undefined,format:string='dd/MM/yyyy'): string =>{
  return new DatePipe('en').transform(dateString,format)!;
}

// export const gerRouteURL = (key:string) =>{
//   AppRoute['secured_dashboard']
//   //return AppRoute.some(subData => Object.keys(AppRoute).values().next()) .secured_dashboard;
//   var arr = Object.keys(AppRoute).map(key => ({type: key, value: obj[key]}));
//   mapped[key];
// }

export function compareObjects(latest: any, old: any): any {
  const keys1: string[] = [];
  const values1: any[] = [];
  Object.keys(latest).forEach((element) => {
    keys1.push(element);
  });
  Object.values(latest).forEach((element) => {
    values1.push(element);
  });
  const keys2: any[] = [];
  const values2: any[] = [];
  Object.keys(old).forEach((element) => {
    keys2.push(element);
  });
  Object.values(old).forEach((element) => {
    values2.push(element);
  });
  const obj: any = {};
  keys1.forEach((element, i) => {
    for (let index = 0; index < keys2.length; index++) {
      if (element === keys2[index]) {
        let updatedValue = sanitize(values1[i]);
        let oldValue = sanitize(values2[index]);

        /*
         let a = {
           updatedValue: updatedValue,
           updatedValueType: typeof updatedValue,
           oldValue: oldValue,
           oldValueType: typeof oldValue,
         }
         console.warn('field name=' + element, a);
        */

        if (updatedValue !== oldValue) {
          const jsonKey = element;
          obj[jsonKey] = values1[i];
        }

        break;
      }
    }
  });

  return obj;
}

function sanitize(value: any) {
  if (typeof value === 'number' || value instanceof Number) {
    return value.toString();
  }
  if (typeof value === 'object' && value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'string' || value instanceof String) {
    if (!isNaN(Date.parse(value.toString()))) {
      return new Date(value.toString()).toLocaleDateString();
    }
    return value.trim();
  }

  return value;
}



export function isEmptyObject(obj: any) {
  //added 20/11/2021
  //An null or undefined object should return true, So filtering null values
  if (obj != null && obj != undefined)
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
  return (obj && (Object.keys(obj).length === 0));
}

/**
 * Check if 2 arrays are equal 
 */
export function isDuplicateArray(a1: any, a2: any) {
  //return JSON.stringify(obj1) === JSON.stringify(obj2);
  if (Array.isArray(a1) && Array.isArray(a2)) {
    a1.sort();
    a2.sort();
  }
  console.log(a1, a2)

    return a1.length === a2.length && a1.every((o: any, idx: string | number) => isEmptyObject(compareObjects(o, a2[idx])))
 }

export function saveAs(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export function saveFromURL(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export function openWindow(url: string) {
  window.open(url, "_blank");
}

export function objectsEqual(o1: any, o2: any): boolean {
  return isEmptyObject(compareObjects(o1, o2))
}

export function arraysEqual(a:any[], b:any[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function getNonNullValues(obj:any) {
  return Object.assign({},Object.fromEntries(Object.entries(obj).filter(([key, value]) => value != null || value != undefined)))
}

export function sanitizeBase64(base64:string){
  let base64Splits=base64.split(",");
  if(base64Splits && base64Splits.length > 0){
    return base64Splits[base64Splits.length-1];
  }
  return base64;
}

export function removeNullFields<T extends Record<string, any>>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Input must be a non-null object');
  }
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined && value !== '')
  ) as T;
}





