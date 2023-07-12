import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { RelanceDTO } from '../../model/relance-dto';
import { RelanceService } from '../relance/relance-api.service';
import { Subscription } from 'rxjs';
import { SectionRelanceDTO } from '../../model/section-relance-dto';
import { ListeRelancesComponent } from '../liste-relances/liste-relances.component';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';

@Component({
  selector: 'app-consultation-fiche-section-relance',
  templateUrl: './consultation-fiche-section-relance.component.html',
  styleUrls: ['./consultation-fiche-section-relance.component.css']
})
export class ConsultationFicheSectionRelanceComponent implements OnInit {

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @ViewChild('listeRelances', { static: false })
  listeRelances: ListeRelancesComponent;

  @Input()
  set idFicheAppel(value: number) {
    this.chargerDonnees(value);
  }

  @Input()
  domaine: string;

  relances: RelanceDTO[];

  isRelances: boolean;

  private subscriptions = new Subscription();

  constructor(private relanceService: RelanceService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDonneesImpression(sectionRelance: SectionRelanceDTO): void {
    if (this.listeRelances) {
      this.listeRelances.loadDonneesImpression(sectionRelance);
    } else {
      sectionRelance.relances = [];
    }
  }

  private chargerDonnees(value: number): void {
    this.isRelances = false;
    this.relances = [];
    if (value) {
      this.subscriptions.add(
        this.relanceService.findAllByIdFicheAppel(value, this.domaine).subscribe(
          (relances: RelanceDTO[]) => {
            this.relances = relances;
            this.isRelances = CollectionUtils.isNotBlank(relances);
          }
        )
      );
    }
  }
}
