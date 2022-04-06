import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent
  implements ControlValueAccessor, OnInit, OnChanges {
  searchTerm = new FormControl('');
  options: SelectOption[] = [];
  selectedOptionName: string = '';
  @Input() disabled = false;
  @Input() multiselect = false;
  @Input() optionAll = false;
  isInside = false;
  @Input('options')
  set setOptions(options: SelectOption[]) {
    if (!this.multiselect) {
      this.options = this.optionAll
        ? [{ value: null, label: this.t.instant('all') }, ...options]
        : options;
    } else {
      this.options = this.optionAll
        ? [{ value: 'all', label: this.t.instant('all') }, ...options]
        : options;
    }
  }

  @Input() placeholder = this.t.instant('select');
  @Input() isLoading = false;
  @Input() selectedOption;
  @Input() type = 'static';

  @Output() searchChanged = new EventEmitter();
  isOpened = false;

  @ViewChild('optionsList') optionsList: ElementRef;
  @ViewChildren('selectOption') selectOptions: QueryList<ElementRef>;

  constructor(
    private t: TranslateService,
    private eRef: ElementRef,
    @Self() @Optional() public ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpened = false;
    } else {
    }
  }

  @HostListener('click')
  clickInside() {
    if (this.multiselect) {
      this.isOpened = true;
    }
  }

  ngOnInit() {
    if (this.optionAll) {
      if (this.multiselect) {
        this.selectedOption = [{ value: null, label: this.t.instant('all') }];
      } else {
        this.selectedOption = { value: null, label: this.t.instant('all') };
      }
    }
    this.searchTerm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: string) => {
        this.searchChanged.emit(value);
        this.isOpened = true;
      });

    if (this.selectedOption) {
      if (this.multiselect) {
        this.ngControl.control.setValue(
          this.selectedOption.map((x) => x.value)
        );
      } else {
        this.ngControl.control.setValue(this.selectedOption.value);
      }

      this.setSelectedOptionName();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.multiselect) {
      if (changes.selectedOption && changes.selectedOption.currentValue) {
        this.setSelectedOptionName();
      }
    } else {
      if (changes.selectedOption) {
        this.setSelectedOptionName();
        /*
        if (
          !changes.selectedOption.previousValue &&
          changes.selectedOption.currentValue
        ) {
          this.setSelectedOptionName();
          // this.onSelected(changes.selectedOption.currentValue);
        }*/
      }
    }
  }

  onSelected(option) {
    if (this.multiselect) {
      // If is 'all' option
      if (option.value === 'all') {
        this.selectedOption = [];
      } else {
        if (this.selectedOption) {
          const allIndex = this.selectedOption.findIndex(
            (x) => x.value === 'all'
          );
          if (allIndex !== -1) {
            this.selectedOption.splice(allIndex, 1);
          }
        }
      }

      if (this.selectedOption) {
        const index = this.selectedOption.findIndex(
          (x) => x.value === option.value
        );

        if (index !== -1) {
          this.selectedOption.splice(index, 1);
        } else {
          this.selectedOption.push(option);
        }

        this.ngControl.control.setValue(
          this.selectedOption.map((option) => option.value)
        );

        const allIndex2 = this.selectedOption.findIndex(
          (x) => x.value === null
        );

        if (allIndex2 !== -1) {
          this.selectedOption.splice(allIndex2, 1);
        }
      }

      this.setSelectedOptionName();
      this.isOpened = true;
    } else {
      this.ngControl.control.setValue(option.value);
      this.selectedOption = option;
      this.setSelectedOptionName();
    }
  }

  removeOption(event: PointerEvent, option: SelectOption) {
    if (this.multiselect) {
      event.stopPropagation();
      const index = this.selectedOption.findIndex(
        (x) => x.value === option.value
      );

      if (index !== -1) {
        this.selectedOption.splice(index, 1);
      } else {
        this.selectedOption.push(option);
      }

      this.ngControl.control.setValue(
        this.selectedOption.map((option) => option.value)
      );
      this.setSelectedOptionName();
    }
  }

  openList() {
    this.isOpened = !this.isOpened;

    const selectedOptionElem = this.selectOptions.find((x) =>
      x.nativeElement.classList.contains('selected')
    );

    if (this.isOpened && selectedOptionElem) {
      this.optionsList.nativeElement.scrollTop =
        selectedOptionElem.nativeElement.offsetTop;
    }
  }

  isSelected(option: SelectOption) {
    if (this.multiselect && this.selectedOption) {
      if (this.selectedOption.find((x) => x.value === option.value)) {
        return true;
      }
    } else {
      if (this.selectedOption && this.selectedOption.value === option.value) {
        return true;
      }
    }
  }

  setSelectedOptionName() {
    if (this.multiselect) {
      this.selectedOptionName = '';
      if (this.selectedOption) {
        this.selectedOption.map((option, index) => {
          this.selectedOptionName +=
            option.label + (index < this.selectedOption.length - 1 ? ', ' : '');
        });
      }
    } else {
      this.selectedOptionName = this.selectedOption
        ? this.selectedOption.label
        : '';
    }
  }

  onFocus() {
    if (this.multiselect) {
      this.selectedOptionName = '';
    }
  }

  onBlur() {
    if (this.multiselect) {
      this.selectedOptionName = '';
      this.setSelectedOptionName();
    }
  }
  writeValue(obj: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched(fn: any) {}

  setDisabledState?(isDisabled: boolean) {}

  sortedOptions(options: SelectOption[]) {
    return options.sort((a, b) => a.value - b.value);
  }
}
