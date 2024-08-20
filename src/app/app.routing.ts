import { Route } from '@angular/router';
import { InitialDataResolver } from 'app/app.resolvers';
import { LayoutComponent } from 'app/layout/layout.component';

export const appRoutes: Route[] = [
    {
        path: '',
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'apps', children: [
                    { path: 'ecommerce', loadChildren: () => import('app/modules/admin/apps/ecommerce/ecommerce.module').then(m => m.ECommerceModule) },

                ]
            },
            { path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module) },
            { path: '**', redirectTo: '404-not-found' }
        ]
    }
];
