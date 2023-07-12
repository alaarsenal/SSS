import { Component, OnInit, Input } from '@angular/core';
import { DatesDTO } from '../../../models/dates-dto';
import { UsagerService } from '../../../services/usager.service';
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-consultation-dates',
  templateUrl: './consultation-dates.component.html',
  styleUrls: ['./consultation-dates.component.css']
})
export class ConsultationDatesComponent implements OnInit {

  @Input("idEnregistrement")
  private idEnregistrementIdent: number;

  private abonnementEnregistrement: Subscription;

  dates: DatesDTO = new DatesDTO();

  constructor(private usagerService: UsagerService) { }

  ngOnInit(): void {
    this.initDates();
  }

  ngOnDestroy(): void {
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }

  private initDates() {
    if (this.idEnregistrementIdent) {
      this.abonnementEnregistrement = this.usagerService.consulterDates(this.idEnregistrementIdent).subscribe((res: DatesDTO) => {
        this.dates = res;
        
      });

    } 
  }

}
