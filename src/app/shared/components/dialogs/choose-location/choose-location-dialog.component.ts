import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Loader, LoaderOptions } from 'google-maps';
import { pairwise } from 'rxjs/operators';
import { GeofenceService } from '../../../../backend/api/geofence.service';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfigService } from '../../../../core/services/config.service';
import { GoogleGeocodingService } from '../../../../services/google-geocoding';

@Component({
  selector: 'app-choose-location-dialog',
  templateUrl: './choose-location-dialog.component.html',
  styleUrls: ['./choose-location-dialog.component.scss'],
})
export class ChooseLocationDialog extends BaseComponent implements OnInit {
  locationId: number;
  isLoading = false;

  address = new FormControl();

  form = new FormGroup({
    radius: new FormControl('5'),
    latitude: new FormControl('', Validators.required),
    longitude: new FormControl('', Validators.required),
  });

  map: google.maps.Map = null;
  marker: google.maps.Marker = null;
  circle: google.maps.Circle = null;

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService,
    authService: AuthService,
    private configService: ConfigService,
    private geocodingService: GoogleGeocodingService,
    private geofenceService: GeofenceService
  ) {
    super(authService, t);
    const config = this.dialogConfig;

    if (config.data) {
      this.locationId = config.data.locationId;
    }

    if (
      config.data?.latitude &&
      config.data?.longitude &&
      config.data?.radius
    ) {
      this.form.patchValue({
        latitude: config.data.latitude,
        longitude: config.data.longitude,
        radius: config.data.radius,
      });
    }
  }

  ngOnInit(): void {
    if (typeof google === 'object' && typeof google.maps === 'object') {
      this.initMap();
    } else {
      const options: LoaderOptions = {};
      const loader = new Loader(this.configService.googleApiKey, options);

      loader.load().then((google) => {
        this.initMap();
      });
    }

    this.form.valueChanges
      .pipe(pairwise())
      .subscribe(([prev, next]: [any, any]) => {
        if (prev.radius != next.radius) {
          this.updateMarkerRadius();
        }
      });
  }

  initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 51.528308, lng: -0.3817765 },
      zoom: 10,
      disableDefaultUI: true,
    });

    google.maps.event.addListener(this.map, 'click', (event) => {
      this.updateMarker(event.latLng.lat(), event.latLng.lng());
    });

    if (this.form.value.latitude && this.form.value.longitude) {
      this.updateMarker(this.form.value.latitude, this.form.value.longitude);
    }
  }

  searchAddress() {
    this.geocodingService.search(this.address.value).subscribe((res) => {
      if (res.results.length) {
        const address = res.results[0];

        this.form.patchValue({
          latitude: address.geometry.location.lat,
          longitude: address.geometry.location.lng,
        });

        this.updateMarker(
          address.geometry.location.lat,
          address.geometry.location.lng
        );
      }
    });
  }

  updateMarker(lat: number, lng: number) {
    if (!this.map) {
      return;
    }

    this.map.setCenter({ lat, lng });
    this.map.setZoom(18);

    this.marker?.setMap(null);
    this.marker = null;

    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
    });

    this.updateMarkerRadius();

    this.form.patchValue({
      latitude: lat,
      longitude: lng,
    });

    this.updateMarkerRadius();
  }

  updateMarkerRadius() {
    this.circle?.setMap(null);
    this.circle = null;

    let radius = parseInt(this.form.value.radius || '0', 10);

    if (radius > 500) {
      radius = 500;
    } else if (radius < 5) {
      radius = 5;
    }

    this.circle = new google.maps.Circle({
      map: this.map,
      radius,
      fillColor: '#ff6565',
      strokeColor: 'transparent',
    });

    this.circle.bindTo('center', this.marker, 'position');

    google.maps.event.addListener(this.circle, 'click', (event) => {
      this.updateMarker(event.latLng.lat(), event.latLng.lng());
    });
  }

  close(save?: boolean) {
    this.dialogRef.close({ save });
  }

  save() {
    this.dialogRef.close({
      latitude: this.form.value.latitude,
      longitude: this.form.value.longitude,
      radius: this.form.value.radius,
    });
  }
}
