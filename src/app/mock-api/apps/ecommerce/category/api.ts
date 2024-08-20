// import { Injectable } from '@angular/core';
// import { assign, cloneDeep } from 'lodash-es';
// import { FuseMockApiService, FuseMockApiUtils } from '@fuse/lib/mock-api';
// import { brands as brandsData, categories as categoriesData, products as productsData, tags as tagsData, vendors as vendorsData } from 'app/mock-api/apps/ecommerce/inventory/data';

// @Injectable({
//     providedIn: 'root'
// })
// export class ECommerceInventoryMockApi {
//     private _categories: any[] = categoriesData;
//     private _brands: any[] = brandsData;
//     private _products: any[] = productsData;
//     private _tags: any[] = tagsData;
//     private _vendors: any[] = vendorsData;

//     constructor(private _fuseMockApiService: FuseMockApiService) {
//         this.registerHandlers();
//     }

//     registerHandlers(): void {

//         this._fuseMockApiService
//             .onGet('api/apps/ecommerce/inventory/categories')
//             .reply(() => [200, cloneDeep(this._categories)]);

//         this._fuseMockApiService
//             .onGet('api/apps/ecommerce/inventory/brands')
//             .reply(() => [200, cloneDeep(this._brands)]);

//         // -----------------------------------------------------------------------------------------------------
//         // @ Products - GET
//         // -----------------------------------------------------------------------------------------------------
//         this._fuseMockApiService
//             .onGet('api/apps/ecommerce/inventory/products', 300)
//             .reply(({ request }) => {

//                 const search = request.params.get('search');
//                 const sort = request.params.get('sort') || 'name';
//                 const order = request.params.get('order') || 'asc';
//                 const page = parseInt(request.params.get('page') ?? '1', 10);
//                 const size = parseInt(request.params.get('size') ?? '10', 10);

//                 let products: any[] | null = cloneDeep(this._products);

//                 if (sort === 'sku' || sort === 'name' || sort === 'active') {
//                     products.sort((a, b) => {
//                         const fieldA = a[sort].toString().toUpperCase();
//                         const fieldB = b[sort].toString().toUpperCase();
//                         return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
//                     });
//                 }
//                 else {
//                     products.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
//                 }

//                 if (search) {
//                     products = products.filter(contact => contact.name && contact.name.toLowerCase().includes(search.toLowerCase()));
//                 }

//                 const productsLength = products.length;

//                 const begin = page * size;
//                 const end = Math.min((size * (page + 1)), productsLength);
//                 const lastPage = Math.max(Math.ceil(productsLength / size), 1);

//                 let pagination = {};

//                 if (page > lastPage) {
//                     products = null;
//                     pagination = {
//                         lastPage
//                     };
//                 }
//                 else {
//                     products = products.slice(begin, end);

//                     pagination = {
//                         length: productsLength,
//                         size: size,
//                         page: page,
//                         lastPage: lastPage,
//                         startIndex: begin,
//                         endIndex: end - 1
//                     };
//                 }

//                 return [
//                     200,
//                     {
//                         products,
//                         pagination
//                     }
//                 ];
//             });

//         this._fuseMockApiService
//             .onGet('api/apps/ecommerce/inventory/product')
//             .reply(({ request }) => {

//                 const id = request.params.get('id');

//                 const products = cloneDeep(this._products);

//                 const product = products.find(item => item.id === id);

//                 return [200, product];
//             });

//         this._fuseMockApiService
//             .onPost('api/apps/ecommerce/inventory/product')
//             .reply(() => {

//                 const newProduct = {
//                     id: FuseMockApiUtils.guid(),
//                     category: '',
//                     name: 'A New Product',
//                     description: '',
//                     tags: [],
//                     sku: '',
//                     barcode: '',
//                     brand: '',
//                     vendor: '',
//                     stock: '',
//                     reserved: '',
//                     cost: '',
//                     basePrice: '',
//                     taxPercent: '',
//                     price: '',
//                     weight: '',
//                     thumbnail: '',
//                     images: [],
//                     active: false
//                 };

//                 this._products.unshift(newProduct);

//                 return [200, newProduct];
//             });

//         this._fuseMockApiService
//             .onPatch('api/apps/ecommerce/inventory/product')
//             .reply(({ request }) => {

//                 const id = request.body.id;
//                 const product = cloneDeep(request.body.product);

//                 let updatedProduct = null;

//                 this._products.forEach((item, index, products) => {

//                     if (item.id === id) {
//                         products[index] = assign({}, products[index], product);

