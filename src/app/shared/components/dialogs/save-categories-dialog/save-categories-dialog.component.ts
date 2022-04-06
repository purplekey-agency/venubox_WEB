import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../../backend/api/category.service';
import { UsersService } from '../../../../backend/api/users.service';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoryDto } from './../../../../backend/model/categoryDto';

@Component({
  selector: 'app-save-categories-dialog',
  templateUrl: './save-categories-dialog.component.html',
  styleUrls: ['./save-categories-dialog.component.scss'],
})
export class SaveCategoriesDialogComponent
  extends BaseComponent
  implements OnInit {
  isLoading = false;
  categories: CategoryDto[] = [];
  categoriesForm = new FormGroup({});
  selectedCategories = [];

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService,
    private router: Router,
    private categoryService: CategoryService,
    private usersService: UsersService,
    private authService: AuthService
  ) {
    super(authService, t);
    const config = this.dialogConfig;
  }

  ngOnInit() {
    this.loadCategories();

    this.usersService.apiUsersMeCategoriesGet().subscribe((res) => {
      this.selectedCategories = res.map((x) => x.id);
      this.populateForm();
    });
  }

  loadCategories() {
    this.isLoading = true;

    this.categoryService.apiCategoryGet().subscribe(
      (res) => {
        this.categories = res;

        const group = {};

        res.forEach((category) => {
          group[category.id] = new FormControl(false);
        });

        this.categoriesForm = new FormGroup(group);
        this.isLoading = false;
        this.populateForm();
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  populateForm() {
    if (this.categories.length && this.selectedCategories) {
      this.selectedCategories.forEach((subcat) => {
        for (let i = 0; i < this.categories.length; i++) {
          const found = this.categories[i].subcategories.find(
            (x) => x.id == subcat
          );

          if (found) {
            this.categoriesForm.controls[
              this.categories[i].id
            ] = new FormControl(true);

            break;
          }
        }
      });
    }
  }

  onCategoryChange(e: { toggleId: number }) {
    const category = this.categories.find((x) => x.id === e.toggleId);

    if (category && category.subcategories) {
      const subCategoriesIds = category.subcategories.map((x) => x.id);

      subCategoriesIds.forEach((x) => {
        const foundIndex = this.selectedCategories.findIndex((y) => y === x);

        if (foundIndex !== -1) {
          this.selectedCategories.splice(foundIndex, 1);
        }
      });
    }
  }

  onSubCategoryChange(e: { value: number }) {
    let parentCategory: CategoryDto = null;

    this.categories.forEach((x) => {
      const foundCategory = x.subcategories.find((x) => x.id === e.value);

      if (foundCategory) {
        parentCategory = x;
      }
    });

    if (parentCategory) {
      const parentCategorySubcategories = parentCategory.subcategories.map(
        (x) => x.id
      );
      parentCategorySubcategories.forEach((x) => {
        const foundIndex = this.selectedCategories.findIndex((y) => y === x);

        if (foundIndex !== -1) {
          this.selectedCategories.splice(foundIndex, 1);
        }
      });

      this.selectedCategories = [...this.selectedCategories, e.value];
    }
  }

  isSubCategorySelected(id: number) {
    const foundIndex = this.selectedCategories.findIndex((x) => x === id);
    return foundIndex !== -1;
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.isLoading = true;

    this.usersService
      .apiUsersMeCategoriesPost({
        requestBody: this.selectedCategories,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        (err) => {
          this.isLoading = false;
          this.errorHandler(err);
        }
      );
  }
}
