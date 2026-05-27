export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
export interface DateRangeFilter {
    startDate?: Date | string;
    endDate?: Date | string;
}
export type Result<T, E = Error> = Success<T> | Failure<E>;
export declare class Success<T> {
    readonly value: T;
    readonly isSuccess = true;
    readonly isFailure = false;
    constructor(value: T);
    static of<T>(value: T): Success<T>;
}
export declare class Failure<E> {
    readonly error: E;
    readonly isSuccess = false;
    readonly isFailure = true;
    constructor(error: E);
    static of<E>(error: E): Failure<E>;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        statusCode: number;
    };
    timestamp: string;
    path?: string;
}
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
export declare enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}
export declare enum TransactionStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    CONSOLIDATED = "CONSOLIDATED"
}
export declare enum ConsolidationStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REPROCESSING = "REPROCESSING"
}
//# sourceMappingURL=common.types.d.ts.map