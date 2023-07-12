import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'msss-sigct-field-set',
  templateUrl: './sigct-field-set.component.html',
  styleUrls: ['./sigct-field-set.component.css']
})
export class SigctFieldSetComponent implements OnInit {

  @Input("titleFieldset")
  titleFieldset: string;

  constructor() { }

  ngOnInit(): void {
  }

}
