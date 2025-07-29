import { PrismaService } from '../../config/prisma.service';
import { GymSearchParamsDto, GetGymListDto } from './dto/gym.dto';
export declare class GymService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findNearbyGyms(params: GymSearchParamsDto): Promise<GetGymListDto>;
    getSupportedCities(): Promise<string[]>;
    getSupportedCountries(): Promise<{
        [key: string]: string[];
    }>;
    private getOrderBy;
    private calculateDistance;
    private deg2rad;
    private getBusinessStatus;
    private getGymTypeLabel;
}
