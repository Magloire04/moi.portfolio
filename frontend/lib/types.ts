export type Locale = 'fr' | 'en';

export interface LocalizedText {
  fr: string;
  en: string;
}

export type ProjectCategory = 'produit_bytechnum' | 'mandat_client' | 'projet_equipe';

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  quote: LocalizedText;
}

export interface Project {
  id: string;
  slug: string;
  category: ProjectCategory;
  title: LocalizedText;
  tagline: LocalizedText;
  summary: LocalizedText;
  body: LocalizedText;
  clientName: string | null;
  stack: string[];
  role: string | null;
  screenshots: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  testimonials: Testimonial[];
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

export interface Settings {
  availableForWork: boolean;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
  projectInterest?: string;
  locale: Locale;
  website?: string;
}
