/**
 * OutOut API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { AdminHuntResponseDto } from './adminHuntResponseDto';


export interface AdminHuntResponseDtoPagedResponse { 
    results?: Array<AdminHuntResponseDto> | null;
    totalResults?: number;
    page?: number;
    pageSize?: number;
    readonly totalPages?: number;
}

