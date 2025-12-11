import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { Policy } from '../entities/policy.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { CreatePolicyInput } from '../dtos/inputs/create-policy.input';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { UpdatePolicyInput } from '../dtos/inputs/update-policy.input';
import { FindPolicyInput } from '../dtos/inputs/find-policy.input';

@Injectable()
export class PolicyService {
  constructor(
    @InjectAppRepository(Policy)
    private readonly policyRepository: AppRepository<Policy>,
  ) {}

  async createPolicy(input: CreatePolicyInput) {
    const policy = await this.policyRepository.findOne({
      where: {
        type: input.type,
      },
    });

    if (policy) {
      throw new AppHttpException(
        ErrorCodeEnum.POLICY_WITH_THIS_TYPE_ALREADY_EXIST,
      );
    }

    await this.policyRepository.createOne(input);

    return true;
  }

  async getPaginatedPolicy(paginatorInput?: PaginatorInput) {
    return this.policyRepository.findPaginated(
      undefined,
      undefined,
      paginatorInput?.page,
      paginatorInput?.limit,
    );
  }

  async getSinglePolicy(id: string) {
    const policy = await this.policyRepository.findOne({
      where: { id },
    });

    if (!policy)
      throw new AppHttpException(ErrorCodeEnum.POLICY_DOES_NOT_EXIST);

    return policy;
  }

  async updatePolicy(input: UpdatePolicyInput) {
    const policy = await this.policyRepository.findOne({
      where: {
        id: input.id,
      },
    });

    if (!policy)
      throw new AppHttpException(ErrorCodeEnum.POLICY_DOES_NOT_EXIST);

    await this.policyRepository.updateOneFromExistingModel(policy, input);

    return true;
  }

  async deletePolicy(id: string) {
    const policy = await this.policyRepository.findOne({
      where: {
        id,
      },
    });

    if (!policy)
      throw new AppHttpException(ErrorCodeEnum.POLICY_DOES_NOT_EXIST);

    await this.policyRepository.remove(policy);

    return true;
  }
}
