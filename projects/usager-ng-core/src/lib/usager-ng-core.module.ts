import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InfosanteNgCoreModule } from 'projects/infosante-ng-core/src/public-api';
import { InfosocialNgCoreModule } from 'projects/infosocial-ng-core/src/public-api';
import { MsssServicesModule } from 'projects/sigct-service-ng-lib/src/lib/msss-services.module';
import { MsssUiModule } from 'projects/sigct-ui-ng-lib/src/lib/msss-ui.module';
import { AjouterEnregistrementUsagerContainerComponent, ConsulterEnregistrementUsagerContainerComponent, ConsulterUsagerContainerComponent, EditerUsagerContainerComponent, EnregistrementsUsagerContainerComponent, RapportFusionUsagerContainerComponent, RechercheUsagerContainerComponent } from './components/containers';
import { AppelsAnterieursUsagerContainerComponent } from './components/containers/appels-anterieurs/appels-anterieurs-usager-container.component';
import { ConsulterAlertesFicheAppelUsagerContainerComponent } from './components/containers/consulter-alertes-fiche-appel-usager/consulter-alertes-fiche-appel-usager-container.component';
import { ConsulterAlertesUsagerContainerComponent } from './components/containers/consulter-alertes-usager/consulter-alertes-usager-container.component';
import { ConsulterAppelAnterieurUsagerContainerComponent } from './components/containers/consulter-appel-anterieur-usager/consulter-appel-anterieur-usager-container.component';
import { FusionnerUsagerContainerComponent } from './components/containers/fusionner-usager/fusionner-usager-container.component';
import { ListeDesEnregistrementsContainerComponent } from './components/containers/liste-des-enregistrements-container/liste-des-enregistrements-container.component';
import { SuiviEtatEnregistramentContainerComponent } from './components/containers/suivi-etat-enregistrament-container/suivi-etat-enregistrament-container.component';
import { AddAddressFromLinkedUsagerComponent } from './components/ui/add-address-from-linked-usager/add-address-from-linked-usager.component';
import { AddCommunicationFromLinkedUsagerComponent } from './components/ui/add-communication-from-linked-usager/add-communication-from-linked-usager.component';
import { AppelsAnterieursUsagerUiComponent } from './components/ui/appels-anterieurs-usager-ui/appels-anterieurs-usager-ui.component';
import { ConsultationAutresInformationsComponent } from './components/ui/consultation-autres-informations/consultation-autres-informations.component';
import { ConsultationDatesComponent } from './components/ui/consultation-dates/consultation-dates.component';
import { ConsultationInformationsGeneralesComponent } from './components/ui/consultation-informations-generales/consultation-informations-generales.component';
import { ConsultationMedicationsComponent } from './components/ui/consultation-medications/consultation-medications.component';
import { ConsultationMesuresSecuriteComponent } from './components/ui/consultation-mesures-securite/consultation-mesures-securite.component';
import { ConsultationOrganismesEnregistrementComponent } from './components/ui/consultation-organismes-enregistrement/consultation-organismes-enregistrement.component';
import { ConsultationRessourcesProfessionnellesComponent } from './components/ui/consultation-ressources-professionnelles/consultation-ressources-professionnelles.component';
import { ConsultationSoinsServicesComponent } from './components/ui/consultation-soins-services/consultation-soins-services.component';
import { ConsulterAlertesUiComponent } from './components/ui/consulter-alertes-ui/consulter-alertes-ui.component';
import { ConsulterUiComponent } from './components/ui/consulter-ui-component/consulter-ui-component.component';
import { DatesEnregistrementUiComponent } from './components/ui/dates-enregistrement-ui/dates-enregistrement-ui.component';
import { FusionCommunicationsUsagerPopupComponent } from './components/ui/fusion-communications-usager-ui/fusion-communications-usager-popup/fusion-communications-usager-popup.component';
import { FusionCommunicationsUsagerComponent } from './components/ui/fusion-communications-usager-ui/fusion-communications-usager-ui.component';
import { FusionLieuxResidenceUsagerPopupComponent } from './components/ui/fusion-lieux-residence-usager-ui/fusion-lieux-residence-usager-popup/fusion-lieux-residence-usager-popup.component';
import { FusionLieuxResidenceUsagerComponent } from './components/ui/fusion-lieux-residence-usager-ui/fusion-lieux-residence-usager-ui.component';
import { IndicateursMesureSecuriteComponent } from './components/ui/indicateurs-mesure-securite/indicateurs-mesure-securite.component';
import { ListeDesEnregistrementsUiComponent } from './components/ui/liste-des-enregistrements-ui/liste-des-enregistrements-ui.component';
import { MedicationsEnregistrementUsagerUiComponent } from './components/ui/medications-enregistrement-usager-ui/medications-enregistrement-usager-ui.component';
import { OrganismesEnregistrementUsagerComponent } from './components/ui/organismes-enregistrement-usager/organismes-enregistrement-usager.component';
import { PopupImportCommAddrssLinkedUsagerComponent } from './components/ui/popup-import-comm-addrss-linked-usager/popup-import-comm-addrss-linked-usager.component';
import { PopupOrganismeEnregistrementUsagerUiComponent } from './components/ui/popup-organisme-enregistrement-usager-ui/popup-organisme-enregistrement-usager-ui.component';
import { RessourcesProSocialesUsagerUiComponent } from './components/ui/ressources-pro-sociales-usager-ui/ressources-pro-sociales-usager-ui.component';
import { SoinsServiceUiComponent } from './components/ui/soins-service-ui/soins-service-ui.component';
import { SuiviEtatEnregistrementUiComponent } from './components/ui/suivi-etat-enregistrement-ui/suivi-etat-enregistrement-ui.component';
import { AdressesUsagerComponent, CommunicationUsagerComponent, DialogueUsagerComponent, EnregistrementsUsagerUiComponent, IdentificationUsagerComponent, InformationsSuppUsagerComponent, RechercheUsagerUiComponent } from './components/uis';

