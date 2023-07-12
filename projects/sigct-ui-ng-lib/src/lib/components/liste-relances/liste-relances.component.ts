import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RelanceDTO } from '../../model/relance-dto';
import { DatePipe } from '@angular/common';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { SectionRelanceDTO } from '../../model/section-relance-dto';

@Component({
  selector: 'app-liste-relances',
  templateUrl: './liste-relances.component.html',
  styleUrls: ['./liste-relances.component.css']
})
export class ListeRelancesComponent implements OnInit {

  @Input()
  relances: RelanceDTO[];

  @Input()
  set allColumns(value: boolean) {
    this.displayedColumns = value
      ? ['dateHeureDebut', 'dateHeureFin', 'usager', 'assignation', 'statut', 'details', 'action']
      : ['dateHeureDebut', 'dateHeureFin', 'assignation', 'statut', 'details'];
    this.displayAllCollumns = value;
  }

  @Output()
  consulterFicheEvent = new EventEmitter<RelanceDTO>();

  displayedColumns: string[] = ['dateHeureDebut', 'dateHeureFin', 'assignation', 'statut', 'details'];

  displayAllCollumns: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(sectionRelance: SectionRelanceDTO): void {
    if (sectionRelance) {
      sectionRelance.relances = [...this.relances];
      sectionRelance.relances.forEach(item => {
        if (!item.assignationLabel) {
          item.assignationLabel = "";
        }
        if (!item.details) {
          item.details = "";
        }
      })
      // sectionRelance.relances?.filter(item => !item.assignationLabel).forEach(item => item.assignationLabel = "");
    }
  }

  getStatutData(relance: RelanceDTO): string {
    if (this.displayAllCollumns) {
      return relance.referenceStatutRelanceNom;
    }
    if (!StringUtils.isBlank(relance.statutFermetureLabel)) {
      return relance.statutFermetureLabel;
    }
    let result: string = "";
    if (relance) {
      if (relance.referenceStatutRelanceNom) {
        result += '<div>' + relance.referenceStatutRelanceNom + '</div>';
      }
      let fermeUsernameLabel: string = '';
      if (relance.fermeUsernameLabel) {
        fermeUsernameLabel += 'par ' + relance.fermeUsernameLabel;
      }
      if (relance.dateFermeture) {
        fermeUsernameLabel += ' le ' + new DatePipe('en-US').transform(relance.dateFermeture, 'yyyy-MM-dd HH:mm');
      }
      if (!StringUtils.isBlank(fermeUsernameLabel)) {
        result += '<div>' + fermeUsernameLabel + '</div>';
      }
    }
    return result;
  }

  displayPeriodWarning(relance: RelanceDTO): boolean {
    if (this.displayAllCollumns && !relance?.dateFermeture) {
      let dateFin: Date = new Date(relance.dateHeureFin);
      const date: Date = new Date();
      return dateFin < date;
    }
    return false;
  }

  onClickButtonConsulterFiche(relance: RelanceDTO): void {
    if (relance) {
      this.consulterFicheEvent.emit(relance);
    }
  }

}
