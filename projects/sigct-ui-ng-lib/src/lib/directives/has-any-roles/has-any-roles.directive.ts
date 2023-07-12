import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';


@Directive({
  selector: "[hasAnyRoles]"
})
export class HasAnyRolesDirective implements OnInit {
  @Input("hasAnyRoles")
  roles: string[];

  constructor(
    private vcr: ViewContainerRef,
    private tpl: TemplateRef<any>) {
  }

  ngOnInit(): void {
    this.vcr.clear();
    if (AuthenticationUtils.hasAnyRole(this.roles)) {
      this.vcr.createEmbeddedView(this.tpl);
    }

  }
}
