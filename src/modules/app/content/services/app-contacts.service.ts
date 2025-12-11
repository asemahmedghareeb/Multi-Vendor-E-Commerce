import { Injectable } from '@nestjs/common';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppContact } from '../entities/app-contact.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { SetAppContactInput } from '../dtos/inputs/set-app-contact.input';
import { AppContactsEnum } from '../enums/app-contacts.enum';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EmailInput } from 'src/common/dtos/inputs/email.input';
import { UrlInput } from 'src/common/dtos/inputs/url.input';
import { PhoneNumberInput } from 'src/common/dtos/inputs/phone-number.input';
import { validationPipeExceptionFactory } from 'src/common/utilities/validation-pipe-exception.factory';
import { PaginatorInput } from 'src/common/dtos/inputs/paginator.input';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class AppContactsService {
  constructor(
    @InjectAppRepository(AppContact)
    private readonly appContactRepository: AppRepository<AppContact>,
  ) {}

  async setAppContact(input: SetAppContactInput) {
    const existedAppContact = await this.appContactRepository.findOne({
      where: {
        type: input.type,
      },
    });

    if (existedAppContact)
      await this.appContactRepository.remove(existedAppContact);

    try {
      if (input.type == AppContactsEnum.EMAIL) {
        await validateOrReject(
          plainToInstance(EmailInput, {
            email: input.target,
          }),
        );
      } else if (
        [
          AppContactsEnum.FACEBOOK,
          AppContactsEnum.INSTAGRAM,
          AppContactsEnum.LINKEDIN,
          AppContactsEnum.X,
        ].includes(input.type)
      ) {
        await validateOrReject(
          plainToInstance(UrlInput, {
            email: input.target,
          }),
        );
      } else if (
        [AppContactsEnum.WHATSAPP, AppContactsEnum.PHONE_NUMBER].includes(
          input.type,
        )
      ) {
        await validateOrReject(
          plainToInstance(PhoneNumberInput, {
            phoneNumber: input.target,
          }),
        );
      }
    } catch (errors) {
      throw validationPipeExceptionFactory(errors);
    }

    await this.appContactRepository.save(input);

    return true;
  }

  findPaginatedAppContacts(paginatorInput?: PaginatorInput) {
    return this.appContactRepository.findPaginated(
      undefined,
      undefined,
      paginatorInput?.page,
      paginatorInput?.limit,
    );
  }

  async findSingleAppContact(id: string) {
    const appContact = await this.appContactRepository.findOne({
      where: {
        id,
      },
    });

    if (!appContact) {
      throw new AppHttpException(ErrorCodeEnum.APP_CONTACT_DOES_NOT_EXIST);
    }

    return appContact;
  }

  async deleteAppContact(id: string) {
    const appContact = await this.appContactRepository.findOne({
      where: {
        id,
      },
    });

    if (!appContact)
      throw new AppHttpException(ErrorCodeEnum.APP_CONTACT_DOES_NOT_EXIST);

    await this.appContactRepository.remove(appContact);

    return true;
  }
}
