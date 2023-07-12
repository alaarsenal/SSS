import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { UsagerService } from '../../../services/usager.service';
import { TherapieDTO } from '../../../models/therapie-dto';
import { ConsultationFichiersComponent } from '../consultation-fichiers/consultation-fichiers.component';




@Component({
  selector: 'app-consultation-medications',
  templateUrl: './consultation-medications.component.html',
  styleUrls: ['./consultation-medications.component.css']
})
export class ConsultationMedicationsComponent implements OnInit {

  readonly displayedColumns: string[] = ['dateDebut', 'nom'];

  public dataSource = new MatTableDataSource<any>([]);

  @Input("idEnregistrement")
  idEnregistrementIdent: number;

  therapieIntraveineuse : string = null;

  codeTypeFichierTherapie : string = "THERAPIE";

  private abonnementMedications: Subscription;
  private abonnementTherapieIntraveineuse: Subscription;

  @ViewChild(ConsultationFichiersComponent, { static: true })
  public consultationFichiersComponent: ConsultationFichiersComponent;

  constructor(private usagerService: UsagerService) {

  }


  ngOnInit(): void {
    this.initMedications();
    this.initTherapieIntraveineuse();
  }

  ngOnDestroy(): void {
    if (this.abonnementMedications) {
      this.abonnementMedications.unsubscribe();
    }

    if (this.abonnementTherapieIntraveineuse) {
      this.abonnementTherapieIntraveineuse.unsubscribe();
    }
  }


  private initMedications() {
    if (this.idEnregistrementIdent) {

      this.abonnementMedications = this.usagerService.consulterMedications(this.idEnregistrementIdent).subscribe((res: any) => {
        this.dataSource = res;
      });

    }
  }

  private initTherapieIntraveineuse() {
    if (this.idEnregistrementIdent) {

      this.abonnementTherapieIntraveineuse = this.usagerService.consulterTherapieIntraveineuse(this.idEnregistrementIdent).subscribe((res: TherapieDTO) => {
        this.therapieIntraveineuse = res.therapie;
      });
    }
  }


}
