import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsagerService } from '../../../services/usager.service';
import { TherapieDTO } from '../../../models/therapie-dto';
import { AutresInfosDTO } from '../../../models/autres-infos-dto';
import { ConsultationFichiersComponent } from '../consultation-fichiers/consultation-fichiers.component';




@Component({
  selector: 'app-consultation-autres-informations',
  templateUrl: './consultation-autres-informations.component.html',
  styleUrls: ['./consultation-autres-informations.component.css']
})
export class ConsultationAutresInformationsComponent implements OnInit {

  @Input("idEnregistrement")
  idEnregistrementIdent: number;

  autresInformations : string = null;

  codeTypeFichierAutreInfo : string = "AUTRE_INFO";

  private abonnementAutresInfos: Subscription;

  @ViewChild("fichiersAutresInfo", { static: true })
  public consultationFichiersComponent: ConsultationFichiersComponent;

  constructor(private usagerService: UsagerService) {

  }

  ngOnInit(): void {
    this.initAutresInformations();
  }

  ngOnDestroy(): void {
    if (this.abonnementAutresInfos) {
      this.abonnementAutresInfos.unsubscribe();
    }

  }

  private initAutresInformations() {
    if (this.idEnregistrementIdent) {

      this.abonnementAutresInfos = this.usagerService.consulterAutresInformations(this.idEnregistrementIdent).subscribe((res: AutresInfosDTO) => {
        this.autresInformations = res.autresInfos;
      });
    }
  }

}
