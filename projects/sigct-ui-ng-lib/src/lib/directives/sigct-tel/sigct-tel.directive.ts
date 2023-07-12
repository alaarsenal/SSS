import { Directive, OnInit, OnDestroy, Input, ElementRef, Renderer2 } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[msssSigctTel]'
})
export class SigctTelDirective implements OnInit, OnDestroy {

  private _telControl:AbstractControl;
  private _valeurOrigine:string;

  @Input("telControl")
  set telControl(control:AbstractControl){
    this._telControl = control; 
  }

  @Input("valeurOrigine")
  set valeurOrigine(valeur:string){
    this._valeurOrigine = valeur;
  }

  private abonnement:Subscription;

  constructor(private el: ElementRef, private renderer:Renderer2) { }

  ngOnInit(){

     this.telValider();

  }

  ngOnDestroy(){
    this.abonnement.unsubscribe();
  }

  telValider(){

    this.abonnement = this._telControl.valueChanges.subscribe(data => {
      
      
      let valeurTravail:string = this._valeurOrigine;
      var dernierCar:string = valeurTravail.substr(valeurTravail.length - 1);
      // Garder seulement les nombre
      var nouvelleValeur = data.replace(/\D/g, '');

      let debut = this.renderer.selectRootElement('#tel').selectionStart;
      let fin = this.renderer.selectRootElement('#tel').selectionEnd;
 
      if (data.length < valeurTravail.length) {
      
        if(valeurTravail.length < debut){
        if(dernierCar == ')'){
          nouvelleValeur = nouvelleValeur.substr(0,nouvelleValeur.length-1); 
        }
      }
      //Vider s'il n'y a pas de nombre
      if (nouvelleValeur.length == 0) {
        nouvelleValeur = '';
      } 
      else if (nouvelleValeur.length <= 3) {
        
        nouvelleValeur = nouvelleValeur.replace(/^(\d{0,3})/, '($1');
      } else if (nouvelleValeur.length <= 6) {
        nouvelleValeur = nouvelleValeur.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
      } else {
        nouvelleValeur = nouvelleValeur.replace(/^(\d{0,3})(\d{0,3})(.*)/, '($1) $2-$3');
      }
     
      this._telControl.setValue(nouvelleValeur,{emitEvent: false});
       
      this.renderer.selectRootElement('#tel').setSelectionRange(debut,fin);
    
    } else{
      var removedD = data.charAt(debut);
    
      if (nouvelleValeur.length == 0) {
      nouvelleValeur = '';
    } 
    
    else if (nouvelleValeur.length <= 3) {
      nouvelleValeur = nouvelleValeur.replace(/^(\d{0,3})/, '($1)');
    } else if (nouvelleValeur.length <= 6) {
      nouvelleValeur = nouvelleValeur.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
    } else {
      nouvelleValeur = nouvelleValeur.replace(/^(\d{0,3})(\d{0,3})(.*)/, '($1) $2-$3');
    }
    
    if(valeurTravail.length >= debut){
      
      if(removedD == '('){
        debut = debut +1;
        fin = fin +1;
      }
      if(removedD == ')'){
        debut = debut +2; // +2 pour avoir un espace après ')'.
        fin = fin +2;
      }
      if(removedD == '-'){
        debut = debut +1;
        fin = fin +1;
      }
      if(removedD == " "){
          debut = debut +1;
          fin = fin +1;
        }
      this._telControl.setValue(nouvelleValeur,{emitEvent: false});
      this.renderer.selectRootElement('#tel').setSelectionRange(debut,fin);
    } else{
        this._telControl.setValue(nouvelleValeur,{emitEvent: false});
        this.renderer.selectRootElement('#tel').setSelectionRange(debut+2,fin+2); // +2 à cause des strings
    }
  }
  });
 }

}
