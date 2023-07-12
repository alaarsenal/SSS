import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { UsagerService } from '../../../services/usager.service';
import { SoinServiceDTO } from '../../../models/soin-service-dto';




@Component({
  selector: 'app-consultation-soins-services',
  templateUrl: './consultation-soins-services.component.html',
  styleUrls: ['./consultation-soins-services.component.css']
})
export class ConsultationSoinsServicesComponent implements OnInit {

  readonly displayedColumns: string[] = ['dateDebut', 'type', 'commentaires'];

  public dataSource = new MatTableDataSource<any>([]);

  listConsultationSoinsServices: Array<SoinServiceDTO> = [];
  
  @Input("idEnregistrement")
  private idEnregistrementIdent: number;

  private abonnementEnregistrement: Subscription;

  constructor(private usagerService: UsagerService) {

  }


  ngOnInit(): void {
    this.initSoinsServices();
  }

  ngOnDestroy(): void {
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }


  private initSoinsServices() {
    if (this.idEnregistrementIdent) {

      this.abonnementEnregistrement = this.usagerService.consulterSoinsServices(this.idEnregistrementIdent).subscribe((res: any) => {
        this.listConsultationSoinsServices = res;
        this.dataSource = res; 
      });

    } 
  }


}

