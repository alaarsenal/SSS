import { Component, Input, OnInit } from '@angular/core';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { Subscription } from 'rxjs';
import { RrssParamsUrl } from '../rrss/rrss-params-url';

@Component({
  selector: 'msss-lien-rrss-pdf',
  templateUrl: './lien-rrss-pdf.component.html',
  styleUrls: ['./lien-rrss-pdf.component.css']
})
export class LienRrssPdfComponent implements OnInit {

  @Input("codeRRSS")
  codeRRSS: string;

  
  @Input("nomRRSS")
  nomRRSS: string;

  rrssParamsUrl: RrssParamsUrl = new RrssParamsUrl();

  public abonnementServices: Subscription;

  constructor(private appelAdmParameterService: AppelAdmParameterService,
    ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.abonnementServices) {
      this.abonnementServices.unsubscribe();
    }
  }

  ouvrirModuleRRSS(code:string) : void {
    this.abonnementServices = this.appelAdmParameterService.obtenirAdmParametersRRSS(window["env"].urlPortail).subscribe((result) => {
      this.rrssParamsUrl.rrssApiWebUrl = result.rrss_urlui;
      this.rrssParamsUrl.rrssApiWebUsername = result.rrss_username;
      this.rrssParamsUrl.rrssApiWebPass = result.rrss_password;

      let url = this.rrssParamsUrl.rrssApiWebUrl + "detailRessourcePdf?ut=" + this.rrssParamsUrl.rrssApiWebUsername
                + "&mp=" + this.rrssParamsUrl.rrssApiWebPass + "&id=" + code;
      window.open(url, "_blank");
    });
  }

}
