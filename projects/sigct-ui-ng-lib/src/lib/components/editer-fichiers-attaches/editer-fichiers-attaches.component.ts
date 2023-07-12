import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableFichierDTO } from 'projects/sigct-service-ng-lib/src/lib/models/TableFichierDTO';
import { UsagerSanterSocialFichierDTO } from '../../model/UsagerSanterSocialFichierDTO';

@Component({
  selector: 'msss-editer-fichiers-attaches',
  templateUrl: './editer-fichiers-attaches.component.html',
  styleUrls: ['./editer-fichiers-attaches.component.css']
})
export class EditerFichiersAttachesComponent implements OnInit {

  @Input("showListeProfile")
  isShowListeProfile: boolean;
  @Input("showColReference")
  isShowColReference: boolean;
  @Input("showColTitre")
  isShowColTitre: boolean;
  @Input("showColDescription")
  isShowColDescription: boolean;
  @Input("listeFichiers")
  listeFichiers: TableFichierDTO[];

  @Output("onAjouterFichier")
  public ajouterFichierEvent = new EventEmitter();

  @Output("onListFichier")
  public listFichierEvent = new EventEmitter();

  @Output("onSupprimerFichier")
  public supprimerFichierEvent = new EventEmitter();

  @Output("onTelechargerFichier")
  public telechargerFichierEvent = new EventEmitter();

  @Output("onAficherAlert")
  public aficherAlertEvent = new EventEmitter();

  
  @Input("typeFichierAccepter")
  public typeFichierAccepter: string;

  @Input()
  titreSection: string = 'Fichier attaché';

  @Input()
  public urlBaseMiniatureImg: string;

  isFocus: boolean = true;

  public displayedColumns: string[] = ['aprecu', 'nom', 'titre', 'description', 'actions'];

  msgSupprimer: string = this.translateService.instant('sa-iu-a00001',[this.titreSection]);

  @Input()
  idFichier: number;

  @Input()
  fichierService: any;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  onAjouterFichier(event) {
    this.ajouterFichierEvent.emit(event);
  }



  onListFichier(event){
    this.listFichierEvent.emit(event);
  }

  onSupprimerFichier(event) {
    this.supprimerFichierEvent.emit(event);
  }

  onTelechargerFichier(fichier: UsagerSanterSocialFichierDTO) {
    this.telechargerFichierEvent.emit(fichier);
  }

  isFichierReadOnly() {
    return false;
  }

  getUrlBaseTelecharge(){
    if(this.idFichier){
      return this.fichierService.getUrlBaseTelechargement(this.idFichier);
    }
    return "";
  }

}
