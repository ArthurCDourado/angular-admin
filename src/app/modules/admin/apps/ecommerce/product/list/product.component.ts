import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ProductService } from 'app/modules/admin/apps/ecommerce/product/product.service';

@Component({
    selector: 'product-list',
    templateUrl: './product.component.html',
    styles: [
        `
            .inventory-grid {
                grid-template-columns: 48px auto 40px;

                @screen sm {
                    grid-template-columns: 48px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 48px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 48px 112px auto 112px 96px 96px 72px;
                }
            }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    products$: Observable<any[]>;

    brands: any[];
    categories: any[];
    filteredTags: any[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: any;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedProduct: any | null = null;
    selectedProductForm: UntypedFormGroup;
    tags: any[];
    tagsEditMode: boolean = false;
    vendors: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _productService: ProductService
    ) {
    }
    ngOnInit(): void {
        this.selectedProductForm = this._formBuilder.group({
            id: [''],
            category: [''],
            name: ['', [Validators.required]],
            description: [''],
            tags: [[]],
            sku: [''],
            barcode: [''],
            brand: [''],
            vendor: [''],
            stock: [''],
            reserved: [''],
            cost: [''],
            basePrice: [''],
            taxPercent: [''],
            price: [''],
            weight: [''],
            thumbnail: [''],
            images: [[]],
            currentImageIndex: [0],
            active: [false]
        });

        this._productService.brands$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((brands: any[]) => {

                this.brands = brands;

                this._changeDetectorRef.markForCheck();
            });

        this._productService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: any[]) => {

                this.categories = categories;

                this._changeDetectorRef.markForCheck();
            });

        this._productService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {

                this.pagination = pagination;

                this._changeDetectorRef.markForCheck();
            });

        this.products$ = this._productService.products$;

        this._productService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: any[]) => {

                this.tags = tags;
                this.filteredTags = tags;

                this._changeDetectorRef.markForCheck();
            });

        this._productService.vendors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vendors: any[]) => {

                this.vendors = vendors;

                this._changeDetectorRef.markForCheck();
            });

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._productService.getProducts(0, 10, 'name', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true
            });

            this._changeDetectorRef.markForCheck();

            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;

                    this.closeDetails();
                });

            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._productService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleDetails(productId: string): void {
        if (this.selectedProduct && this.selectedProduct.id === productId) {
            this.closeDetails();
            return;
        }

        this._productService.getProductById(productId)
            .subscribe((product) => {

                this.selectedProduct = product;

                this.selectedProductForm.patchValue(product);

                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetails(): void {
        this.selectedProduct = null;
    }

    cycleImages(forward: boolean = true): void {
        const count = this.selectedProductForm.get('images').value.length;
        const currentIndex = this.selectedProductForm.get('currentImageIndex').value;

        const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
        const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

        if (forward) {
            this.selectedProductForm.get('currentImageIndex').setValue(nextIndex);
        }
        else {
            this.selectedProductForm.get('currentImageIndex').setValue(prevIndex);
        }
    }

    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    filterTags(event): void {
        const value = event.target.value.toLowerCase();

        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }

    filterTagsInputKeyDown(event): void {
        if (event.key !== 'Enter') {
            return;
        }

        if (this.filteredTags.length === 0) {
            this.createTag(event.target.value);

            event.target.value = '';

            return;
        }

        const tag = this.filteredTags[0];
        const isTagApplied = this.selectedProduct.tags.find(id => id === tag.id);

        if (isTagApplied) {
            this.removeTagFromProduct(tag);
        }
        else {
            this.addTagToProduct(tag);
        }
    }

    createTag(title: string): void {
        const tag = {
            title
        };

        this._productService.createTag(tag)
            .subscribe((response) => {

                this.addTagToProduct(response);
            });
    }

    updateTagTitle(tag: any, event): void {
        tag.title = event.target.value;

        this._productService.updateTag(tag.id, tag)
            .pipe(debounceTime(300))
            .subscribe();

        this._changeDetectorRef.markForCheck();
    }

    deleteTag(tag: any): void {
        this._productService.deleteTag(tag.id).subscribe();

        this._changeDetectorRef.markForCheck();
    }

    addTagToProduct(tag: any): void {
        this.selectedProduct.tags.unshift(tag.id);

        this.selectedProductForm.get('tags').patchValue(this.selectedProduct.tags);

        this._changeDetectorRef.markForCheck();
    }

    removeTagFromProduct(tag: any): void {
        this.selectedProduct.tags.splice(this.selectedProduct.tags.findIndex(item => item === tag.id), 1);

        this.selectedProductForm.get('tags').patchValue(this.selectedProduct.tags);

        this._changeDetectorRef.markForCheck();
    }

    toggleProductTag(tag: any, change: MatCheckboxChange): void {
        if (change.checked) {
            this.addTagToProduct(tag);
        }
        else {
            this.removeTagFromProduct(tag);
        }
    }

    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

    createProduct(): void {
        this._productService.createProduct().subscribe((newProduct) => {

            this.selectedProduct = newProduct;

            this.selectedProductForm.patchValue(newProduct);

            this._changeDetectorRef.markForCheck();
        });
    }

    updateSelectedProduct(): void {
        const product = this.selectedProductForm.getRawValue();

        delete product.currentImageIndex;

        this._productService.updateProduct(product.id, product).subscribe(() => {

            this.showFlashMessage('success');
        });
    }

    deleteSelectedProduct(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Excluir produto',
            message: 'Você tem certeza que deseja excluir esse produto? Essa ação não poderá ser desfeita!',
            actions: {
                confirm: {
                    label: 'Excluir'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {

            if (result === 'confirmed') {

                const product = this.selectedProductForm.getRawValue();

                this._productService.deleteProduct(product.id).subscribe(() => {

                    this.closeDetails();
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
