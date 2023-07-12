import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProtocoleDTO } from 'projects/infosante-ng-core/src/lib/models/protocole-dto';

@Component({
  selector: 'app-consultation-liste-protocoles',
  templateUrl: './consultation-liste-protocoles.component.html',
  styleUrls: ['./consultation-liste-protocoles.component.css']
})
export class ConsultationListeProtocolesComponent implements OnInit {

  @Input()
  readOnly: boolean = false;

  @Input()
  listeProtocoleDto: ProtocoleDTO[] = [];

  @Output("supprimer")
  supprimerEmitter: EventEmitter<ProtocoleDTO> = new EventEmitter();

  @Output("consulter")
  consulterEmitter: EventEmitter<ProtocoleDTO> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  onConsulterProtocole(protocole: ProtocoleDTO) {
    this.consulterEmitter.emit(protocole);
  }

  onSupprimerProtocole(protocole: ProtocoleDTO) {
    this.supprimerEmitter.emit(protocole);
  }

}
