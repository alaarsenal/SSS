import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { TranslateService } from '@ngx-translate/core';
import { InfoAppelCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/info-appel-cti-dto';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import TelephoneUtils from 'projects/sigct-service-ng-lib/src/lib/utils/telephone-utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'msss-cti-aide-saisie',
  templateUrl: './cti-aide-saisie.component.html',
  styleUrls: ['./cti-aide-saisie.component.css']
})
export class CtiAideSaisieComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  listeNomPrenom: string[] = [];
  noTel: string = "";
  isNomAnonyme: boolean = false;
  isTelAnonyme: boolean = false;

  labelMenuNom: string = "";
  labelMenuPrenom: string = "";

  /** Style à ajouter à chaque colonne du composent */
  @Input()
  colsStyle: string = null;

  @Input()
  set infoAppelCti(value: InfoAppelCtiDTO) {
    this.noTel = "";
    this.listeNomPrenom = [];

    this.isNomAnonyme = false;
    this.isTelAnonyme = false;

    if (value) {
      if (value.nomAppel) {
        if (value.nomAppel?.toLowerCase() == "anonymous") {
          this.isNomAnonyme = true;
        } else {
          this.listeNomPrenom = value.nomAppel.split(" ").filter((value: string) => !StringUtils.isBlank(value));
        }
      }

      if (value.noTelAppel) {
        if (value.noTelAppel.toLowerCase() == "anonymous") {
          this.isTelAnonyme = true;
        } else if (value.noTelAppel.startsWith("+1")) {
          // Un tél interurbain débute par "+". On garde que les interurbains Nord-américain débutant par "+1".
          // Formate les chiffres après le +1. Ex: +15554443333 -> 555 444-3333
          this.noTel = TelephoneUtils.formatTelephone(value.noTelAppel.substring(2));
        } else if (value.noTelAppel.startsWith("+")) {
          // Tout autre interurbain provenant d'une autre partie du monde est traité comme un anonyme.
          this.isTelAnonyme = true;
        } else {
          // C'est un appel local, on le formate tel quel.
          this.noTel = TelephoneUtils.formatTelephone(value.noTelAppel);
        }
      }
    }
  }

  @Output()
  nomSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  prenomSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  telephoneSelected: EventEmitter<string> = new EventEmitter<string>();

  @ViewChildren(MatButton)
  private matButtons: QueryList<MatButton>;

  constructor(
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.translateService.get(["sigct.ss.usager.telephonie.nom", "sigct.ss.usager.telephonie.prenom"]).subscribe((labels: string[]) => {
        this.labelMenuNom = labels["sigct.ss.usager.telephonie.nom"];
        this.labelMenuPrenom = labels["sigct.ss.usager.telephonie.prenom"];
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onMenuNomClick(nom: string): void {
    this.nomSelected.emit(nom);
  }

  onMenuPrenomClick(prenom: string): void {
    this.prenomSelected.emit(prenom);
  }

  onBtnNoTelClick(noTel: string): void {
    this.telephoneSelected.emit(noTel);
  }

  /**
   * Positionne le focus sur le premier bouton d'aide à la saisie.
   * @returns true si le focus a été mis sur un bouton, false si aucun bouton disponible
   */
  resetFocus(): boolean {
    if (this.matButtons?.first) {
      this.matButtons.first.focus();
      return true;
    }
    return false;
  }
}
