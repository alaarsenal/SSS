import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'msss-sigct-content-zone',
  templateUrl: './sigct-content-zone.component.html',
  styleUrls: ['./sigct-content-zone.component.css']
})
export class SigctContentZoneComponent {

  @Input() nomSysteme: string = '';
  @Input() public title: string;
  @Input() public contentStyles = {};
  @Input() public id: string;
  @Input() public collapsed: boolean = false;
  @Input() public css: string = "col-md-12";
  @Input() public isCollapsible: boolean = true;
  @Input() public titleBorderColor: string;
  
  @Input("required")
  isRequired: boolean = false;
  @Output() collapsedChange: EventEmitter<boolean> = new EventEmitter();

  constructor() {
  }

  czActionClick() {
    this.collapsed = (this.collapsed === true) ? false : true

    this.collapsedChange.emit(this.collapsed);
  }

  ngOnInit() {


    switch(this.nomSysteme) {
      case "infoSante" : { this.titleBorderColor = "panelHeading borderSante"; break; }
      case "infoSocial" : { this.titleBorderColor = "panelHeading borderSocial"; break; }
      case "usager" : { this.titleBorderColor = "panelHeading borderUsager"; break; }
      default: { this.titleBorderColor = "panel-heading"; break;}
    }


  }

}
