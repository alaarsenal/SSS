import { Component, Input, OnInit, EventEmitter, Output, ViewChild, ElementRef  } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { UsagerSanterSocialFichierDTO } from '../../model/UsagerSanterSocialFichierDTO';
import { InputOptionCollection } from '../../utils/input-option';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';

@Component({
  selector: 'msss-gestionnaire-de-fichiers',
  templateUrl: './gestionnaire-de-fichiers.component.html',
  styleUrls: ['./gestionnaire-de-fichiers.component.css']
})
export class GestionnaireDeFichiersComponent implements OnInit {

  @Input()
  public titreSection: string;
  @Input()
  public msgSupprimer: string;

  //fichier qui sera ajouté.
  public fichier: UsagerSanterSocialFichierDTO;
  //fichier qui sera suppreimé.
  public fichierPourSupprimer: UsagerSanterSocialFichierDTO;

  //Conteneur pour la liste de valeurs de references
  public inputOptionsReferenceType: InputOptionCollection;

  // Table dataSource avec la liste des fihiers du BD.
  public dataSource = new MatTableDataSource<any>([]);
  @Input()
  public displayedColumns: string[] = ['aprecu', 'nom', 'reference', 'titre', 'description', 'actions'];

  public abonnement: Subscription;
  public fichierSubject = new BehaviorSubject<UsagerSanterSocialFichierDTO[]>([]);
  public changementDataSource: Observable<any> = this.fichierSubject.asObservable();

  @ViewChild('inputFile', { static: false })
  public inputFile: ElementRef;

  @ViewChild('btnajouter', { static: false })
  public btnajouter: ElementRef;

  @Output()
  public onAjouterFichier = new EventEmitter();

  @Output()
  public onListFichier = new EventEmitter();

  @Output()
  public onSupprimerFichier = new EventEmitter();

  @Output()
  public onTelechargerFichier = new EventEmitter();

  @Output()
  public onAficherAlert = new EventEmitter();

  @Input()
  public readonly = true;

  @Input()
  public urlTelechargment: string;

  @Input()
  public showListeProfile: boolean = true;

  @Input()
  public showColReference: boolean = true;

  @Input()
  public showColTitre: boolean = true;

  @Input()
  public showColDescription: boolean = true;

  @Input("typeFichierAccepter")
  public typeFichierAccepter: string;

  @Input()
  public isPageFichierAttache: boolean = false;



  public mapTypesFichiers = {
    'application/vnd.ms-excel': {ico: 'fa fa-file-excel-o', img: false},
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {ico: 'fa fa-file-excel-o', img: false},
    'application/msword': {ico: 'fa fa-file-word-o', img: false},
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {ico: 'fa fa-file-word-o', img: false},
    'application/pdf': {ico: 'fa fa-file-pdf-o', img: false},
    'image/jpeg': {ico: 'fa fa-file-image-o', img: true},
    'image/gif': {ico: 'fa fa-file-image-o', img: true},
    'image/png': {ico: 'fa fa-file-image-o', img: true}
  };


  constructor(
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private alertStore: AlertStore) {

  }

  ngOnInit() {
    this.initFichirePourAjouter();
    this.abonnementAuxChangementListe();
    this.initMessageSupression();
    this.refreshFichresFromServer();
  }

  private initFichirePourAjouter() {
    this.fichier = new UsagerSanterSocialFichierDTO();
  }

  private abonnementAuxChangementListe() {
    this.abonnement = this.changementDataSource
      .subscribe(
        data => {
          this.dataSource.data = data;
        });
  }

  private initMessageSupression() {
    this.titreSection = this.translateService.instant(this.titreSection,null);
    this.msgSupprimer = this.translateService.instant('sa-iu-a00001', { 0: this.titreSection });
  }

  @Input("listeFichiers")
  public set listeFichiers(fichiers: UsagerSanterSocialFichierDTO[]){

      this.dataSource.data = fichiers;

      //Faire le focus sur la chargement de la liste
      if(this.btnajouter && this.isPageFichierAttache){
        this.btnajouter.nativeElement.focus();
      }

  }

  /** Peuple la liste des references types */
  @Input("inputOptionsReferenceType")
  public set listeOptionsReferenceType(values: ReferenceDTO[]) {
    let valeurLibelleVide: string = this.translateService.instant("girpi.label.selectionnez");
    this.inputOptionsReferenceType = {
      name: 'type',
      options: []
    };
    if (this.inputOptionsReferenceType.options[0] === undefined) {
      this.inputOptionsReferenceType.options.push({ label: valeurLibelleVide, value: null });
    }
    if (values) {
      values.forEach((item: ReferenceDTO) => {
        this.inputOptionsReferenceType.options.push({ label: item.nom, value: item.id + '' });
      });
    }
  }

