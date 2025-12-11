import { FindOptionsWhere } from 'typeorm';

/**
 * Recursively transforms a FindOptionsWhere<T> that includes `$or` clauses
 * into a TypeORM-compatible array of FindOptionsWhere<T>.
 *
 * Example input:
 * {
 *   companyId: 5,
 *   isActive: true,
 *   $or: [
 *     { age: MoreThan(18) },
 *     { $or: [{ isAdmin: true }, { name: ILike('%Omar%') }] },
 *   ],
 * }
 *
 * Output:
 * [
 *   { companyId: 5, isActive: true, age: MoreThan(18) },
 *   { companyId: 5, isActive: true, isAdmin: true },
 *   { companyId: 5, isActive: true, name: ILike('%Omar%') },
 * ]
 */
export function transformWhereWithOr<T>(
  input: FindOptionsWhere<T> & { $or?: FindOptionsWhere<T>[] },
): FindOptionsWhere<T>[] {
  const { $or, ...common } = input as Record<string, any>;

  if (!$or || !Array.isArray($or)) {
    return [input];
  }

  const results: FindOptionsWhere<T>[] = [];

  for (const cond of $or) {
    if (cond.$or) {
      const nested = transformWhereWithOr(cond);
      for (const nestedCond of nested) {
        results.push({ ...(common as any), ...nestedCond });
      }
    } else {
      results.push({ ...(common as any), ...(cond as any) });
    }
  }

  return results;
}
