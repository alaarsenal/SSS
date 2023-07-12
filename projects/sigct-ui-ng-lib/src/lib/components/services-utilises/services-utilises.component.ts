import { Component, OnInit, Input } from '@angular/core';
import { ServicesUtilisesDTO } from './services-utilises-dto';
import { InputOptionCollection } from '../../utils/input-option';

@Component({
  selector: 'msss-services-utilises',
  templateUrl: './services-utilises.component.html',
  styleUrls: ['./services-utilises.component.css']
})
export class ServicesUtilisesComponent implements OnInit {

  @Input()
  set inputServicesUtilises(value: ServicesUtilisesDTO) {
    if (value) {
      this.servicesUtilisesDTO = value;
    }
  }

  inputServicesInterprete: InputOptionCollection = {
    name: "servicesinterprete",
    options: [
      { label: "Oui", value: "1", description: "Oui" },
      { label: "Non", value: "0", description: "Non" }
    ]
  }

  inputServicesRelaisBell: InputOptionCollection = {
    name: "servicesrelaisbell",
    options: [
      { label: "Oui", value: "1", description: "Oui" },
      { label: "Non", value: "0", description: "Non" }
    ]
  }

  servicesUtilisesDTO = new ServicesUtilisesDTO();

  @Input()
  isDisabled = false;

  constructor() { }

  ngOnInit(): void {
  }


}
