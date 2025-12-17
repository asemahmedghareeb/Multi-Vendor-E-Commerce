import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
import * as Dataloader from 'dataloader';
import { Product } from '../../product/entities/product.entity';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { In } from 'typeorm';

@AppRequestScopedDataloader()
export class ProductsDataloader implements AppDataloader<string, Product> {
  loader: Dataloader<string, Product>;

  constructor(
    @InjectAppRepository(Product)
    private readonly productRepository: AppRepository<Product>,
  ) {
    this.loader = new Dataloader((productIds: string[]) =>
      this.getProductsByIds(productIds),
    );
  }

  private async getProductsByIds(productIds: string[]) {
    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
      },
      withDeleted: true,
    });
    const productMap = {};

    products.forEach((product) => (productMap[product.id] = product));

    return productIds.map((id) => productMap[id]);
  }

  getDataloader(): Dataloader<string, Product> {
    return this.loader;
  }
}
