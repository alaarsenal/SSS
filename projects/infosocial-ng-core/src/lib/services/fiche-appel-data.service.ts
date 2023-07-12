import { Injectable } from '@angular/core';
import { FicheAppelSocialDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { BaseUsagerDTO } from 'projects/usager-ng-core/src/lib/models/base-usager-dto';
import { Observable, Subject } from 'rxjs';


export enum SectionFicheAppelEnum {
  CONSULTATION = "consultation",
  EVALUATION = "evaluation",
  USAGER = "usager",
  PROTOCOLES = "protocoles",
  AVIS = "avis",
  PLAN_ACTION = "plan-action",
  FICHIERS = "fichiers",
  TERMINAISON = "terminaison",
  RELANCE = "relance",
  NOTES = "notes"
}

@Injectable({
  providedIn: 'root'
})
export class FicheAppelDataService {
  private idAppelSubj = new Subject<number>();
  private ficheAppelActiveSubj = new Subject<FicheAppelSocialDTO>();
  private listeFicheAppelSubj = new Subject<FicheAppelSocialDTO[]>();
  private dialogueUsagerOpenedSubj = new Subject<boolean>();
  private refreshListeFicheAppelSubj = new Subject<void>();

  private annulerSubj = new Subject<void>();
  private autoSaveSubj = new Subject<void>();
  private sauvegarderSubj = new Subject<void>();

  private idAppel: number = null;
  private idFicheAppelActive: number = null;
  private listeFicheAppel: FicheAppelSocialDTO[] = null;
  private statutFicheAppelActive: StatutFicheAppelEnum;
  private appelSaisieDifferee: boolean = false;

  static mapLastSectionAffFicheAppel: Map<number, SectionFicheAppelEnum> = new Map();

  constructor() { }

  /**
   * Retourne la fiche d'appel idFicheAppel.
   * @param idFicheAppel
   */
  private getFicheAppelById(idFicheAppel: number): FicheAppelSocialDTO {
    let fiche: FicheAppelSocialDTO = null;

    if (idFicheAppel && this.listeFicheAppel) {
      this.listeFicheAppel.forEach((ficheAppel: FicheAppelSocialDTO) => {
        if (ficheAppel.id == idFicheAppel) {
          fiche = ficheAppel;
        }
      });
    }
    return fiche;
  }

  /**
   * Ajoute les informations de base d'une fiche d'appel à la liste.
   * @param FicheAppelSocialDTO
   */
  ajouterFicheAppel(FicheAppelSocialDTO: FicheAppelSocialDTO) {
    if (!this.listeFicheAppel) {
      this.listeFicheAppel = [];
    }
    this.listeFicheAppel.push(FicheAppelSocialDTO);

    // Lance une notification aux observers de la liste.
    this.listeFicheAppelSubj.next(this.listeFicheAppel);
  }

  clear() {
    this.idAppel = null;
    this.idFicheAppelActive = null;
    this.listeFicheAppel = null;
    this.statutFicheAppelActive = null;
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
   * Retourne la fiche d'appel active.
   */
  getFicheAppelActive(): FicheAppelSocialDTO {
    return this.getFicheAppelById(this.idFicheAppelActive);
  }

  /**
   * Retourne l'usager de la fiche d'appel active.
   */
  getBaseUsagerFicheAppelActive(): BaseUsagerDTO {
    let baseUsager: BaseUsagerDTO = null;

    const ficheAppelSocialActive: FicheAppelSocialDTO = this.getFicheAppelActive();
    if (ficheAppelSocialActive?.usager) {
      let groupeAge: GroupeAgeOptions = undefined;
      if (ficheAppelSocialActive.usager.ageAnnees || ficheAppelSocialActive.usager.ageMois || ficheAppelSocialActive.usager.ageJours || ficheAppelSocialActive.usager.referenceGroupeAge || ficheAppelSocialActive.usager.usagerIdentification?.dtNaiss) {
        groupeAge = new GroupeAgeOptions();
        groupeAge.dateNaissance = ficheAppelSocialActive.usager.usagerIdentification?.dtNaiss;
        groupeAge.annees = ficheAppelSocialActive.usager.ageAnnees ? ficheAppelSocialActive.usager.ageAnnees + "" : null;
        groupeAge.mois = ficheAppelSocialActive.usager.ageMois ? ficheAppelSocialActive.usager.ageMois + "" : null;
        groupeAge.jours = ficheAppelSocialActive.usager.ageJours;
        if (ficheAppelSocialActive.usager.referenceGroupeAge) {
          groupeAge.groupeId = ficheAppelSocialActive.usager.referenceGroupeAge.id;
          groupeAge.groupe = ficheAppelSocialActive.usager.referenceGroupeAge.code;
        }
      }

      // Construction de l'usager de base.
      baseUsager = {
        id: ficheAppelSocialActive.usager.usagerIdentification?.id,
        groupeAgeOptions: groupeAge
      };
    }
    return baseUsager;
  }

  /**
   * Retourne la dernière section affichée (SectionFicheAppelEnum) d'une fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  getLastSectionAffFicheAppel(idFicheAppel: number): SectionFicheAppelEnum {
    return FicheAppelDataService.mapLastSectionAffFicheAppel.get(idFicheAppel);
  }

  /**
   * Retourne la liste des fiches d'appel.
   */
  getListeFicheAppel(): FicheAppelSocialDTO[] {
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
      return this.listeFicheAppel.filter((ficheAppelDto: FicheAppelSocialDTO) => ficheAppelDto.statut == StatutFicheAppelEnum.OUVERT).length;
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
   * Notifie les observers qu'une sauvegarde automatique est demandée.
   */
  doAutoSave() {
    this.autoSaveSubj.next();
  }

  doRefreshListeFicheAppel() {
    // Lance une notification aux observers que la liste des fiche d'appel doit être rechargée.
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

    // Lance une notification aux observers de l'identifiant de l'appel.
    this.idAppelSubj.next(this.idAppel);
  }

  setDialogueUsagerOpened(opened: boolean) {
    // Lance une notification aux observers que l'état du dialogue a changé.
    this.dialogueUsagerOpenedSubj.next(opened);
  }

  setFicheAppelActive(idFicheAppel: number) {
    let ficheAppel: FicheAppelSocialDTO = null;

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

  setListeFicheAppel(listeFicheAppel: FicheAppelSocialDTO[]) {
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

  onAutoSave(): Observable<void> {
    return this.autoSaveSubj.asObservable();
  }

  onDialogueUsagerOpened(): Observable<boolean> {
    return this.dialogueUsagerOpenedSubj.asObservable();
  }

  onFicheAppelActiveChange(): Observable<FicheAppelSocialDTO> {
    return this.ficheAppelActiveSubj.asObservable();
  }

  onListeFicheAppelChange(): Observable<FicheAppelSocialDTO[]> {
    return this.listeFicheAppelSubj.asObservable();
  }

  onRefreshListeFicheAppel(): Observable<void> {
    return this.refreshListeFicheAppelSubj.asObservable();
  }

  onSauvegarder(): Observable<void> {
    return this.sauvegarderSubj.asObservable();
  }

  getNbFicheAppelOuverte(): number {
    let nbFicheOuverte: number = 0;
    nbFicheOuverte = this.listeFicheAppel?.filter((ficheAppel: FicheAppelSocialDTO) => {
      return ficheAppel.statut === StatutFicheAppelEnum.OUVERT;
    }).length;
    return nbFicheOuverte;
  }

  getNbFicheAppelFerme(): number {
    let nbFicheOuverte: number = 0;
    nbFicheOuverte = this.listeFicheAppel?.filter((ficheAppel: FicheAppelSocialDTO) => {
      ficheAppel.statut === StatutFicheAppelEnum.FERME;
    }).length;
    return nbFicheOuverte;
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

}
