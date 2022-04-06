import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { SelectOption } from './../select/select.component';

@Component({
  selector: 'app-time-select',
  templateUrl: './time-select.component.html',
  styleUrls: ['./time-select.component.scss'],
})
export class TimeSelectComponent implements OnInit, OnChanges {
  @Input() control: FormControl = null;
  @Input() min: string;
  @Input() max: string;
  options: SelectOption[] = [];
  selectedOption: SelectOption = null;

  ngOnInit() {
    this.generateOptions();

    if (this.control) {
      if (this.control.value) {
        this.setSelectedOption(this.control.value);
      }

      this.control.valueChanges.subscribe((val) => {
        this.setSelectedOption(val);
      });
    }
  }

  setSelectedOption(val: string) {
    const hhMM = moment(val, 'HH:mm:ss').format('HH:mm');
    const foundOption = this.options.find((x) => x.value == hhMM);

    if (foundOption) {
      this.selectedOption = foundOption;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const min: SimpleChange = changes.min;
    const max: SimpleChange = changes.max;

    const minDifferent =
      min && min.previousValue !== min.currentValue && !!min.currentValue;
    const maxDifferent =
      max && max.previousValue !== max.currentValue && !!max.currentValue;

    if (minDifferent || maxDifferent) {
      this.generateOptions();

      if (minDifferent) {
        this.options = this.options.filter(
          (x) => moment(x.value, 'HH:mm') > moment(min.currentValue, 'HH:mm')
        );
      } else if (maxDifferent) {
        this.options = this.options.filter(
          (x) => moment(x.value, 'HH:mm') < moment(max.currentValue, 'HH:mm')
        );
      }
    }
  }

  generateOptions() {
    this.options = [];

    const current = moment().startOf('day');
    const now = moment().startOf('day');

    while (current.date() <= now.date()) {
      this.options.push({
        value: current.format('HH:mm'),
        label: current.format('HH:mm'),
      });

      current.add(15, 'minutes');
    }
  }
}
