import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'msss-action-link',
  templateUrl: './action-link.component.html',
  styleUrls: ['./action-link.component.css']
})
export class ActionLinkComponent implements OnInit {

  @Input()
  actionLinks:ActionLinkItem[]


  disableAll = false;

  @Input("disableAll")
  set setDisableAll(disable: boolean) {
    this.disableAll = disable;
    if (this.actionLinks)
      this.actionLinks.forEach(l => l.disabled = this.disableAll);
  }

  constructor() { }

  lancerAction(link: ActionLinkItem){
    if (!link.disabled)
      link.action();
  }

  ngOnInit() {
    this.actionLinks?.forEach(l => l.disabled = this.disableAll);
  }

}

export class ActionLinkItem{
  icon: string;
  label?: string;
  action: any;
  id?: any;
  disabled?: boolean = false;
}
