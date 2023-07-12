import { Component, Input, OnInit } from '@angular/core';
import { CadreTextDto } from 'projects/sigct-service-ng-lib/src/lib/models/cadre-text-dto';

@Component({
  selector: 'msss-cadre-text',
  templateUrl: './cadre-text.component.html',
  styleUrls: ['./cadre-text.component.css']
})
export class CadreTextComponent implements OnInit {

  @Input("cadreTextDto") 
  public cadreTextDto: CadreTextDto;

  constructor() { }

  ngOnInit(): void {
  }

}
