import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private _brands: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _product: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {
    }

    get brands$(): Observable<any[]> {
        return this._brands.asObservable();
    }

    get categories$(): Observable<any[]> {
        return this._categories.asObservable();
    }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    get product$(): Observable<any> {
        return this._product.asObservable();
    }

    get products$(): Observable<any[]> {
        return this._products.asObservable();
    }

    get tags$(): Observable<any[]> {
        return this._tags.asObservable();
    }

    get vendors$(): Observable<any[]> {
        return this._vendors.asObservable();
    }

    getBrands(): Observable<any[]> {
        return this._httpClient.get<any[]>('api/apps/ecommerce/inventory/brands').pipe(
            tap((brands) => {
                this._brands.next(brands);
            })
        );
    }

    getCategories(): Observable<any[]> {
        return this._httpClient.get<any[]>('api/apps/ecommerce/inventory/categories').pipe(
            tap((categories) => {
                this._categories.next(categories);
            })
        );
    }

    getProducts(page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: any; products: any[] }> {
        return this._httpClient.get<{ pagination: any; products: any[] }>('api/apps/ecommerce/inventory/products', {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._products.next(response.products);
            })
        );
    }

    getProductById(id: string): Observable<any> {
        return this._products.pipe(
            take(1),
            map((products) => {

                const product = products.find(item => item.id === id) || null;

                this._product.next(product);

                return product;
            }),
            switchMap((product) => {

                if (!product) {
                    return throwError('Could not found product with id of ' + id + '!');
                }

                return of(product);
            })
        );
    }

    createProduct(): Observable<any> {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.post<any>('api/apps/ecommerce/inventory/product', {}).pipe(
                map((newProduct) => {

                    this._products.next([newProduct, ...products]);

                    return newProduct;
                })
            ))
        );
    }

    updateProduct(id: string, product: any): Observable<any> {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.patch<any>('api/apps/ecommerce/inventory/product', {
                id,
                product
            }).pipe(
                map((updatedProduct) => {

                    const index = products.findIndex(item => item.id === id);

                    products[index] = updatedProduct;

                    this._products.next(products);

                    return updatedProduct;
                }),
                switchMap(updatedProduct => this.product$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        this._product.next(updatedProduct);

                        return updatedProduct;
                    })
                ))
            ))
        );
    }

    deleteProduct(id: string): Observable<boolean> {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete('api/apps/ecommerce/inventory/product', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    const index = products.findIndex(item => item.id === id);

                    products.splice(index, 1);

                    this._products.next(products);

                    return isDeleted;
                })
            ))
        );
    }

    getTags(): Observable<any[]> {
        return this._httpClient.get<any[]>('api/apps/ecommerce/inventory/tags').pipe(
            tap((tags) => {
                this._tags.next(tags);
            })
        );
    }

    createTag(tag: any): Observable<any> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<any>('api/apps/ecommerce/inventory/tag', { tag }).pipe(
                map((newTag) => {

                    this._tags.next([...tags, newTag]);

                    return newTag;
                })
            ))
        );
    }

    updateTag(id: string, tag: any): Observable<any> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<any>('api/apps/ecommerce/inventory/tag', {
                id,
                tag
            }).pipe(
                map((updatedTag) => {

                    const index = tags.findIndex(item => item.id === id);

                    tags[index] = updatedTag;

                    this._tags.next(tags);

                    return updatedTag;
                })
            ))
        );
    }

    deleteTag(id: string): Observable<boolean> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/ecommerce/inventory/tag', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    const index = tags.findIndex(item => item.id === id);

                    tags.splice(index, 1);

                    this._tags.next(tags);

                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.products$.pipe(
                    take(1),
                    map((products) => {

                        products.forEach((product) => {

                            const tagIndex = product.tags.findIndex(tag => tag === id);

                            if (tagIndex > -1) {
                                product.tags.splice(tagIndex, 1);
                            }
                        });

                        return isDeleted;
                    })
                ))
            ))
        );
    }

    getVendors(): Observable<any[]> {
        return this._httpClient.get<any[]>('api/apps/ecommerce/inventory/vendors').pipe(
            tap((vendors) => {
                this._vendors.next(vendors);
            })
        );
    }
}
