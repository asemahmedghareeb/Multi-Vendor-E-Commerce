// import * as DataLoader from 'dataloader';
// import { In } from 'typeorm';
// import { AppRequestScopedDataloader } from 'src/common/decorators/app-request-scoped-dataloader.decorator';
// import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
// import { AppDataloader } from 'src/common/interfaces/dataloader.interface';
// import { Product } from '../entities/product.entity';
// import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';

// @AppRequestScopedDataloader()
// export class ProductByIdDataloader implements AppDataloader<string, Product> {
//   loader: DataLoader<string, Product>;

//   constructor(
//     @InjectAppRepository(Product)
//     private readonly productRepository: AppRepository<Product>,
//   ) {
//     this.loader = new DataLoader((ids: string[]) => this.getProductsByIds(ids));
//   }

//   private async getProductsByIds(ids: string[]) {
//     const products = await this.productRepository.find({
//       where: { id: In(ids) },
//     });
//     const productMap = new Map(products.map((p) => [p.id, p]));
//     return ids.map(
//       (id) =>
//         productMap.get(id) || new Error(`Could not find product with id ${id}`),
//     );
//   }

//   getDataloader(): DataLoader<string, Product> {
//     return this.loader;
//   }
// }

// @AppRequestScopedDataloader()
// export class ProductsByVendorIdDataloader
//   implements AppDataloader<string, Product[]>
// {
//   loader: DataLoader<string, Product[]>;

//   constructor(
//     @InjectAppRepository(Product)
//     private readonly productRepository: AppRepository<Product>,
//   ) {
//     this.loader = new DataLoader((vendorIds: string[]) =>
//       this.getProductsByVendorIds(vendorIds),
//     );
//   }

//   private async getProductsByVendorIds(vendorIds: string[]) {
//     const products = await this.productRepository.find({
//       where: { vendor: { id: In(vendorIds) } },
//       order: { createdAt: 'DESC' },
//     });

//     const groupedByVendorId = new Map<string, Product[]>();
//     products.forEach((product) => {
//       if (product.vendorId) {
//         if (!groupedByVendorId.has(product.vendorId)) {
//           groupedByVendorId.set(product.vendorId, []);
//         }
//         groupedByVendorId.get(product.vendorId)?.push(product);
//       }
//     });

//     return vendorIds.map((vendorId) => groupedByVendorId.get(vendorId) || []);
//   }

//   getDataloader(): DataLoader<string, Product[]> {
//     return this.loader;
//   }
// }
