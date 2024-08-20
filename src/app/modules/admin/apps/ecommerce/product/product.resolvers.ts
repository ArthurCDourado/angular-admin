import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ProductService } from 'app/modules/admin/apps/ecommerce/product/product.service';

@Injectable({
    providedIn: 'root'
})
export class InventoryBrandsResolver implements Resolve<any> {
    constructor(private _inventoryService: ProductService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._inventoryService.getBrands();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryCategoriesResolver implements Resolve<any> {
    constructor(private _inventoryService: ProductService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._inventoryService.getCategories();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryProductResolver implements Resolve<any> {
    constructor(
        private _inventoryService: ProductService,
        private _router: Router
    ) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._inventoryService.getProductById(route.paramMap.get('id'))
            .pipe(
                catchError((error) => {

                    console.error(error);

                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    this._router.navigateByUrl(parentUrl);

                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryProductsResolver implements Resolve<any> {
    constructor(private _inventoryService: ProductService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: any; products: any[] }> {
        return this._inventoryService.getProducts();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryTagsResolver implements Resolve<any> {
    constructor(private _inventoryService: ProductService) {
    }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._inventoryService.getTags();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryVendorsResolver implements Resolve<any> {
    constructor(private _inventoryService: ProductService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._inventoryService.getVendors();
    }
}
