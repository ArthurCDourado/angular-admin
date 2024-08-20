import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { CategoryService } from 'app/modules/admin/apps/ecommerce/category/category.service';

// @Injectable({
//     providedIn: 'root'
// })
// export class CategoryResolver implements Resolve<any> {
//     constructor(
//         private _categoryService: CategoryService,
//         private _router: Router
//     ) {
//     }

//     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
//         return this._categoryService.getCategoryById(route.paramMap.get('id'))
//             .pipe(
//                 catchError((error) => {

//                     console.error(error);

//                     const parentUrl = state.url.split('/').slice(0, -1).join('/');

//                     this._router.navigateByUrl(parentUrl);

//                     return throwError(error);
//                 })
//             );
//     }
// }

@Injectable({
    providedIn: 'root'
})
export class CategoryResolver implements Resolve<any> {
    constructor(private _categoryService: CategoryService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._categoryService.getCategories();
    }
}
