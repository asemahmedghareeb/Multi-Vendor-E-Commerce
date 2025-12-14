import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import * as Dataloader from 'dataloader';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { In } from 'typeorm';

@AppRequestScopedDataloader()
export class VendorDataloader implements AppDataloader<string, Vendor> {
  loader: Dataloader<string, Vendor>;

  constructor(
    @InjectAppRepository(Vendor)
    private readonly vendorRepository: AppRepository<Vendor>,
  ) {
    this.loader = new Dataloader((vendorIds: string[]) =>
      this.getVendorsByIds(vendorIds),
    );
  }

  private async getVendorsByIds(vendorIds: string[]) {
    const vendors = await this.vendorRepository.find({
      where: {
        id: In(vendorIds),
      },
      withDeleted: true,
    });
    const vendorMap = {};

    vendors.forEach((vendor) => (vendorMap[vendor.id] = vendor));

    return vendorIds.map((id) => vendorMap[id]);
  }

  getDataloader(): Dataloader<string, Vendor> {
    return this.loader;
  }
}
