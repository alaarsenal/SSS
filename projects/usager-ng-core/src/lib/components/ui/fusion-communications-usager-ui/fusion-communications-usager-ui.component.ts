import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { InputOption } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { TypeEquipementCommunicationEnum } from '../../../models/type-equipement-communication.enum';
import { UsagerCommDTO } from '../../../models/usager-comm-dto';
import { UsagerCommFusionDTO } from '../../../models/usager-comm-fusion-dto';
import FusionUtils from '../../../utils/fusion-utils';
import { FusionCommunicationsUsagerPopupComponent, FusionData } from './fusion-communications-usager-popup/fusion-communications-usager-popup.component';




@Component({
  selector: 'fusion-communications-usager-ui',
  templateUrl: './fusion-communications-usager-ui.component.html',
  styleUrls: ['./fusion-communications-usager-ui.component.css']
})
export class FusionCommunicationsUsagerComponent implements OnInit {
  readonly TEL: string = TypeEquipementCommunicationEnum.TEL;
  readonly TEL2: string = TypeEquipementCommunicationEnum.TEL2;
  readonly COURELEC: string = TypeEquipementCommunicationEnum.COURELEC;

  private subscriptions: Subscription = new Subscription();
  private listeCommunicationUsager1: UsagerCommDTO[] = null;
  private listeCommunicationUsager2: UsagerCommDTO[] = null;

  tableauCommunications: UsagerCommDTO[][] = [];

  /** Liste des index des communications en erreur */
  indexCommunicationsNonValides: number[] = [];

  @Input()
  idUsager1: number;

  @Input()
  idUsager2: number;

  @Input()
  typeEquipementCommOptions: InputOption[];

  @Input()
  typeCoordonneeCommOptions: InputOption[];

  @Input()
  set communicationsUsager1(listeComm: UsagerCommDTO[]) {
    this.listeCommunicationUsager1 = listeComm;
    this.initTableauCommunications();
  }

  @Input()
  set communicationsUsager2(listeComm: UsagerCommDTO[]) {
    this.listeCommunicationUsager2 = listeComm;
    this.initTableauCommunications();
  }

  constructor(
    private matDialog: MatDialog,
    private alertStore: AlertStore,
    private translateService: TranslateService,
    private materialModalDialogService: MaterialModalDialogService) {
  }

  ngOnInit(): void {
  }

