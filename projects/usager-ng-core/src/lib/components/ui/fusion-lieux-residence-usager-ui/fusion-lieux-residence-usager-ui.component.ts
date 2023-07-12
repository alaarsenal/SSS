import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { InputOption } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { UsagerLieuResidenceDTO } from '../../../models/usager-lieu-residence-dto';
import { UsagerLieuResidenceFusionDTO } from '../../../models/usager-lieu-residence-fusion-dto';
import FusionUtils from '../../../utils/fusion-utils';
import { FusionData, FusionLieuxResidenceUsagerPopupComponent } from './fusion-lieux-residence-usager-popup/fusion-lieux-residence-usager-popup.component';




@Component({
  selector: 'fusion-lieux-residence-usager-ui',
  templateUrl: './fusion-lieux-residence-usager-ui.component.html',
  styleUrls: ['./fusion-lieux-residence-usager-ui.component.css']
})
export class FusionLieuxResidenceUsagerComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  private listeLieuResidenceUsager1: UsagerLieuResidenceDTO[] = null;
  private listeLieuResidenceUsager2: UsagerLieuResidenceDTO[] = null;

  tableauLieuxResidence: UsagerLieuResidenceDTO[][] = [];

  indexLieuxResNonValides: number[] = [];

  @Input()
  idUsager1: number;

  @Input()
  idUsager2: number;

  @Input()
  typeLieuResidenceOptions: InputOption[];

  @Input()
  set lieuxResidenceUsager1(listeLieuResidence: UsagerLieuResidenceDTO[]) {
    this.listeLieuResidenceUsager1 = listeLieuResidence;
    this.initTableauLieuxResidence();
  }

  @Input()
  set lieuxResidenceUsager2(listeLieuResidence: UsagerLieuResidenceDTO[]) {
    this.listeLieuResidenceUsager2 = listeLieuResidence;
    this.initTableauLieuxResidence();
  }

  constructor(
    private matDialog: MatDialog,
    private alertStore: AlertStore,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
  }

  /**
   * Peuple l'usager fusionné en fusionnant les données de usager1 et usager2.
   */
  private creerUsagerFusionDto(usagerLieuRes1Dto: UsagerLieuResidenceDTO, usagerLieuRes2Dto: UsagerLieuResidenceDTO): UsagerLieuResidenceFusionDTO {
    let usagerLieuResFusionDto: UsagerLieuResidenceFusionDTO = null;

    // Indique si les 2 adresses sont identiques
    const isIdentique: boolean = (usagerLieuRes1Dto && usagerLieuRes2Dto
      && usagerLieuRes1Dto.actif === usagerLieuRes2Dto.actif
      && usagerLieuRes1Dto.codeTypeAdresse == usagerLieuRes2Dto.codeTypeAdresse
      && usagerLieuRes1Dto.noCiviq == usagerLieuRes2Dto.noCiviq
      && usagerLieuRes1Dto.noCiviqSuffx == usagerLieuRes2Dto.noCiviqSuffx
      && usagerLieuRes1Dto.rue == usagerLieuRes2Dto.rue
      && usagerLieuRes1Dto.codeCategSubdvImmeu == usagerLieuRes2Dto.codeCategSubdvImmeu
      && usagerLieuRes1Dto.subdvImmeu == usagerLieuRes2Dto.subdvImmeu
      && usagerLieuRes1Dto.municNom == usagerLieuRes2Dto.municNom
      && usagerLieuRes1Dto.codePostal == usagerLieuRes2Dto.codePostal
      && usagerLieuRes1Dto.codeRegion == usagerLieuRes2Dto.codeRegion
      && usagerLieuRes1Dto.codeProvince == usagerLieuRes2Dto.codeProvince
      && usagerLieuRes1Dto.codePays == usagerLieuRes2Dto.codePays
      && usagerLieuRes1Dto.rtsCode == usagerLieuRes2Dto.rtsCode
      && usagerLieuRes1Dto.rlsCode == usagerLieuRes2Dto.rlsCode
      && usagerLieuRes1Dto.clscCode == usagerLieuRes2Dto.clscCode
      && usagerLieuRes1Dto.detail == usagerLieuRes2Dto.detail);

    // On fusionne les adresses si:
    //    -une des deux adresses est absente
    //    -les deux adresses sont identiques
    if (!usagerLieuRes1Dto || !usagerLieuRes2Dto || (isIdentique)) {
      usagerLieuResFusionDto = new UsagerLieuResidenceFusionDTO();

      usagerLieuResFusionDto.idSource1 = usagerLieuRes1Dto?.id;
      usagerLieuResFusionDto.idSource2 = usagerLieuRes2Dto?.id;

      usagerLieuResFusionDto.actif = FusionUtils.equalsOuUniqueBool(usagerLieuRes1Dto?.actif, usagerLieuRes2Dto?.actif);
      usagerLieuResFusionDto.noCiviq = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.noCiviq, usagerLieuRes2Dto?.noCiviq);
      usagerLieuResFusionDto.noCiviqSuffx = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.noCiviqSuffx, usagerLieuRes2Dto?.noCiviqSuffx);
      usagerLieuResFusionDto.rue = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rue, usagerLieuRes2Dto?.rue);
      usagerLieuResFusionDto.codeCategSubdvImmeu = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeCategSubdvImmeu, usagerLieuRes2Dto?.codeCategSubdvImmeu);
      usagerLieuResFusionDto.nomCategSubdvImmeu = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomCategSubdvImmeu, usagerLieuRes2Dto?.nomCategSubdvImmeu);
      usagerLieuResFusionDto.subdvImmeu = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.subdvImmeu, usagerLieuRes2Dto?.subdvImmeu);
      usagerLieuResFusionDto.municCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.municCode, usagerLieuRes2Dto?.municCode);
      usagerLieuResFusionDto.municNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.municNom, usagerLieuRes2Dto?.municNom);
      usagerLieuResFusionDto.codePostal = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codePostal, usagerLieuRes2Dto?.codePostal);
      usagerLieuResFusionDto.codeTypeAdresse = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeTypeAdresse, usagerLieuRes2Dto?.codeTypeAdresse);
      usagerLieuResFusionDto.nomTypeAdresse = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomTypeAdresse, usagerLieuRes2Dto?.nomTypeAdresse);
      usagerLieuResFusionDto.codeRegion = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeRegion, usagerLieuRes2Dto?.codeRegion);
      usagerLieuResFusionDto.nomRegion = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomRegion, usagerLieuRes2Dto?.nomRegion);
      usagerLieuResFusionDto.codeProvince = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codeProvince, usagerLieuRes2Dto?.codeProvince);
      usagerLieuResFusionDto.nomProvince = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomProvince, usagerLieuRes2Dto?.nomProvince);
      usagerLieuResFusionDto.codePays = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.codePays, usagerLieuRes2Dto?.codePays);
      usagerLieuResFusionDto.nomPays = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.nomPays, usagerLieuRes2Dto?.nomPays);
      usagerLieuResFusionDto.rtsCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rtsCode, usagerLieuRes2Dto?.rtsCode);
      usagerLieuResFusionDto.rtsNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rtsNom, usagerLieuRes2Dto?.rtsNom);
      usagerLieuResFusionDto.rlsCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rlsCode, usagerLieuRes2Dto?.rlsCode);
      usagerLieuResFusionDto.rlsNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.rlsNom, usagerLieuRes2Dto?.rlsNom);
      usagerLieuResFusionDto.clscCode = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.clscCode, usagerLieuRes2Dto?.clscCode);
      usagerLieuResFusionDto.clscNom = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.clscNom, usagerLieuRes2Dto?.clscNom);
      usagerLieuResFusionDto.detail = FusionUtils.equalsOuUnique(usagerLieuRes1Dto?.detail, usagerLieuRes2Dto?.detail);
    }
    return usagerLieuResFusionDto;
  }

  private initTableauLieuxResidence(): void {
    if (this.listeLieuResidenceUsager1 && this.listeLieuResidenceUsager2) {
      this.tableauLieuxResidence = [];

      this.listeLieuResidenceUsager1.forEach((usager1LieuResDto: UsagerLieuResidenceDTO) => {
        let usager1LieuRes: UsagerLieuResidenceDTO = usager1LieuResDto;
        let usager2LieuRes: UsagerLieuResidenceDTO = null;
        let usagerFusionLieuRes: UsagerLieuResidenceFusionDTO = null;

        // Vérifie si l'adresse de l'usager 1 existe dans les adresses de l'usager 2.
        // On considère qu'elle existe si le numéro civique, le nom de la rue et le code postal sont identiques si présents.
        const usager2MemeAdresse: UsagerLieuResidenceDTO = this.listeLieuResidenceUsager2.find((value: UsagerLieuResidenceDTO) => {
          return FusionUtils.isUsagerLieuxResidencesIdentiques(usager1LieuResDto, value);
        });

        if (usager2MemeAdresse) {
          usager2LieuRes = usager2MemeAdresse;
        }

        usagerFusionLieuRes = this.creerUsagerFusionDto(usager1LieuRes, usager2LieuRes);

        let listeLieuResidence: UsagerLieuResidenceDTO[] = [usager1LieuRes, usager2LieuRes, usagerFusionLieuRes];
        this.tableauLieuxResidence.push(listeLieuResidence)
      });

      this.listeLieuResidenceUsager2.forEach((usager2LieuResDto: UsagerLieuResidenceDTO) => {
        // Vérifie si l'adresse de l'usager 2 existe dans les adresses de l'usager 1.
        // On considère qu'elle existe si le numéro civique, le nom de la rue et le code postal sont identiques si présents.
        const usager2MemeAdresse: UsagerLieuResidenceDTO = this.listeLieuResidenceUsager1.find((value: UsagerLieuResidenceDTO) => {
          return FusionUtils.isUsagerLieuxResidencesIdentiques(usager2LieuResDto, value);
        });

        // Les adresses identiques à l'usager 1 ont été traités dans le forEach précédent. On les ignore ici.
        if (!usager2MemeAdresse) {
          let usager2LieuRes: UsagerLieuResidenceDTO = usager2LieuResDto;
          let usagerFusionLieuRes = this.creerUsagerFusionDto(null, usager2LieuRes);

          let listeLieuResidence: UsagerLieuResidenceDTO[] = [null, usager2LieuRes, usagerFusionLieuRes];
          this.tableauLieuxResidence.push(listeLieuResidence)
        }
      });
    }
  }

  /**
   * Retourne true si des lieux de résidence sont vides dans la colonne Fusion.
   * @returns 
   */
  containsLieuxResidenceVides(): boolean {
    return this.getListeDtoColFusion().includes(null);
  }

  /**
   * Retourne la liste des UsagerLieuResidenceDTO non vides résultant de la fusion.
   * @returns 
   */
  getListeLieuResFusionnes(): UsagerLieuResidenceDTO[] {
    return this.getListeDtoColFusion().filter(value => value != null);
  }

  /**
   * Retourne la liste de tous les UsagerLieuResidenceDTO de la colonne Fusion.
   * @returns 
   */
  getListeDtoColFusion(): UsagerLieuResidenceDTO[] {
    if (this.tableauLieuxResidence.length == 0) {
      return [];
    } else {
      let dtos: UsagerLieuResidenceDTO[] = [];
      this.tableauLieuxResidence.forEach((row: UsagerLieuResidenceDTO[]) => {
        dtos.push(row[2]);
      });
      return dtos;
    }
  }

  /**
   * Affiche le popup d'édition d'une adresse.
   * @param index index de l'adresse à éditer dans le tableau
   */
  onEditerLieuResidence(index: number): void {
    let usagerLieuResidenceDTOs: UsagerLieuResidenceDTO[] = this.tableauLieuxResidence[index];

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
      usagerLieuRes1Dto: usagerLieuResidenceDTOs[0],
      usagerLieuRes2Dto: usagerLieuResidenceDTOs[1],
      usagerLieuResFusionDto: usagerLieuResidenceDTOs[2],
      typeLieuResidenceOptions: this.typeLieuResidenceOptions,
    };

    const dialogRef = this.matDialog.open(FusionLieuxResidenceUsagerPopupComponent, matDialogConfig);

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe((fusionData: FusionData) => {
        if (fusionData) {
          this.tableauLieuxResidence[fusionData.index][2] = fusionData.usagerLieuResFusionDto;
        }
      })
    );
  }

  /**
   * Vide le contenu de la colonne fusion sur la ligne indexRow.
   * @param indexRow 
   */
  onSupprimerLieuResidence(indexRow: number): void {
    this.tableauLieuxResidence[indexRow][2] = null;
  }

  /**
   * Valide les lieux de résidence fusionnées. Ajoute les messages d'erreur dans l'AlertStore au besoin.
   * @returns true si aucune erreur
   */
  validerLieuxResidenceFusionnes(): boolean {
    this.resetErreurs();

    let distinctTypeLieuxResNonValides: Set<string> = new Set();

    const usagerLieuResidenceDtos: UsagerLieuResidenceDTO[] = this.getListeDtoColFusion();
    if (usagerLieuResidenceDtos && usagerLieuResidenceDtos.length > 1) {
      usagerLieuResidenceDtos.forEach((usagerLieuRes: UsagerLieuResidenceDTO, index: number) => {
        if (usagerLieuRes?.actif) {
          // Compte le nombre de lieux de résidence actifs ayant les mêmes types d'adresse.
          const nbOccurence: number = usagerLieuResidenceDtos.filter((value: UsagerLieuResidenceDTO) => value?.actif && usagerLieuRes.codeTypeAdresse == value?.codeTypeAdresse).length;

          if (nbOccurence > 1) {
            this.indexLieuxResNonValides.push(index);
            distinctTypeLieuxResNonValides.add(usagerLieuRes.codeTypeAdresse);
          }
        }
      });
    }

    if (distinctTypeLieuxResNonValides.size > 0) {
      let messages: string[] = [];

      // Affiche un message d'erreur pour chaque type d'adresse ayant des doublons.
      distinctTypeLieuxResNonValides.forEach((typeAdr: string) => {
        const libelleTypeAdr: string = FusionUtils.getLabelFromInputOptions(typeAdr, this.typeLieuResidenceOptions);

        // us-iu-e30004=Adresses : Plusieurs {{0}} ont été sélectionnés. Vous devez en choisir une seule. 
        const msg: string = this.translateService.instant("us-iu-e30004", { 0: libelleTypeAdr });
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
    this.indexLieuxResNonValides = [];
  }
}
