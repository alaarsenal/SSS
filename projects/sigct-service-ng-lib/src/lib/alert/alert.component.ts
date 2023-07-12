import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import {AlertModel} from "./alert-model"
//import { CodegenComponentFactoryResolver } from '@angular/core/src/linker/component_factory_resolver';

@Component({
  selector: 'msss-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  @Input() alerts:AlertModel[];
  @Output() close = new EventEmitter();
  constructor() { }

  ngOnInit() {
  
  }
  ngAfterViewInit(){
  }
  alertViewClose(alertView){
    alertView.remove();
  }
}
