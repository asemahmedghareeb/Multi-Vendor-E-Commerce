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

import { UserModule } from './modules/app/auth-base/user/user.module';
import { AuthModule } from './modules/app/auth-base/auth/auth.module';
import { PaymentModule } from './modules/core/payment/payment.module';
// import { OrdersModule } from './modules/app/orders/orders.module';
// import { WalletModule } from './modules/app/wallet/wallet.module';
import { ReviewsModule } from './modules/app/reviews/reviews.module';
import { FollowModule } from './modules/app/follow/follow.module';
import { CategoriesModule } from './modules/app/categories/categories.module';
import { WishlistModule } from './modules/app/wishlist/wishlist.module';
import { adminGroupModule } from './modules/app/auth-base/admin-group/admin-group.module';
import { BlogModule } from './modules/app/blog/blog.module';
import { ContentModule } from './modules/app/content/content.module';
import { NotificationModule } from './modules/app/notification/notification.module';
import { RegionModule } from './modules/app/region/region.module';
import { testModule } from './modules/app/test-module/test.module';
import { VendorsModule } from './modules/app/vendors/vendors.module';

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
    CartModule,
    ProductModule,
    AuthModule,
    PaymentModule,
    VendorsModule,
    UserModule,
    // OrdersModule,
    // WalletModule,
    ReviewsModule,
    FollowModule,
    CategoriesModule,
    WishlistModule,
    adminGroupModule,
    BlogModule,
    ContentModule,
    NotificationModule,
    RegionModule,
    // AutoModuleLoaderModule.register(), // todo remove if u want modules to be not auto loaded
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
