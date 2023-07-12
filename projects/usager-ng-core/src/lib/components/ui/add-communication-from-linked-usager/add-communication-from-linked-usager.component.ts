import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import TelephoneUtils from 'projects/sigct-service-ng-lib/src/lib/utils/telephone-utils';
import { SafePipe } from 'projects/sigct-ui-ng-lib/src/lib/pipes/pipe-safe/safe.pipe';
import { Action, FormTopBarOptions } from "projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options";
import { TypeEquipementCommunicationEnum } from '../../../models/type-equipement-communication.enum';
import { UsagerCommDTO } from '../../../models/usager-comm-dto';




@Component({
  selector: 'app-add-communication-from-linked-usager',
  templateUrl: './add-communication-from-linked-usager.component.html',
  styleUrls: ['./add-communication-from-linked-usager.component.css'],
  providers: [SafePipe]
})
export class AddCommunicationFromLinkedUsagerComponent implements OnInit {

  @Output("retourModifierUsager")
  retourModifierUsager = new EventEmitter<number>();

  @Output("forwardCommunication")
  forwardCommunicationEvent: EventEmitter<UsagerCommDTO> = new EventEmitter();

  @Input("communications")
  communications: UsagerCommDTO[];

  formTopBarOptions: FormTopBarOptions;
  topBarreFixe: boolean = false;

  constructor(private translateService: TranslateService, private safePipe: SafePipe) { }

  ngOnInit(): void {
    this.initTopBar();
  }

  actionRetourModifierUsager = (): void => {
    this.retourModifierUsager.emit();
  }

  private initTopBar() {
    let topBarActions: Action[] = [];

    let topBarActionRetourModifierUsager: Action = {
      label: this.translateService.instant("usager.importation.revenir"),
      actionFunction: this.actionRetourModifierUsager,
      icon: "fa fa-times fa-lg",
      compId: 'retourBtn',
      extraClass: "btn-default btn-auto-disabled"
    };

    topBarActions = [topBarActionRetourModifierUsager];

    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      actions: topBarActions
    };
  }

  /**
   * Format des informations de communication.
   * @param usagerCommunication
   */
  formatActionUsagerCommunication(usagerCommunication: UsagerCommDTO) {
    let usCommFormate: string;

    if (usagerCommunication.actif) {
      usCommFormate = '<span style="color:black;font-weight:bold;">' + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    } else {
      usCommFormate = '<span style="color:grey;font-weight:bold;">' + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    }

    let coordFormate = "";
    if (usagerCommunication.coordonnees != null) {
      if (usagerCommunication.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
        coordFormate = usagerCommunication.coordonnees;
      } else {
        coordFormate = TelephoneUtils.formatTelephoneAvecPoste(usagerCommunication.coordonnees, true);
      }
    }

    usCommFormate += coordFormate;
    if (usagerCommunication.detail != null) {
      usCommFormate += " (<i>" + usagerCommunication.detail + "</i>)";
    }

    return this.safePipe.transform(usCommFormate, 'html');
  }

  forwardCommunication(comm: UsagerCommDTO): void {
    this.forwardCommunicationEvent.emit(comm);
  }
}
