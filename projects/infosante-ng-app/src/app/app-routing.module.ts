import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppLayout } from './modules/fiche-appel/components/layouts/app-layout/app-layout.component'
import { AuthGuardService } from 'projects/sigct-service-ng-lib/src/lib/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    canActivate: [AuthGuardService],
    children: [
      { path: '', loadChildren: () => import('./modules/fiche-appel/fiche-appel.module').then(m => m.FicheAppelModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes
    // , { enableTracing: true } // <-- pour debugger seulement
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }