import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DureeFicheAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/duree-fiche-appel-dto';
import { FicheAppelChronoService } from 'projects/sigct-service-ng-lib/src/lib/services/fiche-appel-chrono.service';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ConfirmationDialogService } from '../../modal-confirmation-dialog/modal-confirmation-dialog.service';

const TIMER_INTERVALLE_SECONDES: number = 30;

@Component({
  selector: 'msss-duree-fiche-appel',
  templateUrl: './duree-fiche-appel.component.html',
  styleUrls: ['./duree-fiche-appel.component.css']
})
export class DureeFicheAppelComponent implements OnInit, OnDestroy {
  private timer: any;

  dureeFicheAppelDto: DureeFicheAppelDTO = new DureeFicheAppelDTO();

  labelDureeCalculee: string = "sigct.ss.f_appel.terminaison.dureefiche.dureechronometree";
  dureeCalculee: string = "00:00:00";

  dureeCorrigeeHH: string = null;
  dureeCorrigeeMM: string = null;
  dureeCorrigeeSS: string = null;

  @Input()
  isDisabled = false

  @Input()
  correctionFicheAppel: boolean;

  msgConfirmerDureePopup: string = ""; // Message affiché dans le popup de confirmation

  @Input("libelleCreeLe")
  libelleCreeLe: string = "sigct.ss.f_appel.terminaison.dureefiche.fichecreeele";

  @Input("dureeFicheAppel")
  public set dureeFicheAppel(duree: DureeFicheAppelDTO) {
    if (duree) {
      this.dureeFicheAppelDto = duree;

      // S'assure que la date est une Date et non un number.
      if (typeof duree.dateDebut == "number") {
        this.dureeFicheAppelDto.dateDebut = new Date(duree.dateDebut);
      }

      this.labelDureeCalculee = duree.dureeCumulee ? "sigct.ss.f_appel.terminaison.dureefiche.dureechronometree" : "sigct.ss.f_appel.terminaison.dureefiche.dureecalculee";

      this.calculerDuree();

      this.setHHMMSS(this.dureeFicheAppelDto.dureeCorrigee);
    }
  }

  @Output()
  onClickConfirmerDureeEvent = new EventEmitter<boolean>();

  constructor(
    private translateService: TranslateService,
    private confirmationDialogService: ConfirmationDialogService,
    private ficheAppelChronoService: FicheAppelChronoService) {
  }

