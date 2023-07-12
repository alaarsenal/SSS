import { Injectable } from '@angular/core';
import { FicheAppelDTO } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/models';
import { SectionFicheAppelEnum } from 'projects/infosante-ng-core/src/lib/models';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { BaseUsagerDTO } from 'projects/usager-ng-core/src/lib/models/base-usager-dto';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FicheAppelDataService {
  private ficheAppelActiveSubj = new Subject<FicheAppelDTO>();
  private listeFicheAppelSubj = new Subject<FicheAppelDTO[]>();
  private dialogueUsagerOpenedSubj = new Subject<boolean>();
  private refreshListeFicheAppelSubj = new Subject<void>();

  private annulerSubj = new Subject<void>();
  private sauvegarderSubj = new Subject<void>();

  private idAppel: number = null;
  private idFicheAppelActive: number = null;
  private statutFicheAppelActive: StatutFicheAppelEnum;
  private listeFicheAppel: FicheAppelDTO[] = null;
  private appelSaisieDifferee: boolean = false;

  static mapLastSectionAffFicheAppel: Map<number, SectionFicheAppelEnum> = new Map();

  constructor() { }

  /**
   * Retourne la fiche d'appel idFicheAppel.
   * @param idFicheAppel
   */
  private getFicheAppelById(idFicheAppel: number): FicheAppelDTO {
    let fiche: FicheAppelDTO = null;

    if (idFicheAppel && this.listeFicheAppel) {
      this.listeFicheAppel.forEach((ficheAppel: FicheAppelDTO) => {
        if (ficheAppel.id == idFicheAppel) {
          fiche = ficheAppel;
        }
      });
    }
    return fiche;
  }

  clear() {
    this.idAppel = null;
    this.idFicheAppelActive = null;
    this.statutFicheAppelActive = null;
    this.listeFicheAppel = null;
  }

  /**
   * Retourne l'identifiant de l'appel.
   */
  getIdAppel(): number {
    return this.idAppel;
  }

  /**
   * Retourne l'identifiant de la fiche d'appel active.
   */
  getIdFicheAppelActive(): number {
    return this.idFicheAppelActive;
  }

  /**
   * Retourne la dernière section affichée (SectionFicheAppelEnum) d'une fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  getLastSectionAffFicheAppel(idFicheAppel: number): SectionFicheAppelEnum {
    return FicheAppelDataService.mapLastSectionAffFicheAppel.get(idFicheAppel);
  }

  /**
   * Retourne le statut de la fiche d'appel active.
   */
  getStatutFicheAppelActive(): StatutFicheAppelEnum {
    return this.statutFicheAppelActive;
  }

  /**
   * Retourne le statut de la fiche d'appel dont l'id corrspond à idFicheAppel.
   */
  getStatutFicheAppelById(idFicheAppel: number): StatutFicheAppelEnum {
    let statut: StatutFicheAppelEnum = null;
    if (idFicheAppel) {
      statut = this.getFicheAppelById(idFicheAppel)?.statut;
    }
    return statut;
  }

  getNbFicheAppel(): number {
    return this.listeFicheAppel?.length;
  }

  getFicheAppelIds(): number[] {
    let ficheAppleIds: number[] = [];
    this.listeFicheAppel?.forEach(function (value: FicheAppelDTO) {
      ficheAppleIds.push(value.id);
    });
    return ficheAppleIds;
  }

  getNbFicheAppelOuverte(): number {
    let nbFicheOuverte: number = 0;
    nbFicheOuverte = this.listeFicheAppel?.filter((ficheAppel: FicheAppelDTO) => {
      return ficheAppel.statut === StatutFicheAppelEnum.OUVERT;
    }).length;
    return nbFicheOuverte;
  }

  getNbFicheAppelFerme(): number {
    let nbFicheOuverte: number = 0;
    nbFicheOuverte = this.listeFicheAppel?.filter((ficheAppel: FicheAppelDTO) => {
      ficheAppel.statut === StatutFicheAppelEnum.FERME;
    }).length;
    return nbFicheOuverte;
  }

  /**
   * Retourne la fiche d'appel active.
   */
  getFicheAppelActive(): FicheAppelDTO {
    return this.getFicheAppelById(this.idFicheAppelActive);
  }

  /**
   * Retourne l'usager de la fiche d'appel active.
   */
  getBaseUsagerFicheAppelActive(): BaseUsagerDTO {
    let baseUsager: BaseUsagerDTO = null;

    const ficheAppelActive: FicheAppelDTO = this.getFicheAppelActive();
    if (ficheAppelActive?.usager) {
      let groupeAge: GroupeAgeOptions = undefined;
      if (ficheAppelActive.usager.ageAnnees || ficheAppelActive.usager.ageMois || ficheAppelActive.usager.ageJours || ficheAppelActive.usager.referenceGroupeAge || ficheAppelActive.usager.usagerIdentification?.dtNaiss) {
        groupeAge = new GroupeAgeOptions();
        groupeAge.dateNaissance = ficheAppelActive.usager.usagerIdentification?.dtNaiss;
        groupeAge.annees = ficheAppelActive.usager.ageAnnees ? ficheAppelActive.usager.ageAnnees + "" : null;
        groupeAge.mois = ficheAppelActive.usager.ageMois ? ficheAppelActive.usager.ageMois + "" : null;
        groupeAge.jours = ficheAppelActive.usager.ageJours;
        if (ficheAppelActive.usager.referenceGroupeAge) {
          groupeAge.groupeId = ficheAppelActive.usager.referenceGroupeAge.id;
          groupeAge.groupe = ficheAppelActive.usager.referenceGroupeAge.code;
        }
      }

      // Construction de l'usager de base.
      baseUsager = {
        id: ficheAppelActive.usager.usagerIdentification?.id,
        groupeAgeOptions: groupeAge
      };
    }

    return baseUsager;
  }

  /**
   * Retourne la liste des fiches d'appel.
   */
  getListeFicheAppel(): FicheAppelDTO[] {
    return this.listeFicheAppel;
  }

  /**
   * Retourne le nombre de fiche dans l'appel dont le satstut est Ouvert.
   * @returns 
   */
  getNbFicheOuverte(): number {
    if (CollectionUtils.isBlank(this.listeFicheAppel)) {
      return 0;
    } else {
      return this.listeFicheAppel.filter((ficheAppelDto: FicheAppelDTO) => ficheAppelDto.statut == StatutFicheAppelEnum.OUVERT).length;
    }
  }

  /**
   *
   * @returns true si l'appel est de type saisie différée
   */
  isAppelSaisieDifferee(): boolean {
    return this.appelSaisieDifferee;
  }

  /**
   * Notifie les observers qu'une annulation des modifications est demandée.
   */
  doAnnnuler() {
    this.annulerSubj.next();
  }

  /**
   * Notifie les observers que la liste des fiches d'appel doit être rechargée.
   */
  doRefreshListeFicheAppel() {
    this.refreshListeFicheAppelSubj.next();
  }

  /**
   * Notifie les observers qu'une sauvegarde est demandée.
   */
  doSauvegarder() {
    this.sauvegarderSubj.next();
  }

  setIdAppel(idAppel: number) {
    this.idAppel = idAppel;
  }

  setDialogueUsagerOpened(opened: boolean) {
    // Lance une notification aux observers que l'état du dialogue a changé.
    this.dialogueUsagerOpenedSubj.next(opened);
  }

  /**
   * Met à jour l'id de la fiche d'appel active et lance une notification aux observateurs de la fiche active.
   * @param idFicheAppel identifiant de la fiche d'appel active
   */
  setIdFicheAppelActive(idFicheAppel: number) {
    let ficheAppel: FicheAppelDTO = null;

    if (idFicheAppel) {
      ficheAppel = this.getFicheAppelById(idFicheAppel);
    }

    this.idFicheAppelActive = idFicheAppel;
    this.statutFicheAppelActive = ficheAppel?.statut;

    // Lance une notification aux observers de la fiche active.
    this.ficheAppelActiveSubj.next(ficheAppel);
  }

  /**
   * Met à jour la dernière section affichée d'une fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @param sectionFicheAppel dernière section affiché
   */
  setLastSectionAffFicheAppel(idFicheAppel: number, sectionFicheAppel: SectionFicheAppelEnum): void {
    FicheAppelDataService.mapLastSectionAffFicheAppel.set(idFicheAppel, sectionFicheAppel);
  }

  /**
   * Met à jour la liste des fiches d'appel et lance une notification aux observateurs de la liste.
   * @param listeFicheAppel
   */
  setListeFicheAppel(listeFicheAppel: FicheAppelDTO[]) {
    this.listeFicheAppel = listeFicheAppel;

    // Lance une notification aux observers de la liste.
    this.listeFicheAppelSubj.next(this.listeFicheAppel);
  }

  /**
   * Spécifie si l'appel est de type saisie différée.
   * @param saisieDifferee
   */
  setAppelSaisieDifferee(saisieDifferee: boolean) {
    this.appelSaisieDifferee = saisieDifferee;
  }


  // Observables

  onAnnuler(): Observable<void> {
    return this.annulerSubj.asObservable();
  }

  onDialogueUsagerOpened(): Observable<boolean> {
    return this.dialogueUsagerOpenedSubj.asObservable();
  }

  onFicheAppelActiveChange(): Observable<FicheAppelDTO> {
    return this.ficheAppelActiveSubj.asObservable();
  }

  onListeFicheAppelChange(): Observable<FicheAppelDTO[]> {
    return this.listeFicheAppelSubj.asObservable();
  }

  onRefreshListeFicheAppel(): Observable<void> {
    return this.refreshListeFicheAppelSubj.asObservable();
  }

  onSauvegarder(): Observable<void> {
    return this.sauvegarderSubj.asObservable();
  }
}
