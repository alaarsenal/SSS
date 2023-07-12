import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UsagerService } from '../../../services/usager.service';
import { EnregistrementsUsagerResultatDTO } from '../../../models/enregistrements-usager-resultat-dto';
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-dates-enregistrement-ui',
  templateUrl: './dates-enregistrement-ui.component.html',
  styleUrls: ['./dates-enregistrement-ui.component.css']
})
export class DatesEnregistrementUiComponent implements OnInit {

  @ViewChild("fDates", { static: true })
  form: NgForm;

   // identifiant de l'usager
   @Input("idUsager")
   idUsager: number;

   @Input("enregistrement")
   enregistrement : EnregistrementsUsagerResultatDTO;
   private abonnementEnregistrement: Subscription;

  constructor(private usagerService: UsagerService)
  { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }

  setIdentificationUsager(idUsager: number): void {
    this.idUsager = idUsager;
  }

  reviserCompletement() {
    const idUsager = this.idUsager != null ? this.idUsager : this.enregistrement.idUsager;

    this.abonnementEnregistrement = this.usagerService.reviserEnregistrementUsager(idUsager, this.enregistrement).subscribe((data: EnregistrementsUsagerResultatDTO) => {
      this.enregistrement.dateRevision  = data.dateRevision;
      this.enregistrement.revisionUsername = data.revisionUsername;
      this.enregistrement.revisionFullDisplayName = data.revisionFullDisplayName;
      this.enregistrement.revisionParOrganisme = data.revisionParOrganisme;

      this.enregistrement.dateAReviser = data.dateAReviser;

    });

  }




}
