import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Policy } from '../entities/policy.entity';
import { PolicyService } from '../services/policy.service';
import { CreatePolicyInput } from '../dtos/inputs/create-policy.input';
import { Transactional } from 'typeorm-transactional';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { PaginatedPoliciesResponse } from '../dtos/responses/paginated-policies.response';
import { NullablePaginatorArgsInput } from 'src/common/dtos/inputs/paginator.input';
import { FindPolicyInput } from '../dtos/inputs/find-policy.input';
import { UpdatePolicyInput } from '../dtos/inputs/update-policy.input';

@Resolver(() => Policy)
export class PolicyResolver {
  constructor(private readonly policyService: PolicyService) {}

  @Query(() => PaginatedPoliciesResponse)
  async findPaginatedPolicies(@Args() paginator?: NullablePaginatorArgsInput) {
    return this.policyService.getPaginatedPolicy(paginator?.paginate);
  }

  @Query(() => Policy)
  async findSinglePolicy(@Args() input: FindPolicyInput) {
    return this.policyService.getSinglePolicy(input.id);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.CREATE,
        target: Policy.permissionsTarget,
      },
    ],
  })
  async adminCreatePolicy(@Args('input') input: CreatePolicyInput) {
    return this.policyService.createPolicy(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.UPDATE,
        target: Policy.permissionsTarget,
      },
    ],
  })
  async adminUpdatePolicy(@Args('input') input: UpdatePolicyInput) {
    return this.policyService.updatePolicy(input);
  }

  @Mutation(() => Boolean)
  @Transactional()
  @Auth({
    roles: [UserRoleEnum.ADMIN],
    permissions: [
      {
        action: DefaultPermissionActionsEnum.DELETE,
        target: Policy.permissionsTarget,
      },
    ],
  })
  async adminDeletePolicy(@Args() input: FindPolicyInput) {
    return this.policyService.deletePolicy(input.id);
  }
}
