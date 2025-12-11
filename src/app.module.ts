import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GqlConfig } from './config/graphql/graphql.config';
import { AutoModuleLoaderModule } from './modules/core/auto-module-loader/auto-module-loader.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseSerializerInterceptor } from './common/interceptors/response-serializer.interceptor';
import { ContextModule } from './modules/core/context/context.module';
import { LangContextMiddleware } from './common/middlewares/lang-context.middleware';
import { AppExceptionFilter } from './common/filters/exception.filter';
import { ValidationPipeFactory } from './config/validation-pipe/validation-pipe.factory';
import { AppDatabaseModule } from './modules/core/app-database/app-database.module';
import { dataSource, TypeOrmConfig } from './config/database/typeorm.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { BullModule } from '@nestjs/bullmq';
import { BullConfigFactory } from './config/queue/bull.config';
import { MailModule } from './modules/core/mail/mail.module';
import { SmsModule } from './modules/core/sms/sms.module';
import { NotificationPusherModule } from './modules/core/notification-pusher/notification-pusher.module';
import { MediaModule } from './modules/core/media/media.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppJwtModule } from './modules/core/app-jwt/app-jwt.module';
import { AppHelperModule } from './modules/core/app-helper/app-helper.module';
import { TimestampScalar } from './common/scalars/timestamp.scalar';
import { I18nModule } from 'nestjs-i18n';
import { I18nConfig } from './config/i18n/i18n.config';
import { AppHelperService } from './modules/core/app-helper/services/app-helper.service';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfig } from './config/app.config';
import { AppCheckModule } from './modules/core/app-check/app-check.module';
import { MoneyScalar } from './common/scalars/money.scalar';
import { MonitoringModule } from './modules/core/monitoring/monitoring.module';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheConfigFactory } from './config/cache/cache.config';
import { CartModule } from './modules/app/cart/cart.module';
import { ProductModule } from './modules/app/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlConfig,
      imports: [ContextModule],
    }),
    AppDatabaseModule.forRootAsync({
      useFactory: () => TypeOrmConfig,
      async dataSourceFactory() {
        return addTransactionalDataSource(dataSource);
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: BullConfigFactory,
    }),
    ThrottlerModule.forRoot({
      throttlers: AppConfig.throttlers,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheConfigFactory,
      isGlobal: true,
    }),
    I18nModule.forRootAsync(I18nConfig),
    ContextModule,
    ScheduleModule.forRoot(),
    MailModule,
    SmsModule,
    NotificationPusherModule,
    MonitoringModule,
    MediaModule,
    AppJwtModule,
    AppHelperModule,
    AppCheckModule,
    AutoModuleLoaderModule.register(),
    CartModule,
    ProductModule, // todo remove if u want modules to be not auto loaded
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MoneyScalar,
    TimestampScalar,
    LangContextMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    {
      provide: APP_PIPE,
      inject: [AppHelperService],
      useFactory: ValidationPipeFactory,
    },
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LangContextMiddleware)
      .exclude({ path: 'graphql', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
