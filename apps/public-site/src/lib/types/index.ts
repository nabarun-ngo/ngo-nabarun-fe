/** Resolved site content (vars stripped after load). */

/** Internal path (`/img/...`) or external absolute URL (`https://...`). */
export type ImageSrc = string;

export interface ContentData {
  metadata: ContentMetadata;
  layout: LayoutSection;
}

export interface LayoutSection {
  common: CommonSection;
  pages: PagesSection;
}

export interface PagesSection {
  home: HomePage;
  about: AboutSection;
  projects: ServicesSection;
  team: TeamSection;
  donate: DonateSection;
  contact: ContactSection;
  membership: MembershipSection;
  gallery: GallerySection;
  events: EventsSection;
  policies: PolicySection;
  forms: FormsSection;
}

/** Form provider: native CustomForm renderer or an external embedded provider. */
export type FormProvider = 'custom' | 'google' | 'microsoft';

export interface FormConfig {
  /** Provider/renderer; defaults to `custom` when omitted. */
  type?: FormProvider;
  /** Required for native (`custom`) forms; must match a key in form-definitions.json. */
  formId?: string;
  /** Required for native (`custom`) forms. */
  recaptchaAction?: string;
  /** Required for native (`custom`) forms. */
  submitLabel?: string;
  /** Required for external (`google`/`microsoft`) forms; the provider's published embed URL. */
  embedUrl?: string;
  /** Accessible iframe title for external forms; falls back to the page title. */
  embedTitle?: string;
  /** Optional CSS height for the external form iframe (e.g. "1200px"). */
  embedHeight?: string;
}

export type {
  CustomFieldType,
  DependentOptions,
  FieldCondition,
  FieldOption,
  FieldValidationRule,
  FieldValidationRules,
  FormDefinition,
  FormFieldDefinition,
} from '@nabarun-ngo/forms-core';

export interface SectionCtaButton {
  label: string;
  url: string;
  icon?: string;
  primary?: boolean;
  /** Button style; defaults from `primary` when omitted. */
  variant?: 'primary' | 'secondary' | 'outline' | 'light';
  external?: boolean;
  enabled?: boolean;
}

export interface SectionCta {
  enabled?: boolean;
  title?: string;
  description?: string;
  buttons: SectionCtaButton[];
}

export type CtaVariant = 'default' | 'teaser' | 'page';

export interface SectionCtaVariants {
  teaser?: SectionCta;
  page?: SectionCta;
}

export interface SectionWithCta {
  cta?: SectionCta;
  ctaVariants?: SectionCtaVariants;
}

export interface InternalScrollConfig {
  enabled?: boolean;
  /** CSS max-height, e.g. "42rem" or "min(70vh, 42rem)". */
  maxHeight?: string;
  /** Mobile max-height; falls back to maxHeight then default. */
  maxHeightMobile?: string;
}

export interface HomeSectionConfig {
  enabled: boolean;
  mode?: 'teaser' | 'full';
  /** Scroll cards inside a fixed-height panel (home embed only). */
  internalScroll?: boolean | InternalScrollConfig;
  /** Override CTA when this section is embedded on the home page. */
  cta?: SectionCta;
}

/** Hero overlay stats labels; values come from GET …/contents/dynamic `stats`. */
export interface HomeHeroStatsLabels {
  beneficiaryLabel: string;
  projectLabel: string;
}

export interface HomePage {
  carousel: CarouselItem[];
  /** Labels for hero stats fed by dynamic `stats.beneficiaryCount` / `projectCount`. */
  heroStats?: HomeHeroStatsLabels;
  sections: {
    about?: HomeSectionConfig;
    projects?: HomeSectionConfig;
    donate?: HomeSectionConfig;
    team?: HomeSectionConfig;
    membership?: HomeSectionConfig;
    contact?: HomeSectionConfig;
  };
}

export interface SectionCtaButton {
  label: string;
  url: string;
  icon?: string;
  primary?: boolean;
  /** Button style; defaults from `primary` when omitted. */
  variant?: 'primary' | 'secondary' | 'outline' | 'light';
  external?: boolean;
  enabled?: boolean;
}

export interface PageSeo {
  pageName: string;
  title: string;
  description: string;
  keywords?: string;
  path: string;
  /** When true, page is excluded from sitemap and set to noindex. */
  noindex?: boolean;
  /** Page-specific Open Graph / Twitter image (internal path or absolute URL). */
  ogImage?: ImageSrc;
  sitemap?: {
    priority?: number;
    changefreq?: string;
    /** ISO date for sitemap lastmod (defaults to build time). */
    lastmod?: string;
  };
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string;
  brand: string;
  shortBrand: string;
  name: string;
  /** WebSite JSON-LD alternate name. */
  alternateName?: string;
  location: string;
  areaServed: string;
  openGraph: {
    url: string;
    siteName: string;
    image: ImageSrc;
  };
  locale: string;
  twitter: { card: string };
}

export interface OrganizationAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

