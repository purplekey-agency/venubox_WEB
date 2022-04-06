import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  Type,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { DialogRef } from './dialog-ref';
import { DialogConfig } from './dialog.service';
import { InsertionDirective } from './insertion.directive';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogComponent implements AfterViewInit, OnDestroy {
  componentRef: ComponentRef<any>;
  size: DialogConfig['size'];
  className: DialogConfig['className'] = '';
  closeOnClickOutside: DialogConfig['closeOnClickOutside'] = true;

  @ViewChild(InsertionDirective, { static: false })
  insertionPoint: InsertionDirective;

  private readonly onCloseSubject = new Subject<any>();
  public onClose = this.onCloseSubject.asObservable();

  childComponentType: Type<any>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef,
    private dialogRef: DialogRef
  ) {}

  ngAfterViewInit() {
    this.loadChildComponent(this.childComponentType);
    this.cd.detectChanges();
  }

  onOverlayClicked(evt: MouseEvent) {
    if (
      // @ts-ignore
      evt.target.className.includes('dialog-overlay') &&
      this.closeOnClickOutside
    ) {
      this.dialogRef.close();
    }
  }

  onDialogClicked(evt: MouseEvent) {
    // evt.stopPropagation();
  }

  loadChildComponent(componentType: Type<any>) {
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(componentType);

    const viewContainerRef = this.insertionPoint.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentFactory);
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  close() {
    this.onCloseSubject.next();
  }
}
