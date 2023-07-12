import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InformationUtileDTO } from 'projects/sigct-service-ng-lib/src/lib/models/information-utile-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';

@Component({
  selector: 'msss-sigct-liens-utiles',
  templateUrl: './sigct-liens-utiles.component.html',
  styleUrls: ['./sigct-liens-utiles.component.css']
})
export class SigctLiensUtilesComponent implements OnInit {

  listeInformationsUtiles: InformationUtileDTO[];
  listeCategories: ReferenceDTO[];


  //Événements pour le composant parent.
  @Output("onTelechargerFichier")
  telechargerFichier: EventEmitter<InformationUtileDTO> = new EventEmitter<InformationUtileDTO>();


  @Input()
  set setListeInformationsUtiles(dtos: InformationUtileDTO[]) {
    if (dtos) {
      this.listeInformationsUtiles = dtos;
      this.actualiserListeCategories();
    }
  }

  @Input()
  set setListeCategories(dtos: ReferenceDTO[]) {
    if (dtos) {
      this.listeCategories = dtos;
      this.actualiserListeCategories();
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

  private actualiserListeCategories(): void {
    if (CollectionUtils.isNotBlank(this.listeInformationsUtiles)
      && CollectionUtils.isNotBlank(this.listeCategories)) {
      const nomCategories: string[] = this.listeInformationsUtiles.map(item => item.categorieNom);
      const aux: ReferenceDTO[] = this.listeCategories.filter(item => nomCategories.includes(item.nom));
      this.listeCategories = aux;
    }
  }

  /**Obtien les classes CSS pour chaque section de catégorie. */
  getCSSClassAction(): string {
    let resultat: string = "";
    resultat = "col-md-12 hd-texte-noir no-padding-left";
    return resultat;
  }

  /**
   * Permet de différencier le type de lien utilise dans le template HTML
   * @param lien
   * @param categorie
   */
  getTypeLien(lien: InformationUtileDTO): string {
    let resultat: string = "MESSAGE";
    if (lien.url) {
      resultat = "URL";
    }
    if (lien.fichierNom && !lien.url) {
      resultat = "FICHIER";
    }
    return resultat;
  }

  /**
   * Envoie le fichier à télécharger au composant parent.
   * @param fichier
   */
  onTelecharger(fichier: InformationUtileDTO) {
    this.telechargerFichier.emit(fichier);
  }

  filterItemsOfType(type) {
    return this.listeInformationsUtiles.filter(x => x.categorieNom == type);
  }

}
