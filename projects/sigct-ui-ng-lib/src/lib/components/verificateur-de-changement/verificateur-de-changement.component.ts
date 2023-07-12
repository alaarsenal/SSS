import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfirmationDialogService } from '../modal-confirmation-dialog/modal-confirmation-dialog.service';
import { VerificateurChangmentService } from './verificateur-changment.service';

@Component({
  selector: 'msss-verificateur-de-changement',
  templateUrl: './verificateur-de-changement.component.html',
  styleUrls: ['./verificateur-de-changement.component.scss']
})
export class VerificateurDeChangementComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();

  private data: any;

  private originalData: any;

  private urlRequired;

  public onBtnOuiCallback: Function = this.onBtnOuiClick;

  public onBtnNomCallback: Function = this.onBtnNomClick;

  @Input()
  public messagAvertissement = 'usager.msg.confirmatiom'

  constructor(
    private router: Router,
    private modalConfirmService: ConfirmationDialogService,
    private verificateurService: VerificateurChangmentService) { }

  ngOnInit() {
    this.sabonnerAuxChangementsDeRoute();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  @Input("data")
  public set setData(data: any) {
    this.data = data;
    this.originalData = JSON.stringify(data);
    this.verificateurService.originalData = this.originalData;
    this.verificateurService.data = this.data;
  }

  private sabonnerAuxChangementsDeRoute() {
    this.subscriptions = this.router.events
      .pipe(filter(e => e instanceof NavigationStart)).subscribe((e: NavigationStart) => {
        this.urlRequired = e.url;
        this.verifierChangments(this.onBtnOuiClick, this.onBtnNomClick);
      });
  }

  public verifierChangments(onBtnOuiCallback: any, onBtnNomCallback: any){
    this.onBtnOuiCallback = onBtnOuiCallback;
    this.onBtnNomCallback = onBtnNomCallback;
    if (this.isExisteChangements()) {
      this.informerUtilisateur();
    }
  }

  public isExisteChangements(): boolean {
    return this.verificateurService.isExisteChangements();
  }

  private informerUtilisateur(){
    this.router.navigate([this.router.routerState.snapshot.url]);
    this.modalConfirmService.openAndFocus('confirm_popup_verificateur_changement',
        'verificateur_changement_cancel_confirm_button');
  }

  public onBtnOuiClick() {
    this.subscriptions.unsubscribe();
    this.closeModal();
    this.router.navigate([this.urlRequired]);
  }

  public onBtnNomClick() {
    this.router.navigate([this.router.routerState.snapshot.url]);
  }

  @HostListener('window:beforeunload ', ['$event'])
  public beforeUnLoad(event: any){
    if (this.isExisteChangements()) {
      event.preventDefault(event); //per the standard
      event.returnValue = '';
    }
  }

  public closeModal(){
    this.modalConfirmService.close('confirm_popup_verificateur_changement');
  }

  public reset(){
    this. verificateurService.data = undefined;
    this.verificateurService.originalData = undefined;
  }

}
