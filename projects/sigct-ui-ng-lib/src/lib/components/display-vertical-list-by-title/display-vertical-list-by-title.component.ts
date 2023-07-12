import { Component, Input, OnInit } from '@angular/core';
import { VerticalListByTitleDTO } from './vertical-list-by-title-dto';

@Component({
  selector: 'msss-display-vertical-list-by-title',
  templateUrl: './display-vertical-list-by-title.component.html',
  styleUrls: ['./display-vertical-list-by-title.component.css']
})
export class DisplayVerticalListByTitleComponent implements OnInit {

  @Input("verticalListByTitleDTO")
  set verticalListByTitleDTO(value: VerticalListByTitleDTO) {
    this._verticalListByTitleDTO = value;
  }

  _verticalListByTitleDTO: VerticalListByTitleDTO;

  constructor() { }

  ngOnInit(): void {
  }

}
