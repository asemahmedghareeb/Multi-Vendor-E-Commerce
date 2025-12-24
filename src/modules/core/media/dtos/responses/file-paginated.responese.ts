import { ObjectType } from '@nestjs/graphql';
import { paginatedObjectTypeFactory } from 'src/common/utilities/object-paginated-type.factory';
import { File } from '../../entities/file.entity';


@ObjectType()
export class FilesPaginated extends paginatedObjectTypeFactory(File) {}
