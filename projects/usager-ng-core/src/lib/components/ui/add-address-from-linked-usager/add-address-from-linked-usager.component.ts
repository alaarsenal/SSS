import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UsagerLieuResidenceDTO } from '../../../models/usager-lieu-residence-dto';
import { TranslateService } from '@ngx-translate/core';
import { Action, FormTopBarOptions } from "projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options";
import { SafePipe } from 'projects/sigct-ui-ng-lib/src/lib/pipes/pipe-safe/safe.pipe';
import { enumTypeAdr } from '../adresses-usager/adresses-usager.component';




@Component({
  selector: 'app-add-address-from-linked-usager',
  templateUrl: './add-address-from-linked-usager.component.html',
  styleUrls: ['./add-address-from-linked-usager.component.css'],
  providers: [SafePipe]
})
export class AddAddressFromLinkedUsagerComponent implements OnInit {

  @Output("retourModifierUsager")
  retourModifierUsager = new EventEmitter<number>();

  @Output("forwardAddress")
  forwardAddressEvent: EventEmitter<UsagerLieuResidenceDTO> = new EventEmitter();

  @Input("addresses")
  addresses: UsagerLieuResidenceDTO[];

  formTopBarOptions: FormTopBarOptions;
  topBarreFixe: boolean = false;

  constructor(private translateService: TranslateService, private safePipe : SafePipe) { }

  ngOnInit(): void {
    this.initTopBar();
  }

  actionRetourModifierUsager = (): void => {
    this.retourModifierUsager.emit();
  }

  private initTopBar() {
    let topBarActions: Action[] = [];

    let topBarActionRetourModifierUsager: Action = {
      label: "Fermer",
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
   * Format des informations adresse.
   * @param usagerLieuResidence
   */
  formatActionUsagerLieuResidence(usagerLieuResidence: UsagerLieuResidenceDTO) {
    let formattedAddress: string = "";

    if (usagerLieuResidence) {
      let codePostal = "";
      if (usagerLieuResidence.codePostal && usagerLieuResidence.codePostal != null) {
        codePostal = usagerLieuResidence.codePostal.substring(0, 3) + " " + usagerLieuResidence.codePostal.substring(3, 6);
      }

      let adresseLigneUn = [usagerLieuResidence.adresse, usagerLieuResidence.nomCategSubdvImmeu, usagerLieuResidence.subdvImmeu, usagerLieuResidence.municNom, codePostal];
      let adresseLigneDeux = [usagerLieuResidence.codeRegion, ' - ', usagerLieuResidence.nomRegion, usagerLieuResidence.nomProvince, usagerLieuResidence.nomPays];
      let adresseLigneTrois: string = "";
      if (usagerLieuResidence.rtsNom) {
        adresseLigneTrois = usagerLieuResidence.rtsNom;
      }
      if (usagerLieuResidence.rlsNom) {
        if (adresseLigneTrois) {
          adresseLigneTrois += ", ";
        }
        adresseLigneTrois += usagerLieuResidence.rlsNom;
      }
      if (usagerLieuResidence.clscNom) {
        if (adresseLigneTrois) {
          adresseLigneTrois += ", ";
        }
        adresseLigneTrois += usagerLieuResidence.clscNom;
      }

      let adresseLigneQuatre: string = usagerLieuResidence.detail ? usagerLieuResidence.detail : "";

      let typeAdresse: string = "";
      switch (usagerLieuResidence.codeTypeAdresse) {
        case enumTypeAdr.PRINC: {
          typeAdresse = "Principale";
          break;
        }
        case enumTypeAdr.SECOND: {
          typeAdresse = "Secondaire";
          break;
        }
        case enumTypeAdr.TEMP: {
          typeAdresse = "Temporaire";
          break;
        }
      }

      formattedAddress =
        '<div>' +
        '  <table cellspacing="0" width="100%" style="word-break: break-word;">' +
        '    <tr>' +
        '      <th style="vertical-align:top;"><div style="width:90px">' + typeAdresse + '</div></th>' +
        '      <td width="100%">' +
        '          <div style="word-wrap: break-word; margin-bottom:7px;">' + adresseLigneUn.filter(Boolean).join(" ") + '</div>' +
        '          <div style="word-wrap: break-word; margin-bottom:7px;">' + adresseLigneDeux.filter(Boolean).join(" ") + '</div>';

      if (adresseLigneTrois) {
        formattedAddress += '<div style="word-wrap: break-word; margin-bottom:7px;">' + adresseLigneTrois + '</div>';
      }

      if (adresseLigneQuatre) {
        formattedAddress += '<div style="word-wrap:break-word; margin-bottom:7px;">(<i>' + adresseLigneQuatre + '</i>)</div>';
      }

      formattedAddress += '' +
        '      </td>' +
        '    </tr>' +
        '  </table>' +
        '</div>';
    }
    return this.safePipe.transform(formattedAddress, 'html');
  }

  forwardAddress(address: UsagerLieuResidenceDTO): void {
    this.forwardAddressEvent.emit(address);
  }

}
