import { BadRequestException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Context, Mutation, Args } from '@nestjs/graphql';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { AppGqlContext } from 'src/common/types/gql-context.type';
import { TestInput } from './inputs/test.input';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { TestEntity } from './entities/test.entity';
import { Transactional } from 'typeorm-transactional';
import { MailService } from 'src/modules/core/mail/services/mail.service';
import { MailTemplateEnum } from 'src/modules/core/mail/enums/mail-template.enum';
import { SmsService } from 'src/modules/core/sms/services/sms.service';
import { SmsMessageEnum } from 'src/modules/core/sms/enum/sms-message.enum';
import { LangEnum } from 'src/common/enums/lang.enum';
import { NotificationPusherService } from 'src/modules/core/notification-pusher/services/notification-pusher.service';
import { NotificationEnum } from 'src/modules/core/notification-pusher/enums/notification.enum';
import { MailSubjectEnum } from 'src/modules/core/mail/enums/mail-subject.enum';
import { AppConfig } from 'src/config/app.config';
import { AuthorizedGuard } from 'src/common/guards/authorized.guard';
import { AllowedRoles } from 'src/common/decorators/allowed-roles.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { RequiredPermissions } from 'src/common/decorators/permissions.decorator';
import { DefaultPermissionActionsEnum } from 'src/common/enums/default-permissions.enum';
import { User } from '../auth-base/user/entities/user.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RequireAppCheck } from 'src/modules/core/app-check/decorator/app-check.decorator';
import { Payment } from 'src/modules/core/payment/entities/payment.entity';
import { PaymentService } from 'src/modules/core/payment/services/payment.service';
import { PaymentGatewaysEnum } from 'src/modules/core/payment/enums/payment-gateways.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { MoneyScalar } from 'src/common/scalars/money.scalar';
import { TestCreatePaymentIntent } from './inputs/test-create-payment-intent.input';
import { File } from 'src/modules/core/media/entities/file.entity';
import { SmsStrategyEnum } from 'src/modules/core/sms/enum/sms-strategy.enum';

@Resolver()
export class TestResolver {
  constructor(
    @InjectAppRepository(TestEntity)
    private readonly testRepo: AppRepository<TestEntity>,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly notificationPusherService: NotificationPusherService,
    private readonly paymentService: PaymentService,
    @InjectAppRepository(File)
    private readonly fileRepository: AppRepository<File>,
  ) {}

  @Query(() => File)
  async getFileTest(@Args('id') id: string) {
    return this.fileRepository.findOneOrFail(
      {
        where: { id },
      },
      ErrorCodeEnum.NOT_FOUND,
    );
  }

  @Query(() => String)
  // @RequireAppCheck()
  async sayHello(@Context() context: AppGqlContext): Promise<string> {
    // console.log(context.currentUser);
    // console.log(context.session);
    // await this.testRepo.findOneOrFail(
    //   {
    //     where: generateOrQuery<TestEntity>({
    //       $or: [
    //         {
    //           name: 'hi',
    //         },
    //         { name: 'test1d23' },
    //       ],
    //     }),
    //   },
    //   ErrorCodeEnum.METHOD_NOT_ALLOWED,
    // );

    // console.log(
    //   generateOrQuery<TestEntity>({
    //     $or: [
    //       {
    //         name: 'hi',
    //       },
    //       { name: 'tedst123' },
    //     ],
    //   }),
    // );
    // throw new AppHttpException(ErrorCodeEnum.NOT_FOUND, {
    //   test: 'hi',
    // });

    return 'Hello, world';
  }

  @Mutation(() => String)
  @Transactional()
  async mutationTest(@Args('input') input: TestInput) {
    await this.testRepo.createOne({ name: 'test123' });
    return 'Hello, world';
  }

  @Mutation(() => Boolean)
  async testSms() {
    this.smsService.sendLocalizedSms(
      '+201206863457',
      SmsMessageEnum.HELLO_MESSAGE,
      {
        name: 'omar',
      },
      LangEnum.AR,
      SmsStrategyEnum.SMS,
    );
    return true;
  }

  @Mutation(() => Boolean)
  async testNotification(
    @Args('token') token: string,
    @Context() context: AppGqlContext,
  ) {
    this.notificationPusherService.sendLocalizedNotification(
      token,
      NotificationEnum.WELCOME_NOTIFICATION,
      { name: 'omar' },
      context.lang,
      {
        test: 'sgjewopgjope',
      },
    );
    return true;
  }

  @Mutation(() => Boolean)
  async testMailer(@Context() context: AppGqlContext) {
    this.mailService.sendEmailWithATemplate(
      'omar.hashy@baianat.net',
      MailSubjectEnum.RESET_USER_PASSWORD,
      MailTemplateEnum.Welcome,
      { name: 'Omar', appName: AppConfig.AppName },
      context.lang,
    );

    return true;
  }

  // @Mutation(() => Payment)
  // @Auth()
  // async testPaymentIntent(
  //   @Args() input: TestCreatePaymentIntent,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.paymentService.createPaymentIntent(
  //     PaymentGatewaysEnum.STRIPE,
  //     input.amount,
  //     AppConfig.appGeneralCurrency,
  //     {},
  //     user,

  //   );
  // }

  // @Mutation(() => Boolean)
  // async testRefund(@Args('paymentId') paymentId: string) {
  //   await this.paymentService.refundPayment(paymentId);
  //   return true;
  // }
}