//                         updatedProduct = products[index];
//                     }
//                 });

//                 return [200, updatedProduct];
//             });

//         this._fuseMockApiService
//             .onDelete('api/apps/ecommerce/inventory/product')
//             .reply(({ request }) => {

//                 const id = request.params.get('id');

//                 this._products.forEach((item, index) => {

//                     if (item.id === id) {
//                         this._products.splice(index, 1);
//                     }
//                 });

//                 return [200, true];
//             });

//         this._fuseMockApiService
//             .onGet('api/apps/ecommerce/inventory/tags')
//             .reply(() => [200, cloneDeep(this._tags)]);

//         this._fuseMockApiService
//             .onPost('api/apps/ecommerce/inventory/tag')
//             .reply(({ request }) => {

//                 const newTag = cloneDeep(request.body.tag);

//                 newTag.id = FuseMockApiUtils.guid();

//                 this._tags.unshift(newTag);

//                 return [200, newTag];
//             });

//         this._fuseMockApiService
//             .onPatch('api/apps/ecommerce/inventory/tag')
//             .reply(({ request }) => {

//                 const id = request.body.id;
//                 const tag = cloneDeep(request.body.tag);

//                 let updatedTag = null;

//                 this._tags.forEach((item, index, tags) => {

//                     if (item.id === id) {
//                         tags[index] = assign({}, tags[index], tag);

//                         updatedTag = tags[index];
//                     }
//                 });

//                 return [200, updatedTag];
//             });

//         this._fuseMockApiService
//             .onDelete('api/apps/ecommerce/inventory/tag')
//             .reply(({ request }) => {

//                 const id = request.params.get('id');

//                 this._tags.forEach((item, index) => {

//                     if (item.id === id) {
//                         this._tags.splice(index, 1);
//                     }
//                 });

//                 const productsWithTag = this._products.filter(product => product.tags.indexOf(id) > -1);

//                 productsWithTag.forEach((product) => {
//                     product.tags.splice(product.tags.indexOf(id), 1);
//                 });

//                 return [200, true];
//             });

//         this._fuseMockApiService
//             .onGet('api/apps/ecommerce/inventory/vendors')
//             .reply(() => [200, cloneDeep(this._vendors)]);
//     }
// }
import { Injectable } from '@angular/core';
import { assign, cloneDeep } from 'lodash-es';
import { FuseMockApiService, FuseMockApiUtils } from '@fuse/lib/mock-api';
import { categories as categoriesData } from 'app/mock-api/apps/ecommerce/category/data';

@Injectable({
    providedIn: 'root'
})
export class ECommerceCategoryMockApi {
    private _categories: any[] = categoriesData;

    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }

    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Categories - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/ecommerce/inventory/categories')
            .reply(() => [200, cloneDeep(this._categories)]);

        // -----------------------------------------------------------------------------------------------------
        // @ Category - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/ecommerce/inventory/category')
            .reply(({ request }) => {

                // Get the id from the params
                const id = request.params.get('id');

                // Clone the categories
                const categories = cloneDeep(this._categories);

                // Find the category
                const category = categories.find(item => item.id === id);

                // Return the response
                return [200, category];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Category - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/apps/ecommerce/inventory/category')
            .reply(({ request }) => {

                // Generate a new category
                const newCategory = {
                    id: FuseMockApiUtils.guid(),
                    parentId: request.body.parentId || null,
                    name: request.body.name,
                    slug: request.body.slug
                };

                // Unshift the new category
                this._categories.unshift(newCategory);

                // Return the response
                return [200, newCategory];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Category - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/apps/ecommerce/inventory/category')
            .reply(({ request }) => {

                // Get the id and category
                const id = request.body.id;
                const category = cloneDeep(request.body.category);

                // Prepare the updated category
                let updatedCategory = null;

                // Find the category and update it
                this._categories.forEach((item, index, categories) => {

                    if (item.id === id) {
                        // Update the category
                        categories[index] = assign({}, categories[index], category);

                        // Store the updated category
                        updatedCategory = categories[index];
                    }
                });

                // Return the response
                return [200, updatedCategory];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Category - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/apps/ecommerce/inventory/category')
            .reply(({ request }) => {

                // Get the id
                const id = request.params.get('id');

                // Find the category and delete it
                this._categories.forEach((item, index) => {

                    if (item.id === id) {
                        this._categories.splice(index, 1);
                    }
                });

                // Return the response
                return [200, true];
            });
    }
}
