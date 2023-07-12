import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';


@Directive({
  selector: "[hasAllRoles]"
})
export class HasAllRolesDirective implements OnInit {
  @Input("hasAllRoles")
  roles: string[];

  constructor(
    private vcr: ViewContainerRef,
    private tpl: TemplateRef<any>) {
  }

  ngOnInit(): void {
    this.vcr.clear();
    if (AuthenticationUtils.hasAllRoles(this.roles)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
