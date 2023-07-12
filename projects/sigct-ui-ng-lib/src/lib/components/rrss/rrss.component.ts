import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RrssParamsUrl } from './rrss-params-url';

@Component({
  selector: 'msss-rrss',
  templateUrl: './rrss.component.html',
  styleUrls: ['./rrss.component.css']
})
export class RRSSComponent implements OnInit {
  messageList: any[] = [];

  rrssUrl: string;

  multiSelect: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public rrssParamsUrl: any, public dialogRef: MatDialogRef<RRSSComponent>) { }

  ngOnInit(): void {
    this.rrssUrl = this.creerUrlRrss(this.rrssParamsUrl);
    this.multiSelect = this.rrssParamsUrl.selectMultiRrss;
    this.addWindowListner();
  }


  private creerUrlRrss(rrssParamsUrl: RrssParamsUrl): string {
    var paramLiaison = "?"
    var urlParams = "";

    if (rrssParamsUrl.rrssApiWebUsername) {
      urlParams = urlParams + paramLiaison + "ut=" + encodeURI(rrssParamsUrl.rrssApiWebUsername);
      paramLiaison = "&"
    }

    if (rrssParamsUrl.rrssApiWebPass) {
      urlParams = urlParams + paramLiaison + "mp=" + encodeURI(rrssParamsUrl.rrssApiWebPass);
    }

    if (rrssParamsUrl.rrssDTO.rrssNom) {
      urlParams = urlParams + paramLiaison + "nom=" + encodeURI(rrssParamsUrl.rrssDTO.rrssNom);
    }

    urlParams = urlParams + paramLiaison + "url=" + rrssParamsUrl.urlActifRequerant;
    return rrssParamsUrl.rrssApiWebUrl + urlParams;
  };

  fermerDialog() {
    this.dialogRef.close(this.messageList);
  }

  receiveMessage(message: any) {
    if (message && message != undefined && message.data != "loaded") {
      let messageData = JSON.parse(message.data);

      if (!this.multiSelect) {
        this.messageList = [];
      } else if (this.messageList.filter(item => item.id == messageData.id).length > 0) {
        return;
      }
      this.messageList.push(messageData);
    }
    if (this.messageList.length > 0 && !this.multiSelect) {
      this.fermerDialog();
    }
  }

  private addWindowListner() {
    if (window.addEventListener) {
      window.addEventListener("message", this.receiveMessage.bind(this), false);
    } else {
      (<any>window).attachEvent("onmessage", this.receiveMessage.bind(this));
    }
  }

  onClickRemoveResultItem(index: number): void {
    this.messageList.splice(index, 1);
  }

}
