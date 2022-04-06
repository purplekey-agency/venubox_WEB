import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import {
  DialogConfig,
  DialogService,
} from '../../../../core/dialog/dialog.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TemplateService } from './../../../../backend/api/template.service';
// @ts-ignore
import template01 from './jsons/template01.json';
// @ts-ignore
import template02 from './jsons/template02.json';
// @ts-ignore
import template03 from './jsons/template03.json';
// @ts-ignore
import template04 from './jsons/template04.json';

interface Template {
  id?: number;
  html: any;
  iframeHtml: any;
  template: any;
}

@Component({
  selector: 'app-promotion-templates-dialog',
  templateUrl: './promotion-templates-dialog.component.html',
  styleUrls: ['./promotion-templates-dialog.component.scss'],
})
export class PromotionTemplatesDialogComponent implements OnInit {
  isLoading = false;

  templates: Template[] = [
    {
      template: JSON.parse(template01[0].Design).design,
      html: JSON.parse(template01[0].Design).html,
      iframeHtml: this.sanitizer.bypassSecurityTrustHtml(
        JSON.parse(template01[0].Design).html
      ),
    },
    {
      template: JSON.parse(template02[0].Design).design,
      html: JSON.parse(template02[0].Design).html,
      iframeHtml: this.sanitizer.bypassSecurityTrustHtml(
        JSON.parse(template02[0].Design).html
      ),
    },
    {
      template: JSON.parse(template03[0].Design).design,
      html: JSON.parse(template03[0].Design).html,
      iframeHtml: this.sanitizer.bypassSecurityTrustHtml(
        JSON.parse(template03[0].Design).html
      ),
    },
    {
      template: JSON.parse(template04[0].Design).design,
      html: JSON.parse(template04[0].Design).html,
      iframeHtml: this.sanitizer.bypassSecurityTrustHtml(
        JSON.parse(template04[0].Design).html
      ),
    },
  ];

  activeTab: 'saved' | 'default' = 'default';
  savedTemplates: Template[] = [];

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService,
    private router: Router,
    private templateService: TemplateService,
    private dialogService: DialogService,
    private sanitizer: DomSanitizer
  ) {
    const config = this.dialogConfig;
  }

  ngOnInit() {
    this.isLoading = true;

    this.templateService.apiTemplateGet().subscribe(
      (res) => {
        this.isLoading = false;
        this.savedTemplates = res.map((x) => ({
          id: x.id,
          template: JSON.parse(x.design).design,
          html: JSON.parse(x.design).html,
          iframeHtml: this.sanitizer.bypassSecurityTrustHtml(
            JSON.parse(x.design).html
          ),
        }));

        if (res.length) {
          this.activeTab = 'saved';
        }
      },
      () => {
        this.isLoading = false;
        this.dialogRef.close();
      }
    );
  }

  selectTemplate(design: any) {
    this.dialogRef.close(design);
  }

  deleteTemplate(id: number) {
    setTimeout(() => {
      this.dialogService
        .open(ConfirmDialogComponent, {})
        .afterClosed.subscribe((res) => {
          if (res?.confirmed) {
            this.templateService
              .apiTemplateIdDelete({ id })
              .subscribe((res) => {
                const foundIndex = this.savedTemplates.findIndex(
                  (x) => x.id == id
                );
                this.savedTemplates.splice(foundIndex, 1);

                if (!this.savedTemplates.length) {
                  this.dialogRef.close();
                }
              });
          }
        });
    }, 100);
  }
}
