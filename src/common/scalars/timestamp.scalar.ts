import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, GraphQLError, ValueNode } from 'graphql';

@Scalar('Timestamp')
export class TimestampScalar implements CustomScalar<number, Date> {
  serialize(value: Date): number {
    return value.getTime();
  }

  parseValue(value: number): Date {
    return new Date(value);
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind !== Kind.INT) {
      throw new GraphQLError(
        `Can only parse INT literals as timestamps, but got: ${ast.kind}`,
      );
    }

    return this.parseValue(Number(ast.value));
  }
}
