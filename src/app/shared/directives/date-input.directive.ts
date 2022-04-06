import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import * as moment from 'moment';

@Directive({
  selector: '[date-input-format]',
})
export class DateInputFormatDirective implements OnInit {
  @Input() format: 'date' | 'time' | 'datetime' = 'datetime';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    setTimeout(() => {
      this.applyFormat();
    });
  }

  // @HostListener('blur')
  @HostListener('input')
  @HostListener('change')
  @HostListener('ngModelChange')
  applyFormat() {
    let ele = this.el.nativeElement as HTMLInputElement;

    if (typeof ele.value === 'string') {
      let date = null;

      if (this.format === 'time') {
        date = moment.utc(ele.value, 'HH:mm').local();
      } else {
        date = moment.utc(moment(ele.value)).local(); // ios buggy, returns invalid date unless moment instance is passed to .utc()
      }

      if (date && !date.isValid()) {
        ele.value = '';
        return;
      }

      if (this.format === 'datetime') {
        ele.value = date.format('LLL');
      } else if (this.format === 'date') {
        ele.value = date.format('LL');
      } else if (this.format === 'time') {
        ele.value = date.format('HH:mm');
      }
    }
  }
}
