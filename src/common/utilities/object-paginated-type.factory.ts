import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../dtos/responses/page-info.type';

export function paginatedObjectTypeFactory(TClass: {
  new (...args: any[]): any;
}) {
  @ObjectType({ isAbstract: true })
  class ResponseWrapper {
    @Field(() => PageInfo)
    pageInfo: PageInfo;

    @Field(() => [TClass], { nullable: true })
    items: (typeof TClass)[];
  }

  Object.defineProperty(ResponseWrapper, 'name', {
    value: `${TClass.name}Paginated`,
  });

  return ResponseWrapper;
}
