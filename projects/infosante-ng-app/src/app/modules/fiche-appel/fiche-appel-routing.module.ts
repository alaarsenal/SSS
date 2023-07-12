import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'projects/sigct-service-ng-lib/src/lib/auth/auth-guard.service';
import { PiloterParametresSystemeEnModificationComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-parametres-systeme-en-modification/piloter-parametres-systeme-en-modification.component';
import { PiloterParametresSystemeComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-parametres-systeme/piloter-parametres-systeme.component';
import { PiloterTableReferenceContentEnConsultationComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-en-consultation/piloter-table-reference-content-en-consultation.component';
import { PiloterTableReferenceContentItemEnAjoutComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-item-en-ajout/piloter-table-reference-content-item-en-ajout.component';
import { PiloterTableReferenceContentItemEnModificationComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-item-en-modification/piloter-table-reference-content-item-en-modification.component';
import { PiloterTablesReferencesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-tables-references/piloter-tables-references.component';
import { RelancesPageComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/relances-page/relances-page.component';
import { SigctAboutComponent } from '../../../../../sigct-ui-ng-lib/src/lib/components/sigct-about/sigct-about.component';
import { EditerFicheAppelLayoutComponent } from '../fiche-appel/components/layouts/editer-fiche-appel/editer-fiche-appel-layout.component';
import { AccueilFicheAppelPageComponent, ConsultationFicheAppelAnterieurePageComponent, ConsultationFichePageComponent, DemandeEvaluationPageComponent, DetailUsagerPageComponent, FichesAppelNonTermineesPageComponent, FichiersAttachesPageComponent, InterventionFicheAppelPageComponent, ProtocolesPageComponent, RapportFusionUsagerPageComponent, RechercherFicheAppelPageComponent, SaisieDiffereeFicheAppelPageComponent, TerminaisonPageComponent } from "./components/pages";
import { CorrectionFicheAppelPageComponent } from './components/pages/correction-fiche-appel-page/correction-fiche-appel-page.component';
import { AvisPageComponent } from './components/pages/editer-fiche-appel/avis/avis-page.component';
import { JournalisationPageComponent } from './components/pages/journalisation-page/journalisation-page.component';
import { EditerInformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/editer-information-utile-page/editer-information-utile-page.component';
import { InformationUtilePageComponent } from './components/pages/pilotage/information-utile-page/information-utile-page.component';
import { UsaerenregistrementsPageComponent } from './components/pages/usaerenregistrements-page/usaerenregistrements-page.component';
import { AccesFicheAppelGuard } from './guards/acces-fiche-appel-guard';
import { ModifierFicheAppelGuard } from './guards/modifier-fiche-appel-guard';
import { AutoSaveGuardService } from './services/auto-save-guard.service';
import { ConsultSuppFicheGuard } from './services/consult-supp-fiche-guard';


const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: '/accueil'
  },
  {
    path: 'accueil',
    component: AccueilFicheAppelPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'journal',
    component: JournalisationPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_RAPPORT_AUD', 'ROLE_SA_RAPPORT_AUD_PROV']
    }
  },
  {
    path: 'usager/enregistrements/:action',
    component: UsaerenregistrementsPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'consulter/appel/:idAppel/fiche/:idFicheAppel',
    canActivate: [AuthGuardService, ConsultSuppFicheGuard, AccesFicheAppelGuard],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_CONSULT']
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        canDeactivate: [AutoSaveGuardService],
        component: ConsultationFicheAppelAnterieurePageComponent,
      },
      {
        path: "**",
        component: ConsultationFicheAppelAnterieurePageComponent,
      }
    ]
  },
  {
    path: 'corriger/appel/:idAppel/fiche/:idFicheAppel',
    component: CorrectionFicheAppelPageComponent,
    canDeactivate: [AutoSaveGuardService],
    canActivate: [AuthGuardService]
  },
  {
    path: 'editer/appel/:idAppel',
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_MODIF', 'ROLE_SA_SAISIE_DIFFEREE']
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        component: EditerFicheAppelLayoutComponent,
        canActivate: [AuthGuardService]
      },
      {
        path: 'fiche/:idFicheAppel',
        component: EditerFicheAppelLayoutComponent,
        canActivate: [AuthGuardService, ModifierFicheAppelGuard],
        children: [
          {
            path: "",
            pathMatch: "full",
            component: ConsultationFichePageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "consultation",
            component: ConsultationFichePageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "evaluation",
            component: DemandeEvaluationPageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "usager",
            component: DetailUsagerPageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "protocoles",
            component: ProtocolesPageComponent,
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "avis",
            component: AvisPageComponent,
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "intervention",
            component: InterventionFicheAppelPageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "fichiers",
            component: FichiersAttachesPageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "terminaison",
            component: TerminaisonPageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "saisie-differee",
            component: SaisieDiffereeFicheAppelPageComponent,
            canDeactivate: [AutoSaveGuardService],
            canActivate: [ConsultSuppFicheGuard],
          },
          {
            path: "**",
            component: ConsultationFichePageComponent,
          }]
      },
      {
        path: "**",
        component: EditerFicheAppelLayoutComponent,
        canActivate: [AuthGuardService]
      }]
  },
  {
    path: 'relances-a-realiser',
    component: RelancesPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_RELANCE', 'ROLE_SA_APPEL_RELANCE_TOUS']
    },
  },
  {
    path: 'fichesAppel-non-terminees',
    component: FichesAppelNonTermineesPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_MODIF', 'ROLE_SA_SAISIE_DIFFEREE']
    },
  },
  {
    path: 'rechercher',
    component: RechercherFicheAppelPageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_RECH']
    },
  },
  {
    path: 'a-propos',
    component: SigctAboutComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'piloter-tables-references',
    component: PiloterTablesReferencesComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
  },
  {
    path: 'consult-table-reference-content/:idTabRef',
    component: PiloterTableReferenceContentEnConsultationComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
  },
  {
    path: 'edit-table-reference-content-item/:idTabRef/:idTabRefItem',
    component: PiloterTableReferenceContentItemEnModificationComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
  },
  {
    path: 'add-table-reference-content-item/:idTabRef/:nomTabRef',
    component: PiloterTableReferenceContentItemEnAjoutComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
  },
  {
    path: 'piloter-params-systeme',
    component: PiloterParametresSystemeComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
  },
  {
    path: 'piloter-info-utile-page',
    component: InformationUtilePageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
  },
  {
    path: 'info-utile-page/:id',
    component: EditerInformationUtilePageComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
  },
  {
    path: 'editer-params-systeme/:codeParamSystm',
    component: PiloterParametresSystemeEnModificationComponent,
    canActivate: [AuthGuardService],
    data: {
      requiredRoles: ['ROLE_SA_APPEL_PILOTAGE']
    },
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
    path: "**",
    redirectTo: '/accueil'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FicheAppelRoutingModule { }
