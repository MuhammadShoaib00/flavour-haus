import { applyDecorators, Logger, SetMetadata } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthN } from '../authN.decorator';
import { AuthZ } from '../authZ.decorator';
/**
 * @description ApiDescription adds description to the route
 */
interface ApiOperationData{
    name: string, roles: Array<string> | null | undefined, description: string
}
export const ApiRoute = {
    LIST: (data: ApiOperationData) => {
        return apply_decorator(data, 'list');
    },
    UPDATE: (data: ApiOperationData) => {
        return apply_decorator(data, 'update');
    },
    DELETE: (data: ApiOperationData) => {
        return apply_decorator(data, 'delete');
    }
}

const apply_decorator = (data: ApiOperationData, type: string) => 
    applyDecorators(!data.roles ? AuthN() : AuthZ(type), ApiOperation({...data, permission: type, summary: data.roles.join(' | ') || ''} as any));