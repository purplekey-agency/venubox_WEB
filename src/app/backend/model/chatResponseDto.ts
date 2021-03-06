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
import { ChatMessageDto } from './chatMessageDto';
import { ChatUserDto } from './chatUserDto';


export interface ChatResponseDto { 
    id?: number;
    lastMessage?: ChatMessageDto;
    users?: Array<ChatUserDto> | null;
    isReadOnly?: boolean;
}

