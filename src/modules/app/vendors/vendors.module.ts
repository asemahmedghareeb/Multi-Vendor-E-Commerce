import { Module } from '@nestjs/common';
import { VendorService } from './services/vendors.service';
import { UsersResolver } from './resolvers/vendors.resolver';
import { Vendor } from './entities/vendor.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Review } from '../reviews/entities/review.entity';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';

@Module({
  imports: [AppDatabaseModule.forFeature([User, Vendor, Review])],
  providers: [UsersResolver, VendorService],
})
export class VendorsModule {}
