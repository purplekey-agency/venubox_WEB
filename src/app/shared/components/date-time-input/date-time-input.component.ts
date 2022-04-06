import {
  Component,
  HostListener,
  Input,
  OnChanges,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { DateButton } from 'angular-bootstrap-datetimepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-date-time-input',
  templateUrl: './date-time-input.component.html',
  styleUrls: ['./date-time-input.component.scss'],
})
export class DateTimeInputComponent implements ControlValueAccessor, OnChanges {
  @Input() placeholder = '';
  @Input() inputName = `input-${Math.floor(Math.random() * 1000 + 1)}`;
  @Input() disablePastDates = false;
  @Input() type: 'datetime' | 'date' | 'time' = 'datetime';
  @Input() minDate;
  @Input() maxDate;
  @Input() disabled = false;

  dummyFormControl = new FormControl();
  popupVisible = false;
  wrapperClassName = `popup-input-wrapper-${Math.floor(
    Math.random() * 1000 + 1
  )}`;

  @ViewChild('insideElement') insideElement;
  @HostListener('document:click', ['$event'])
  public onClick(event) {
    if (!this.popupVisible) {
      return;
    }

    const isInside = event.path.find((x) =>
      x.className?.includes(this.wrapperClassName)
    );

    if (!isInside) {
      this.popupVisible = false;
    }
  }

  constructor(@Self() @Optional() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges() {
    // if (this.value !== this.dummyFormControl.value) {
    //   this.dummyFormControl.patchValue(this.value);
    // }
  }

  // ControlValueAccessor interface
  writeValue(obj: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched(fn: any) {}

  setDisabledState?(isDisabled: boolean) {}

  onFocus() {
    this.popupVisible = true;
  }

  dateSelected(event) {
    if (this.popupVisible && event.value) {
      const date = moment(event.value);

      if (this.type === 'time') {
        this.ngControl.control.patchValue(date.utc().format('HH:mm'));
      } else {
        this.ngControl.control.patchValue(date.utc());
      }

      this.popupVisible = false;
    }
  }

  datePickerFilter = (dateButton: DateButton, viewName: string) => {
    if (this.type === 'datetime' || this.type === 'date') {
      const isYear = parseInt(dateButton.display, 10) > 31;
      const isMonth = !!dateButton.display.match(/[A-Za-z]+/g)?.length;
      const isDay = parseInt(dateButton.display, 10) <= 32;

      if (this.minDate) {
        const displayDate = moment(dateButton.value); // default values are already in UTC
        const minDate = moment.utc(this.minDate);

        if (isYear) {
          return displayDate.year() >= minDate.year();
        }

        if (isMonth) {
          if (
            displayDate.year() == minDate.year() &&
            displayDate.month() >= minDate.month()
          ) {
            return true;
          }

          if (displayDate.year() > minDate.year()) {
            return true;
          }

          return false;
        }

        if (isDay) {
          return displayDate.isAfter(minDate);
        }
      }

      if (this.maxDate) {
        const displayDate = moment(dateButton.value); // default values are already in UTC
        const maxDate = moment.utc(this.maxDate);

        if (isYear) {
          return displayDate.year() <= maxDate.year();
        }

        if (isMonth) {
          if (
            displayDate.year() == maxDate.year() &&
            displayDate.month() <= maxDate.month()
          ) {
            return true;
          }

          if (displayDate.year() < maxDate.year()) {
            return true;
          }

          return false;
        }

        if (isDay) {
          return displayDate.isBefore(maxDate);
        }
      }
    }

    return this.disablePastDates
      ? dateButton.value >=
          moment()
            .startOf(viewName as moment.unitOfTime.StartOf)
            .valueOf()
      : true;
  };
}
