import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'projects/sigct-service-ng-lib/src/lib/auth/auth-guard.service';
import { PiloterTableReferenceContentEnConsultationComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-en-consultation/piloter-table-reference-content-en-consultation.component';
import { PiloterTableReferenceContentItemEnAjoutComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-item-en-ajout/piloter-table-reference-content-item-en-ajout.component';
import { PiloterTableReferenceContentItemEnModificationComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-item-en-modification/piloter-table-reference-content-item-en-modification.component';
import { PiloterTablesReferencesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-tables-references/piloter-tables-references.component';
import { SigctAboutComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-about/sigct-about.component';
import { AccesUsagerGuard } from 'projects/usager-ng-core/src/lib/guards/acces-usager.guard';
import { AjouterNoteComplementaireGuard } from 'projects/usager-ng-core/src/lib/guards/ajouter-note-complementaire.guard';
import { AutoSaveGuardService } from 'projects/usager-ng-core/src/lib/services/auto-save-guard.service';
import { AccesAppelAnterieurGuard } from '../../../usager-ng-core/src/lib/guards/acces-appel-anterieur.guard';
import { AccueilUsagerPageComponent, AjouterEnregistrementUsagerPageComponent, ConsulterEnregistrementUsagerPageComponent, ConsulterUsagerPageComponent, EditerUsagerPageComponent, EnregistrementsUsagerPageComponent, RapportFusionUsagerPageComponent, RechercherUsagerPageComponent } from './components/pages';
import { AppelsAnterieursUsagerPageComponent } from './components/pages/appels-anterieurs-usager-page/appels-anterieurs-usager-page.component';
import { ConsulterAlertesFicheAppelUsagerPageComponent } from './components/pages/consulter-alertes-fiche-appel-usager-page/consulter-alertes-fiche-appel-usager-page.component';
import { ConsulterAlertesUsagerPageComponent } from './components/pages/consulter-alertes-usager-page/consulter-alertes-usager-page.component';
import { ConsulterAppelAnterieurUsagerPageComponent } from './components/pages/consulter-appel-anterieur-usager-page/consulter-appel-anterieur-usager-page.component';
import { FusionnerUsagerPageComponent } from './components/pages/fusionner-usager-page/fusionner-usager-page.component';
import { ListeDesEnregistrementsPageComponent } from './components/pages/liste-des-enregistrements-page/liste-des-enregistrements-page.component';
import { RapportJournalisationPageComponent } from './components/pages/rapport-journalisation-page/rapport-journalisation-page.component';
import { SuiviEtatEnregistrementPageComponent } from './components/pages/suivi-etat-enregistrement-page/suivi-etat-enregistrement-page.component';
import { InformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/information-utile-page.component';
import { EditerInformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/editer-information-utile-page/editer-information-utile-page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'accueil',
  },
  {
    path: 'accueil',
    component: AccueilUsagerPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'piloter-tables-references',
    component: PiloterTablesReferencesComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_PILOTAGE']
    },
  },
  {
    path: 'piloter-info-utile-page',
    component: InformationUtilePageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_PILOTAGE']
    },
  },
  {
    path: 'info-utile-page/:id',
    component: EditerInformationUtilePageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_PILOTAGE']
    },
  },
  {
    path: 'consult-table-reference-content/:idTabRef',
    component: PiloterTableReferenceContentEnConsultationComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_PILOTAGE']
    },
  },
  {
    path: 'add-table-reference-content-item/:idTabRef/:nomTabRef',
    component: PiloterTableReferenceContentItemEnAjoutComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_PILOTAGE']
    },
  },
  {
    path: 'edit-table-reference-content-item/:idTabRef/:idTabRefItem',
    component: PiloterTableReferenceContentItemEnModificationComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_PILOTAGE']
    },
  },
  {
    path: ':idUsager/editer',
    component: EditerUsagerPageComponent,
    canActivate: [AuthGuardService, AccesUsagerGuard],
    canDeactivate: [AutoSaveGuardService]
  },
  {
    path: 'editer',
    component: EditerUsagerPageComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [AutoSaveGuardService]
  },
  {
    path: 'consulter',
    component: ConsulterUsagerPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':idUsager/consulter',
    component: ConsulterUsagerPageComponent,
    canActivate: [AuthGuardService, AccesUsagerGuard]
  },
  {
    path: 'recherche',
    component: RechercherUsagerPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'suivi-enregistrements',
    component: SuiviEtatEnregistrementPageComponent,
    canActivate: [AuthGuardService]
  },

  // TEMPORAIRE ROUTE
  {
    path: 'list-enregistrements',
    component: ListeDesEnregistrementsPageComponent,
    canActivate: [AuthGuardService]
  },
  //---

  {
    path: 'consulter-alertes',
    component: ConsulterAlertesUsagerPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':idUsager/alertes/fiche-appel/:domaine/:idFicheAppel/consulter',
    component: ConsulterAlertesFicheAppelUsagerPageComponent,
    canDeactivate: [AjouterNoteComplementaireGuard],
    canActivate: [AccesAppelAnterieurGuard, AccesUsagerGuard]
  },
  {
    path: ':idUsager/enregistrements',
    component: EnregistrementsUsagerPageComponent,
    canActivate: [AuthGuardService, AccesUsagerGuard]
  },
  {
    path: 'enregistrements',
    component: EnregistrementsUsagerPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':idUsager/enregistrement/generer',
    component: AjouterEnregistrementUsagerPageComponent,
    canActivate: [AuthGuardService, AccesUsagerGuard],
    data: {
      requiredRoles: ['ROLE_US_ENREGISTREMENT_AJOUT', 'ROLE_US_ENREGISTREMENT_AJOUT_TOUS']
    }
  },
  {
    path: 'enregistrement/generer',
    component: AjouterEnregistrementUsagerPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_ENREGISTREMENT_AJOUT', 'ROLE_US_ENREGISTREMENT_AJOUT_TOUS']
    }
  },
  {
    path: ':idUsager/enregistrement/:idEnregistrement/editer',
    component: AjouterEnregistrementUsagerPageComponent,
    canActivate: [AuthGuardService, AccesUsagerGuard],
    data: {
      requiredRoles: ['ROLE_US_ENREGISTREMENT_MODIF', 'ROLE_US_ENREGISTREMENT_MODIF_TOUS']
    }
  },
  {
    path: ':idUsager/enregistrement/:idEnregistrement/copier',
    component: AjouterEnregistrementUsagerPageComponent,
    canActivate: [AuthGuardService, AccesUsagerGuard],
    data: {
      requiredRoles: ['ROLE_US_ENREGISTREMENT_AJOUT', 'ROLE_US_ENREGISTREMENT_AJOUT_TOUS']
    }
  },
  {
    path: ':idUsager/enregistrement/:idEnregistrement/consulter',
    component: ConsulterEnregistrementUsagerPageComponent,
    canActivate: [AuthGuardService, AccesUsagerGuard],
    data: {
      requiredRoles: ['ROLE_US_ENREGISTREMENT_CONSULT', 'ROLE_US_ENREGISTREMENT_CONSULT_TOUS']
    }
  },
  {
    path: 'enregistrement/:idEnregistrement/consulter',
    component: ConsulterEnregistrementUsagerPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_ENREGISTREMENT_CONSULT', 'ROLE_US_ENREGISTREMENT_CONSULT_TOUS']
    }
  },
  {
    path: ':idUsager/fiches-anterieures',
    canActivate: [AuthGuardService, AccesUsagerGuard],
    children: [
      {
        path: "",
        pathMatch: "full",
        component: AppelsAnterieursUsagerPageComponent
      },
      {
        path: ':domaine/:idFicheAppel/consulter',
        component: ConsulterAppelAnterieurUsagerPageComponent,
        canDeactivate: [AjouterNoteComplementaireGuard],
        canActivate: [AccesAppelAnterieurGuard]
      },
      {
        path: '**',
        component: AppelsAnterieursUsagerPageComponent
      },
    ]
  },
  {
    path: 'fusionner/:idUsager1/:idUsager2',
    component: FusionnerUsagerPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_USAGER_FUSION']
    }
  },
  {
    path: 'rapport-fusion',
    component: RapportFusionUsagerPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_RAPPORT_FUSION', 'ROLE_US_RAPPORT_FUSION_PROV']
    },
  },
  {
    path: 'journal',
    component: RapportJournalisationPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_US_RAPPORT_AUD']
    }
  },
  {
    path: 'a-propos',
    component: SigctAboutComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: "**",
    redirectTo: '/accueil'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes
    //  , { enableTracing: true } // <-- pour debugger seulement
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
