import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AdminHuntRequestDto } from '../../backend/model/adminHuntRequestDto';
import { AdminHuntUserProgressResponseDto } from '../../backend/model/adminHuntUserProgressResponseDto';
import { BasePagedComponent } from '../../core/components/base-paged/base-paged.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { ChooseLocationDialog } from '../../shared/components/dialogs/choose-location/choose-location-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { AdminHuntsService } from './../../backend/api/adminHunts.service';

@Component({
  selector: 'app-admin-save-treasure-hunt',
  templateUrl: './admin-save-treasure-hunt.component.html',
  styleUrls: ['./admin-save-treasure-hunt.component.scss'],
})
export class AdminSaveTreasureHunt
  extends BasePagedComponent
  implements OnInit
{
  isLoading: boolean;
  isSaving: boolean;
  id: number;
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    cityPart: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    goals: new FormArray([]),
    endGoal: new FormGroup({
      id: new FormControl(),
      endMessage: new FormControl('', Validators.required),
      latitude: new FormControl(0),
      longitude: new FormControl(0),
      radius: new FormControl(0),
    }),
  });

  selectedTab: 'info' | 'progress' = 'info';
  userProgress: AdminHuntUserProgressResponseDto[] = [];

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private adminHuntsService: AdminHuntsService,
    private router: Router,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute
  ) {
    super(authService, t);

    this.activatedRoute.paramMap.subscribe((res) => {
      if (res.get('id')) {
        this.id = parseInt(res.get('id'), 10);
      }
    });
  }

  ngOnInit(): void {
    if (this.id) {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;

    this.adminHuntsService
      .apiAdminHuntsIdGet({ id: this.id })
      .subscribe((res) => {
        this.isLoading = false;

        this.userProgress = res.userProgress;

        const endGoal = res.goals[res.goals.length - 1];
        res.goals.splice(res.goals.length - 1, 1);

        res.goals.forEach((x) => {
          this.goals.push(
            new FormGroup({
              id: new FormControl(x.id),
              order: new FormControl(x.order),
              endMessage: new FormControl(x.endMessage, Validators.required),
              nextClueMessage: new FormControl(
                x.nextClueMessage,
                Validators.required
              ),
              nextClueMessageDelay: new FormControl(
                x.nextClueMessageDelay,
                Validators.required
              ),
              latitude: new FormControl(x.latitude),
              longitude: new FormControl(x.longitude),
              radius: new FormControl(x.radius),
            })
          );
        });

        this.form.patchValue({
          name: res.name,
          city: res.city,
          cityPart: res.cityPart,
          startDate: moment.utc(res.startAt),
          startTime: moment.utc(res.startAt).local().format('HH:mm'),
          endDate: moment.utc(res.endAt),
          endTime: moment.utc(res.endAt).local().format('HH:mm'),
          endGoal: {
            id: endGoal.id,
            order: endGoal.order,
            endMessage: endGoal.endMessage,
            latitude: endGoal.latitude,
            longitude: endGoal.longitude,
            radius: endGoal.radius,
          },
        });
      });
  }

  async getRequestData() {
    const startDate = this.form.value.startDate.local();
    const endDate = this.form.value.endDate.local();

    const startTime = moment(this.form.value.startTime, 'HH:mm');
    const endTime = moment(this.form.value.endTime, 'HH:mm');

    const start = startDate
      .set({
        hour: startTime.get('hour'),
        minute: startTime.get('minute'),
        second: 0,
        millisecond: 0,
      })
      .utc()
      .format();

    const end = endDate
      .set({
        hour: endTime.get('hour'),
        minute: endTime.get('minute'),
        second: 0,
        millisecond: 0,
      })
      .utc()
      .format();

    const goals = this.goals.controls.map((x, i) => ({
      order: i,
      ...x.value,
    }));

    goals.push({
      order: goals.length,
      ...this.form.value.endGoal,
    });

    const data: AdminHuntRequestDto = {
      name: this.form.value.name,
      city: this.form.value.city,
      cityPart: this.form.value.cityPart,
      startAt: start,
      endAt: end,
      goals,
    };

    return data;
  }

  async save() {
    this.clearAlerts();
    this.isSaving = true;

    const data = await this.getRequestData();

    const apiCall = this.id
      ? this.adminHuntsService.apiAdminHuntsPut({
          adminHuntRequestDto: {
            id: this.id,
            ...data,
          },
        })
      : this.adminHuntsService.apiAdminHuntsPost({ adminHuntRequestDto: data });

    apiCall.subscribe(
      (res) => {
        this.isSaving = false;
        this.router.navigate(['/admin/treasure-hunt']);
      },
      (err) => {
        this.isSaving = false;
        this.errorHandler(err, this.form);
      }
    );
  }

  cancel() {
    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
      })
      .afterClosed.subscribe((res) => {
        if (res && res.confirmed) {
          this.router.navigate(['/admin/treasure-hunt']);
        }
      });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.goals.controls,
      event.previousIndex,
      event.currentIndex
    );

    this.goals.controls.forEach((x, i) => {
      x.patchValue({
        order: i,
      });
    });
  }

  get goals() {
    return this.form.get('goals') as FormArray;
  }

  addGoal() {
    this.goals.push(
      new FormGroup({
        order: new FormControl(this.goals.controls.length),
        endMessage: new FormControl('', Validators.required),
        nextClueMessage: new FormControl('', Validators.required),
        nextClueMessageDelay: new FormControl(0, Validators.required),
        latitude: new FormControl(0),
        longitude: new FormControl(0),
        radius: new FormControl(0),
      })
    );
  }

  deleteGoal(i: number) {
    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
      })
      .afterClosed.subscribe((res) => {
        if (res && res.confirmed) {
          this.goals.removeAt(i);

          this.goals.controls.forEach((x, i) => {
            x.patchValue({
              order: i,
            });
          });
        }
      });
  }

  chooseLocation(i: number) {
    const control =
      i !== -1 ? this.goals.controls[i] : this.form.controls.endGoal;

    this.dialogService
      .open(ChooseLocationDialog, {
        className: 'choose-location-dialog',
        closeOnClickOutside: false,
        data: {
          latitude: control.value.latitude,
          longitude: control.value.longitude,
          radius: control.value.radius,
        },
      })
      .afterClosed.subscribe((res) => {
        if (res?.latitude && res?.longitude && res?.radius) {
          control.patchValue({
            latitude: res.latitude,
            longitude: res.longitude,
            radius: res.radius,
          });
        }
      });
  }

  selectTab(tab: 'info' | 'progress') {
    this.selectedTab = tab;
  }

  sameAsStartDate() {
    return this.form.value.startDate
      ? moment(this.form.value.startDate).add(-1, 'day')
      : null;
  }

  sameAsEndDate() {
    return this.form.value.endDate
      ? moment(this.form.value.endDate).add(1, 'day')
      : null;
  }
}
