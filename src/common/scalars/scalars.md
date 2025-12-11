# Custom Scalars Reference

Shared GraphQL scalars live in `src/common/scalars`. They transform values as they travel between the client, resolver, and database, giving us predictable formats. This document outlines the behaviour of each scalar and how to use them in schemas.

## Quick Reference

| Scalar            | GraphQL Name  | Runtime Type                        | Purpose                                                |
| ----------------- | ------------- | ----------------------------------- | ------------------------------------------------------ |
| `MoneyScalar`     | `MoneyScalar` | `number` (integer cents internally) | Represent monetary amounts while preserving precision. |
| `TimestampScalar` | `Timestamp`   | `Date` (server) / `number` (client) | Exchange dates as Unix epoch milliseconds.             |

---

## `MoneyScalar`

```ts
@Scalar('MoneyScalar')
export class MoneyScalar implements CustomScalar<number, number> {
  serialize(value: number) {
    return value / 100;
  }

  parseValue(value: number) {
    if (value < 1) {
      throw new GraphQLError('Mony should be positive a INT');
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
      throw new GraphQLError('Mony should be a positive INT');
    }
    return ast.value * 100;
  }
}
```

### Behaviour

- **Serialize**: Converts stored integer cents to a decimal number for the client (`12345` → `123.45`).
- **parseValue / parseLiteral**: Accepts positive integers from variables or inline literals, multiplies by 100 for storage. Non-positive values or non-int literals trigger a `GraphQLError`.
- **Precision**: Because the scalar deals strictly with integers, you avoid floating-point precision issues when storing values in the database.

### Usage Tips

- Define monetary fields using the scalar to enforce consistent conversions:

  ```ts
  @Field(() => MoneyScalar)
  price: number; // exposed to clients as decimal, stored internally as integer cents
  ```

- When accepting input, instruct clients to submit integer cents (e.g., `12345`) so the scalar can multiply them back to storage units. If you prefer clients to send decimal numbers, update the `parseValue` logic accordingly.
- Error strings contain typos in the current implementation; consider correcting them if you plan to expose the raw messages to end users.

## `TimestampScalar`

```ts
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
```

### Behaviour

- **Serialize**: Converts `Date` objects to epoch milliseconds (`Date#getTime()`), aligning with JavaScript client expectations.
- **parseValue / parseLiteral**: Converts numeric milliseconds back into `Date` instances. Non-integer literals throw a `GraphQLError`.

### Usage Tips

- Annotate GraphQL fields or arguments with `@Field(() => TimestampScalar)` to ensure clients send/receive epoch milliseconds.
- When handling inputs, remember that `parseValue` does not validate ranges—if you expect only future or past dates, add guards in the resolver/service layer.
- Combine with `class-transformer` or DTO validators when you need additional constraints (e.g., `@MinDate`).

---

Update this document whenever you introduce new scalars or adjust the parsing rules so other teams understand the data contracts.
