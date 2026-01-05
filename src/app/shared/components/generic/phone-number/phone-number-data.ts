export const COUNTRY_CODES = [
  { name: 'India', iso2: 'in', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', iso2: 'us', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', iso2: 'gb', dialCode: '+44', flag: '🇬🇧' },
  
];

export interface CountryPhoneCode {
  name: string;
  iso2: string;
  dialCode: string;
  flag: string; // emoji or asset path
}