  getIco(fichier: UsagerSanterSocialFichierDTO) {
    if (fichier != null && fichier.typeContenu != null){
      if (this.mapTypesFichiers[fichier.typeContenu] != undefined){
        return this.mapTypesFichiers[fichier.typeContenu].ico;
      }
    }
    return 'fa fa-file';
  }

  isImg(fichier: UsagerSanterSocialFichierDTO) {
    if (fichier != null && fichier.typeContenu != null){
      if (this.mapTypesFichiers[fichier.typeContenu] != undefined){
        return this.mapTypesFichiers[fichier.typeContenu].img;
      }
    }
    return false;
  }

  getUrlImg(fichier: UsagerSanterSocialFichierDTO) {
    return this.urlTelechargment.replace('{idFichier}',fichier.id.toString());
  }

  handleFileInput(files: FileList) {
    this.fichier.file = files.item(0);
    this.fichier.typeContenu = files.item(0).type;
    this.fichier.nom = files.item(0).name;
  }

  private refreshFichresFromServer() {
    let listEvent = {
      data: this.dataSource.data,
      subject: this.fichierSubject
    }
    this.onListFichier.emit(listEvent);
  }

  onBtnParcourirClick(){

    if (this.readonly){
      let msgs: string[] = [];
      msgs.push(this.translateService.instant('us-e90015'));
      this.creerAlert(msgs, "Message d'erreur", AlertType.ERROR);
      return;
    }
    this.inputFile.nativeElement.click();
  }

  onBtnAjouterClick(){

    if (this.readonly){
      let msgs: string[] = [];
      msgs.push(this.translateService.instant('us-e90015'));
      this.creerAlert(msgs, "Message d'erreur", AlertType.ERROR);
      return;
    }

    if (this.fichier.nom != null) {
        this.fichier.nom = this.getNomNomNormalized(this.fichier.nom);
        let qtdExistent = this.dataSource.data.filter(fichier =>
              fichier.nom == this.fichier.nom).length;

        if (qtdExistent > 0){
          let msgs: string[] = [];

          //Quand le gestionnaire de fichier est appelé depuis la page des fichiers attaché
          //prendre le premier message d'erreur (isPageFichierAttache == true)
          if(this.isPageFichierAttache){
            msgs.push(this.translateService.instant('ss-iu-e50103',{0:this.fichier.nom}));
          } else {
            msgs.push(this.translateService.instant('us-e90012',{0:this.fichier.nom}));
          }

          this.creerAlert(msgs, "Message d'erreur", AlertType.ERROR);
          return;
        }
    }

    let newFichier = new UsagerSanterSocialFichierDTO();
    newFichier.idReferenceTypeFichier = this.fichier.idReferenceTypeFichier
    newFichier.file = this.fichier.file
    newFichier.nom = this.fichier.nom;
    newFichier.typeContenu = this.fichier.typeContenu;

    let ajouterEvent = {
      fichier: newFichier,
      data: this.dataSource.data,
      subject: this.fichierSubject,
      informeAjoute: (data) => {
        this.fichierSubject.next(data);
        this.fichier = new UsagerSanterSocialFichierDTO();
        this.inputFile.nativeElement.value=null;
      }
    }

    this.onAjouterFichier.emit(ajouterEvent);


  }

  onBtnSupprimerClick(fichier: UsagerSanterSocialFichierDTO) {
    this.fichierPourSupprimer = fichier;
    this.modalConfirmService.openAndFocus('confirm_popup_supression_fichier', 'ok_supression_button_fichier');
  }

  onBtnOksupprimerClick() {
    this.dataSource.data = this.dataSource.data.filter(f => f.id != this.fichierPourSupprimer.id);
    let supprimerEvent = {
      fichier: this.fichierPourSupprimer,
      data: this.dataSource.data,
      subject: this.fichierSubject
    }
    this.onSupprimerFichier.emit(supprimerEvent);
    this.modalConfirmService.close('confirm_popup_supression_fichier');
  }

  onBtnTelecharcgerClick(fichier: UsagerSanterSocialFichierDTO) {
    this.onTelechargerFichier.emit(fichier);
  }

  getLinktelechargment(fichier: UsagerSanterSocialFichierDTO) {
    return this.urlTelechargment.replace('{idFichier}', fichier.id.toString())
  }


  creerAlert(messages: string[], titre: string, erreurType: AlertType) {
    this.alertStore.resetAlert();
    const alertM: AlertModel = new AlertModel();
    alertM.title = titre;
    alertM.type = erreurType;
    alertM.messages = messages;
    const alerts = [alertM];
    this.alertStore.addAlerts(alerts);
    this.onAficherAlert.emit();
  }

  getNomNomNormalized(nomOriginal: string) {

    const nomSplit = nomOriginal.split(".");
    let nom = nomOriginal
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace("."+nomSplit[nomSplit.length-1], "")
        .replace(/ /g, '_')
        .replace(/[^aA-zZ-Z0-9]+/g, "-")
        .concat("."+nomSplit[nomSplit.length-1])
        .toLowerCase();
    return nom;
	}


}
