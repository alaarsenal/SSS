import { Component, OnInit, Input } from '@angular/core';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';

@Component({
  selector: 'msss-consultation-fiche-section-terminaison-resume-intervention',
  templateUrl: './consultation-fiche-section-terminaison-resume-intervention.component.html',
  styleUrls: ['./consultation-fiche-section-terminaison-resume-intervention.component.css']
})
export class ConsultationFicheSectionTerminaisonResumeInterventionComponent implements OnInit {

  @Input()
  labelSection: string;

  @Input()
  labelChampLangue: string;

  @Input()
  raisonsIntervention: RaisonAppelDTO[];

  @Input()
  rolesAction: RoleActionDTO[];

  @Input()
  centreActivite: ReferenceDTO;

  @Input()
  langueIntervention: ReferenceDTO;

  constructor() { }

  ngOnInit(): void {
  }

  get displaySection(): boolean {
    return CollectionUtils.isNotBlank(this.raisonsIntervention)
      || CollectionUtils.isNotBlank(this.rolesAction)
      || (this.centreActivite != undefined && this.centreActivite != null)
      || (this.langueIntervention != undefined && this.langueIntervention != null);
  }

  get displayRaisonIntervention(): boolean {
    return CollectionUtils.isNotBlank(this.raisonsIntervention);
  }

  get displayRoleAction(): boolean {
    return CollectionUtils.isNotBlank(this.rolesAction);
  }

}
