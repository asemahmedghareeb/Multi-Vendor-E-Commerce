import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { CursorPageInfo } from '../dtos/responses/cursor-page-info.type';

export function cursorPaginatedObjectTypeFactory<T>(TClass: Type<T>) {
  @ObjectType(`${TClass.name}Edge`)
  abstract class Edge {
    @Field(() => String)
    cursor: string;

    @Field(() => TClass)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [Edge], { nullable: true })
    edges: Edge[];

    @Field(() => CursorPageInfo)
    pageInfo: CursorPageInfo;
  }

  Object.defineProperty(PaginatedType, 'name', {
    value: `${TClass.name}CursorPaginated`,
  });

  return PaginatedType;
}
