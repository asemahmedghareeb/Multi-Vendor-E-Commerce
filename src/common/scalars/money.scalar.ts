import { CustomScalar, Scalar } from '@nestjs/graphql';
import { GraphQLError, Kind } from 'graphql';

@Scalar('MoneyScalar')
export class MoneyScalar implements CustomScalar<number, number> {
  serialize(value: number) {
    return value / 100;
  }

  parseValue(value: number) {
    if (value < 1) {
      throw new GraphQLError(`Mony should be positive a INT`);
    }
    return value * 100;
  }

  parseLiteral(ast: any) {
    if (ast.kind !== Kind.INT) {
      throw new GraphQLError(
        `Can only parse INT to dates but got a: ${ast.kind}`,
      );
    }
    if (ast.value < 1) {
      throw new GraphQLError(`Mony should be a positive INT`);
    }
    return ast.value * 100;
  }
}
