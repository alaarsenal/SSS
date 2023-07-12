import { Injectable, ComponentFactoryResolver, Injector, Inject, TemplateRef, Type } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MssModalComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-dialog/modal-dialog.component';


export type Content<T> = string | TemplateRef<T> | Type<T>;

@Injectable({
  providedIn: 'root'
})
export class ModalDialogService {

  constructor(private resolver: ComponentFactoryResolver,
    private injector: Injector,
    @Inject(DOCUMENT) private document: Document
  ) { }

  open<T>(content: Content<T>) {
    let factory = this.resolver.resolveComponentFactory(MssModalComponent);
    let ngContent = this.resolveNgContent(content);
    let componentRef = factory.create(this.injector, ngContent);

    componentRef.hostView.detectChanges();

    let { nativeElement } = componentRef.location;
    this.document.body.appendChild(nativeElement);

    factory = this.resolver.resolveComponentFactory(MssModalComponent);
    ngContent = this.resolveNgContent(content);
    componentRef = factory.create(this.injector, ngContent);

    componentRef.hostView.detectChanges();


    this.document.body.appendChild( componentRef.location.nativeElement);
    
  }

  resolveNgContent<T>(content: Content<T>) {
    if (typeof content === 'string') {
      const element = this.document.createTextNode(content);
      return [[element]];
    }

    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(null);
      // In earlier versions, you may need to add this line
      // this.appRef.attachView(viewRef);
      return [viewRef.rootNodes];
    }

    const factory = this.resolver.resolveComponentFactory(content);
    const componentRef = factory.create(this.injector);
    return [[componentRef.location.nativeElement], [this.document.createTextNode('Second ng-content')]];
  }
}
