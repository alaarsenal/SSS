import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { ProtocoleDTO } from '../../../models/protocole-dto';

@Component({
  selector: 'app-consultation-sect-referenciels',
  templateUrl: './consultation-sect-referenciels.component.html',
  styleUrls: ['./consultation-sect-referenciels.component.css']
})
export class ConsultationSectionReferencielsComponent implements OnInit {

  @Input()
  intervention: string = " ";

  @Input()
  listeProtocole: ProtocoleDTO[] = [];

  @Output()
  consulterProtocole: EventEmitter<ProtocoleDTO> = new EventEmitter();

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Lorsque l'utilisateur clique sur un protocole. Notifie le parent.
   * @param protocole 
   */
  onConsulterProtocole(protocole: ProtocoleDTO): void {
    this.consulterProtocole.emit(protocole);
  }
}
