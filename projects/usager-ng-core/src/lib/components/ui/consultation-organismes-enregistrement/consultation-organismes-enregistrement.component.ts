import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UsagerService } from '../../../services/usager.service';
import { Subscription } from 'rxjs';
import { OrganismeDTO } from '../../../models/organisme-dto';




@Component({
  selector: 'app-consultation-organismes-enregistrement',
  templateUrl: './consultation-organismes-enregistrement.component.html',
  styleUrls: ['./consultation-organismes-enregistrement.component.css']
})
export class ConsultationOrganismesEnregistrementComponent implements OnInit {

  readonly displayedColumns: string[] = ['organisme_site', 'garde', 'type', 'gestionnaire', 'raison', 'numero_dossier', 'commentaires', 'date_debut', 'date_fermeture_prevue', 'fermeture'];

  public dataSource = new MatTableDataSource<any>([]);

  @Input("idEnregistrement")
  private idEnregistrementIdent: number;

  private abonnementEnregistrement: Subscription;

  constructor(private usagerService: UsagerService) {

  }


  ngOnInit(): void {
    this.initOrganismesEnregistreurs();
  }

  ngOnDestroy(): void {
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }


  private initOrganismesEnregistreurs() {
    if (this.idEnregistrementIdent) {

      this.abonnementEnregistrement = this.usagerService.consulterOrganismesEnregistreurs(this.idEnregistrementIdent).subscribe((res: any) => {
        this.dataSource = res;
      });

    }
  }

  getCodeMG(organismeEnregistreur : OrganismeDTO) : string {
    return organismeEnregistreur.codeSiteMG ? organismeEnregistreur.codeSiteMG : organismeEnregistreur.codeOrganismeMG;
  }

}
