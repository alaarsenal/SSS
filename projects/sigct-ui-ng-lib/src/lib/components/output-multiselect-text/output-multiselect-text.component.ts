import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tuple } from '../../utils/tuple';

@Component({
  selector: 'msss-output-multiselect-text',
  templateUrl: './output-multiselect-text.component.html',
  styleUrls: ['./output-multiselect-text.component.css']
})
export class OutputMultiselectTextComponent implements OnInit {

  @Input()
  label: string;

  @Input('contentSeparator')
  separator: string;

  @Input('outputContentList')
  contentList: Tuple[];

  @Input()
  backgroundColor: string = "inherit";

  @Input()
  height: string = "50px";

  constructor() { }

  ngOnInit(): void {
  }
}
