import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { debounceTime, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { CategoryService } from '../category.service';

@Component({
    selector: 'category-list',
    templateUrl: './category.component.html',
    styles: [
        `
            .inventory-grid {
                grid-template-columns: 600px 50px;

                @screen sm {
                    grid-template-columns: 600px 50px;
                }

                @screen md {
                    grid-template-columns: 600px 50px;
                }

                @screen lg {
                    grid-template-columns: 600px 50px;
                }
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class CategoryListComponent implements OnInit, AfterViewInit, OnDestroy {

    categories$: Observable<any[]>;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedCategory: any | null = null;
    selectedCategoryForm: UntypedFormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _categoryService: CategoryService
    ) {
    }

    ngOnInit(): void {
        this.selectedCategoryForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            parentId: [null],
            slug: ['', [Validators.required]],
        });

        this.categories$ = this._categoryService.categories$;

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._categoryService.getCategories();
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleDetails(categoryId: string): void {
        if (this.selectedCategory && this.selectedCategory.id === categoryId) {
            this.closeDetails();
            return;
        }

        this._categoryService.getCategoryById(categoryId)
            .subscribe((category) => {
                this.selectedCategory = category;
                this.selectedCategoryForm.patchValue(category);
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetails(): void {
        this.selectedCategory = null;
        this.selectedCategoryForm.reset();
    }

    createCategory(): void {
        let newCategory = this.selectedCategoryForm.getRawValue();
        this._categoryService.createCategory(newCategory).subscribe((createdCategory) => {
            this.selectedCategory = createdCategory;
            this.selectedCategoryForm.patchValue(createdCategory);
            this._changeDetectorRef.markForCheck();
            this.showFlashMessage('success');
        });
    }

    updateSelectedCategory(): void {
        const category = this.selectedCategoryForm.getRawValue();

        delete category.currentImageIndex;

        this._categoryService.updateCategory(category.id, category).subscribe(() => {
            this.showFlashMessage('success');
            // this._changeDetectorRef.markForCheck();
        });
    }

    deleteSelectedCategory(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir categoria',
            message: 'Você tem certeza que deseja excluir essa categoria? Essa ação não poderá ser desfeita!',
            actions: {
                confirm: {
                    label: 'Excluir'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                const category = this.selectedCategoryForm.getRawValue();
                this._categoryService.deleteCategory(category.id).subscribe(() => {
                    this.closeDetails();
                    this.showFlashMessage('success');
                    this._changeDetectorRef.markForCheck();
                });
            }
        });
    }

    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = null;
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
