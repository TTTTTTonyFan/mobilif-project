export declare class HealthService {
    checkHealth(): Promise<{
        status: string;
        timestamp: string;
        responseTime: string;
        services: {
            database: {
                status: string;
                responseTime: string;
                message: string;
                error?: undefined;
            } | {
                status: string;
                error: any;
                message: string;
                responseTime?: undefined;
            };
            redis: {
                status: string;
                responseTime: string;
                message: string;
                error?: undefined;
            } | {
                status: string;
                error: any;
                message: string;
                responseTime?: undefined;
            };
        };
        system: {
            uptime: number;
            memory: NodeJS.MemoryUsage;
            version: string;
            environment: string;
        };
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        responseTime: string;
        error: any;
        services?: undefined;
        system?: undefined;
    }>;
    checkDatabaseHealth(): Promise<{
        status: string;
        responseTime: string;
        message: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        message: string;
        responseTime?: undefined;
    }>;
    checkRedisHealth(): Promise<{
        status: string;
        responseTime: string;
        message: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        message: string;
        responseTime?: undefined;
    }>;
}
