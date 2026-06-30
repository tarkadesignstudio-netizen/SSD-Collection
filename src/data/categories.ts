export interface Domain {
  id?: string;
  name: string;
  image?: string;
  createdAt?: unknown;
}

export interface Category {
  id?: string;
  name: string;
  domain?: string; // Links category to a domain
  image?: string;
  isAll?: boolean;
  createdAt?: unknown;
}
