import { DatePipe } from '@angular/common';
import { Component, DoCheck, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AgeUtils from 'projects/sigct-service-ng-lib/src/lib/utils/age-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { AgeDTO } from 'projects/usager-ng-core/src/lib/models/age-dto';
import { ReferencesService } from 'projects/usager-ng-core/src/lib/services/references.service';
import { UtilitaireService } from 'projects/usager-ng-core/src/lib/services/utilitaire.service';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { InputOption, InputOptionCollection } from '../../utils/input-option';
import { SigctChosenComponent } from '../sigct-chosen/sigct-chosen.component';
import { GroupeAgeOptions } from './sigct-group-age.options';


@Component({
  selector: 'msss-sigct-groupe-age',
  templateUrl: './sigct-groupe-age.component.html',
  providers: [ReferencesService, UtilitaireService, DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SigctGroupeAgeComponent),
      multi: true
    }
  ],
  styleUrls: ['./sigct-groupe-age.component.css'],

})

export class SigctGroupeAgeComponent implements OnInit, ControlValueAccessor, OnDestroy, DoCheck {

  constructor(private referencesService: ReferencesService,
    private utilitaireService: UtilitaireService,
    private datePipe: DatePipe, private appContextStore: AppContextStore) {

  }

  groupeAgeOptions: GroupeAgeOptions = new GroupeAgeOptions();

  @Input()
  ageMax: number = 200; // 200 ans par défaut

  @Input("idCalendrier")
  idCalendrier: string;

  @Input("name")
  name: string;

  @Input("id")
  id: string;

  @Input("startDate")
  startDate: string;

  @Input("endDate")
  endDate: string;

  @Output()
  valueChangeEvent: EventEmitter<GroupeAgeOptions> = new EventEmitter();

  @Output()
  messageErreur: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  messageAvertissement: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('groupeAge', { static: true })
  groupeAgeChosen: SigctChosenComponent;

  @Input("idAns")
  idAns: string;

  @Input("idMois")
  idMois: string;

  @Input("idJours")
  idJours: string;

  @Input("idSelect")
  idSelect: string;

  @Input()
  dateNaissanceClass: string = "col-md-3 no-padding-left";
  @Input()
  amjClass: string = "col-md-2 no-padding-left";
  @Input()
  groupeAgeClass: string = "col-md-3 no-padding-left";
  @Input()
  calculAgeClass: string = "col-md-2 no-padding-left padding-top-20";

  AMJLabel?: string;

  listGroupeAge: ReferenceDTO[];

  subscriptions: Subscription = new Subscription();

  public dateNaissanceEmpty: boolean = true;
  public ageAnneeEmpty: boolean = true;
  public ageMoisEmpty: boolean = true;
  public ageJourEmpty: boolean = true;
  public isContextAppel: boolean = true;

  private aujourdhui: Date;

  private labelSelectionnez: string = 'Sélectionnez...';

  private listeGroupeDAgeSub: Subscription;

  public inputOptionGroupeAge: InputOptionCollection = {
    name: "groupeAge",
    options: []
  }

