import { DatePipe } from "@angular/common";

export const isEmpty = (str: string): boolean => {
  return (!str || str.length === 0);
}

export const date = (dateString: string | Date | undefined, format: string = 'dd/MM/yyyy'): string => {
  return new DatePipe('en').transform(dateString, format)!;
}

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

export function saveAs(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = fileName;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function openWindow(url: string) {
  window.open(url, "_blank");
}

export function sanitizeBase64(base64: string) {
  let base64Splits = base64.split(",");
  if (base64Splits && base64Splits.length > 0) {
    return base64Splits[base64Splits.length - 1];
  }
  return base64;
}

export function removeNullFields<T extends Record<string, any>>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Input must be a non-null object');
  }

  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      if (value !== null && Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    })
  ) as T;
}

export function shareToWhatsApp(message: string, phoneNumber?: string): void {
  const encodedMessage = encodeURIComponent(message);

  let whatsappUrl: string;
  if (phoneNumber) {
    whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  } else {
    whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  }

  window.open(whatsappUrl, '_blank');
}
