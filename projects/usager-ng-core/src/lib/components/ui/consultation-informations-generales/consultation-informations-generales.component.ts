import { Component, OnInit, Input } from '@angular/core';
import { InformationsGeneralesDTO } from '../../../models/informations-generales-dto';
import { UsagerService } from '../../../services/usager.service';
import { Subscription } from 'rxjs';
import { SafePipe } from 'projects/sigct-ui-ng-lib/src/lib/pipes/pipe-safe/safe.pipe';
import { SafeHtml } from '@angular/platform-browser';




@Component({
  selector: 'app-consultation-informations-generales',
  templateUrl: './consultation-informations-generales.component.html',
  styleUrls: ['./consultation-informations-generales.component.css'],
  providers: [SafePipe]
})
export class ConsultationInformationsGeneralesComponent implements OnInit {

  @Input("idEnregistrement")
  private idEnregistrementIdent: number;

  private abonnementEnregistrement: Subscription;

  public informationsGenerales: InformationsGeneralesDTO = new InformationsGeneralesDTO();

  constructor(private usagerService: UsagerService,
    private safePipe : SafePipe) { }

  ngOnInit(): void {
    this.initInformationsGenerales();
  }

  ngOnDestroy(): void {
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }

  private initInformationsGenerales() {
    if (this.idEnregistrementIdent) {

      this.abonnementEnregistrement = this.usagerService.consulterInformationsGenerales(this.idEnregistrementIdent).subscribe((res: InformationsGeneralesDTO) => {
        this.informationsGenerales = res;
      });

    }
  }

  safeHTML(html : string): SafeHtml {
    return this.safePipe.transform(html, 'html');
  }

}
