import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'msss-list-info-action',
  templateUrl: './list-info-action.component.html',
  styleUrls: ['./list-info-action.component.css']
})
export class ListInfoActionComponent implements OnInit, OnChanges {

  @Input('list')
  list: any[];

  @Input('formatAction')
  formatAction: string;

  @Output('modifierAction')
  modifierAction: EventEmitter<any> = new EventEmitter<any>();

  @Output('archiverAction')
  archiverAction: EventEmitter<any> = new EventEmitter<any>();

  @Output('supprimerAction')
  supprimerAction: EventEmitter<any> = new EventEmitter<any>();

  @Output('displayAllAction')
  displayAllAction: EventEmitter<any> = new EventEmitter<any>();

  @Input('displayAll')
  displayAll: boolean = false;

  @Input('cacherAfficherReduire')
  cacherAfficherReduire: boolean = false;

  @Input('editerId')
  editerId: string;

  @Input('archiverId')
  archiverId: string;

  @Input('suprimerId')
  supprimerId: string;

  @Input('afficherId')
  afficherId: string;

  @Input('afficherBouttons')
  afficherBouton: boolean = true;

  @Input('afficherBoutonSupprimer')
  afficherBoutonSupprimer: boolean = false;

  @Input('idElementModifieSelectionne')
  idElementModifieSelectionne: number = null;

  @Input('labelDevelopper')
  labelDevelopper: string = "Afficher tout";

  @Input('labelReduire')
  labelReduire: string = "Réduire tout";

  @Input()
  dispalyArchiveIcon: boolean = true;

  @Input()
  dispalyReductAndShowLinks: boolean = true;

  @Input()
  displayButtonAfficherTout: boolean = false;

  @Input('ariaLabel')
  ariaLabel: string;

  // identifiant du DIV contenant l'action en cours de modification
  public idDivActionModifie: string;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.idDivActionModifie = "";
  }

  ngOnChanges(changes: SimpleChanges) {

    for (let propName in changes) {
      if (propName === 'idElementModifieSelectionne') {
        this.idDivActionModifie = "";
        if (this.idElementModifieSelectionne !== null) {
          this.idDivActionModifie = "div-" + this.editerId + "-" + this.idElementModifieSelectionne;
        }
      }
    }
  }

  afficherTout() {
    this.displayAll = !this.displayAll;
    this.displayAllAction.emit({ displayAll: this.displayAll });
  }

  onModifierClick(id: number) {
    this.idDivActionModifie = "div-" + this.editerId + "-" + this.idElementModifieSelectionne;

    this.modifierAction.emit({ id: id });
  }

  onSupprimerClick(id: number) {
    this.idDivActionModifie = "div-" + this.supprimerId + "-" + this.idElementModifieSelectionne;

    this.supprimerAction.emit({ id: id });
  }

  onArchiverClick(id: number) {
    this.archiverAction.emit({ id: id });
  }

  getLigne(displayAll: boolean, i: number): boolean {
    var res: boolean = false;

    if (displayAll) {
      if (this.list[i].actif && this.list[i + 1] && !this.list[i + 1].actif) {
        res = true;
      }
    }

    return res;
  }

  /**
   * Retourne le(s) nom(s) de(s) classe(s) CSS pour une action en cours de modification sinon retourne une chaîne vide
   * @param id identifiant fonctionnel de l'action
   */
  getCSSClassAction(id: string): string {
    let resultat: string = "";
    let tmpId: string = "div-" + this.editerId + "-" + id;

    if (tmpId === this.idDivActionModifie) {
      resultat = "alert-warning texte-noir";
    }

    return resultat;
  }

  public sanitize(object : Object) {
    let objectDisplay = JSON.parse(JSON.stringify(object));
    Object.keys(objectDisplay).forEach(objKey => {
      const valueOfobject = objectDisplay[objKey]
      if(typeof valueOfobject === 'string'){
        objectDisplay[objKey] = this.sanitizer.sanitize(SecurityContext.HTML, valueOfobject);
      }
    })
    return objectDisplay;
  }

}
