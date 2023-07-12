import { Component, Input, OnInit } from '@angular/core';
import { ListInfoAffichageDto } from './list-info-affichage-dto';

@Component({
  selector: 'msss-list-info-affichage',
  templateUrl: './list-info-affichage.component.html',
  styleUrls: ['./list-info-affichage.component.css']
})
export class ListInfoAffichageComponent implements OnInit {

  @Input("listInfoAffichageDtos")
  public listInfoAffichageDtos: ListInfoAffichageDto[];

  @Input("titleSection")
  public titleSection: string;

  constructor() { }

  ngOnInit(): void {
  }

}
