import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmailEditorComponent } from 'angular-email-editor';
import * as moment from 'moment';
import { GeofenceService } from '../../backend/api/geofence.service';
import { IdentitiesService } from '../../backend/api/identities.service';
import { PromotionService } from '../../backend/api/promotion.service';
import { PromotionResponseDto } from '../../backend/model/promotionResponseDto';
import { SubscriptionFrequencyEnum } from '../../backend/model/subscriptionFrequencyEnum';
import { TimeSpan } from '../../backend/model/timeSpan';
import { UserIdentityImageResponseDto } from '../../backend/model/userIdentityImageResponseDto';
import { UserIdentityImageType } from '../../backend/model/userIdentityImageType';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { PromotionPlannedActivityDialogComponent } from '../../shared/components/dialogs/promotion-planned-activity/promotion-planned-activity.component';
import { UploadPhotoDialogComponent } from '../../shared/components/dialogs/upload-photo-dialog/upload-photo-dialog.component';
import { SelectOption } from '../../shared/components/select/select.component';
import { TemplateService } from './../../backend/api/template.service';
import { BaseComponent } from './../../core/components/base/base.component';
import { PhotoChooserDialogComponent } from './../../shared/components/dialogs/photo-chooser-dialog/photo-chooser-dialog.component';
import { PromotionTemplatesDialogComponent } from './../../shared/components/dialogs/promotion-templates-dialog/promotion-templates-dialog.component';

