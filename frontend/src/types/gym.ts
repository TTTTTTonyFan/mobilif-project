export interface GymListItemDto {
  id: string;
  uuid: string;
  name: string;
  nameEn?: string;
  description?: string;
  address: string;
  city: string;
  district: string;
  distance?: number;
  rating: number;
  reviewCount: number;
  businessStatus: string;
  todayHours: string;
  gymType: string;
  crossfitCertified: boolean;
  supportedPrograms: string[];
  tags: string[];
  logo?: string;
  images: string[];
  phone?: string;
  verified: boolean;
  featured: boolean;
}

export interface PaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetGymListDto {
  list: GymListItemDto[];
  pagination: PaginationDto;
  currentCity: string;
  searchParams: GymSearchParamsDto;
}

export interface GymSearchParamsDto {
  lat?: number;
  lng?: number;
  city?: string;
  radius?: number;
  keyword?: string;
  gymType?: string;
  programs?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface GymFilters {
  gymType?: string;
  programs?: string[];
  sortBy?: string;
}

export interface GymState {
  gymList: GymListItemDto[];
  loading: boolean;
  error: string | null;
  currentCity: string;
  searchKeyword: string;
  filters: GymFilters;
  pagination: PaginationDto;
  supportedCities: string[];
  supportedCountries: { [key: string]: string[] };
}