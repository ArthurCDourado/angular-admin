import { NgModule } from '@angular/core';
import { LayoutComponent } from 'app/layout/layout.component';
import { ClassyLayoutModule } from 'app/layout/layouts/vertical/classy/classy.module';
import { SharedModule } from 'app/shared/shared.module';

const layoutModules = [
    ClassyLayoutModule,
];

@NgModule({
    declarations: [
        LayoutComponent
    ],
    imports: [
        SharedModule,
        ...layoutModules
    ],
    exports: [
        LayoutComponent,
        ...layoutModules
    ]
})
export class LayoutModule {
}
