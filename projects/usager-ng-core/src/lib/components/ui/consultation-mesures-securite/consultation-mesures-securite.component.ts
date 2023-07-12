import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { IndicateursMesuresSecuriteDTO } from '../../../models/indicateurs-mesures-securite';
import { Subscription } from 'rxjs';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'app-consultation-mesures-securite',
  templateUrl: './consultation-mesures-securite.component.html',
  styleUrls: ['./consultation-mesures-securite.component.css']
})
export class ConsultationMesuresSecuriteComponent implements OnInit {

  readonly displayedColumns: string[] = ['type', 'commentaires'];

  public dataSource = new MatTableDataSource<any>([]);

  listConsultationMesuresSecurite: Array<IndicateursMesuresSecuriteDTO> = [];
  
  @Input("idEnregistrement")
  private idEnregistrementIdent: number;

  private abonnementEnregistrement: Subscription;

  constructor(private usagerService: UsagerService) {

  }


  ngOnInit(): void {
    this.initMesuresSecurite();
  }

  ngOnDestroy(): void {
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }


  private initMesuresSecurite() {
    if (this.idEnregistrementIdent) {

      this.abonnementEnregistrement = this.usagerService.consulterMesuresSecurite(this.idEnregistrementIdent).subscribe((res: any) => {
        this.listConsultationMesuresSecurite = res;
        this.dataSource = res; 
      });

    } 
  }


}
