import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private _categories: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _category: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {
    }

    get category$(): Observable<any> {
        return this._category.asObservable();
    }

    get categories$(): Observable<any[]> {
        return this._categories.asObservable();
    }

    getCategories(): Observable<any[]> {
        return this._httpClient.get<any[]>('api/apps/ecommerce/inventory/categories').pipe(
            tap((categories) => {
                this._categories.next(categories);
            })
        );
    }

    getCategoryById(id: string): Observable<any> {
        return this._categories.pipe(
            take(1),
            map((categories) => {

                const category = categories.find(item => item.id === id) || null;

                this._category.next(category);

                return category;
            }),
            switchMap((product) => {

                if (!product) {
                    return throwError('Could not found category with id of ' + id + '!');
                }

                return of(product);
            })
        );
    }

    createCategory(category: any): Observable<any> {
        return this.categories$.pipe(
            take(1),
            switchMap(categories => this._httpClient.post<any>('api/apps/ecommerce/inventory/category', category).pipe(
                map((newCategory) => {

                    this._categories.next([newCategory, ...categories]);

                    return newCategory;
                })
            ))
        );
    }

    updateCategory(id: string, category: any): Observable<any> {
        return this.categories$.pipe(
            take(1),
            switchMap(categories => this._httpClient.patch<any>('api/apps/ecommerce/inventory/category', {
                id,
                category
            }).pipe(
                map((updatedCategory) => {

                    const index = categories.findIndex(item => item.id === id);

                    categories[index] = updatedCategory;

                    this._categories.next(categories);

                    return updatedCategory;
                }),
                switchMap(updatedCategory => this.category$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        this._category.next(updatedCategory);

                        return updatedCategory;
                    })
                ))
            ))
        );
    }

    deleteCategory(id: string): Observable<boolean> {
        return this.categories$.pipe(
            take(1),
            switchMap(categories => this._httpClient.delete('api/apps/ecommerce/inventory/category', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    const index = categories.findIndex(item => item.id === id);

                    categories.splice(index, 1);

                    this._categories.next(categories);

                    return isDeleted;
                })
            ))
        );
    }

}
