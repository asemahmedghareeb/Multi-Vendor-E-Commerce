import { Module } from '@nestjs/common';
import { VendorService } from './vendors.service';
import { UsersResolver } from './vendors.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { User } from '../auth-base/user/entities/user.entity';
import { Review } from '../reviews/entities/review.entity';
import { ProductModule } from '../product/product.module';


@Module({
  imports: [TypeOrmModule.forFeature([User, Vendor, Review]), ProductModule],
  providers: [UsersResolver, VendorService],
})
export class vendorsModule {}
