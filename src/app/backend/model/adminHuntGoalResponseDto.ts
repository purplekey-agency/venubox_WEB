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


export interface AdminHuntGoalResponseDto { 
    id?: number;
    order?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    endMessage?: string | null;
    nextClueMessage?: string | null;
    nextClueMessageDelay?: number;
}

