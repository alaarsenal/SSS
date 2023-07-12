import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { UsagerService } from '../../../services/usager.service';
import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { UsagerEnregistrementFichireService } from '../../../services/usager-enregistrement-fichier.service';






@Component({
  selector: 'app-consultation-fichiers',
  templateUrl: './consultation-fichiers.component.html',
  styleUrls: ['./consultation-fichiers.component.css']
})
export class ConsultationFichiersComponent implements OnInit {

  // Table dataSource avec la liste des fihiers du BD.
  public dataSource = new MatTableDataSource<UsagerSanterSocialFichierDTO>([]);

  readonly displayedColumns: string[] = ['nom', 'titre', 'description'];

  @Input("idEnregistrement")
  private idEnregistrementIdent: number;

  @Input("codeTypeFichier")
  private codeTypeFichier: string;

  @Input("loadExternalFichiers")
  private loadExternal = false;

  @Output("onTelechargeFichier")
  private onTelechargeFichier = new EventEmitter();

  private abonnement: Subscription;

  @Input("listeFichiers")
  set listeFichiers(fichiers: any) {
    this.dataSource.data = fichiers;
  }

  constructor(private usagerService: UsagerService,
    private fichierService: UsagerEnregistrementFichireService) {

  }

  ngOnInit(): void {
    if (! this.loadExternal) {
      this.initFichiers();
    }
  }

  ngOnDestroy(): void {
    if (this.abonnement) {
      this.abonnement.unsubscribe();
    }

  }

  private initFichiers() {
    if (this.idEnregistrementIdent) {

      this.abonnement = this.usagerService.consulterFichiers(this.idEnregistrementIdent, this.codeTypeFichier).subscribe((res: any) => {
        this.dataSource.data = res;
      });

    }
  }

  onTelechargerFichier(fichier: UsagerSanterSocialFichierDTO) {
    if (this.loadExternal) {
      this.onTelechargeFichier.emit(fichier.id)
    } else {
      let a= document.createElement('a');
      a.target= '_blank';
      a.href= this.fichierService.getLinktelechargement(this.idEnregistrementIdent, fichier.id);;
      a.click();
    }
  }

}
