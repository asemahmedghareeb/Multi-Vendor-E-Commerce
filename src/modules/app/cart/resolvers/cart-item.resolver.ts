// import { ResolveField, Parent, Resolver } from "@nestjs/graphql";

// import { Product } from "../../product/entities/product.entity";
// import { ProductsDataloader } from "../dataloaders/product.dataloader";
// import { CartItem } from "../entities/cart-item.entity";

// @Resolver(() => CartItem)
// export class CartItemResolver {
//   constructor(private readonly productLoader: ProductsDataloader) {}

//   @ResolveField(() => Product)
//   async product(@Parent() cartItem: CartItem) {
//     if (cartItem.product) return cartItem.product;
//     if (!cartItem.product_id) return null;
//     return this.productLoader.getDataloader().load(cartItem.product_id);
//   }
// }