/** Structured data for Organization / NGO JSON-LD (metadata.organization). */
export interface OrganizationMetadata {
  alternateNames: string[];
  logo?: ImageSrc;
  email: string;
  telephone: string;
  foundingDate?: string;
  registrationNumber?: string;
  address: OrganizationAddress;
  knowsAbout: string[];
  sameAs?: string[];
}

export interface ContentMetadata {
  site: SiteMetadata;
  organization: OrganizationMetadata;
  pages: {
    home: PageSeo;
    about: PageSeo;
    projects: PageSeo;
    team: PageSeo;
    donate: PageSeo;
    contact: PageSeo;
    membership: PageSeo;
    gallery: PageSeo;
    events: PageSeo;
    policies: Record<string, PageSeo>;
    forms: Record<string, PageSeo>;
  };
}

export interface BasicInfo {
  followUs?: string;
  followLinks: Array<{
    icon: string;
    url: string;
    enabled?: boolean;
  }>;
  location: string;
  email: string;
  phone: string;
}

export interface NavLinkItem {
  id: string;
  label: string;
  /** Internal links may use {{metadata.pages...path}} refs; site values use {{vars.key}}. */
  url?: string;
  external: boolean;
  enabled?: boolean;
  endCta?: boolean;
  inMore?: boolean;
  parent?: string | null;
}
export interface AboutDetailSection {
  enabled?: boolean;
  paragraphs: string[];
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
}

export interface AboutSection extends SectionWithCta {
  sectionTitle: string;
  title: string;
  description: string;
  detail?: AboutDetailSection;
  experience: {
    years: string;
    label: string;
  };
  stats: Array<{
    icon: string;
    value: string;
    label: string;
    enabled?: boolean;
  }>;
  missionPoints: Array<{
    icon: string;
    title: string;
    description: string;
    enabled?: boolean;
  }>;
  founderMessage: {
    quote: string;
    name: string;
    title: string;
  };
}

export interface ContactSection extends SectionWithCta {
  sectionTitle: string;
  title: string;
  locationLink: string;
  /** Accessible title for the embedded location map iframe. */
  locationMapTitle: string;
  form: FormConfig;
}

export interface PaymentMethods {
  title: string;
  description: string;
  bank: Array<{
    label: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    accountType?: string;
    enabled?: boolean;
  }>;
  upi: Array<{
    label: string;
    id: string;
    qrImage?: ImageSrc;
    note?: string;
    enabled?: boolean;
  }>;
  afterDonation: {
    title: string;
    steps: Array<{
      text: string;
      enabled?: boolean;
    }>;
  };
}

export interface DonateSection extends SectionWithCta {
  sectionTitle: string;
  title: string;
  description: string;
  impact: {
    title: string;
    description: string;
    stats: Array<{
      amount: string;
      description: string;
      enabled?: boolean;
    }>;
  };
  trust: {
    indicators: Array<{
      title: string;
      description: string;
      enabled?: boolean;
    }>;
  };
  paymentMethods: PaymentMethods;
  /** Optional direct link to an online payment gateway (enable when ready). */
  gatewayCta?: {
    enabled: boolean;
    label: string;
    url: string;
    icon?: string;
    external?: boolean;
  };
}

export interface CarouselItem {
  image: ImageSrc;
  alt: string;
  title: string;
  enabled?: boolean;
  quote: {
    text: string;
    author: string;
  };
  buttons?: Array<{
    label: string;
    url: string;
    icon: string;
    primary: boolean;
    enabled?: boolean;
  }>;
}

export interface GallerySection {
  sectionTitle: string;
  title: string;
  description: string;
  items: Array<GalleryItem & { enabled?: boolean }>;
}

export interface EventsSection {
  sectionTitle: string;
  title: string;
  description: string;
  eyebrowIcon?: string;
  emptyMessage?: string;
}

export interface MembershipDisclaimer {
  message: string;
  rulesLink: {
    label: string;
    url: string;
  };
}

export interface MembershipSection extends SectionWithCta {
  sectionTitle: string;
  title: string;
  disclaimer?: MembershipDisclaimer;
  form: FormConfig;
}

export interface NavbarSection {
  brand: {
    name: string;
    logo: ImageSrc;
    established?: string | null;
    registrationNumber?: string;
  };
  moreLabel: string;
  navLinks: NavLinkItem[];
}

export interface LearnMoreButton {
  label: string;
  url: string;
}

export interface ServicesSection extends SectionWithCta {
  sectionTitle: string;
  title: string;
  description: string;
  /** Project cards are loaded from dynamic content; static may omit or leave empty. */
  serviceItems?: ServiceItem[];
  learnMoreButton: LearnMoreButton;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  enabled?: boolean;
  features: Array<{
    text: string;
    enabled?: boolean;
  }>;
  button: {
    label: string;
    url: string;
  };
  overlay: {
    title: string;
    stat: {
      value: string;
      label: string;
    };
  };
  /** Optional card/OG image. */
  image?: ImageSrc;
}

