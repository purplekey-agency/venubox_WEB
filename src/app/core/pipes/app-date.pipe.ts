import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({
  name: 'appDate',
})
export class AppDatePipe implements PipeTransform {
  constructor(private t: TranslateService) {}

  transform(date: Date | undefined, format?: string): string {
    if (!date) {
      return '';
    }

    return moment
      .utc(date)
      .local()
      .format(format ?? 'LLL');
  }
}
