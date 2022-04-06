import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { ConfigService } from '../core/services/config.service';

type GeocodingResponseStatus =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'OVER_DAILY_LIMIT'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';

type AddressType =
  | 'street_address'
  | 'route'
  | 'intersection'
  | 'political'
  | 'country'
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'administrative_area_level_3'
  | 'administrative_area_level_4'
  | 'administrative_area_level_5'
  | 'colloquial_area'
  | 'locality'
  | 'ward'
  | 'sublocality'
  | 'neighborhood'
  | 'premise'
  | 'subpremise'
  | 'postal_code'
  | 'natural_feature'
  | 'airport'
  | 'park'
  | 'point_of_interest';

type GeocodingAddressComponentType =
  | 'floor'
  | 'establishment'
  | 'point_of_interest'
  | 'parking'
  | 'post_box'
  | 'postal_town'
  | 'room'
  | 'street_number'
  | 'bus_station'
  | 'train_station'
  | 'transit_station';

type LocationType =
  | 'ROOFTOP'
  | 'RANGE_INTERPOLATED'
  | 'GEOMETRIC_CENTER'
  | 'APPROXIMATE';

interface AddressComponent {
  types: (AddressType | GeocodingAddressComponentType)[];
  long_name: string;
  short_name: string;
}

type LatLngLiteral = { lat: number; lng: number };

interface LatLngBounds {
  northeast: LatLngLiteral;
  southwest: LatLngLiteral;
}

interface AddressGeometry {
  location: LatLngLiteral;
  location_type: LocationType;
  viewport: LatLngBounds;
  bounds: LatLngBounds;
}

interface PlusCode {
  global_code: string;
  compound_code: string;
}

interface GeocodingResult {
  types: AddressType[];
  formatted_address: string;
  address_components: AddressComponent[];
  postcode_localities: string[];
  geometry: AddressGeometry;
  plus_code: PlusCode;
  partial_match: boolean;
  place_id: string;
}

interface GeocodingResponse<STATUSES = GeocodingResponseStatus> {
  status: STATUSES;
  error_message: string;
  results: GeocodingResult[];
}

@Injectable({
  providedIn: 'root',
})
export class GoogleGeocodingService {
  private httpClient: HttpClient;

  constructor(handler: HttpBackend, private config: ConfigService) {
    this.httpClient = new HttpClient(handler);
  }

  search(address: string): Observable<GeocodingResponse> {
    return new Observable((observer: Observer<any>) => {
      this.httpClient
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&components=country:GB&key=${this.config.googleApiKey}`,
          { headers: {} }
        )
        .subscribe(
          (res: GeocodingResponse) => {
            observer.next(res);
            observer.complete();
          },
          (err) => {
            observer.error(err);
            observer.complete();
          }
        );
    });
  }
}
