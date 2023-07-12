import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'projects/sigct-service-ng-lib/src/lib/auth/auth-guard.service';
import { RechercherIsiswPageComponent } from './components/pages';
import { ConsulterIsiswPageComponent } from './components/pages/consulter-isisw-page/consulter-isisw-page.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/rechercher',
  },
  {
    path: 'rechercher',
    component: RechercherIsiswPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_RECH_ISISW', 'ROLE_SA_APPEL_RECH_ISISW_TOUS', 'ROLE_SO_APPEL_RECH_ISISW', 'ROLE_SO_APPEL_RECH_ISISW_TOUS']
    },
  },
  {
    path: 'consulter/:idAppel',
    component: ConsulterIsiswPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_RECH_ISISW', 'ROLE_SA_APPEL_RECH_ISISW_TOUS', 'ROLE_SO_APPEL_RECH_ISISW', 'ROLE_SO_APPEL_RECH_ISISW_TOUS']
    },
  },
  {
    path: '**',
    redirectTo: '/rechercher'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes
    //  , { enableTracing: true } // <-- pour debugger seulement
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