  ngOnInit() {

    this.aujourdhui = new Date();

    this.endDate = DateUtils.getDateToAAAAMMJJ(this.aujourdhui); // Date du jour par défaut

    let dateAgeMax: Date = DateUtils.addYearsToDate(this.aujourdhui, -this.ageMax);
    dateAgeMax.setDate(dateAgeMax.getDate());
    this.startDate = this.datePipe.transform(dateAgeMax, "yyyy-MM-dd"); // Date du jour - âge max

    // Récupère la liste des groupes d'âge dans la BD.
    this.getListeGroupeAge();

    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appcontext: AppContext) => {
        this.isContextAppel = appcontext.isContextAppel;
      })
    );
  }

  ngDoCheck() {
    if (this.groupeAgeOptions.dateNaissance) {
      this.dateNaissanceEmpty = false;
    }
    else {
      this.dateNaissanceEmpty = true;
    }

    if (this.groupeAgeOptions.annees) {
      this.ageAnneeEmpty = false;
    }
    else {
      this.ageAnneeEmpty = true;
    }

    if (this.groupeAgeOptions.mois) {
      this.ageMoisEmpty = false;
    }
    else {
      this.ageMoisEmpty = true;
    }

    if (this.groupeAgeOptions.jours) {
      this.ageJourEmpty = false;
    }
    else {
      this.ageJourEmpty = true;
    }
  }

  ngOnDestroy() {
    if (this.listeGroupeDAgeSub) { this.listeGroupeDAgeSub.unsubscribe(); }
    this.subscriptions.unsubscribe();
  }

  // Both onChange and onTouched are functions
  onChange: any = () => { };
  onTouched: any = () => { };

  public registerOnChange(fn) {
    this.onChange = fn;
  }

  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  public writeValue(value: GroupeAgeOptions) {
    if (value) {
      this.groupeAgeOptions = value;

      if (value.dateNaissance) {
        // Sélectionne le groupe d'âge dans la liste déroulante et calcule l'âge selon la date de naissance
        this.subscriptions.add(
          this.calculerAgeSelonDateNaissance().subscribe()
        );
      } else if (value.annees != null || value.mois != null || value.jours != null) {
        // Sélectionne le groupe d'âge dans la liste déroulante et calcule l'âge selon AMJ
        this.subscriptions.add(
          this.calculerAgeSelonAMJ().subscribe()
        );
      } else {
        // Désélectionne le groupe d'âge dans la liste déroulante et vide l'âge
        this.resetChamps();
      }
    } else {
      this.groupeAgeOptions = new GroupeAgeOptions();
    }
  }

  anneesChanged(args) {
    if (this.groupeAgeOptions.annees) {
      this.groupeAgeOptions.annees = this.groupeAgeOptions.annees.replace(".", ",")
    }

    this.subscriptions.add(
      this.calculerAgeSelonAMJ().subscribe(_ => {
        this.valueChangeEvent.emit(this.groupeAgeOptions);
        this.onChange(this.groupeAgeOptions);
      })
    );
  }

  moisChanged(args) {
    if (this.groupeAgeOptions.mois) {
      this.groupeAgeOptions.mois = this.groupeAgeOptions.mois.replace(".", ",")
    }

    this.subscriptions.add(
      this.calculerAgeSelonAMJ().subscribe(_ => {
        this.valueChangeEvent.emit(this.groupeAgeOptions);
        this.onChange(this.groupeAgeOptions);
      })
    );
  }

  joursChanged(args) {
    if (this.groupeAgeOptions.jours) {
    }

    this.subscriptions.add(
      this.calculerAgeSelonAMJ().subscribe(_ => {
        this.valueChangeEvent.emit(this.groupeAgeOptions);
        this.onChange(this.groupeAgeOptions);
      })
    );
  }

  private isEmpty(value: any): boolean {
    if (value && value != undefined && value != null && value.toString() != "") {
      return false;
    }
    return true;
  }

  dateNaissanceChanged(args) {

    if (args != "" || (args == "" && this.isEmpty(this.groupeAgeOptions.annees) && this.isEmpty(this.groupeAgeOptions.mois) && this.isEmpty(this.groupeAgeOptions.jours))) {
      this.groupeAgeOptions.annees = null;
      this.groupeAgeOptions.mois = null;
      this.groupeAgeOptions.jours = null;

      this.subscriptions.add(
        this.calculerAgeSelonDateNaissance().subscribe(_ => {
          this.valueChangeEvent.emit(this.groupeAgeOptions);
          this.onChange(this.groupeAgeOptions);
        })
      );
    }
  }

  /**
   * Calcule et affiche l'âge à patir de la date saisie.
   */
  private calculerAgeSelonDateNaissance(): Observable<void> {
    if (this.groupeAgeOptions.dateNaissance) {
      const dateNaissance: string = this.datePipe.transform(this.groupeAgeOptions.dateNaissance, "yyyy-MM-dd");

      if (dateNaissance.length == 10) {
        return this.utilitaireService.getAgeParDateNaissance('' + dateNaissance).pipe(map(
          (ageDTO: AgeDTO) => {
            if (ageDTO.years <= this.ageMax) {
              // Affiche l'âge.
              this.afficherAge(ageDTO, "dateNaissance");

              // Sélectionne le groupe d'âge dans la liste déroulante.  
              this.setGroupeAge(ageDTO);
            } else {
              this.resetChamps();
            }
            return;
          }
        ));
      } else {
        this.resetChamps();
        return of(void 0);
      }
    } else {
      this.resetChamps();
      return of(void 0);
    }
  }

  /**
   * Met à blanc tous les champs du composant.
   */
  resetChamps() {
    this.AMJLabel = "";

    this.groupeAgeOptions.dateNaissance = null;
    this.groupeAgeOptions.annees = null;
    this.groupeAgeOptions.mois = null;
    this.groupeAgeOptions.jours = null;
    this.groupeAgeOptions.groupe = null;

    this.setGroupeAge(null);
  }

  /**
   * Calcule et affiche l'âge à partir des champs AA, MM et JJ.
   */
  private calculerAgeSelonAMJ(): Observable<void> {
    this.AMJLabel = "";

    let annees: number = 0;
    let mois: number = 0;
    let jours: number = 0;

    if (this.groupeAgeOptions.annees != null && typeof this.groupeAgeOptions.annees != undefined && this.groupeAgeOptions.annees !== '') {
      annees = Number(this.groupeAgeOptions.annees.replace(",", "."));
    }

    if (this.groupeAgeOptions.mois != null && typeof this.groupeAgeOptions.mois != undefined && this.groupeAgeOptions.mois !== '') {
      mois = Number(this.groupeAgeOptions.mois.replace(",", "."));
    }

    if (this.groupeAgeOptions.jours != null && typeof this.groupeAgeOptions.jours != undefined && this.groupeAgeOptions.jours.toString() != '') {
      jours = Number(this.groupeAgeOptions.jours.toString());
    }

    if (annees > 0 || mois > 0 || jours > 0) {
      return this.utilitaireService.getAgeParDateNaissanceCompose(annees, mois, jours).pipe(
        map((ageDTO: AgeDTO) => {
          if ((ageDTO.years < this.ageMax) || (ageDTO.years == this.ageMax && !ageDTO.months && !ageDTO.days)) {
            // Affiche l'âge.
            this.afficherAge(ageDTO, "age");

            // Sélectionne le groupe d'âge dans la liste déroulante.  
            this.setGroupeAge(ageDTO);
          } else {
            this.resetChamps();
          }
          return;
        })
      );
    } else {
      this.resetChamps();
      return of(void 0);
    }
  }

  /** Affiche l'âge. Ex: 2 ans  1 mois 
   * Le paramètre origine indique quel champ a été modifié. Les valeurs possibles sont :
   * + age, quand les champs ans, mois ou jours ont été modifié
   * + dateNaissance, quand le champ (date picker) date de naissance a été modifié
   */
  private afficherAge(ageDto: AgeDTO, origine: string) {
    this.AMJLabel = "";

    if (ageDto != null) {
      this.AMJLabel = AgeUtils.formaterAgeFormatLong(ageDto.years, ageDto.months, ageDto.days);

      if (ageDto.years > 100 && ageDto.years < 150) {
        this.messageAvertissement.emit(origine);
      } else {
        if (ageDto.years >= 150) {
          this.messageErreur.emit(origine);
        }
      }
    }
  }

  /** Sélectionne le groupe d'âge dans la liste déroulante. */
  private setGroupeAge(ageDto: AgeDTO) {
    let id: number = null;
    let code: string = null;
    let nbMois = 0;
    if (ageDto && this.listGroupeAge) {
      //TODO: le jour ou le parametre hors context d'appel influence le calcule d'age,
      // on ajoute le filre de 'isContextAppel' et son code lié.
      let isNbMonthMoreThanOne = ageDto.months >= 1 || ageDto.years >= 1;
      if (isNbMonthMoreThanOne) {
        nbMois = (ageDto.years * 12) + ageDto.months;
      }

      let groupeAgeFound = this.listGroupeAge.find(groupeAge => this.validateGroupeAgeByNbMonth(nbMois, groupeAge))
      id = groupeAgeFound.id;
      code = groupeAgeFound.code;
    }

    this.groupeAgeOptions.groupeId = id;
    this.groupeAgeOptions.groupe = code;
    this.groupeAgeChosen.value = code;
  }

  private validateGroupeAgeByNbMonth(nbMois: number, groupeAge: ReferenceDTO): boolean {
    let valideMinBound = nbMois >= groupeAge.min;
    let valideMaxBound = groupeAge.max == null || nbMois <= groupeAge.max;
    return valideMinBound && valideMaxBound;
  }

  /**
   * Récupère la liste des groupes d'âges possibles dans la BD.
   */
  public getListeGroupeAge() {
    let self = this;

    this.setGroupeAge(null);

    if (self.inputOptionGroupeAge.options[0] === undefined) {
      self.inputOptionGroupeAge.options.push({ label: this.labelSelectionnez, value: null });
    }

    if (this.listeGroupeDAgeSub) { this.listeGroupeDAgeSub.unsubscribe(); }
    this.listeGroupeDAgeSub = this.referencesService.getListeGroupeDAge().subscribe((res: ReferenceDTO[]) => {
      this.listGroupeAge = res;
      res.forEach((item: ReferenceDTO) => {
        self.inputOptionGroupeAge.options.push({ label: item.nom, value: item.code });
      });

      if (this.groupeAgeOptions.dateNaissance) {
        this.subscriptions.add(
          this.calculerAgeSelonDateNaissance().subscribe()
        );
      }
    });
  }

  public getAgeSelonDateNaissance(): AgeDTO {

    const dateNaissance: string = this.datePipe.transform(this.groupeAgeOptions.dateNaissance, "yyyy-MM-dd");
    let ageDto: AgeDTO;

    if (dateNaissance.length == 10) {

      let dtNaissance: Date = new Date(dateNaissance);
      ageDto.years = this.aujourdhui.getFullYear() - dtNaissance.getFullYear();

      let nbMois = this.aujourdhui.getMonth() - dtNaissance.getMonth();

    } else {
      this.resetChamps();
    }

    return ageDto;
  }

  onGroupeAgeSelected(selectedOption: InputOption) {
    if (selectedOption) {
      let groupeAge: ReferenceDTO = this.listGroupeAge.find((groupeAge: ReferenceDTO) => groupeAge.code == selectedOption.value);
      this.groupeAgeOptions.groupeId = groupeAge.id;
      this.groupeAgeOptions.groupe = groupeAge.code;
    } else {
      this.groupeAgeOptions.groupeId = null;
      this.groupeAgeOptions.groupe = null;
    }
  }
}
