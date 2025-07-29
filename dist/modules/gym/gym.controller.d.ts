import { GymService } from './gym.service';
import { GetGymListDto, GymSearchParamsDto } from './dto/gym.dto';
import { ResponseDto } from '../../common/dto/response.dto';
export declare class GymController {
    private readonly gymService;
    private readonly logger;
    constructor(gymService: GymService);
    getGymList(params: GymSearchParamsDto): Promise<ResponseDto<GetGymListDto>>;
    getSupportedCities(): Promise<ResponseDto<string[]>>;
    getSupportedCountries(): Promise<ResponseDto<{
        [key: string]: string[];
    }>>;
}
