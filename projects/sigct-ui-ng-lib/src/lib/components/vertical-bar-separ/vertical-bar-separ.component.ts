import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'msss-vertical-bar-separ',
  templateUrl: './vertical-bar-separ.component.html',
  styleUrls: ['./vertical-bar-separ.component.css']
})
export class VerticalBarSeparComponent implements OnInit {

  @Input()
  height: string;
  constructor() {
  }

  ngOnInit() {
  }

  finalHeight(): number {
    return Number.parseInt(this.height) + 35;
  }
}
