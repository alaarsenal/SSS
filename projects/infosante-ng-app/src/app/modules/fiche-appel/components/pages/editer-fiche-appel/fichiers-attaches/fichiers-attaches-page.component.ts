import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { TableFichierDTO } from 'projects/sigct-service-ng-lib/src/lib/models/TableFichierDTO';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { FichiersApiService } from 'projects/sigct-service-ng-lib/src/lib/services/fichiers-api.service';
import { ParametreSystemeDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-parametres-systeme/parametre-systeme-dto';
import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { forkJoin, iif, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'fichiers-attaches-page',
  templateUrl: './fichiers-attaches-page.component.html',
  styleUrls: ['./fichiers-attaches-page.component.css']
})
export class FichiersAttachesPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {

  showListeProfile: boolean = false;
  showColReference: boolean = false;
  showColTitre: boolean = true;
  showColDescription: boolean = true;

  listeFichiers: UsagerSanterSocialFichierDTO[];
  titreSection: string;

  typeFichierAccepter: string;

  subscription: Subscription = new Subscription();

  idFicheAppel: number;

  idFichier: number;

  urlBaseMiniatureImg: string;

  ficheAppelSocialDto: FicheAppelDTO;

  private readonly REF_TABLE: string = "SA_FICHE_APPEL";

  constructor(
    private router: Router,
    private ficheAppelDataService: FicheAppelDataService,
    private ficheAppelApiService: FicheAppelApiService,
    public fichierService: FichiersApiService,
    private alertStore: AlertStore,
    private parametreService: AppelAdmParameterService,
    private translateService: TranslateService) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();

    forkJoin([
      this.parametreService.obtenirAdmParameterByCode("FICHIERS_ATTACHES_FORMAT"),

    ]).subscribe(result => {
      let param: ParametreSystemeDTO = result[0] as ParametreSystemeDTO;

      this.typeFichierAccepter = param.contenu;
    });

    this.titreSection = "Fichier attaché";

    this.chargerListeFichier();

