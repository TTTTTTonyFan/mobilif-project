export declare class ResponseDto<T = any> {
    code: number;
    message: string;
    data?: T;
    timestamp: number;
    requestId?: string;
}
