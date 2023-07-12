import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NotificationService } from 'projects/sigct-service-ng-lib/src/lib/services/notification/notification.service';
import { ConsultationFichiersComponent } from 'projects/usager-ng-core/src/lib/components/ui/consultation-fichiers/consultation-fichiers.component';
import { JournalisationAccesUsagerComponent } from 'projects/usager-ng-core/src/lib/components/ui/journalisation-acces-usager/journalisation-acces-usager.component';
import { ActionLinkComponent } from './components/action-link/action-link.component';
import { BandeFlottanteComponent } from './components/bande-flottante/bande-flottante.component';
import { BienvenueTopBarComponent } from './components/bienvenue-top-bar/bienvenue-top-bar.component';
import { BoutonModuleGardeComponent } from './components/bouton-module-garde/bouton-module-garde.component';
import { BoutonRadioCouleurComponent } from './components/bouton-radio-couleur/bouton-radio-couleur-component';
import { CadreTextFieldsetComponent } from './components/cadre-text-fieldset/cadre-text-fieldset.component';
import { CadreTextComponent } from './components/cadre-text/cadre-text.component';
import { CkeditorComponent } from './components/ckeditor/ckeditor.component';
import { ConsultationFicheSectionAppelantComponent } from './components/consultation-fiche-section-appelant/consultation-fiche-section-appelant.component';
import { ConsultationFicheSectionFichiersComponent } from './components/consultation-fiche-section-fichiers/consultation-fiche-section-fichiers.component';
import { ConsultationFicheSectionIdentifiantComponent } from './components/consultation-fiche-section-identifiant/consultation-fiche-section-identifiant.component';
import { ConsultationFicheSectionNoteComplComponent } from './components/consultation-fiche-section-note-compl/consultation-fiche-section-note-compl.component';
import { ConsultationFicheSectionRelanceComponent } from './components/consultation-fiche-section-relance/consultation-fiche-section-relance.component';
import { ConsultationFicheSectionSignatureComponent } from './components/consultation-fiche-section-signature/consultation-fiche-section-signature.component';
import { ConsultationFicheSectionSuiteInterventionComponent } from './components/consultation-fiche-section-suite-intervention/consultation-fiche-section-suite-intervention.component';
import { ConsultationFicheSectionTerminaisonDureeFicheComponent } from './components/consultation-fiche-section-terminaison-duree-fiche/consultation-fiche-section-terminaison-duree-fiche.component';
import { ConsultationFicheSectionTerminaisonInteractionComponent } from './components/consultation-fiche-section-terminaison-interaction/consultation-fiche-section-terminaison-interaction.component';
import { ConsultationFicheSectionTerminaisonResumeInterventionComponent } from './components/consultation-fiche-section-terminaison-resume-intervention/consultation-fiche-section-terminaison-resume-intervention.component';
import { ConsultationFicheSectionTerminaisonServicesUtiliseesComponent } from './components/consultation-fiche-section-terminaison-services-utilisees/consultation-fiche-section-terminaison-services-utilisees.component';
import { ConsultationFicheSectionTerminaisonComponent } from './components/consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.component';
import { ConsultationFicheSectionUsagerAdresseComponent } from './components/consultation-fiche-section-usager-adresse/consultation-fiche-section-usager-adresse.component';
import { ConsultationFicheSectionUsagerCommunicationComponent } from './components/consultation-fiche-section-usager-communication/consultation-fiche-section-usager-communication.component';
import { ConsultationFicheSectionUsagerIdentificationComponent } from './components/consultation-fiche-section-usager-identification/consultation-fiche-section-usager-identification.component';
import { ConsultationFicheSectionUsagerInformationsSuppComponent } from './components/consultation-fiche-section-usager-informations-supp/consultation-fiche-section-usager-informations-supp.component';
import { ConsultationFicheSectionUsagerComponent } from './components/consultation-fiche-section-usager/consultation-fiche-section-usager.component';
import { ConsultationJournalMessageCtiComponent } from './components/consultation-journal-message-cti/consultation-journal-message-cti.component';
import { ConsultationJournalUtilisateurComponent } from './components/consultation-journal-utilisateur/consultation-journal-utilisateur.component';
import { ConsultationJournalComponent } from './components/consultation-journal/consultation-journal.component';
import { CtiAideSaisieComponent } from './components/cti-aide-saisie/cti-aide-saisie.component';
import { DisplayVerticalListByTitleComponent } from './components/display-vertical-list-by-title/display-vertical-list-by-title.component';
import { DureeFicheAppelComponent } from './components/duree-fiche-appel/duree-fiche-appel/duree-fiche-appel.component';
import { EditerFichiersAttachesComponent } from './components/editer-fichiers-attaches/editer-fichiers-attaches.component';
import { EditionListeEntiteComponent } from './components/edition-liste-entite/edition-liste-entite.component';
import { FichesAppelNonTermineesComponent } from './components/fiches-appel-non-terminees/fiches-appel-non-terminees.component';
import { FormTopBarComponent } from './components/form-top-bar/form-top-bar.component';
import { GestionnaireDeFichiersComponent } from './components/gestionnaire-de-fichiers/gestionnaire-de-fichiers.component';
import { GriseAutomatiqueSelonTypeInterventionComponent } from './components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { IndicateursFinInterventionComponent } from './components/indicateurs-fin-intervention/indicateurs-fin-intervention.component';
import { InputCheckboxComponent } from './components/input-checkbox/input-checkbox.component';
import { InputRadioComponent } from './components/input-radio/input-radio.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { InputTextAreaComponent } from './components/input-textarea/input-textarea.component';
import { InteractionTerminaisonComponent } from './components/interaction-terminaison/interaction-terminaison.component';
import { JournalisationsComponent } from './components/journalisations/journalisations.component';
import { LienRrssPdfComponent } from './components/lien-rrss-pdf/lien-rrss-pdf.component';
import { ListInfoActionComponent } from './components/list-info-action/list-info-action.component';
import { ListInfoAffichageComponent } from './components/list-info-affichage/list-info-affichage.component';
import { ListeRelancesComponent } from './components/liste-relances/liste-relances.component';
import { ManagerFilesBatchComponent } from './components/manager-files-batch/manager-files-batch.component';
import { LeftMenuComponent } from './components/menus/left-menu/left-menu.component';
import { TopMenuComponent } from './components/menus/top-menu/top-menu.component';
import { ModalConfirmationDialogComponent } from './components/modal-confirmation-dialog/modal-confirmation-dialog.component';
import { MssModalComponent } from './components/modal-dialog/modal-dialog.component';
import { MsssM10AdresseAutocompleteComponent } from './components/msss-m10/components/msss-m10-adresse-autocomplete/msss-m10-adresse-autocomplete.component';
import { MsssM10CodePostalAutocompleteComponent } from './components/msss-m10/components/msss-m10-code-postal-autocomplete/msss-m10-code-postal-autocomplete.component';
import { MsssM10MunicipaliteAutocompleteComponent } from './components/msss-m10/components/msss-m10-municipalite-autocomplete/msss-m10-municipalite-autocomplete.component';
import { NoteComplementaireComponent } from './components/note-complementaire/note-complementaire.component';
import { OngletsComponent } from './components/onglets/onglets.component';
import { OutputMultiselectTextComponent } from './components/output-multiselect-text/output-multiselect-text.component';
import { PiloterInformationsUtilesComponent } from './components/piloter-informations-utiles/piloter-informations-utiles.component';
import { PiloterParametresSystemeEnModificationComponent } from './components/piloter-parametres-systeme-en-modification/piloter-parametres-systeme-en-modification.component';
import { PiloterParametresSystemeSectionCriteresRechercheComponent } from './components/piloter-parametres-systeme-section-criteres-recherche/piloter-parametres-systeme-section-criteres-recherche.component';
import { PiloterParametresSystemeComponent } from './components/piloter-parametres-systeme/piloter-parametres-systeme.component';
import { PiloterTableInformationsUtilesComponent } from './components/piloter-table-informations-utiles/piloter-table-informations-utiles.component';
import { PiloterTableReferenceContentEnConsultationComponent } from './components/piloter-table-reference-content-en-consultation/piloter-table-reference-content-en-consultation.component';
import { PiloterTableReferenceContentItemAjoutModificationInterfaceComponent } from './components/piloter-table-reference-content-item-ajout-modification-interface/piloter-table-reference-content-item-ajout-modification-interface.component';
import { PiloterTableReferenceContentItemEnAjoutComponent } from './components/piloter-table-reference-content-item-en-ajout/piloter-table-reference-content-item-en-ajout.component';
import { PiloterTableReferenceContentItemEnModificationComponent } from './components/piloter-table-reference-content-item-en-modification/piloter-table-reference-content-item-en-modification.component';
import { PiloterTablesReferencesSectionCriteresRechercheComponent } from './components/piloter-tables-references-section-criteres-recherche/piloter-tables-references-section-criteres-recherche.component';
import { PiloterTablesReferencesComponent } from './components/piloter-tables-references/piloter-tables-references.component';
import { PopupComponent } from './components/popup/popup.component';
import { QuebecPiedDePageComponent } from './components/quebec-pied-de-page/quebec-pied-de-page.component';
import { RapportFusionUsagerUiComponent } from './components/rapport-fusion-usager-ui/rapport-fusion-usager-ui.component';
import { RechercheAppelantCriteresComponent } from './components/recherche-appelant-criteres/recherche-appelant-criteres.component';
import { RechercheFicheAppelCriteresComponent } from './components/recherche-fiche-appel-criteres/recherche-fiche-appel-criteres.component';
import { RechercheNoteComplementaireCriteresComponent } from './components/recherche-note-complementaire-criteres/recherche-note-complementaire-criteres.component';
import { RechercheUsagerCriteresComponent } from './components/recherche-usager-criteres/recherche-usager-criteres.component';
import { RechercherFicheAppelUiComponent } from './components/rechercher-fiche-appel-ui/rechercher-fiche-appel-ui.component';
import { RelanceWrapperComponent } from './components/relance-wrapper/relance-wrapper.component';
import { RelanceComponent } from './components/relance/relance.component';
import { RelancesPageComponent } from './components/relances-page/relances-page.component';
import { RrssLinkComponent } from './components/rrss-link/rrss-link.component';
import { RRSSComponent } from './components/rrss/rrss.component';
import { ServicesUtilisesComponent } from './components/services-utilises/services-utilises.component';
import { SigctAboutComponent } from './components/sigct-about/sigct-about.component';
import { SigctAppelantCommunicationComponent } from './components/sigct-appelant-communication/sigct-appelant-communication.component';
import { SigctAppelantInitialComponent } from './components/sigct-appelant-initial/sigct-appelant-initial.component';
import { SigctAutocompleteComponent } from './components/sigct-autocomplete/sigct-autocomplete.component';
import { SigctChosenComponent } from './components/sigct-chosen/sigct-chosen.component';
import { SigctContentZoneComponent } from './components/sigct-content-zone/sigct-content-zone.component';
import { TargetZoneDirective } from './components/sigct-content-zone/target-zone.directive';
import { SigctDatepickerComponent } from './components/sigct-datepicker/sigct-datepicker.component';
import { SigctFieldSetComponent } from './components/sigct-field-set/sigct-field-set.component';
import { SigctGroupeAgeComponent } from './components/sigct-groupe-age/sigct-groupe-age.component';
import { SigctLiensUtilesComponent } from './components/sigct-liens-utiles/sigct-liens-utiles.component';
import { SigctMultiSelectComponent } from './components/sigct-multi-select/sigct-multi-select.component';
import { SigctOrientationSuitesInterventionComponent } from './components/sigct-orientation-suites-intervention/sigct-orientation-suites-intervention.component';
import { SigctReferenceSuitesInterventionComponent } from './components/sigct-reference-suites-intervention/sigct-reference-suites-intervention.component';
import { StatistiquesComponent } from './components/statistiques/statistiques.component';
import { SuitesInterventionComponent } from './components/suites-intervention/suites-intervention.component';
import { TablePaginationComponent } from './components/table-pagination/table-pagination.component';
import { VerificateurDeChangementComponent } from './components/verificateur-de-changement/verificateur-de-changement.component';
import { VerticalBarSeparComponent } from './components/vertical-bar-separ/vertical-bar-separ.component';
import { MatIframeDialogComponent } from './dialogs/mat-iframe-dialog/mat-iframe-dialog.component';
import { HasAllRolesDirective } from './directives/has-all-roles/has-all-roles.directive';
import { HasAnyRolesDirective } from './directives/has-any-roles/has-any-roles.directive';
import { SigctCodePostalDirective } from './directives/sigct-code-postal/sigct-code-postal.directive';
import { SigctDateDirective } from './directives/sigct-date/sigct-date.directive';
import { SigctDecimalDirective } from './directives/sigct-decimal/sigct-decimal.directive';
import { NoDoubleClickDirective } from './directives/sigct-no-double-click/sigct-no-double-click.directive';
import { SigctOnlyNumberDirective } from './directives/sigct-only-number/sigct-only-number.directive';
import { SigctTelDirective } from './directives/sigct-tel/sigct-tel.directive';
import { MsssUiComponent } from './msss-ui.component';
import { CodePostalPipe } from './pipes/code-postal-pipe/code-postal.pipe';
import { HighlightPipe } from './pipes/highlight.list.pipe';
import { SafePipe } from './pipes/pipe-safe/safe.pipe';
import { SigctSeparateurDecimalPipe } from './pipes/sigct-separateur-decimal/sigct-separateur-decimal.pipe';
import { StripHtmlPipe } from './pipes/strip-html/strip-html.pipe';
import { TelephonePipe } from './pipes/telephone-pipe/telephone.pipe';
import { MatPaginatorIntlFr } from './utils/mat-paginator-intl-fr';