  ngOnInit(): void {
    this.startTimerCalculerDuree();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Retourne le DureeFicheAppelDTO en édition.
   */
  public getDureeFicheAppelDTO(): DureeFicheAppelDTO {
    this.dureeFicheAppelDto.dureeCorrigee = this.convertirHHMMSSEnSecondes(this.dureeCorrigeeHH, this.dureeCorrigeeMM, this.dureeCorrigeeSS);

    if (this.dureeFicheAppelDto?.dureeCumulee) {
      // Ajoute la durée du chrono à la duréee de la fiche.
      this.dureeFicheAppelDto.dureeCumulee += this.ficheAppelChronoService.getDuree();
    }

    return this.dureeFicheAppelDto;
  }

  /**
   * Calcule la durée corrigée en secondes.
   * @param hh
   * @param mm
   * @param ss
   */
  private convertirHHMMSSEnSecondes(hh: string, mm: string, ss: string): number {
    const hre: number = (hh ? Number(hh) : 0);
    const min: number = (mm ? Number(mm) : 0);
    const sec: number = (ss ? Number(ss) : 0);

    const duree: number = (hre * 3600) + (min * 60) + sec;

    return (duree == 0 ? null : duree);
  }

  /**
   * Pad avec des 0 à gauche à la sortie du champ Hre.
   */
  onDureeCorrigeeHHBlur() {
    if (this.dureeCorrigeeHH) {
      this.dureeCorrigeeHH = this.dureeCorrigeeHH.padStart(2, "0");
    }
  }

  /**
   * Pad avec des 0 à gauche à la sortie du champ Min.
   */
  onDureeCorrigeeMMBlur() {
    if (this.dureeCorrigeeMM) {
      this.dureeCorrigeeMM = this.dureeCorrigeeMM.padStart(2, "0");
    }
  }

  /**
   * Pad avec des 0 à gauche à la sortie du champ Sec.
   */
  onDureeCorrigeeSSBlur() {
    if (this.dureeCorrigeeSS) {
      this.dureeCorrigeeSS = this.dureeCorrigeeSS.padStart(2, "0");
    }
  }

  /**
   * Calcul la durée en ajoutant la durée du chrono en cours à la durée cumulée.
   */
  private calculerDuree(): void {
    let duree: number = 0;

    if (this.dureeFicheAppelDto?.dureeCumulee) {
      duree = this.dureeFicheAppelDto.dureeCumulee;

      // Si le chrono est en cours d'exécution, on ajoute son temps d'exécution à la durée.
      if (this.ficheAppelChronoService.isRunning()) {
        duree += DateUtils.calculerNbSecondesBetween(this.ficheAppelChronoService.getDTO().dateDebut, new Date());
      }
    } else if (this.dureeFicheAppelDto?.dateDebut) {
      const dateFin: Date = this.dureeFicheAppelDto.dateFin ? this.dureeFicheAppelDto.dateFin : new Date();
      duree = DateUtils.calculerNbSecondesBetween(this.dureeFicheAppelDto.dateDebut, dateFin);
    }

    this.dureeCalculee = DateUtils.secondesToHHMMSS(duree);
  }

  /**
   * Détermine les heures, les minutes et les secondes de la durée corrigée à partir d'un nombre de secondes.
   * Alimente les champs dureeCorrigeeHH, dureeCorrigeeMM et dureeCorrigeeSS
   * @param dureeCorrigee durée corrigée en secondes
   */
  private setHHMMSS(dureeCorrigee: number): void {
    if (dureeCorrigee) {
      // Convertit des secondes en hh:mm:ss
      const hhmmss: string = DateUtils.secondesToHHMMSS(dureeCorrigee);

      const parts: string[] = hhmmss.split(":");

      this.dureeCorrigeeHH = parts[0];
      this.dureeCorrigeeMM = parts[1];
      this.dureeCorrigeeSS = parts[2];
    } else {
      this.dureeCorrigeeHH = null;
      this.dureeCorrigeeMM = null;
      this.dureeCorrigeeSS = null;
    }
  }

  /**
   * Démare le timer qui recalcule la durée calculé à toutes les 30 secondes.
   */
  private startTimerCalculerDuree(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (this.dureeFicheAppelDto) {
        if (this.dureeFicheAppelDto.dureeCumulee) {
          // Maj la durée chronométrée uniquement si le chrono roule
          if (this.ficheAppelChronoService.isRunning()) {
            this.calculerDuree();
          }
        } else {
          this.calculerDuree();
        }
      }
    }, TIMER_INTERVALLE_SECONDES * 1000);
  }

  /**
   * Lorsque l'utilisateur clique sur le bouton Oui de la fenêtre de confirmation confirmer-duree-popup.
   */
  onBtnConfirmerDureeClick(confirmation: boolean) {
    this.onClickConfirmerDureeEvent.emit(confirmation);
  }

  /**
   * Valide le contenu du composant DureeFicheAppelComponent avant d'effectuer la terminaison.
   * Une confirmation de l'utilisateur peut être nécessaire.
   */
  validerDureeFicheAppelBeforeTerminer(dureeRecommandee: number, msgDureeCorrigee: string, msgDureeCalculee: string, msgDureeCumulee: string): boolean {
    const dureeFicheAppelDto: DureeFicheAppelDTO = this.getDureeFicheAppelDTO();
    if (dureeFicheAppelDto) {
      if (dureeFicheAppelDto.dureeCorrigee) {
        if (dureeFicheAppelDto.dureeCorrigee > dureeRecommandee) {
          // Durée corrigée : La durée corrigée de la fiche est supérieure à 1 heure. Désirez-vous continuer ?
          this.msgConfirmerDureePopup = this.translateService.instant(msgDureeCorrigee);
          this.confirmationDialogService.openAndFocus("confirmer-duree-popup", "confirmer-duree-btn-oui");
          return false;
        }
      } else if (dureeFicheAppelDto.dureeCumulee) {
        if (dureeFicheAppelDto.dureeCumulee > dureeRecommandee) {
          // Durée chronométrée : La durée chronométrée de la fiche est supérieure à 1 heure. Désirez-vous continuer ?
          this.msgConfirmerDureePopup = this.translateService.instant(msgDureeCumulee);
          this.confirmationDialogService.openAndFocus("confirmer-duree-popup", "confirmer-duree-btn-oui");
          return false;
        }
      } else if (dureeFicheAppelDto.dateDebut) {
        const dateFin: Date = dureeFicheAppelDto.dateFin ? dureeFicheAppelDto.dateFin : new Date();
        let dureeCalculee: number = DateUtils.calculerNbSecondesBetween(dureeFicheAppelDto.dateDebut, dateFin);
        if (dureeCalculee > dureeRecommandee) {
          // Durée calculée : La durée calculée de la fiche est supérieure à 1 heure. Désirez-vous continuer ?
          this.msgConfirmerDureePopup = this.translateService.instant(msgDureeCalculee);
          this.confirmationDialogService.openAndFocus("confirmer-duree-popup", "confirmer-duree-btn-oui");
          return false;
        }
      }
    }
    return true;
  }

  isFormVide(dureeCorrigeeInitial?: number): boolean {
    const isDureeCorrigeeEmpty: boolean = StringUtils.isBlank(this.dureeCorrigeeHH)
      && StringUtils.isBlank(this.dureeCorrigeeMM)
      && StringUtils.isBlank(this.dureeCorrigeeSS);
    if (this.correctionFicheAppel) {
      if (dureeCorrigeeInitial) {
        const aux: number = this.convertirHHMMSSEnSecondes(this.dureeCorrigeeHH, this.dureeCorrigeeMM, this.dureeCorrigeeSS);
        return dureeCorrigeeInitial == aux;
      } else {
        return isDureeCorrigeeEmpty;
      }
    } else {
      return isDureeCorrigeeEmpty && StringUtils.isBlank(this.dureeFicheAppelDto?.detailsDureeCorrigee);
    }
  }

  resetFields(detailParDefaut: string = null): void {
    this.calculerDuree();
    this.dureeCorrigeeHH = null;
    this.dureeCorrigeeMM = null;
    this.dureeCorrigeeSS = null;
    this.dureeFicheAppelDto.detailsDureeCorrigee = detailParDefaut;
  }
}
