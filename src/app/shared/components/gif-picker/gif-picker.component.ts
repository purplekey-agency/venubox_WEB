import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-gif-picker',
  templateUrl: './gif-picker.component.html',
  styleUrls: ['./gif-picker.component.scss'],
})
export class GifPickerComponent implements OnInit {
  isLoading = false;
  gifs: { previewUrl: string; url: string }[] = [];
  searchControl = new FormControl('');

  @Output() gifSelected = new EventEmitter<string>();

  constructor(private httpClient: HttpClient) {
    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((res) => {
        this.loadGifs();
      });
  }

  ngOnInit() {
    this.loadGifs();
  }

  loadGifs() {
    this.isLoading = true;
    this.gifs = [];

    const url = this.searchControl.value
      ? 'https://api.giphy.com/v1/gifs/search'
      : 'https://api.giphy.com/v1/gifs/trending';

    this.httpClient
      .get(url, {
        params: {
          api_key: 'UJWb90UYB2QzJMO710dMliExVkGdGsZc',
          q: this.searchControl.value,
          limit: '25',
        },
      })
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          this.gifs = res.data.map((x) => ({
            previewUrl: x.images.downsized_medium.url,
            url: x.images.original.url,
          }));
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  selectGif(url: string) {
    this.gifSelected.emit(url);
  }
}