@NgModule({
  declarations: [
    MsssUiComponent,
    SigctDatepickerComponent,
    SigctChosenComponent,
    SigctMultiSelectComponent,
    SigctContentZoneComponent,
    MsssM10AdresseAutocompleteComponent,
    MsssM10CodePostalAutocompleteComponent,
    MsssM10MunicipaliteAutocompleteComponent,
    TargetZoneDirective,
    TopMenuComponent,
    LeftMenuComponent,
    InputTextComponent,
    InputTextAreaComponent,
    InputRadioComponent,
    InputCheckboxComponent,
    FormTopBarComponent,
    SigctGroupeAgeComponent,
    MssModalComponent,
    ActionLinkComponent,
    VerticalBarSeparComponent,
    ModalConfirmationDialogComponent,
    ListInfoActionComponent,
    SafePipe,
    SigctOnlyNumberDirective,
    SigctDecimalDirective,
    SigctDateDirective,
    SigctCodePostalDirective,
    NoDoubleClickDirective,
    HighlightPipe,
    SigctAutocompleteComponent,
    SigctTelDirective,
    BienvenueTopBarComponent,
    QuebecPiedDePageComponent,
    OngletsComponent,
    SigctSeparateurDecimalPipe,
    SigctAboutComponent,
    BoutonRadioCouleurComponent,
    SigctAppelantInitialComponent,
    SigctAppelantCommunicationComponent,
    FichesAppelNonTermineesComponent,
    RRSSComponent,
    RrssLinkComponent,
    OutputMultiselectTextComponent,
    IndicateursFinInterventionComponent,
    ServicesUtilisesComponent,
    CkeditorComponent,
    SigctOrientationSuitesInterventionComponent,
    SigctReferenceSuitesInterventionComponent,
    BandeFlottanteComponent,
    GestionnaireDeFichiersComponent,
    ConsultationFichiersComponent,
    VerificateurDeChangementComponent,
    InteractionTerminaisonComponent,
    ConsultationFicheSectionUsagerComponent,
    ConsultationFicheSectionUsagerIdentificationComponent,
    ConsultationFicheSectionUsagerCommunicationComponent,
    ConsultationFicheSectionUsagerInformationsSuppComponent,
    ConsultationFicheSectionUsagerAdresseComponent,
    JournalisationsComponent,
    JournalisationAccesUsagerComponent,
    StatistiquesComponent,
    CadreTextComponent,
    ListInfoAffichageComponent,
    DureeFicheAppelComponent,
    CadreTextFieldsetComponent,
    SigctFieldSetComponent,
    ConsultationFicheSectionSuiteInterventionComponent,
    NoteComplementaireComponent,
    ConsultationFicheSectionTerminaisonComponent,
    ConsultationFicheSectionTerminaisonResumeInterventionComponent,
    ConsultationFicheSectionTerminaisonServicesUtiliseesComponent,
    ConsultationFicheSectionTerminaisonDureeFicheComponent,
    ConsultationFicheSectionNoteComplComponent,
    ConsultationFicheSectionFichiersComponent,
    BoutonModuleGardeComponent,
    DisplayVerticalListByTitleComponent,
    ConsultationFicheSectionAppelantComponent,
    ConsultationFicheSectionSignatureComponent,
    ConsultationFicheSectionIdentifiantComponent,
    RechercherFicheAppelUiComponent,
    PopupComponent,
    RechercheUsagerCriteresComponent,
    PiloterTablesReferencesComponent,
    TablePaginationComponent,
    PiloterTablesReferencesSectionCriteresRechercheComponent,
    RechercheAppelantCriteresComponent,
    RechercheFicheAppelCriteresComponent,
    RechercheNoteComplementaireCriteresComponent,
    PiloterParametresSystemeComponent,
    PiloterParametresSystemeSectionCriteresRechercheComponent,
    PiloterParametresSystemeEnModificationComponent,
    PiloterInformationsUtilesComponent,
    TelephonePipe,
    CodePostalPipe,
    HasAllRolesDirective,
    HasAnyRolesDirective,
    PiloterTableReferenceContentEnConsultationComponent,
    PiloterTableReferenceContentItemEnModificationComponent,
    PiloterTableReferenceContentItemEnAjoutComponent,
    PiloterTableReferenceContentItemAjoutModificationInterfaceComponent,
    PiloterTableInformationsUtilesComponent,
    SigctLiensUtilesComponent,
    ConsultationJournalComponent,
    LienRrssPdfComponent,
    EditerFichiersAttachesComponent,
    SuitesInterventionComponent,
    EditionListeEntiteComponent,
    GriseAutomatiqueSelonTypeInterventionComponent,
    RapportFusionUsagerUiComponent,
    StripHtmlPipe,
    ConsultationJournalUtilisateurComponent,
    ConsultationJournalMessageCtiComponent,
    RelanceComponent,
    ConsultationFicheSectionRelanceComponent,
    RelanceWrapperComponent,
    ListeRelancesComponent,
    RelanceComponent,
    ListeRelancesComponent,
    RelancesPageComponent,
    ManagerFilesBatchComponent,
    MatIframeDialogComponent,
    ConsultationFicheSectionTerminaisonInteractionComponent,
    CtiAideSaisieComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxSpinnerModule,
    NgxMaskModule.forRoot(),
    TranslateModule,

    // https://material.angular.io/
    MatCheckboxModule,
    MatChipsModule,
    MatRadioModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatToolbarModule,
    MatSelectModule,
    MatMenuModule,
    ScrollingModule,
    CKEditorModule
  ],
  exports: [
    MsssUiComponent,
    SigctDatepickerComponent,
    SigctChosenComponent,
    SigctMultiSelectComponent,
    SigctContentZoneComponent,
    MsssM10AdresseAutocompleteComponent,
    MsssM10CodePostalAutocompleteComponent,
    MsssM10MunicipaliteAutocompleteComponent,
    TopMenuComponent,
    LeftMenuComponent,
    InputTextComponent,
    InputTextAreaComponent,
    SigctAutocompleteComponent,
    InputRadioComponent,
    InputCheckboxComponent,
    FormTopBarComponent,
    SigctGroupeAgeComponent,
    MssModalComponent,
    ActionLinkComponent,
    VerticalBarSeparComponent,
    ModalConfirmationDialogComponent,
    ListInfoActionComponent,
    BienvenueTopBarComponent,
    QuebecPiedDePageComponent,
    OngletsComponent,
    HighlightPipe,
    BoutonRadioCouleurComponent,
    RrssLinkComponent,
    OutputMultiselectTextComponent,
    IndicateursFinInterventionComponent,
    ServicesUtilisesComponent,
    CkeditorComponent,
    SigctOrientationSuitesInterventionComponent,
    SigctReferenceSuitesInterventionComponent,
    BandeFlottanteComponent,
    GestionnaireDeFichiersComponent,
    ConsultationFichiersComponent,
    VerificateurDeChangementComponent,
    ConsultationFicheSectionUsagerComponent,
    ConsultationFicheSectionTerminaisonComponent,
    ConsultationFicheSectionTerminaisonResumeInterventionComponent,
    ConsultationFicheSectionTerminaisonServicesUtiliseesComponent,
    ConsultationFicheSectionTerminaisonDureeFicheComponent,
    PopupComponent,
    ConsultationJournalComponent,
    SuitesInterventionComponent,
    EditionListeEntiteComponent,
    GriseAutomatiqueSelonTypeInterventionComponent,
    ConsultationJournalUtilisateurComponent,
    ConsultationJournalMessageCtiComponent,

    // https://material.angular.io/
    MatCheckboxModule,
    MatChipsModule,
    MatRadioModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    MatMenuModule,

    NgxSpinnerModule,
    NgxMaskModule,

    ScrollingModule,
    CKEditorModule,
    SigctAppelantInitialComponent,
    SigctAppelantCommunicationComponent,
    FichesAppelNonTermineesComponent,
    InteractionTerminaisonComponent,
    FichesAppelNonTermineesComponent,
    JournalisationsComponent,
    StatistiquesComponent,
    CadreTextComponent,
    ListInfoAffichageComponent,
    DureeFicheAppelComponent,
    CadreTextFieldsetComponent,
    SigctFieldSetComponent,
    ConsultationFicheSectionSuiteInterventionComponent,
    NoteComplementaireComponent,
    ConsultationFicheSectionNoteComplComponent,
    ConsultationFicheSectionFichiersComponent,
    BoutonModuleGardeComponent,
    DisplayVerticalListByTitleComponent,
    ConsultationFicheSectionAppelantComponent,
    ConsultationFicheSectionSignatureComponent,
    ConsultationFicheSectionIdentifiantComponent,
    RechercherFicheAppelUiComponent,
    RechercheAppelantCriteresComponent,
    RechercheFicheAppelCriteresComponent,
    RechercheNoteComplementaireCriteresComponent,
    RechercheUsagerCriteresComponent,
    PiloterTablesReferencesComponent,
    TablePaginationComponent,
    PiloterTablesReferencesSectionCriteresRechercheComponent,
    PiloterParametresSystemeComponent,
    PiloterParametresSystemeEnModificationComponent,
    PiloterInformationsUtilesComponent,
    TelephonePipe,
    CodePostalPipe,
    HasAllRolesDirective,
    HasAnyRolesDirective,
    NoDoubleClickDirective,
    PiloterTableReferenceContentEnConsultationComponent,
    PiloterTableReferenceContentItemEnModificationComponent,
    PiloterTableReferenceContentItemEnAjoutComponent,
    PiloterTableReferenceContentItemAjoutModificationInterfaceComponent,
    PiloterTableInformationsUtilesComponent,
    SigctLiensUtilesComponent,
    EditerFichiersAttachesComponent,
    LienRrssPdfComponent,
    RapportFusionUsagerUiComponent,
    RelanceComponent,
    ConsultationFicheSectionRelanceComponent,
    RelanceWrapperComponent,
    ListeRelancesComponent,
    RelanceComponent,
    ListeRelancesComponent,
    RelancesPageComponent,
    ManagerFilesBatchComponent,
    MatIframeDialogComponent,
    ConsultationFicheSectionTerminaisonInteractionComponent,
    CtiAideSaisieComponent,
  ],

  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-CA' },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlFr },
    NotificationService],
  entryComponents: [MatIframeDialogComponent]
})
export class MsssUiModule { }
