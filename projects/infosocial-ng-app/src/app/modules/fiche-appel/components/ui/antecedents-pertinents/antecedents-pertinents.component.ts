import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Renderer2, DoCheck, Output, EventEmitter } from '@angular/core';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { AntecedentDTO } from '../../../models/antecedent-dto';
import { NgForm } from '@angular/forms';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';

@Component({
  selector: 'app-antecedents-pertinents',
  templateUrl: './antecedents-pertinents.component.html',
  styleUrls: ['./antecedents-pertinents.component.css']
})
export class AntecedentsPertinentsComponent implements OnInit, OnDestroy, DoCheck {

  antecedent: AntecedentDTO = new AntecedentDTO();
  

  public pertinence: number = null;
  public listeLabelPertinence: Array<string> = new Array<string>();

  public actionLinks: ActionLinkItem[];
  public listeAntecedents: Array<AntecedentDTO> = new Array<AntecedentDTO>();
  private listeAntecedentsDesc: Array<ReferenceDTO> = new Array<ReferenceDTO>();
  private elementSelectionner: AntecedentDTO;


  public messageConfirmerAjout: string;
  public libelleMessageErreur: string;

  public isPresenceActive: boolean = false;
  public isAbscenceActive: boolean = false;
  public preTitle: string;
  public absTitle: string;

  public isPertinenceValide:boolean = true;
  public isAntecedentValide:boolean = true;
  public isPresenceValide:boolean = true;

  public infoBulleAntecedent: string = 'Sélectionnez une valeur';

  public readOnly:string = '';

  public idFiche:number;

  public auMoinsUnPresence:boolean = true;

  idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;
  
  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private renderer2: Renderer2) {

  }
  
  
  /**
   * Peuple la liste des antecedents sauvegardes dans la base de donnees
   */
  @Input("listeAntecedent")
  public set listeAntecedent(antecedentsDTO: AntecedentDTO[]) {
    this.listeAntecedents = antecedentsDTO;
  } 

  @Input("inputOptionsAntecedents")
  public set inputOptionsAntecedent(options:InputOptionCollection){
    this.inputOptionsAntecedents = options;
  }

  @Input("listeAntecedentRef")
  public set listeAntecedentRefs(option:ReferenceDTO[]){
    this.listeAntecedentsDesc = option;
  }

  
  @Input("inputOptionsPertinence")
  public set inputOptionsPertinences(options:InputOptionCollection){
    this.inputOptionsPertinence = options;
  }
  


  //Les événements qui sont poussés au parent
  @Output()
  outputSubmit: EventEmitter<any> = new EventEmitter();

  @Output()
  outputDelete: EventEmitter<any> = new EventEmitter();



  ngOnInit() {

  }


  //Conteneur pour la liste de valeurs
  public inputOptionsAntecedents: InputOptionCollection = {
    name: "antecedents",
    options: []
  };

  public inputOptionsPertinence: InputOptionCollection = {
    name: "pertinences",
    options: []  
  };

  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @ViewChild('PremierElem', { read: ElementRef, static: true }) private radioPertinence: ElementRef;

  

  /**
   * vérifie si l'antécédent est vide.  S'il est vide on soumet la page, sinon, 
   * afficher une boite de dialogue.
   * 
   * @param element
   */
  confirmerModifierAntecedent(element: any){

    this.idElementSelectionne = element.id;

    if (!this.isAntecendantVide()) {
      this.openModal('confirm_popup_modif');
    } else {
      this.remplacerAntecedent();
    }

  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerAntecedent(element: any){

    this.idElementSelectionne = element.id;
    this.openModal('confirm_popup_supri');

  }


 /**
  * Formate les liens d'action selon la présence ou l'absence d'un antécédent.
  * @param antecedant 
  */
  formatActionAntecedent(antecedant: AntecedentDTO){

    let anteStr: string;

    anteStr = '<span style="color:black;font-weight:bold;">';
    
    //Afficher l'icône 
    if (antecedant.presence == '1'){
      anteStr +=  '<i id="pre" class="fa fa-check" style="color: green;" ></i>';
    } else {
      anteStr += '<i id="pre" class="fa fa-ban" style="color: red;" ></i>';
    }
    
    anteStr += " " + antecedant.antecedent + " ";
    
    anteStr +=  "</span>  ";

    //Noir mais non en gras
    if(antecedant.details){
      anteStr +=  " <span style='color:black;'>(<i>" + antecedant.details + "</i>)</span>";
    }

    return anteStr;

  }

  /**
   * obtenir l'objet AntecedentDTO a partir de son id
   * @param id
   */
  getAntecedentDTOById(id: number) {
    this.listeAntecedents.forEach(
      (antecedentDTO: AntecedentDTO) => {
        if (antecedentDTO.id == id) {
          this.elementSelectionner = antecedentDTO;
        }
      }
    )
  }

  /**
   * Remplace l'antécédent dans le formulaire.
   */
  remplacerAntecedent(){

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getAntecedentDTOById(this.idElementSelectionne);
    let data: AntecedentDTO = this.elementSelectionner;
    this.antecedent.id = data.id;

    this.antecedent.details = data.details;
    this.antecedent.presence = data.presence;
    if(this.antecedent.presence == '1'){
      this.isPresenceActive = true;
      this.isAbscenceActive = false;

    }if(this.antecedent.presence == '0'){
      this.isAbscenceActive = true;
      this.isPresenceActive = false;
    }
    this.antecedent.referenceAntecedent = data.referenceAntecedent;


    this.antecedent.actif = data.actif;

    this.closeModal('confirm_popup_modif');

  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  onPresenceClick(){
    this.isPresenceActive = !this.isPresenceActive;

    if(this.isPresenceActive){

      this.isAbscenceActive = false;

    }

  }

  onAbsenceClick(){
    this.isAbscenceActive = !this.isAbscenceActive;

    if(this.isAbscenceActive){

      this.isPresenceActive = false;

    }

    

  }

  /**
   * Met à jour l'infobulle de l'antécédent.  Met la description si elle est
   * disponnible.
   */
  onAntecedentChange(){
  
    this.listeAntecedentsDesc.forEach(item => {
       const antecedentCode =  this.antecedent.referenceAntecedent;
       
       if (item.id == antecedentCode){
          if (item.description != null){
             this.infoBulleAntecedent = item.description;
          } else {
             this.infoBulleAntecedent = item.nom;
          }
      
       }
    }); 
    

  }

  onPertinenceChange(){

    if (this.pertinence == 0) {

      // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
      let valeursParDefaut: any = {
         referenceAntecedent: null
      };

      // Réinitialise la liste des antecedents
      this.form.resetForm(valeursParDefaut);
      

    }

  }

  setAbsenceStyle():string{
    if (this.isAbscenceActive){
      return " color: red;";
    } else {
      return "color: gray;";

    }
  }
  
  setPresenceStyle():string{
    if (this.isPresenceActive){
      return "color: green;";
  
    } else {
      return "color: gray;";
  
 
    }
  }

  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }

  supprimerAntecedent(){
    
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getAntecedentDTOById(this.idElementSelectionne);
    let data: AntecedentDTO = this.elementSelectionner;
    this.antecedent.id = data.id;

    this.outputDelete.emit("deleteAntecedent");

  }


  onSubmit() {
    
    this.detecterFicheActive();

    if (this.validerAntecedent()){
      this.saveDonnees();
    }
  
  }

  //Sauvegarder les données 
  saveDonnees(): void {
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    if(this.isPresenceActive){
      this.antecedent.presence = '1';
    } else {
      this.antecedent.presence = '0';
    }

    //Affiche un message d'avertissement quand on détecte un doublon
    if (this.isDoublon() == true){
      
      let messages : string[] = [];
      const msg = this.translateService.instant("sa-iu-a00007");
      messages.push(msg);

      this.creerErreurs(messages,'Avertissement',AlertType.WARNING);

    }

    this.antecedent.ficheAppel = this.idFiche;

    this.outputSubmit.emit("submitAntecedent");

  }

  /**
   * Méthode pour afficher un message d'erreur du service.
   * @param err
   */
  creerErreur(err:any){
    let messages : string[] = [];
        const msg = err;
        messages.push(msg);
  
        const alertM: AlertModel = new AlertModel();
        alertM.title = this.libelleMessageErreur;
        alertM.type = AlertType.ERROR;
        alertM.messages = messages;
  
        if (this.alertStore.state) {
            this.alertStore.setState(this.alertStore.state.concat(alertM));
        } else {
            this.alertStore.setState([alertM]);
        }
  }

  //Messages d'erreurs de validation
  creerErreurs(messages : string[], titre: string, erreurType: AlertType){
    
        const alertM: AlertModel = new AlertModel();
        alertM.title = titre;
        alertM.type = erreurType;
        alertM.messages = messages;
  
        if (this.alertStore.state) {
            this.alertStore.setState(this.alertStore.state.concat(alertM));
        } else {
            this.alertStore.setState([alertM]);
        }
  }

  /**
   * reinitialiser le formulaire d'edition du moyen de communication
   */
  reinitialiserAntecedent() {
    this.antecedent = new AntecedentDTO();

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      referenceAntecedent: null,
      detail: null
    };

    this.isPresenceActive = false;
    this.isAbscenceActive = false;

    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;

  }

  //Libère les abonnements
  ngOnDestroy(){
   
  }

  /**
   * Désactive les boutons radios de pertinence après un changement de données
   */
  ngDoCheck(): void {
 
    if (this.auMoinsUnPresence){
      this.renderer2.setProperty(this.radioPertinence.nativeElement,'disabled','disabled');
    } else {
      this.renderer2.setProperty(this.radioPertinence.nativeElement,'disabled','');
    }
 }

  isAntecendantVide(): boolean{
    
    if((this.antecedent.details === undefined || this.antecedent.details === null ) &&
       this.antecedent.presence === undefined &&
       (this.antecedent.referenceAntecedent === undefined || this.antecedent.referenceAntecedent === null)){
         return true;
       }
       return false;
  }

  /**
   * Lance un message d'erreur si la fiche d'appel n'est pas trouvée.
   */
  detecterFicheActive(){
    let messages: string[] = [];

    if (this.antecedent.ficheAppel != null){
      
     this.radioPertinence.nativeElement.lastChild.firstElementChild.focus();


      if (this.antecedent.ficheAppel == null){
        
          
        const msg = this.translateService.instant("ss-sv-e00023", { 0:  'this.antecedent.ficheAppel.id.toString()'});
        messages.push(msg);

        this.creerErreurs(messages,this.libelleMessageErreur,AlertType.ERROR);

      }

      
    } else {

      //Il n'y a pas de numéro de fiche d'appel actif
      const msg = this.translateService.instant("ss-sv-e00022");
      messages.push(msg);

      this.creerErreurs(messages,this.libelleMessageErreur,AlertType.ERROR);

    }
  }

  validerAntecedent():boolean{

    let valide:boolean = true;

    let messages: string[] = [];

     //Vider les alertes déjà présentes
     if (this.alertStore.state) {
      this.alertStore.setState([]);
    }
    
    //Présence obligaoire
     if (this.isAbscenceActive == false && this.isPresenceActive == false){

      const msg = this.translateService.instant("sa-iu-e00005");

      messages.push(msg);

      valide = false;

      this.isPresenceValide = valide;


    } //Antécédent null
    if (this.antecedent.referenceAntecedent == null){

     const msg = this.translateService.instant("sa-iu-e00004");
     messages.push(msg);


     valide = false;

     this.isAntecedentValide = valide;

   }

   this.creerErreurs(messages,this.libelleMessageErreur,AlertType.ERROR);

   return valide;

  }

  isDoublon():boolean{
    
    let rep:boolean = false;
    
    this.listeAntecedents.forEach((ant: AntecedentDTO) => {
      
      let condition1:boolean = (ant.details == this.antecedent.details);
      let condition2:boolean = (ant.presence == this.antecedent.presence);
      let condition3:boolean = (ant.referenceAntecedent == this.antecedent.referenceAntecedent);

      if(condition1 &&
         condition2 &&
         condition3 ){
          
          rep = true;

         }
    });

    return rep;
  }

  notifierChangement(liste: AntecedentDTO[]):void{
     this.listeAntecedents = liste;
     this.reinitialiserAntecedent();
  }

  isAntecedentsValide():boolean{
    
    return this.isAntecedentValide;
  }

}
