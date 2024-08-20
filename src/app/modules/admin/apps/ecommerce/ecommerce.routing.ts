import { Route } from '@angular/router';
import { ProductComponent } from 'app/modules/admin/apps/ecommerce/product/product.component';
import { ProductListComponent } from 'app/modules/admin/apps/ecommerce/product/list/product.component';
import { InventoryBrandsResolver, InventoryCategoriesResolver, InventoryProductsResolver, InventoryTagsResolver, InventoryVendorsResolver } from 'app/modules/admin/apps/ecommerce/product/product.resolvers';
import { CategoryComponent } from './category/category.component';
import { CategoryListComponent } from './category/list/category.component';
import { CategoryResolver } from './category/category.resolvers';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products'
    },
    {
        path: 'products',
        component: ProductComponent,
        children: [
            {
                path: '',
                component: ProductListComponent,
                resolve: {
                    brands: InventoryBrandsResolver,
                    categories: InventoryCategoriesResolver,
                    products: InventoryProductsResolver,
                    tags: InventoryTagsResolver,
                    vendors: InventoryVendorsResolver
                }
            }
        ]
    },
    {
        path: 'categories',
        component: CategoryComponent,
        children: [
            {
                path: '',
                component: CategoryListComponent,
                resolve: {
                    categories: CategoryResolver,
                }
            }
        ]
    }
];