export interface TeamSection extends SectionWithCta {
  sectionTitle: string;
  title: string;
  description: string;
  members?: TeamMember[];
  member: {
    bio: string;
    contact: string;
  };
}

export interface FooterSection {
  brand: {
    name: string;
    description: string;
  };
  social: {
    title: string;
  };
  quickLinks: {
    title: string;
    links: Array<{
      label: string;
      url: string;
      enabled?: boolean;
    }>;
  };
  getInTouch: {
    title: string;
  };
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    button: string;
  };
  bottom: {
    copyright: string;
    legal: Array<{
      label: string;
      url: string;
      enabled?: boolean;
    }>;
  };
}

export interface TeamMember {
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  id: string;
  fullName: string;
  picture: ImageSrc;
  roleString: string;
  email: string;
  bio?: string;
  active?: boolean;
}

export interface DialCode {
  country: string;
  code: string;
}

export interface PolicyItem {
  title: string;
  description: string;
  url: string;
}

export type PolicySection = {
  [key: string]: PolicyItem;
}

export interface FormPageItem extends FormConfig {
  title: string;
  description: string;
}

export type FormsSection = {
  [key: string]: FormPageItem;
}

export interface MessagesSection {
  contact: {
    success: string;
    error: string;
    sending: string;
  };
  donate: {
    success: string;
    error: string;
  };
  join: {
    success: string;
    error: string;
    interestMessage: string;
  };
  newsletter?: {
    success: string;
    error: string;
  };
  validation: {
    mobileNumber: {
      india: string;
      other: string;
    };
  };
}

export interface ValidationSection {
  contact: {
    fullName: {
      min: string;
      max: string;
      regex: string;
    };
    email: {
      invalid: string;
    };
    contactNumber: {
      regex: string;
      min: string;
      max: string;
    };
    subject: {
      min: string;
      max: string;
    };
    message: {
      min: string;
      max: string;
    };
  };
  donate: {
    fullName: {
      required: string;
      max: string;
    };
    email: {
      invalid: string;
    };
    contactNumber: {
      regex: string;
      min: string;
      max: string;
    };
    amount: {
      min: string;
      max: string;
    };
  };
  join: {
    firstName: {
      min: string;
      max: string;
      regex: string;
    };
    lastName: {
      min: string;
      max: string;
      regex: string;
    };
    email: {
      invalid: string;
    };
    contactNumber: {
      regex: string;
      min: string;
      max: string;
    };
    hometown: {
      min: string;
      max: string;
    };
    howDoUKnowAboutUs: {
      min: string;
      max: string;
    };
  };
  password: {
    email: {
      invalid: string;
    };
    password: {
      min: string;
      max: string;
    };
    confirmPassword: {
      mismatch: string;
    };
  };
  newsletter: {
    email: {
      invalid: string;
    };
  };
}

export interface MetadataSection {
  title: string;
  description: string;
  keywords: string;
  openGraph: {
    url: string;
    siteName: string;
    image: string;
  };
}

export interface CommonSection {
  backToTop: {
    enabled?: boolean;
    ariaLabel: string;
    scrollThreshold?: number;
  };
  breadcrumb: {
    home: string;
  };
  org: BasicInfo;
  navbar: NavbarSection;
  footer: FooterSection;
}

// Types for public/location-data.json
export interface LocationCountryItem {
  KEY: string; // ISO alpha-2 code
  VALUE: string; // Country name
  DESCRIPTION: string;
  ATTRIBUTES: {
    DIALCODE: string; // e.g. +91
    KEY: string; // dial code numeric string e.g. "91"
  };
}

// ---------------------------------------------------------------------------
// Dynamic content types (served from GET API at build time; see lib/api)
// ---------------------------------------------------------------------------

/** Standard success envelope from the backend API. */
export interface SuccessResponse<T = unknown> {
  info: string;
  timestamp: string;
  traceId?: string;
  message: string;
  responsePayload?: T;
}

/** Response from GET /api/public-site/contents/dynamic */
export interface DynamicContent {
  stats: DynamicStats;
  team: TeamMember[];
  projects: DynamicProject[];
  events: EventItem[];
}

export interface DynamicStats {
  beneficiaryCount: number;
  projectCount: number;
}

export interface DynamicProjectGoal {
  name: string;
  description?: string;
  active?: boolean;
}

export interface DynamicProjectMetadata {
  image?: ImageSrc;
  icon?: string;
  impactTitle?: string;
  impactLabel?: string;
}

export interface DynamicProject {
  title: string;
  description: string;
  goals?: DynamicProjectGoal[];
  beneficiaryCount: number;
  metadata?: DynamicProjectMetadata;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  location: string;
  projectName?: string;
  image?: ImageSrc;
  registrationUrl?: string;
  active?: boolean;
}

export interface HeroStatsDisplay {
  beneficiaryCount: string;
  projectCount: string;
  beneficiaryLabel: string;
  projectLabel: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: ImageSrc;
  category?: string;
}