@NgModule({
  declarations: [
    EditerUsagerContainerComponent,
    ConsulterUsagerContainerComponent,
    RechercheUsagerContainerComponent,
    SuiviEtatEnregistramentContainerComponent,
    ListeDesEnregistrementsContainerComponent,
    EnregistrementsUsagerContainerComponent,
    CommunicationUsagerComponent,
    DialogueUsagerComponent,
    AdressesUsagerComponent,
    InformationsSuppUsagerComponent,
    IdentificationUsagerComponent,
    ConsulterUiComponent,
    RechercheUsagerUiComponent,
    SuiviEtatEnregistrementUiComponent,
    ListeDesEnregistrementsUiComponent,
    EnregistrementsUsagerUiComponent,
    AjouterEnregistrementUsagerContainerComponent,
    DatesEnregistrementUiComponent,
    RessourcesProSocialesUsagerUiComponent,
    OrganismesEnregistrementUsagerComponent,
    IndicateursMesureSecuriteComponent,
    MedicationsEnregistrementUsagerUiComponent,
    SoinsServiceUiComponent,
    PopupOrganismeEnregistrementUsagerUiComponent,
    ConsulterEnregistrementUsagerContainerComponent,
    ConsultationOrganismesEnregistrementComponent,
    ConsultationInformationsGeneralesComponent,
    ConsultationDatesComponent,
    ConsultationRessourcesProfessionnellesComponent,
    ConsultationSoinsServicesComponent,
    ConsultationMesuresSecuriteComponent,
    AppelsAnterieursUsagerContainerComponent,
    AppelsAnterieursUsagerUiComponent,
    ConsultationMedicationsComponent,
    ConsulterAppelAnterieurUsagerContainerComponent,
    ConsultationAutresInformationsComponent,
    ConsulterAlertesUsagerContainerComponent,
    ConsulterAlertesUiComponent,
    ConsulterAlertesFicheAppelUsagerContainerComponent,
    FusionnerUsagerContainerComponent,
    FusionCommunicationsUsagerComponent,
    FusionCommunicationsUsagerPopupComponent,
    FusionLieuxResidenceUsagerComponent,
    FusionLieuxResidenceUsagerPopupComponent,
    RapportFusionUsagerContainerComponent,
    AddCommunicationFromLinkedUsagerComponent,
    PopupImportCommAddrssLinkedUsagerComponent,
    AddAddressFromLinkedUsagerComponent,
  ],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    TranslateModule.forChild(),
    FormsModule,
    MsssUiModule,
    FormsModule,
    MsssServicesModule,
    MatToolbarModule,
    InfosanteNgCoreModule,
    InfosocialNgCoreModule,
  ],
  exports: [
    EditerUsagerContainerComponent,
    ConsulterUsagerContainerComponent,
    RechercheUsagerContainerComponent,
    SuiviEtatEnregistramentContainerComponent,
    ListeDesEnregistrementsContainerComponent,
    EnregistrementsUsagerContainerComponent,
    AjouterEnregistrementUsagerContainerComponent,
    ConsulterEnregistrementUsagerContainerComponent,
    AppelsAnterieursUsagerContainerComponent,
    ConsulterAppelAnterieurUsagerContainerComponent,
    ConsulterAlertesUsagerContainerComponent,
    ConsulterAlertesFicheAppelUsagerContainerComponent,
    FusionnerUsagerContainerComponent,
    RapportFusionUsagerContainerComponent,
  ],
  entryComponents: [DialogueUsagerComponent]
})

export class UsagerNgCoreModule {

}



