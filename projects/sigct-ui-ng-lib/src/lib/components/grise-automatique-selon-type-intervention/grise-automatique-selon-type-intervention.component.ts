import { AfterViewInit, Component, EventEmitter, Injectable, Input, IterableDiffers, OnInit, Output, ViewChild } from '@angular/core';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';

export interface Disabling {
  isDisabled? : boolean;
  id? : string
  val: any;
}

@Injectable({
  providedIn: 'root'
})
export class TypeficheSelectioneService {

  codTypeSubject = new BehaviorSubject<string>("DETAIL");
  public changementCodeType: Observable<any> = this.codTypeSubject.asObservable();

  elements = new Array<Disabling>();

  public codeType: string = 'DETAIL'

  public majHyperliensLeftMenu: any;

  public byPassConfirmation = false;

  constructor(private ficheAppelDatService: FicheAppelDataService) {

  }

  public initAvecFicheActive(){
    if (this.ficheAppelDatService.getFicheAppelActive()!=null)
      this.codeType = this.ficheAppelDatService.getFicheAppelActive().typeConsultation;
  }

  public isDetail(): boolean {
    return this.codeType == 'DETAIL';
  }

  public isAbreg(): boolean {
    return this.codeType == 'ABREG';
  }

  public isNomPert(): boolean {
    return this.codeType == 'NONPERT';
  }

  public isDemress() {
    return this.codeType == 'DEMRESS';
  }

  public isMtcp() {
    return this.codeType == 'MTCP';
  }
}

@Component({
  selector: 'msss-grise-automatique-selon-type-intervention',
  templateUrl: './grise-automatique-selon-type-intervention.component.html',
  styleUrls: ['./grise-automatique-selon-type-intervention.component.css']
})
export class GriseAutomatiqueSelonTypeInterventionComponent implements OnInit, AfterViewInit {

  private codeReferenceTypeFiche: string;

  private codeSelected: string;

  @Input() public alertCofirmationChangement = true;
  @Input() public abregDiabledList: Array<any> = [];
  @Input() public nomPertDiabledList: Array<any> = [];
  @Input() public demandeRessoucesList: Array<any> = [];
  @Input() public mesureTemporaireList: Array<any> = [];

  @Output() public onChangementTypeCancel = new EventEmitter<string>();
  @Output() public onChangementTypeConfirme = new EventEmitter<any>();

  private enabledControlMap: Map<String, Array<any>> = new Map();

  private isInintialise = false;

  constructor(
    private modalConfirmService: ConfirmationDialogService,
    private typeFicheSelectioneService: TypeficheSelectioneService
  ) { }

  ngOnInit() {
    this.initEnabledControlMap();
  }

  ngAfterViewInit(): void {
  }

  @Input('codeReferenceTypeFiche')
  set setCodeReferenceTypeFiche(code: string) {
    this.codeSelected = code ? code : 'DETAIL';
    if (this.codeSelected != 'DETAIL' && this.codeSelected != 'MTCP'
              && this.alertCofirmationChangement
              && code != this.typeFicheSelectioneService.codeType
              && this.isInintialise
              && !this.typeFicheSelectioneService.byPassConfirmation) {

      this.modalConfirmService.openAndFocus('gliser_confirm', 'gliser_cancel_confirm_button');

    } else {
        this.confirmeChangement();
    }

    this.isInintialise = code != undefined;
  }



  confirmeChangement() {
    if (this.abregDiabledList) {

      this.codeReferenceTypeFiche = this.codeSelected;
      this.typeFicheSelectioneService.codeType = this.codeReferenceTypeFiche;
      this.typeFicheSelectioneService.codTypeSubject.next(this.typeFicheSelectioneService.codeType);


      // créer la liste pour desactiver (griser)
      const listDisableds: Array<any> = this.enabledControlMap.get(this.codeReferenceTypeFiche)

      // creér la liste pour activer
      const listEnableds = new Array<any>();
      const keys =  this.enabledControlMap.keys()
      let key = keys.next();
      while (!key.done) {
        this.enabledControlMap.get(key.value)
                .filter(item => !listDisableds.find(i=>i==item))
                .forEach(item=>listEnableds.push(item));
        key = keys.next();
      }

      //activer les champs seleon le codeReferenceTypeFiche
      listEnableds.forEach( target => {
        target.isDisabled = false;
      });


      // desactiver les champs seleon le codeReferenceTypeFiche
      this.codeReferenceTypeFiche = this.codeSelected;
      if (listDisableds) {
        listDisableds.forEach(target =>{
          target.isDisabled = true;
        });
      }

      if (this.isInintialise && !this.typeFicheSelectioneService.byPassConfirmation) {
        const listReturn = new Array<Disabling>();
        listEnableds.forEach(i => listReturn.push(i));
        listDisableds.forEach(i => listReturn.push(i));
        this.typeFicheSelectioneService.elements = listReturn;
        this.onChangementTypeConfirme.emit(this.typeFicheSelectioneService);
      }

      this.typeFicheSelectioneService.byPassConfirmation = false;
    }

    this.modalConfirmService.close('gliser_confirm');

   }

  cancelChanghement() {

    this.onChangementTypeCancel.emit(this.codeReferenceTypeFiche);
  }

  initEnabledControlMap() {

    this.enabledControlMap.set('DETAIL', []);
    this.enabledControlMap.set('ABREG', this.abregDiabledList);
    this.enabledControlMap.set('NONPERT', this.nomPertDiabledList);
    this.enabledControlMap.set('DEMRESS', this.demandeRessoucesList);
    this.enabledControlMap.set('MTCP', this.mesureTemporaireList);

  }

}
