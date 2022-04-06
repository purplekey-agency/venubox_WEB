import { BaseComponent } from '../base/base.component';

export interface TableData {
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
  orderByKey?: string;
  isDescending?: boolean;
}

export interface PagedResult {
  results?: Array<any> | null;
  totalResults?: number;
  page?: number;
  pageSize?: number;
  readonly totalPages?: number;
}

export class BasePagedComponent extends BaseComponent {
  tableData: TableData = {
    totalResults: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
    orderByKey: null,
    isDescending: true,
  };

  pageLoaded(response: PagedResult) {
    this.tableData = {
      ...this.tableData,
      totalResults: response.totalResults,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
  }

  tableChangePage(event: any) {
    this.pageChanged(event.offset);
    this.loadData();
  }

  tableSort(event: any) {
    this.sortChanged(event);
    this.loadData();
  }

  loadData() {}

  private pageChanged(newPage: number) {
    this.tableData.page = newPage + 1;
  }

  private sortChanged(event: any) {
    this.tableData.orderByKey = (event.sorts[0].prop as string).toPascalCase();
    this.tableData.isDescending = event.sorts[0].dir === 'desc';
  }
}
