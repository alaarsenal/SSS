import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { NoteComplementaireDTO } from 'projects/sigct-service-ng-lib/src/lib/models/note-compl-dto';
import { FichiersApiService } from 'projects/sigct-service-ng-lib/src/lib/services/fichiers-api.service';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { Subscription } from 'rxjs';
import { DetailsFile } from '../../model/details-file';
import { UsagerSanterSocialFichierDTO } from '../../model/UsagerSanterSocialFichierDTO';
import { InputOptionCollection } from '../../utils/input-option';
import { DureeFicheAppelComponent } from '../duree-fiche-appel/duree-fiche-appel/duree-fiche-appel.component';
import { ManagerFilesBatchComponent } from '../manager-files-batch/manager-files-batch.component';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';
import { SigctChosenComponent } from '../sigct-chosen/sigct-chosen.component';

const DOMAINE_SO: string = 'SO';
const DOMAINE_SA: string = 'SA';

@Component({
  selector: 'msss-note-complementaire',
  templateUrl: './note-complementaire.component.html',
  styleUrls: ['./note-complementaire.component.css']
})
export class NoteComplementaireComponent implements OnInit, AfterViewInit {
  @Input()
  domaine: string;

  @Input()
  note: NoteComplementaireDTO;

  @Input()
  isReadonly: boolean;

  isTypeNoteValide: boolean = true;

  isLangueValide: boolean = true;

  isInterlocuteurValide: boolean = true;

  isLangueVisible: boolean = false;

  isInterlocuteurVisible: boolean = false;

  inputOptionsTypeNotes: InputOptionCollection;
  inputOptionsLangues: InputOptionCollection;
  inputOptionsInterlocuteurs: InputOptionCollection;
  inputOptionsConsentementenFicheEnregistreur: InputOptionCollection;

  @Input()
  dureeFicheAppelDto: DureeFicheAppelDTO;

  @Input("setInputOptionsTypeNotes")
  public set setInputOptionsTypeNotes(listeNote: InputOptionCollection) {
    this.inputOptionsTypeNotes = listeNote
  }

  @Input("setInputOptionsLangues")
  public set setInputOptionLangues(listeLangue: InputOptionCollection) {
    this.inputOptionsLangues = listeLangue;
  }

  @Input("setInputOptionsInterlocuteurs")
  public set setInputOptionsInterlocuteurs(listeInterlocuteur: InputOptionCollection) {
    this.inputOptionsInterlocuteurs = listeInterlocuteur;
  }

  @Input()
  public set setInputOptionConsentementenFicheEnregistreur(listeConsentement: InputOptionCollection) {
    this.inputOptionsConsentementenFicheEnregistreur = listeConsentement;
  }

  @Input()
  libelleString: string;

  @Input()
  noteComplementaireDTO: NoteComplementaireDTO;

  @Output()
  terminerClick: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  retourClick: EventEmitter<void> = new EventEmitter<void>();

  //Références aux composants Chosen pour faire des focus ou d'identifier les champs en erreurs
  @ViewChild("listeTypeNoteHTML", { static: false })
  listeTypeNoteHTML: SigctChosenComponent;

  @ViewChild("listeLangueHTML", { static: false })
  listeLangueHTML: SigctChosenComponent;

  @ViewChild("appDureeFicheAppel", { static: false })
  appDureeFicheAppel: DureeFicheAppelComponent;

  @ViewChild("fCom", { static: true })
  form: NgForm;

  // Variables of file component 
  @Output()
  ajouterFileEvent = new EventEmitter();

  @Output()
  deleteFileEvent = new EventEmitter();

  @Input()
  listeFichiers: UsagerSanterSocialFichierDTO[] = [];

  @Output()
  cancelEvent = new EventEmitter();

  @ViewChild("managerFilesBatchComponent", { static: false })
  managerFilesBatchComponent: ManagerFilesBatchComponent;

  showListeProfile: boolean = false;
  showColReference: boolean = false;
  showColTitre: boolean = true;
  showColDescription: boolean = true;

  typeFichierAccepter: string;
  urlBaseMiniatureImg: string;
  displayedColumns: string[] = ['aprecu', 'nom', 'titre', 'description', 'actions'];
  idFicheAppel: number;
  idFichier: number;
  subscription: Subscription = new Subscription();

  constructor(public fichierService: FichiersApiService,
    private modalConfirmService: ConfirmationDialogService) { }

  /**
   * Exécute le chargement initial du composant depuis le wrapper ou depuis le ngIniti
   */
  public initialiserNoteComplementaire(noteComplementaireDto: NoteComplementaireDTO) {
    // Reset le formulaire avec les données du DTO
    this.resetForm(noteComplementaireDto);

    // Met le focus sur le champ Type de note
    this.setlisteTypeNoteHTMLFocus();
  }

  /**
   * Déclencher seulement lors de la création du composant.  Les changements d'onglet
   * passe par la méthode : initialiserNoteComplementaire()
   */
  ngOnInit(): void {
    // Ajuste la visibilité des listes langue et interlocuteur selon le type de note.
    this.onTypeNoteChange();

    // Met le focus sur le champ Type de note
    this.setlisteTypeNoteHTMLFocus();

    this.urlBaseMiniatureImg = this.fichierService.getUrlBaseTelechargement();
  }

  ngAfterViewInit(): void {
    this.listeTypeNoteHTML?.focus();
  }


  /**
   * Notifie le composent parent lorsque l'utilisateur clique sur le bouton "Retour".
   */
  onBtnRetourClick(): void {
    this.retourClick.emit();
  }

