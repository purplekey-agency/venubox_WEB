import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import { DialogInjector } from './dialog-injector';
import { DialogRef } from './dialog-ref';
import { DialogComponent } from './dialog.component';
import { DialogModule } from './dialog.module';

export class DialogConfig<D = any> {
  data?: D;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  closeOnClickOutside?: boolean;
}

@Injectable({
  providedIn: DialogModule,
})
export class DialogService {
  dialogComponentRefs: ComponentRef<DialogComponent>[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  public open(componentType: Type<any>, config: DialogConfig) {
    const dialogRef = this.appendDialogComponentToBody(config);

    const lastDialogRef =
      this.dialogComponentRefs[this.dialogComponentRefs.length - 1];

    lastDialogRef.instance.size = (config && config.size) || 'md';
    lastDialogRef.instance.className = (config && config.className) || '';
    lastDialogRef.instance.closeOnClickOutside =
      typeof config.closeOnClickOutside === 'undefined'
        ? true
        : config.closeOnClickOutside;
    lastDialogRef.instance.childComponentType = componentType;

    return dialogRef;
  }

  private appendDialogComponentToBody(config: DialogConfig) {
    const map = new WeakMap();
    map.set(DialogConfig, config);

    const dialogRef = new DialogRef();
    map.set(DialogRef, dialogRef);

    const sub = dialogRef.afterClosed.subscribe(() => {
      this.removeDialogComponentFromBody();
      sub.unsubscribe();
    });

    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(DialogComponent);
    const componentRef = componentFactory.create(
      new DialogInjector(this.injector, map)
    );

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    componentRef.instance.onClose.subscribe(() => {
      this.removeDialogComponentFromBody();
    });

    this.dialogComponentRefs.push(componentRef);

    return dialogRef;
  }

  private removeDialogComponentFromBody() {
    const lastDialogRef =
      this.dialogComponentRefs[this.dialogComponentRefs.length - 1];

    this.appRef.detachView(lastDialogRef.hostView);
    lastDialogRef.destroy();

    this.dialogComponentRefs.splice(this.dialogComponentRefs.length - 1, 1);
  }
}
