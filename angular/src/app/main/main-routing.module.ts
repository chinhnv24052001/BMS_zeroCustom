import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
    imports: [
        RouterModule.forChild([
          {
            path: '',
            children: [
              {
                path: 'home',
                component: HomeComponent
              },
              {
                path: 'dashboard',
                component: DashboardComponent
              },
              { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
              { path: '**', redirectTo: 'dashboard' }
            ]
          }
        ])
      ],
    exports: [
        RouterModule
    ]
})
export class MainRoutingModule { }