  /**
   * Méthode qui met en rouge les champs invalides et qui produit l'événment
   * pour enregistrer la note dans la BD.
   */
  onBtnTerminerClick(): void {

    this.isTypeNoteValide = true;

    if (!this.note.typeNoteCode) {
      this.isTypeNoteValide = false;
    }

    if (this.isLangueVisible && !this.note.langueAppelCode) {
      this.isLangueValide = false;
    }

    if (this.isLangueVisible && !this.note.interlocuteurCode) {
      this.isInterlocuteurValide = false;
    }

    this.terminerClick.emit({
      "note": this.note,
      "files": this.getFilesObjets(this.listeFichiers),
      "detailsFiles": this.getDataFilesToTrait(this.listeFichiers),
    });
  }

  /**
   * Sur changement de la liste de type note, affiche ou cache les champs selon
   * leur environnement.
   */
  onTypeNoteChange(): void {
    if (this.domaine == DOMAINE_SA) {
      if (this.note.typeNoteCode != null && this.note.typeNoteCode != 'NT10') {
        this.isInterlocuteurVisible = true;
        this.isLangueVisible = true;
      } else {
        this.isInterlocuteurVisible = false;
        this.isLangueVisible = false;
      }
    } else if (this.domaine == DOMAINE_SO) {
      if (!this.note.langueAppelCode) {
        this.note.langueAppelCode = "100";
      }
      if (this.note.typeNoteCode != null && this.note.typeNoteCode != '10') {
        this.isInterlocuteurVisible = true;
        this.isLangueVisible = true;
      } else {
        this.isInterlocuteurVisible = false;
        this.isLangueVisible = false;
      }
    }
  }

  onTypeNoteValide(event): void {

  }

  onLangueChange(): void {

  }

  onLangueValide(): void {

  }

  onInterlocuteurChange(): void {

  }

  onInterlocuteurValide(): void {

  }

  /**
   * Reset le formulaire avec les données du DTO
   */
  private resetForm(noteComplementaireDto: NoteComplementaireDTO): void {
    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    const valeursParDefaut: any = {
      typenote: noteComplementaireDto?.typeNoteCode,
      langue: noteComplementaireDto?.langueAppelCode,
      interlocuteur: noteComplementaireDto?.interlocuteurCode,
      note: noteComplementaireDto?.notecompl,
      consentementenFicheEnregistreur: noteComplementaireDto.consentementenFicheEnregistreur,
    };

    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);
  }

  /**
   * Met le focus sur Type Note
   */
  setlisteTypeNoteHTMLFocus(): void {
    if (this.listeTypeNoteHTML) {
      this.listeTypeNoteHTML.value = null;
      this.listeTypeNoteHTML.focus();
    }

  }

  /**
   * Change la valeur de la liste de langue
   * @param val
   */
  setlisteLangueHTMLValeur(val): void {
    if (val && this.listeLangueHTML) {
      this.listeLangueHTML.value = val;
    }

  }


  /**
   * Extraction de la durée calculée / corrigée depuis le composant DureeFicheAppel
   */
  getDureeFicheAppel(): DureeFicheAppelDTO {

    return this.appDureeFicheAppel.getDureeFicheAppelDTO();

  }

  public isNotVide(): boolean {

    let dureeDTO = this.appDureeFicheAppel.getDureeFicheAppelDTO()

    if (!StringUtils.isEmpty(this.note.notecompl) || !StringUtils.isEmpty(this.note.typeNoteCode) || (dureeDTO.dureeCorrigee != null || dureeDTO.dureeCorrigee != undefined) || !StringUtils.isEmpty(dureeDTO.detailsDureeCorrigee) || this.listeFichiers.length > 0) {
      return true;
    }
    return false;
  }

  getDomaineClass(): string {
    return DOMAINE_SA == this.domaine ? "sa" : "so";
  }


  // Functions's section of file component

  onAjouterFichierToList(event: any): void {
    this.ajouterFileEvent.emit(event);
  }

  onSupprimerFichierFromList(event) {
    this.deleteFileEvent.emit(event);
  }

  private getFilesObjets(source: UsagerSanterSocialFichierDTO[]): File[] {
    let files: File[] = [];
    for (let i = 0; i < source?.length; i++) {
      if (source[i].file) {
        files.push(source[i].file);
      }
    }
    return files;
  }

  private getDataFilesToTrait(listeFichiersToAdd: UsagerSanterSocialFichierDTO[]): DetailsFile[] {
    return this.getDetailsFiles(listeFichiersToAdd);
  }

  private getDetailsFiles(source: UsagerSanterSocialFichierDTO[]): DetailsFile[] {
    let onlineDataFiles: DetailsFile[] = [];
    for (let i = 0; i < source?.length; i++) {
      let onlineDataFile: DetailsFile = new DetailsFile();
      if (source[i].id) {
        onlineDataFile.id = source[i].id;
      }

      onlineDataFile.description = source[i].description;
      onlineDataFile.titre = source[i].titre;
      onlineDataFile.nom = source[i].nom;

      onlineDataFiles.push(onlineDataFile)
    }

    return onlineDataFiles;
  }

  onListFichier(event: any) { }

  onTelechargerFichier(event: any) { }

  isFichierReadOnly() {
    return false;
  }

  onBtnCancelClick(): void {
    this.openModal('confirm_popup_cancel');
  }

  confirmCancelClick(): void {
    this.closeModal('confirm_popup_cancel');
    this.cancelEvent.emit();
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  resetDureeFicheAppel(detailParDefaut: string): void {
    this.appDureeFicheAppel.resetFields(detailParDefaut);
  }

  resetFileComponent(): void {
    this.listeFichiers = [];
    this.managerFilesBatchComponent.initFichirePourAjouter();
    this.managerFilesBatchComponent.filesButchSubject.next(this.listeFichiers);
  }
}
