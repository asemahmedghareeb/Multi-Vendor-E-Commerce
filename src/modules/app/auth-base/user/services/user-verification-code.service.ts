import { Injectable } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { UserVerificationCode } from '../entities/user-verification-code.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { VerificationCodeUseCaseEnum } from '../enums/verification-code-use-case.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { AppConfig } from 'src/config/app.config';
import { VerificationCodeMetadata } from '../types/verification-code-metadata.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserVerificationCodeService {
  constructor(
    @InjectAppRepository(UserVerificationCode)
    private readonly userVerificationCodeRepository: AppRepository<UserVerificationCode>,
    private readonly appHelperService: AppHelperService,
    private readonly configService: ConfigService,
  ) {}

  async createVerificationCode(
    userId: string,
    useCase: VerificationCodeUseCaseEnum,
    verificationCodeMetadata?: VerificationCodeMetadata,
  ) {
    const now = new Date();

    const existedVerificationCode =
      await this.userVerificationCodeRepository.findOne({ where: { userId } });

    if (
      existedVerificationCode &&
      now.getTime() - existedVerificationCode.createdAt.getTime() <
        2 * 60 * 1000
    ) {
      throw new AppHttpException(ErrorCodeEnum.VALID_VERIFICATION_CODE_EXIST);
    } else if (existedVerificationCode) {
      await this.userVerificationCodeRepository.remove(existedVerificationCode);
    }

    const expiryDate = new Date(now.getTime() + 10 * 60 * 1000);

    const verificationCode =
      await this.userVerificationCodeRepository.createOne({
        userId,
        code:
          this.configService.get('NODE_ENV') == 'production'
            ? this.appHelperService.generateRandomNumber(4)
            : '1234',
        expiryDate,
        useCase,
        metadata: verificationCodeMetadata,
      });

    return verificationCode;
  }

  async verifyAndConsumeCode(
    userId: string,
    useCase: VerificationCodeUseCaseEnum,
    code: string,
  ) {
    const verificationCode = await this.userVerificationCodeRepository.findOne({
      where: {
        code,
        useCase,
        userId,
      },
    });

    if (!verificationCode)
      throw new AppHttpException(ErrorCodeEnum.INVALID_VERIFICATION_CODE);

    if (verificationCode.expiryDate.getTime() < new Date().getTime())
      throw new AppHttpException(ErrorCodeEnum.EXPIRED_VERIFICATION_CODE);

    await this.userVerificationCodeRepository.remove(verificationCode);

    return verificationCode;
  }
}