    this.urlBaseMiniatureImg = this.fichierService.getUrlBaseTelechargement();

  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  chargerListeFichier() {

    this.idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();
    this.ficheAppelSocialDto = this.ficheAppelDataService.getFicheAppelActive();

    this.subscription.add(this.fichierService.liste(this.idFicheAppel, this.REF_TABLE).subscribe((dtos: TableFichierDTO[]) => {
      if (dtos) {

        this.listeFichiers = [];

        dtos.forEach((item: TableFichierDTO) => {

          let document: UsagerSanterSocialFichierDTO = new UsagerSanterSocialFichierDTO();
          document = this.setContenu(document, item);
          this.listeFichiers.push(document);

        });

      }
    }));





  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    this.chargerListeFichier();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (StatutFicheAppelEnum.OUVERT == this.ficheAppelSocialDto?.statut) {
      this.doSave(false);
      this.alertStore.resetAlert();
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.alertStore.resetAlert();

    // Parce que la fiche peut avoir été fermé dans un autre onglet du navigateur, 
    // on récupère le statut de la fiche en BD.
    return this.ficheAppelApiService.getStatutFicheAppel(this.ficheAppelDataService.getIdFicheAppelActive()).pipe(
      mergeMap((statut: StatutFicheAppelEnum) =>
        // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
        iif(() => statut == StatutFicheAppelEnum.OUVERT,
          // Si ouvert: la fiche est ouverte, on la sauvegarde
          this.doSave(false),
          // Sinon : la fiche n'est plus Ouverte, on retourne un UrlTree pour redirection vers la consultation.
          of(this.router.createUrlTree(["/editer", "appel", this.ficheAppelDataService.getIdAppel(), "fiche", this.ficheAppelDataService.getIdFicheAppelActive(), "consultation"])))
      )
    );
  }

  /**
   * Lorsqu'un changement de fiche est effectué (changement d'onglet).
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.chargerListeFichier();
  }

  private convertirEnListeTableFichierDTO(liste: UsagerSanterSocialFichierDTO[]): TableFichierDTO[] {

    let fichiers: TableFichierDTO[] = [];

    for (let i = 0; i < liste.length; i++) {

      let fichier: TableFichierDTO = new TableFichierDTO();
      let fl: UsagerSanterSocialFichierDTO = liste[i];

      fichier.id = fl.id;
      fichier.description = fl.description;
      fichier.file = fl.file;
      fichier.idReferenceTypeFichier = null;
      fichier.nom = fl.nom;
      fichier.typeContenu = fl.typeContenu;
      fichier.refId = this.idFicheAppel;
      fichier.titre = fl.titre;

      fichiers.push(fichier);

    }


    return fichiers;

  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    this.alertStore.resetAlert();
    this.doSave(true);
  }


  doSave(afficherMessage: boolean): Observable<boolean> {
    if (this.listeFichiers.length > 0) {
      return this.fichierService.editer(this.convertirEnListeTableFichierDTO(this.listeFichiers), this.idFicheAppel).pipe(
        map((data: TableFichierDTO[]) => {
          if (data) {
            this.chargerListeFichier();
            if (afficherMessage) {
              this.populateAlertSuccess();
            }
          }

          return true;
        },
          (err) => { })
      );
    } else {
      return of(true);
    }
  }


  private enregister(data: UsagerSanterSocialFichierDTO, event): void {
    let fichier: TableFichierDTO = new TableFichierDTO();
    let fl: UsagerSanterSocialFichierDTO = data;

    fichier.id = fl.id;
    fichier.description = fl.description;
    fichier.file = fl.file;
    fichier.idReferenceTypeFichier = null;
    fichier.nom = fl.nom;
    fichier.typeContenu = fl.typeContenu;
    fichier.refId = this.idFicheAppel;
    fichier.titre = data.titre;

    if (fl.file) {
      fichier.tailleContenu = fl.file.size;

      this.subscriptions.add(this.fichierService.sauvegarder(fichier, this.idFicheAppel, this.REF_TABLE)
        .subscribe((data: TableFichierDTO) => {

          let document: UsagerSanterSocialFichierDTO = new UsagerSanterSocialFichierDTO();

          document = this.setContenu(document, data);

          event.fichier = new UsagerSanterSocialFichierDTO();
          this.addFichierToList(data, event);
          event.informeAjoute(this.listeFichiers);
          this.populateAlertSuccess();

        }, (err) => {

        }));
    }


  }

  onAjouterFichier(event) {
    this.alertStore.resetAlert();
    this.onExecuterAjoutFichier(event);
  }

  private onExecuterAjoutFichier(event): void {

    const msgs = this.validerFichier(event);
    if (msgs.length > 0) {

      this.populateAlertErreur(msgs);
      return;
    }
    this.enregister(event.fichier, event);

  }


  private validerFichier(event: any) {

    let msgs: string[] = [];

    let fl: UsagerSanterSocialFichierDTO = event.fichier;

    if (!fl.nom) {
      msgs.push(this.translateService.instant('ss-iu-e50104'));
      return msgs;
    }

    if (event.fichier.file == null) {
      const msg = this.translateService.instant('ss-iu-e50104');
      msgs.push(msg);
    }


    return msgs;
  }


  private setContenu(document: UsagerSanterSocialFichierDTO, data: TableFichierDTO): UsagerSanterSocialFichierDTO {

    if (document == undefined) { document = new UsagerSanterSocialFichierDTO(); }

    document.idEnregistrement = data.id;
    document.id = data.id;
    document.nom = data.nom;

    if (data.description) {
      document.description = data.description;
    } else {
      document.description = "";
    }

    document.typeContenu = data.typeContenu;

    if (data.titre) {
      document.titre = data.titre;
    } else {
      document.titre = "";
    }


    document.file = data.file;

    return document;

  }

  /** Met à jour l'objet sélectionner dans la liste de valeur */
  onListFichier(event) {
    this.fichierService.liste(this.idFicheAppel, this.REF_TABLE).subscribe(data => {
      this.listeFichiers = [];
      if (data) {
        data.forEach((f: TableFichierDTO) => {
          this.addFichierToList(f, event);
        });
      }
    });
  }

  private addFichierToList(fichierDTO: TableFichierDTO, event: any): void {
    let doc: UsagerSanterSocialFichierDTO;
    doc = this.setContenu(doc, fichierDTO);
    if (!this.listeFichiers) {
      this.listeFichiers = [];
    }
    this.listeFichiers.push(doc);
    if (event != undefined && event != null && event.data.id == doc.id) {
      this.idFichier = doc.id;
      event.data = doc;
      event.subject.next(doc);
    }
  }

  onSupprimerFichier(event) {
    this.titreSection = event.fichier.nom;
    this.subscriptions.add(this.fichierService.supprimer(this.idFicheAppel, event.fichier.id).subscribe(
      () => {
        this.onListFichier(event);
      }
    ));
  }

  onTelechargerFichier(fichier: UsagerSanterSocialFichierDTO) {

    const url = this.fichierService.getLinktelechargement(this.idFicheAppel, fichier.id);
    window.open(url, '_blank');

  }

  private populateAlertErreur(messages) {
    let alertM: AlertModel = new AlertModel();
    alertM.title = "Message d'erreur :";
    alertM.messages = messages;
    alertM.type = AlertType.ERROR;
    this.alertStore.addAlert(alertM);

  }

  private populateAlertSuccess() {
    let alertSuccess: AlertModel = new AlertModel();
    alertSuccess.title = "Confirmation :";
    alertSuccess.messages = [this.translateService.instant("ss-iu-c00002")];
    alertSuccess.type = AlertType.SUCCESS;
    this.alertStore.addAlert(alertSuccess);

  }

}
