import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { UsagerService } from '../../../services/usager.service';
import { ConsultationRessourcesProfessionellesDTO } from '../../../models/consultation-ressources-professionnelles-dto';




@Component({
  selector: 'app-consultation-ressources-professionnelles',
  templateUrl: './consultation-ressources-professionnelles.component.html',
  styleUrls: ['./consultation-ressources-professionnelles.component.css']
})
export class ConsultationRessourcesProfessionnellesComponent implements OnInit {

  readonly displayedColumns: string[] = ['nom', 'lien', 'adresse', 'telephone1', 'telephone2', 'disponibilite'];

  public dataSource = new MatTableDataSource<any>([]);

  listConsultationRessourcesProfessionnelles: Array<ConsultationRessourcesProfessionellesDTO> = [];
  
  @Input("idEnregistrement")
  private idEnregistrementIdent: number;

  private abonnementEnregistrement: Subscription;

  constructor(private usagerService: UsagerService) {

  }


  ngOnInit(): void {
    this.initRessourcesProfessionnelles();
  }

  ngOnDestroy(): void {
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }


  private initRessourcesProfessionnelles() {
    if (this.idEnregistrementIdent) {

      this.abonnementEnregistrement = this.usagerService.consulterRessourcesProfessionnelles(this.idEnregistrementIdent).subscribe((res: any) => {
        this.listConsultationRessourcesProfessionnelles = res;
        this.dataSource = res; 
      });

    } 
  }


}

