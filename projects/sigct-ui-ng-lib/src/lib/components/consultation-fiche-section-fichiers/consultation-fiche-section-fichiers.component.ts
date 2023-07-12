import { Component, Input, OnInit, Output, QueryList, ViewChildren, EventEmitter } from '@angular/core';
import { ConsultationFichiersDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-fichiers-dto';
import { TableFichierDTO } from 'projects/sigct-service-ng-lib/src/lib/models/TableFichierDTO';
import { SectionFichiersDTO } from '../../model/section-fichiers-dto';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'app-consultation-fiche-section-fichiers',
  templateUrl: './consultation-fiche-section-fichiers.component.html',
  styleUrls: ['./consultation-fiche-section-fichiers.component.css']
})
export class ConsultationFicheSectionFichiersComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input()
  public dto: ConsultationFichiersDTO;

  @Output()
  public onTelechargeFichier = new  EventEmitter();


  constructor() { }

  ngOnInit() {
  }

  get islistVide(){
    return this.dto?.listeFichiers == null || this.dto?.listeFichiers.length == 0;
  }

  get liste(){
    return this.dto?.listeFichiers;
  }

  loadDonneesImpression(section: SectionFichiersDTO) {
    if (section) {
      section.fichiers = this.liste;
    }
  }

  separator(item: TableFichierDTO) {
    return item.titre && item.description ? '-' : '';
  }

  onTelechargerFichier(idFichier: number) {
    this.onTelechargeFichier.emit(idFichier);
  }

}
