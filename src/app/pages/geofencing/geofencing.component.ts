import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { GeofenceService } from '../../backend/api/geofence.service';
import { BasePagedComponent } from '../../core/components/base-paged/base-paged.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { AddEditLocationComponent } from '../../shared/components/dialogs/add-edit-location/add-edit-location.component';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';

interface GeoTableRow {
  id: number;
  created: string;
  name: string;
  coordinates: string;
  radius: string;
}

@Component({
  selector: 'app-geofencing',
  templateUrl: './geofencing.component.html',
  styleUrls: ['./geofencing.component.scss'],
})
export class GeofencingComponent extends BasePagedComponent implements OnInit {
  @ViewChild('tableAction', { static: true }) tableAction: TemplateRef<any>;
  isLoading: boolean;
  rows: GeoTableRow[] = [];
  columns = [];

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private geofenceService: GeofenceService
  ) {
    super(authService, t);
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'created', name: this.t.instant('created') },
      { prop: 'name', name: this.t.instant('name') },

      {
        prop: 'coordinates',
        name: this.t.instant('coordinates'),
      },
      {
        prop: 'radius',
        name: this.t.instant('radius'),
      },
      {
        prop: 'action',
        name: '',
        cellTemplate: this.tableAction,
        cellClass: 'action-cell',
        sortable: false,
        width: 120,
      },
    ];

    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    this.geofenceService.apiGeofenceGet({ ...this.tableData }).subscribe(
      (res) => {
        this.isLoading = false;

        this.pageLoaded(res);
        this.rows = res.results.map((x) => ({
          id: x.id,
          created: moment.utc(x.createdOn).local().format('LLL'),
          name: x.name,
          radius: x.radius.toString(),
          coordinates: `${x.latitude.toString().substr(0, 8)}, ${x.longitude
            .toString()
            .substr(0, 8)}`,
        }));
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  addLocation() {
    this.dialogService
      .open(AddEditLocationComponent, {
        className: 'location-dialog',
        size: 'md',
        closeOnClickOutside: false,
      })
      .afterClosed.subscribe((res) => {
        if (res && res.save) {
          //this.toastr.success(this.t.instant("success.locationCreated"));
          this.ngOnInit();
        }
      });
  }

  editLocation(locationId) {
    this.dialogService
      .open(AddEditLocationComponent, {
        className: 'location-dialog',
        size: 'md',
        data: {
          locationId,
        },
        closeOnClickOutside: false,
      })
      .afterClosed.subscribe((res) => {
        if (res && res.save) {
          //this.toastr.success(this.t.instant("success.locationEdited"));
          this.ngOnInit();
        }
      });
  }

  removeLocation(locationId) {
    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
        data: {
          locationId,
        },
      })
      .afterClosed.subscribe((res) => {
        if (res && res.confirmed) {
          //this.toastr.success(this.t.instant("success.locationRemoved"));
          this.geofenceService
            .apiGeofenceIdDelete({ id: locationId })
            .subscribe(
              (res) => {
                this.loadData();
              },
              (err) => {}
            );
        }
      });
  }
}
