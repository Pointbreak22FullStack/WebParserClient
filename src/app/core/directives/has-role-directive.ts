import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {AuthorizationService} from '../../services/authorization-service';


@Directive({
  selector: '[hasRole]'
})
export class HasRoleDirective {

  private authz = inject(AuthorizationService);
  private platformId = inject(PLATFORM_ID);

  private requiredRoles: string[] = [];
  private isViewCreated = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  // Поддержка:
  // *hasRole="'Admin'"
  // *hasRole="['Admin','Manager']"
  @Input()
  set hasRole(role: string | string[]) {
    this.requiredRoles = Array.isArray(role) ? role : [role];
    this.updateView();
  }

  private updateView() {

    if (!isPlatformBrowser(this.platformId)) {
      this.viewContainer.clear();
      return;
    }

    const hasAccess = this.authz.isAuthenticated() && this.authz.hasAnyRole(this.requiredRoles);

    if (hasAccess && !this.isViewCreated) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isViewCreated = true;
    }

    if (!hasAccess && this.isViewCreated) {
      this.viewContainer.clear();
      this.isViewCreated = false;
    }
  }
}
