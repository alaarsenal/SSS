import { Component, OnInit, Input } from '@angular/core';
import { FicheAppelDTO } from '../../../../../../../../infosante-ng-core/src/lib/models/fiche-appel-dto';

@Component({
  selector: 'app-constat-evaluation',
  templateUrl: './constat-evaluation.component.html',
  styleUrls: ['./constat-evaluation.component.css']
})
export class ConstatEvaluationComponent implements OnInit {

  @Input()
  isDisabled = false;

  constructor() { }

  @Input()
  ficheAppel: FicheAppelDTO;

  ngOnInit() {
  }

}