  /**
   * Peuple l'usager fusionné en fusionnant les données de usager1 et usager2.
   */
  private creerUsagerFusionDto(usagerComm1Dto: UsagerCommDTO, usagerComm2Dto: UsagerCommDTO): UsagerCommFusionDTO {
    let usagerCommFusionDto: UsagerCommFusionDTO = null;

    // Indique si les 2 communications sont identiques
    const isIdentique: boolean = (usagerComm1Dto && usagerComm2Dto &&
      usagerComm1Dto.actif === usagerComm2Dto.actif &&
      usagerComm1Dto.coordonnees == usagerComm2Dto.coordonnees &&
      usagerComm1Dto.detail == usagerComm2Dto.detail &&
      usagerComm1Dto.codeTypeCoordComm == usagerComm2Dto.codeTypeCoordComm &&
      usagerComm1Dto.codeTypeEquipComm == usagerComm2Dto.codeTypeEquipComm);

    // On fusionne les communications si:
    //    -une des deux communications est absente
    //    -les deux communications sont identiques
    if (!usagerComm1Dto || !usagerComm2Dto || (isIdentique)) {
      usagerCommFusionDto = new UsagerCommFusionDTO();

      usagerCommFusionDto.idSource1 = usagerComm1Dto?.id;
      usagerCommFusionDto.idSource2 = usagerComm2Dto?.id;

      usagerCommFusionDto.actif = FusionUtils.equalsOuUniqueBool(usagerComm1Dto?.actif, usagerComm2Dto?.actif);
      usagerCommFusionDto.coordonnees = FusionUtils.equalsOuUnique(usagerComm1Dto?.coordonnees, usagerComm2Dto?.coordonnees);
      usagerCommFusionDto.courriel = FusionUtils.equalsOuUnique(usagerComm1Dto?.courriel, usagerComm2Dto?.courriel);
      usagerCommFusionDto.numero = FusionUtils.equalsOuUnique(usagerComm1Dto?.numero, usagerComm2Dto?.numero);
      usagerCommFusionDto.poste = FusionUtils.equalsOuUnique(usagerComm1Dto?.poste, usagerComm2Dto?.poste);
      usagerCommFusionDto.detail = FusionUtils.equalsOuUnique(usagerComm1Dto?.detail, usagerComm2Dto?.detail);
      usagerCommFusionDto.codeTypeCoordComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.codeTypeCoordComm, usagerComm2Dto?.codeTypeCoordComm);
      usagerCommFusionDto.nomTypeCoordComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.nomTypeCoordComm, usagerComm2Dto?.nomTypeCoordComm);
      usagerCommFusionDto.codeTypeEquipComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.codeTypeEquipComm, usagerComm2Dto?.codeTypeEquipComm);
      usagerCommFusionDto.nomTypeEquipComm = FusionUtils.equalsOuUnique(usagerComm1Dto?.nomTypeEquipComm, usagerComm2Dto?.nomTypeEquipComm);
    }
    return usagerCommFusionDto;
  }

  /**
   * Prend la valeur du champ coordonnees et le distribue dans les champs numero, poste et courriel du dto selon le type d'équipement.
   * @param usagerCommDto 
   */
  private initUsagerComm(usagerCommDto: UsagerCommDTO): UsagerCommDTO {
    if (usagerCommDto?.coordonnees) {
      if (usagerCommDto?.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
        usagerCommDto.courriel = usagerCommDto.coordonnees;
      } else if (usagerCommDto?.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL || usagerCommDto?.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL2) {
        const telParts: string[] = usagerCommDto.coordonnees.split("#");
        usagerCommDto.numero = telParts[0];
        usagerCommDto.poste = telParts.length > 1 ? telParts[1] : null;
      } else {
        usagerCommDto.numero = usagerCommDto.coordonnees;
      }
    }
    return usagerCommDto;
  }

  /**
   * Vérifie si 2 communications possèdent des contenus identiques dans leur champ coordonnee.
   * Les courriels sont comparés tels quels, mais les numéro de téléphone sont décomposés en numéro + poste 
   * afin d'effectuer la comparaison uniquement sur le numéro.
   * @param usagerComm1 
   * @param usagerComm2 
   * @returns 
   */
  private haveSameCoordonnee(usagerComm1: UsagerCommDTO, usagerComm2: UsagerCommDTO): boolean {
    let coord1: string = null;
    if (usagerComm1.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
      coord1 = usagerComm1.coordonnees;
    } else {
      coord1 = usagerComm1.coordonnees.split("#")[0];
    }

    let coord2: string = null;
    if (usagerComm2.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
      coord2 = usagerComm2.coordonnees;
    } else {
      coord2 = usagerComm2.coordonnees.split("#")[0];
    }

    return StringUtils.safeEqualsIgnoreCase(coord1, coord2);
  }

  /**
   * Construction du tableau des communications.
   * Les communications ayant des coordonnées identiques sont inscrites sur un même ligne.
   */
  private initTableauCommunications(): void {
    this.resetErreurs();

    if (this.listeCommunicationUsager1 && this.listeCommunicationUsager2) {
      this.tableauCommunications = [];

      // Parcourt les communications de l'usager 1 afin de trouver des communications identiques dans usager 2.
      this.listeCommunicationUsager1.forEach((usager1CommDto: UsagerCommDTO) => {
        // Variables des 3 communications de la ligne du tableau
        let usager1Comm: UsagerCommDTO = this.initUsagerComm(usager1CommDto);
        let usager2Comm: UsagerCommDTO = null;
        let usagerFusionComm: UsagerCommFusionDTO = null;

        // Vérifie si la communication de l'usager 1 existe dans les communications de l'usager 2.
        const usager2MemeCoord: UsagerCommDTO = this.listeCommunicationUsager2.find((value: UsagerCommDTO) => {
          return this.haveSameCoordonnee(usager1CommDto, value);
        });

        if (usager2MemeCoord) {
          usager2Comm = this.initUsagerComm(usager2MemeCoord);
        }

        usagerFusionComm = this.creerUsagerFusionDto(usager1Comm, usager2Comm);

        let listeCommunication: UsagerCommDTO[] = [usager1Comm, usager2Comm, usagerFusionComm];
        this.tableauCommunications.push(listeCommunication)
      });

      // Parcourt les communications de l'usager 2 afin de trouver les communications non identiques à l'usager 1.
      this.listeCommunicationUsager2.forEach((usager2CommDto: UsagerCommDTO) => {
        // Vérifie si la communication de l'usager 2 existe dans les communications de l'usager 1.
        const usager2MemeCoord: UsagerCommDTO = this.listeCommunicationUsager1.find((value: UsagerCommDTO) => {
          return this.haveSameCoordonnee(usager2CommDto, value);
        });

        // Les communciations identiques à l'usager 1 ont été traités dans le forEach précédent. On les ignore ici.
        if (!usager2MemeCoord) {
          let usager2Comm: UsagerCommDTO = this.initUsagerComm(usager2CommDto);
          let usagerFusionComm = this.creerUsagerFusionDto(null, usager2Comm);

          let listeCommunication: UsagerCommDTO[] = [null, usager2Comm, usagerFusionComm];
          this.tableauCommunications.push(listeCommunication)
        }
      });
    }
  }

  /**
   * Retourne true si des communications sont vides dans la colonne Fusion.
   * @returns 
   */
  containsCommVides(): boolean {
    return this.getListeDtoColFusion().includes(null);
  }

  /**
   * Retourne la liste des UsagerCommDTO résultant de la fusion.
   * @returns 
   */
  getListeCommFusionnes(): UsagerCommDTO[] {
    return this.getListeDtoColFusion().filter(value => value != null);
  }

  private getListeDtoColFusion(): UsagerCommDTO[] {
    if (this.tableauCommunications.length == 0) {
      return [];
    } else {
      let dtos: UsagerCommDTO[] = [];
      this.tableauCommunications.forEach((row: UsagerCommDTO[]) => {
        dtos.push(row[2]);
      });
      return dtos;
    }
  }

  /**
   * Affiche le popup d'édition d'une communication.
   * @param index index de la communication à éditer dans le tableau
   */
  onEditerCommunication(index: number): void {
    let usagerCommDtos: UsagerCommDTO[] = this.tableauCommunications[index];

    const matDialogConfig = new MatDialogConfig();
    matDialogConfig.disableClose = true;
    matDialogConfig.autoFocus = false;
    matDialogConfig.restoreFocus = true;
    matDialogConfig.width = "1300px";
    matDialogConfig.maxWidth = "90vw";
    matDialogConfig.data = {
      index: index,
      idUsagerIdent1: this.idUsager1,
      idUsagerIdent2: this.idUsager2,
      usagerComm1Dto: usagerCommDtos[0],
      usagerComm2Dto: usagerCommDtos[1],
      usagerCommFusionDto: usagerCommDtos[2],
      typeEquipementCommOptions: this.typeEquipementCommOptions,
      typeCoordonneCommOptions: this.typeCoordonneeCommOptions
    };

    const dialogRef = this.matDialog.open(FusionCommunicationsUsagerPopupComponent, matDialogConfig);

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe((fusionData: FusionData) => {
        if (fusionData) {
          this.tableauCommunications[fusionData.index][2] = fusionData.usagerCommFusionDto;
        }
      })
    );
  }

  /**
   * Vide le contenu de la colonne fusion sur la ligne indexRow.
   * @param indexRow 
   */
  onSupprimerCommunication(indexRow: number): void {
    this.tableauCommunications[indexRow][2] = null;
  }

  /**
   * Valide les communications fusionnées. Ajoute les messages d'erreur dans l'AlertStore au besoin.
   * @returns true si aucune erreur
   */
  validerCommFusionnes(): boolean {
    this.resetErreurs();

    let distinctTypeCoordEquipNonValides: Set<string> = new Set();

    const usagerCommDtos: UsagerCommDTO[] = this.getListeDtoColFusion();
    if (usagerCommDtos && usagerCommDtos.length > 0) {
      usagerCommDtos.forEach((usagerComm: UsagerCommDTO, index: number) => {
        if (usagerComm?.actif) {
          // Compte le nombre de comm actives ayant les mêmes moyens et types.
          const nbOccurence: number = usagerCommDtos.filter((value: UsagerCommDTO) => value?.actif && usagerComm.codeTypeEquipComm == value?.codeTypeEquipComm && usagerComm.codeTypeCoordComm == value?.codeTypeCoordComm).length;

          if (nbOccurence > 1) {
            this.indexCommunicationsNonValides.push(index);
            distinctTypeCoordEquipNonValides.add(usagerComm.codeTypeEquipComm + ":" + usagerComm.codeTypeCoordComm);
          }
        }
      });
    }

    if (distinctTypeCoordEquipNonValides.size > 0) {
      let messages: string[] = [];

      // Affiche un message d'erreur pour chaque combinaison type équipement/type coordonnées ayant des doublons.
      distinctTypeCoordEquipNonValides.forEach((coordEquipement: string) => {
        // Sépare le type équipement et le type coordonnée "TEL:PRINC"
        const types: string[] = coordEquipement.split(":");
        const typeEquipement = types[0];
        const typeCoordonnee = types[1];

        const libelleEquipement: string = FusionUtils.getLabelFromInputOptions(typeEquipement, this.typeEquipementCommOptions);
        const libelleCoordonnee: string = FusionUtils.getLabelFromInputOptions(typeCoordonnee, this.typeCoordonneeCommOptions);

        // us-iu-e30003=Communications : plusieurs {{0}} {{1}} ont été sélectionnés. Vous devez choisir un type différent pour chacun des {{0}}.
        const msg: string = this.translateService.instant("us-iu-e30003", { 0: libelleEquipement, 1: libelleCoordonnee });
        messages.push(msg);
      });

      const alertTitle: string = this.translateService.instant("girpi.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Supprime les erreurs du composant. Retire les encadrés rouges.
   */
  public resetErreurs(): void {
    this.indexCommunicationsNonValides = [];
  }
}
