import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { Subscription } from 'rxjs';
import { RrssDTO } from '../rrss/rrss-dto';
import { RrssParamsUrl } from '../rrss/rrss-params-url';
import { RRSSComponent } from '../rrss/rrss.component';

@Component({
  selector: 'msss-rrss-link',
  templateUrl: './rrss-link.component.html',
  styleUrls: ['./rrss-link.component.css']
})
export class RrssLinkComponent implements OnInit, OnDestroy {

  @Input()
  id:string;

  @Input('rrssLabel')
  label: string;

  @Input('rrssLink')
  link: string;

  @Input('selectMultiRrss')
  multiSelect: boolean = true;

  @Output('rssDialogClosed')
  dialogClosedEvent: EventEmitter<RrssDTO[]> = new EventEmitter<RrssDTO[]>();

  rrssDTOList: RrssDTO[] = [];

  isDialogOpened: boolean;

  rrssParamsUrl: RrssParamsUrl = new RrssParamsUrl();

  private subscription: Subscription;


  constructor(
    private dialog: MatDialog,
    private appelAdmParameterService: AppelAdmParameterService,
    ) { }

  ngOnInit(): void {

    if (this.subscription) { this.subscription.unsubscribe(); }
    this.subscription = this.appelAdmParameterService.obtenirAdmParametersRRSS(window["env"].urlPortail).subscribe((result:any ) => {
      this.rrssParamsUrl.rrssApiWebUrl = result.rrss_urlui;
      this.rrssParamsUrl.rrssApiWebUsername = result.rrss_username;
      this.rrssParamsUrl.rrssApiWebPass = result.rrss_password;
      this.rrssParamsUrl.urlActifRequerant = window.location.href;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  openRrssDialog(): void {
    const dialogRef = this.dialog.open(RRSSComponent, this.getDialogConfig());
    dialogRef.afterOpened().subscribe(() => {
      this.isDialogOpened = true;
    });
    dialogRef.afterClosed().subscribe((message) => {
      this.isDialogOpened = false;
      message.forEach((item: any) => this.traiterMessageRrss(item));
      this.dialogClosedEvent.emit([...this.rrssDTOList]);
        this.rrssDTOList = [];
    });
  }

  private getDialogConfig(): MatDialogConfig {

    this.rrssParamsUrl.selectMultiRrss = this.multiSelect;

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = true;
    dialogConfig.width = "90vw";
    dialogConfig.maxWidth = "90vw";
    dialogConfig.height = "calc(100% - 120px)";
    dialogConfig.data = this.rrssParamsUrl;

    return dialogConfig
  }

  private traiterMessageRrss(message: any) {
    if (message && message != undefined && message.data != "loaded") {
        const rrssDTO = new RrssDTO();
        rrssDTO.rrssId = message.id;
        rrssDTO.rrssNom = message.nom;
        this.rrssDTOList.push(rrssDTO);
      }
    }

}
