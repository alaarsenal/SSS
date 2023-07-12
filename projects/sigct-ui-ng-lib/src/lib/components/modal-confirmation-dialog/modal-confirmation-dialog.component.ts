import { Component, OnInit, Input, ElementRef, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ConfirmationDialogService } from './modal-confirmation-dialog.service';

@Component({
  selector: 'modal-confirmation',
  templateUrl: './modal-confirmation-dialog.component.html',
  styleUrls: ['./modal-confirmation-dialog.component.css']
})
export class ModalConfirmationDialogComponent implements OnInit, OnDestroy {
  @Input('id-container') id: string = "confirm-popup";
  @Input('titre') titre: string = "Demande de confirmation";

  @Output()
  onModalClose: EventEmitter<string> = new EventEmitter();

  private element: any;

  constructor(private confirmationDialogService: ConfirmationDialogService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  @ViewChild('confirm_popup', { read: ElementRef, static: true }) confirmPopup: ElementRef;

  ngOnInit() {
    let modal = this;

  
// move element to bottom of page (just before </body>) so it can be displayed above everything else
document.body.appendChild(this.element);


 // close modal on background click
 this.element.addEventListener('click', function (e: any) {
  if (e.target.className === 'jw-modal') {
      modal.close();
  }
});

let buttons = document.querySelectorAll(".hidePopup");

buttons.forEach(function(element) {
  element.addEventListener("click", function() {
    modal.close();
  });
});

 // add self (this modal instance) to the modal service so it's accessible from controllers
 this.confirmationDialogService.add(this);
  }


  open() { 
    this.confirmPopup.nativeElement.style.display = 'block';
  }
  
  /**
   * Affiche la fenêtre de confirmation et met le focus sur l'élément dont l'identifiant est idElemFocus.
   * @param idElemFocus identifiant de l'élement recevant le focus
   */
  openAndFocus(idElemFocus: string) {
    this.open();

    if (idElemFocus){
      let element: HTMLElement = document.getElementById(idElemFocus);

      if (element){
        element.focus();
      }
    }
  }

  close() {
    this.confirmPopup.nativeElement.style.display = 'none';
    this.onModalClose.emit(this.id); // On indique au parent que la fenêtre ferme
   }

  ngOnDestroy(): void {
    this.confirmationDialogService.remove(this.id);
        this.element.remove();
  }
}
