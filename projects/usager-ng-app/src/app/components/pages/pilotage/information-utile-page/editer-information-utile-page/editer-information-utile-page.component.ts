import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReferencesService } from 'projects/usager-ng-core/src/lib/services/references.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { TableFichierDTO } from 'projects/sigct-service-ng-lib/src/lib/models/TableFichierDTO';
import { FichiersApiService } from 'projects/sigct-service-ng-lib/src/lib/services/fichiers-api.service';
import { TableInformationsUtilesService } from 'projects/sigct-service-ng-lib/src/lib/services/table-informations-utiles/table-informations-utiles-service';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { PiloterTableInformationsUtilesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-informations-utiles/piloter-table-informations-utiles.component';
import { TableInforUtileDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-informations-utiles/table-infor-utile-dto';
import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-editer-information-utile-page',
  templateUrl: './editer-information-utile-page.component.html',
  styleUrls: ['./editer-information-utile-page.component.css']
})
export class EditerInformationUtilePageComponent implements OnInit, OnDestroy {

  tableInforUtileDTO: TableInforUtileDTO;

  titreSection: string;

  @ViewChild('alertContainer', { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  @ViewChild('inforutile', { static: false }) private formulaire: PiloterTableInformationsUtilesComponent;

  @ViewChild('triElement', { static: false })
  triElement: InputTextComponent;

  @ViewChild('nom', { static: false })
  nomElement: InputTextComponent;

  @ViewChild('contenuScroll', { static: true })
  contenuScroll: ElementRef;

  isNomValide = true;
  isTriValide = true;
  isCategorieValide = true;
  isModifyMode = false;

  listeCategorieInforUtile: ReferenceDTO[];

  listeFichiers: UsagerSanterSocialFichierDTO[];

  idFichier: number;

  fichierAConfirmer: any;

  typeFichierAccepter = 'image/gif, image/jpeg, image/png';

  subscriptions: Subscription = new Subscription();

  constructor(private alertService: AlertService,
    private alertStore: AlertStore,
    private modalConfirmService: ConfirmationDialogService,
    private router: Router,
    private referencesService: ReferencesService,
    private tableInfoService: TableInformationsUtilesService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    public fichierService: FichiersApiService) { }

  ngOnInit(): void {
    this.alertStore.resetAlert();
    this.configureAlertMsg();
    if (!this.tableInforUtileDTO) {
      this.tableInforUtileDTO = new TableInforUtileDTO();
      localStorage.setItem('contenuHistory', JSON.stringify(this.tableInforUtileDTO));
      this.isModifyMode = false;
    }
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        const _identifiant = params?.get('id');
        if (_identifiant !== '0') {
          forkJoin([
            this.tableInfoService.getInformationUtile(_identifiant),
            this.referencesService.getListeCategorieInforUtile(),
          ]).subscribe(result => {
            this.tableInforUtileDTO = result[0] as TableInforUtileDTO;
            this.isModifyMode = true;
            localStorage.setItem('contenuHistory', JSON.stringify(this.tableInforUtileDTO));
            this.listeCategorieInforUtile = result[1] as ReferenceDTO[];
            this.onListFichier(null);
          });
        } else {
          this.subscriptions.add(this.referencesService.getListeCategorieInforUtile().subscribe((references: ReferenceDTO[]) => {
            if (references) {
              this.listeCategorieInforUtile = references;
              this.isModifyMode = false;
            }
          }));
        }
      })
    );
  }

  private configureAlertMsg(): void {
    this.subscriptions.add(this.alertStore.state$.subscribe((state: AlertModel[]) => {
      this.alertService.show(this.alertContainer, state);
    })
    );
  }

  submitAction = () => {
    this.isNomValide = true;
    this.isCategorieValide = true;
    this.formulaire.setValideCategorie(this.isCategorieValide);
    this.isTriValide = true;
    this.onSubmit(this.tableInforUtileDTO);
  }

  onSubmit(dto: TableInforUtileDTO): void {
    this.alertStore.resetAlert();
    this.validerForm();
    if (this.isNomValide && this.isCategorieValide && this.isTriValide) {
      this.subscriptions.add(this.tableInfoService.saveInformationUtile(dto).subscribe((resultat) => {
        if (resultat) {
          this.tableInforUtileDTO = resultat;
          localStorage.setItem('contenuHistory', JSON.stringify(this.tableInforUtileDTO));
          this.populateAlertSuccess();
          this.router.navigate(['/' + 'info-utile-page/' + this.tableInforUtileDTO.identifiant]);
        }
      }));
    }
  }

  private populateAlertSuccess() {
    const msg: string [] = [];
    const alertM: AlertModel = new AlertModel();
    alertM.title = this.translateService.instant('ss.msg.succes.confirmation');
    alertM.type = AlertType.SUCCESS;
    msg.push(this.translateService.instant('ss.msg.succes.confirmation.text'));
    alertM.messages = msg;
    this.alertStore.addAlert(alertM);
  }

  private populateAlertErreur(messages) {
    const alertM: AlertModel = new AlertModel();
    alertM.title = 'Message d\'erreur :';
    alertM.messages = messages;
    alertM.type = AlertType.ERROR;
    this.alertStore.addAlert(alertM);
  }

  private validerForm(): void {
    const messages: string[] = [];
    if (!this.tableInforUtileDTO.nom) {
      this.isNomValide = false;
      const title = this.translateService.instant('sigct.ss.pilotage.info_utile.ajoutmodif.nom');
      const msg = this.translateService.instant('general.msg.obligatoire', [title]);
      messages.push(msg);
    }
    if (!this.tableInforUtileDTO.categorie) {
      this.isCategorieValide = false;
      this.formulaire.setValideCategorie(this.isCategorieValide);
      const title = this.translateService.instant('sigct.ss.pilotage.info_utile.ajoutmodif.categorie');
      const msg = this.translateService.instant('general.msg.obligatoire', [title]);
      messages.push(msg);
    }
    if (!this.tableInforUtileDTO.tri) {
      this.isTriValide = false;
      const title = this.translateService.instant('sigct.ss.pilotage.info_utile.ajoutmodif.tri');
      const msg = this.translateService.instant('general.msg.obligatoire', [title]);
      messages.push(msg);
    }
    if (messages.length > 0) {
      this.populateAlertErreur(messages);
    }
  }

  onFocus(event: any) {
    this.onFocusClick(event);
  }

  onClick(event: any) {
    this.onFocusClick(event.target.id);
  }

  private onFocusClick(id: string) {
    switch (id) {
      case 'categorie': {
        this.isCategorieValide = true;
        break;
      }
      case 'tri': {
        this.isTriValide = true;
        break;
      }
      case 'nom': {
        this.isNomValide = true;
        break;
      }
    }
  }

  confirmBackToTableInformationsUtiles(): void {
    if (this.isExistOnlineModification()) {
      this.openModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    } else {
      this.router.navigate(['piloter-info-utile-page']);
    }
  }

  isExistOnlineModification(): boolean {
    const originalTableInforUtileDTO: TableInforUtileDTO = JSON.parse(localStorage.getItem('contenuHistory'));
    if (originalTableInforUtileDTO) {
      return this.tableInforUtileDTO?.tri != originalTableInforUtileDTO.tri
        || this.tableInforUtileDTO?.nom != originalTableInforUtileDTO.nom
        || this.tableInforUtileDTO?.description != originalTableInforUtileDTO.description
        || this.tableInforUtileDTO?.actif != originalTableInforUtileDTO.actif
        || this.tableInforUtileDTO.url != originalTableInforUtileDTO.url;
    }
    return false;
  }

  annulerModifEtRetourListeRecherche(): void {
    this.closeModal('confirm_popup_annuler-modif_et_retour_list_recherche');
    this.router.navigate(['piloter-info-utile-page']);
  }

  confirmerAnnulerAction(): void {
    this.openModal('confirm_popup_annuler-modif');
  }

  annulerAction(): void {
    this.closeModal('confirm_popup_annuler-modif');
    if (this.isExistOnlineModification()) {
      this.tableInforUtileDTO = JSON.parse(localStorage.getItem('contenuHistory'));
    }
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  ngOnDestroy(): void {
    this.alertStore.resetAlert();
    this.subscriptions.unsubscribe();
  }

  /*------------------------- Fichiers attachés ------------------------------------*/
  onAjouterFichier(event) {
    this.alertStore.resetAlert();
    if (this.listeFichiers && (this.listeFichiers.length > 0)) {
      this.fichierAConfirmer = event;
      this.openModal('confirm_popup_remplacer_fichier');
    } else {
      this.onExecuterAjoutFichier(event);
    }
  }

  private onExecuterAjoutFichier(event): void {
    const msgs = this.validerFichier(event);
    if (msgs.length > 0) {
      this.scrollTop();
      this.populateAlertErreur(msgs);
      return;
    }

    const fichier: TableFichierDTO = new TableFichierDTO();
    const fl: UsagerSanterSocialFichierDTO = event.fichier;

    // Pour faire la mise à jour du fichier déjà présent dans la BD
    // il faut extraire la clé prinaire du fichier à modifier.
    if (this.listeFichiers && this.listeFichiers.length > 0) {
      fl.id = this.listeFichiers[0].id;
    }

    fichier.id = fl.id;
    fichier.description = fl.description;
    fichier.file = fl.file;
    fichier.idReferenceTypeFichier = null;
    fichier.nom = fl.nom;
    fichier.typeContenu = fl.typeContenu;
    fichier.tailleContenu = fl.file.size;
    fichier.refId = Number(this.tableInforUtileDTO.identifiant);

    this.subscriptions.add(this.fichierService.sauvegarder(fichier, Number(this.tableInforUtileDTO.identifiant))
      .subscribe((data: TableFichierDTO) => {
        let document: UsagerSanterSocialFichierDTO = new UsagerSanterSocialFichierDTO();
        document = this.setContenu(document, data);
        // Pour mettre à jour la liste des fichiers modifiers dans l'interface.
        if (this.listeFichiers.length == 0) {
          this.listeFichiers.push(document);
        } else {
          this.listeFichiers[0] = document;
        }
        event.data = this.listeFichiers;
        event.informeAjoute(this.listeFichiers);
        this.populateAlertSuccess();
        this.scrollTop();
      }, (err) => {
        this.contenuScroll.nativeElement.scrollTop = 0;
      }));
  }

  public scrollTop() {
    this.contenuScroll.nativeElement.scrollTop = 0;
  }

  public remplacerFichier(): void {
    this.closeModal('confirm_popup_remplacer_fichier');
    this.onExecuterAjoutFichier(this.fichierAConfirmer);
  }

  private validateFileExtension(fileName: string) {
    const validExtensions = ['PNG', 'GIF', 'JPG', 'JPEG', 'XLS', 'XLSX', 'PDF', 'DOC', 'DOCX'];
    const fileExtension = fileName.split('.').pop().toUpperCase();
    return validExtensions.includes(fileExtension);
  }

  private validerFichier(event: any) {
    const msgs: string[] = [];
    const fl: UsagerSanterSocialFichierDTO = event.fichier;
    if (!fl.nom) {
      msgs.push(this.translateService.instant('us-e90016'));
      return msgs;
    }
    if (event.fichier.file == null) {
      const msg = this.translateService.instant('us-e90016');
      msgs.push(msg);
    }
    if (event.fichier.file.size > 12000000) {
      const params = {
        '0': fl.nom,
        '1': '12'
      };
      const msg = this.translateService.instant('us-e90011', params);
      msgs.push(msg);
    }
    if (!this.validateFileExtension(fl.nom)) {
      const msg = this.translateService.instant('us-e90014', {0: 'PNG;GIF;JPG;JPEG;XLS;XLSX;PDF;DOC;DOCX'});
      msgs.push(msg);
    }
    return msgs;
  }

  private setContenu(document: UsagerSanterSocialFichierDTO, data: TableFichierDTO): UsagerSanterSocialFichierDTO {
    if (document == undefined) { document = new UsagerSanterSocialFichierDTO(); }
    document.idEnregistrement = data.id;
    document.id = data.id;
    document.nom = data.nom;
    document.description = data.description;
    document.typeContenu = data.typeContenu;
    document.file = data.file;
    return document;
  }

  onListFichier(event) {
    this.fichierService.liste(Number(this.tableInforUtileDTO.identifiant), 'US_INFOR_UTILE').subscribe(data => {
      if (!this.listeFichiers) {
        this.listeFichiers = [];
      }
      this.listeFichiers[0] = this.setContenu(this.listeFichiers[0], data[0]);
      this.idFichier = data[0].id;
      if (event != undefined && event != null) {
        event.data = this.listeFichiers[0];
        event.subject.next(this.listeFichiers[0]);
      }
    });
  }

  onSupprimerFichier(event) {
    this.titreSection = event.fichier.nom;
    this.subscriptions.add(this.fichierService.supprimer(Number(this.tableInforUtileDTO.identifiant), event.fichier.id).subscribe(
      () => {
        this.listeFichiers.pop();
      }
    ));
  }

  onTelechargerFichier(fichier: UsagerSanterSocialFichierDTO) {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = this.fichierService.getLinktelechargement(Number(this.tableInforUtileDTO.identifiant), fichier.id);
    a.click();
  }
}
