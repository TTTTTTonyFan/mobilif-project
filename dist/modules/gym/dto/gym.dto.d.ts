export declare class GymSearchParamsDto {
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
export declare class GymListItemDto {
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
export declare class PaginationDto {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class GetGymListDto {
    list: GymListItemDto[];
    pagination: PaginationDto;
    currentCity: string;
    searchParams: GymSearchParamsDto;
}
