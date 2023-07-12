import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableInformationsUtilesService } from 'projects/sigct-service-ng-lib/src/lib/services/table-informations-utiles/table-informations-utiles-service';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { PiloterInformationsUtilesComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-informations-utiles/piloter-informations-utiles.component';
import { TableInforUtileDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-informations-utiles/table-infor-utile-dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-information-utile-page',
  templateUrl: './information-utile-page.component.html',
  styleUrls: ['./information-utile-page.component.css']
})
export class InformationUtilePageComponent implements OnInit, OnDestroy {


  @ViewChild('ajouterinfoutil', { read: ElementRef, static: true }) private btnAjouter: ElementRef;
  @ViewChild('listeutile', {static: false}) private listeInfoUtile: PiloterInformationsUtilesComponent;

  messageSupprimer: string;
  private eventASupprimer: TableInforUtileDTO;
  private subscription: Subscription = new Subscription();

  constructor(private router: Router,
              private translateService: TranslateService,
              private modalConfirmService: ConfirmationDialogService,
              private tableInfoService: TableInformationsUtilesService) { }
  
  
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    const titre : string = this.translateService.instant('sigct.ss.pilotage.info_utile.liste.titre');
    this.messageSupprimer = this.translateService.instant('ss-iu-a50106',[titre]);
    this.btnAjouter.nativeElement.focus();

  }

  onAjouterInfoUtileClick() : void {
    this.router.navigate(["/" + "info-utile-page/0"]);
  }

  onSupprimerElement(event: TableInforUtileDTO): void {

    this.eventASupprimer = event;
    this.openModal('confirm_popup_supprimer_infor_util');

  }


  supprimerInforUtile():void{
    this.closeModal('confirm_popup_supprimer_infor_util');
    if(this.eventASupprimer){

      this.subscription.add(
        this.tableInfoService.deleteInformationUtile(this.eventASupprimer.identifiant).subscribe((r) => {
          this.listeInfoUtile.rechercher();
        })
      
        );

    }
    


  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }


}
