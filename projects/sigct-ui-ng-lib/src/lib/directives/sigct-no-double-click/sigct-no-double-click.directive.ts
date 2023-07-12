import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Directive qui permet d'empêcher un double clique sur un objet. 
 * Par défaut, la directive attend la réception de clics pendant 500 ms avant d'émettre un événement "safeClick".
 */
 @Directive({
  selector: '[no-double-click]'
})
export class NoDoubleClickDirective implements OnInit, OnDestroy {
  private clicks = new Subject<PointerEvent>();
  private subscription: Subscription;

  @Input()
  msDelai = 500;

  @Output()
  safeClick = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.subscription = this.clicks.pipe(
      debounceTime(this.msDelai)
    ).subscribe(e => this.safeClick.emit(e));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }
}