@Component({
  selector: 'app-save-promotion',
  templateUrl: './save-promotion.component.html',
  styleUrls: ['./save-promotion.component.scss'],
})
export class SavePromotionComponent extends BaseComponent implements OnInit {
  id: number;
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    weekDays: new FormControl('', Validators.required),
    geofenceId: new FormControl('', Validators.required),
    contactId: new FormControl('', Validators.required),
    isEnabled: new FormControl(true),
    isContinues: new FormControl(false),
  });
  selectedImage: UserIdentityImageResponseDto = null;

  geofences: SelectOption[] = [];
  selectedGeofence: SelectOption = null;

  contactIdentities: SelectOption[] = [];
  selectedContactIdentity: SelectOption = null;

  isLoading = false;
  isSaving = false;
  isDesignLoaded = false;
  promotion: PromotionResponseDto = null;
  editorUploadQueue = [];
  isUsingPayg = false;

  selectedWeekDays: SelectOption[] = [];
  allWeekDayOptions: SelectOption[] = [
    {
      value: 0,
      label: 'Mon',
    },
    {
      value: 1,
      label: 'Tue',
    },
    {
      value: 2,
      label: 'Wed',
    },
    {
      value: 3,
      label: 'Thu',
    },
    {
      value: 4,
      label: 'Fri',
    },
    {
      value: 5,
      label: 'Sat',
    },
    {
      value: 6,
      label: 'Sun',
    },
  ];
  weekDaysOptions: SelectOption[] = this.allWeekDayOptions;

  @ViewChild(EmailEditorComponent, { static: false })
  private emailEditor: EmailEditorComponent;

  appearance = {
    theme: 'light',
    layout: 'mobile',
  };

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private router: Router,
    private dialogService: DialogService,
    private promotionService: PromotionService,
    private activatedRouter: ActivatedRoute,
    private geofenceService: GeofenceService,
    private identitiesService: IdentitiesService,
    private templateService: TemplateService
  ) {
    super(authService, t);

    this.activatedRouter.paramMap.subscribe((res) => {
      if (res.get('id')) {
        this.id = parseInt(res.get('id'), 10);
      }
    });

    this.activatedRouter.queryParamMap.subscribe((res) => {
      if (res.get('duplicateOf')) {
        const duplicateOfId = parseInt(res.get('duplicateOf'), 10);
        this.loadPromotion(duplicateOfId);
      }
    });

    if (!this.id && this.currentUser.activeSubscriptions.length) {
      const availablePAYG = this.currentUser.activeSubscriptions.find(
        (x) =>
          x.frequency == SubscriptionFrequencyEnum.Once &&
          x.promotionsUsed < x.promotionsLimit
      );

      if (availablePAYG) {
        this.isUsingPayg = true;
      }
    }

    this.form.controls.startDate.valueChanges.subscribe((res) => {
      setTimeout(() => {
        this.filterWeekDays();
      });
    });

    this.form.controls.endDate.valueChanges.subscribe((res) => {
      setTimeout(() => {
        this.filterWeekDays();
      });
    });
  }

  filterWeekDays() {
    const start = this.form.value.startDate
      ? moment.utc(this.form.value.startDate)
      : null;

    const end = this.form.value.endDate
      ? moment.utc(this.form.value.endDate)
      : null;

    this.weekDaysOptions = [];

    for (let i = start; i <= end; i.add(1, 'day')) {
      const isoWeekDay = i.local().isoWeekday() - 1;

      const weekDay = this.allWeekDayOptions.find((x) => x.value == isoWeekDay);

      if (weekDay && this.weekDaysOptions.length < 7) {
        this.weekDaysOptions.push(weekDay);
      }
    }

    this.weekDaysOptions.sort((a, b) => a.value - b.value);

    this.selectedWeekDays = this.selectedWeekDays.filter((x) =>
      this.weekDaysOptions.map((o) => o.value).includes(x.value)
    );
    // @todo: filter selected week day options
  }

  ngOnInit() {
    if (this.id) {
      this.loadPromotion(this.id);
    }

    this.geofenceService.apiGeofenceGet({ pageSize: 100 }).subscribe((res) => {
      this.geofences = res.results.map((x) => ({
        label: x.name,
        value: x.id,
      }));
    });

    this.identitiesService
      .apiIdentitiesGet({ type: UserIdentityImageType.Contact })
      .subscribe((res) => {
        this.contactIdentities = res.map((x) => ({
          label: x.name,
          value: x.id,
        }));
      });
  }

  loadPromotion(id: number) {
    this.isLoading = true;

    this.promotionService.apiPromotionIdGet({ id: id }).subscribe(
      (res) => {
        this.promotion = res;

        this.form.patchValue({
          name: res.name,
          startDate: res.startDate,
          endDate: res.endDate,
          startTime: res.startTime,
          endTime: res.endTime,
          geofenceId: res.geofence?.id,
          contactId: res.contact?.id,
          isEnabled: res.isEnabled,
          isContinues: res.isContinues,
        });

        if (res.geofence) {
          this.selectedGeofence = {
            value: res.geofence.id,
            label: res.geofence.name,
          };
        }

        if (res.contact) {
          this.selectedContactIdentity = {
            value: res.contact.id,
            label: res.contact.name,
          };
        }

        if (res.weekDays) {
          res.weekDays.forEach((x) => {
            const foundOption = this.weekDaysOptions.find((o) => o.value == x);

            if (foundOption) {
              this.selectedWeekDays.push(foundOption);
            }
          });
        }

        this.selectedImage = res.image;

        if (this.emailEditor && this.emailEditor.editor && res.design) {
          this.emailEditor.loadDesign(JSON.parse(res.design).design);
        }

        // If is duplicated
        if (!this.id) {
          this.form.patchValue({
            name: `${res.name}_1`,
          });
        }

        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        this.router.navigate(['/promotions']);
      }
    );
  }

  editorLoaded(e) {
    // this.emailEditor.editor.registerCallback('design:loaded', () => {
    //   this.test();
    // });

    this.emailEditor.editor.registerCallback('image', (file, done) => {
      done({ progress: 0 });
      this.editorUploadQueue.push(file);

      this.promotionService
        .apiPromotionUploadImagePost({ file: file.attachments[0] })
        .subscribe(
          (res) => {
            done({ progress: 100, url: res });

            const foundIndex = this.editorUploadQueue.findIndex(
              (x) => x === file
            );
            if (foundIndex !== -1) {
              this.editorUploadQueue.splice(foundIndex, 1);
            }
          },
          (err) => {}
        );
    });

    if (!this.isDesignLoaded && this.promotion && this.promotion.design) {
      this.emailEditor.loadDesign(JSON.parse(this.promotion.design).design);
    }
  }

  cancel() {
    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
      })
      .afterClosed.subscribe((res) => {
        if (res && res.confirmed) {
          this.router.navigate(['/promotions']);
        }
      });
  }

  async getRequestData() {
    const design = await new Promise<object>((done, reject) => {
      this.emailEditor.exportHtml((d) => {
        done(d);
      });
    });

    const startTime = moment
      .utc(this.form.value.startTime, 'HH:mm')
      .format('HH:mm');
    const endTime = moment
      .utc(this.form.value.endTime, 'HH:mm')
      .format('HH:mm');

    const data = {
      name: this.form.value.name,
      startDate: this.form.value.startDate,
      endDate: this.form.value.endDate,
      startTime: startTime as TimeSpan,
      endTime: endTime as TimeSpan,
      validityPeriod: this.form.value.validityPeriod,
      geofenceId: this.form.value.geofenceId,
      design: JSON.stringify(design),
      imageId: this.selectedImage?.id,
      contactId: this.form.value.contactId,
      isEnabled: this.form.value.isEnabled,
      isContinues: this.form.value.isContinues,
      weekDays: this.selectedWeekDays.map((x) => x.value),
    };

    return data;
  }

  async save() {
    this.clearAlerts();
    this.isSaving = true;

    const data = await this.getRequestData();

    const apiCall = this.id
      ? this.promotionService.apiPromotionPut({
          promotionRequestDto: {
            id: this.id,
            ...data,
          },
        })
      : this.promotionService.apiPromotionPost({ promotionRequestDto: data });

    apiCall.subscribe(
      (res) => {
        this.authService.refreshUser().subscribe();

        this.isSaving = false;
        this.router.navigate(['/promotions']);
      },
      (err) => {
        this.isSaving = false;
        this.errorHandler(err, this.form);
      }
    );
  }

  openUploadImage() {
    this.dialogService
      .open(UploadPhotoDialogComponent, {
        size: 'sm',
        data: {
          type: UserIdentityImageType.Brand,
          closeAfterFirstUpload: true,
        },
      })
      .afterClosed.subscribe((res) => {
        if (res && res.id) {
          this.selectedImage = res;
        }
      });
  }

  openImageChooser() {
    this.dialogService
      .open(PhotoChooserDialogComponent, {})
      .afterClosed.subscribe((res) => {
        if (res && res.image && res.image.id) {
          this.selectedImage = res.image;
        }
      });
  }

  removeSelectedImage() {
    this.selectedImage = null;
  }

  showTemplates() {
    this.dialogService
      .open(PromotionTemplatesDialogComponent, {})
      .afterClosed.subscribe((res) => {
        if (res) {
          this.emailEditor.loadDesign(res);
        }
      });
  }

  saveTemplate() {
    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          message: 'Save this template for usage in other offers?',
        },
      })
      .afterClosed.subscribe(async (res) => {
        if (res?.confirmed) {
          const design = await new Promise<object>((done, reject) => {
            this.emailEditor.exportHtml((d) => {
              done(d);
            });
          });

          this.templateService
            .apiTemplatePost({
              templateRequestDto: {
                design: JSON.stringify(design),
              },
            })
            .subscribe((res) => {});
        }
      });
  }

  async seePlannedActivity() {
    const data = await this.getRequestData();

    this.dialogService.open(PromotionPlannedActivityDialogComponent, {
      data: {
        id: this.id,
        ...data,
      },
    });
  }
}
