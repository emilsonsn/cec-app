import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Order, PageControl } from '@models/application';
import { Client } from '@models/client';
import { AssignService } from '@services/assign.service';
import { ClientService } from '@services/client.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-table-user-signatures',
  templateUrl: './table-user-signatures.component.html',
  styleUrl: './table-user-signatures.component.scss'
})
export class TableUserSignaturesComponent {
  @Input()
  searchTerm?: string = '';

  @Input()
  loading: boolean = false;

  @Input()
  filters: any;

  public files = [];

  public columns = [
    {
      slug: "name",
      order: true,
      title: "Nome",
      align: "start",
    },
    {
      slug: "date",
      order: true,
      title: "Data",
      align: "justify-content-center",
    },
    {
      slug: "",
      order: true,
      title: "Ações",
      align: "justify-content-center",
    },
  ];

  public pageControl: PageControl = {
    take: 10,
    page: 1,
    itemCount: 0,
    pageCount: 0,
    orderField: "id",
    order: Order.ASC,
  };

  constructor(
    private readonly _toastr: ToastrService,
    private readonly _assignService : AssignService,
  ) {}

  ngOnInit() {
    this.search();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { filters, searchTerm, loading } = changes;

    if ( searchTerm?.previousValue && searchTerm?.currentValue !== searchTerm?.previousValue ) {
      this._onSearch();
    }
    else if (!loading?.currentValue) {
      this._onSearch();
    }
    else if(filters?.previousValue && filters?.currentValue) {
			this._onSearch();
		}

  }

  private _initOrStopLoading(): void {
    this.loading = !this.loading;
  }

  get getLoading() {
    return !!this.loading;
  }

  private _onSearch() {
    this.pageControl.search_term = this.searchTerm || '';
    this.pageControl.page = 1;
    this.search();
  }

  search(): void {
    this._initOrStopLoading();

    this._assignService
      .getFiles(this.pageControl, this.filters)
      .pipe(finalize(() => this._initOrStopLoading()))
      .subscribe({
        next:res => {
            this.files = res.data;

          this.pageControl.page = res.current_page - 1;
          this.pageControl.itemCount = res.total;
          this.pageControl.pageCount = res.last_page;
      },
        error: err => {
          this._toastr.error(
            err?.error?.message || "Ocorreu um erro ao buscar os dados"
          );
        }
      });
  }

  onClickOrderBy(slug: string, order: boolean) {
    if (!order) {
      return;
    }

    if (this.pageControl.orderField === slug) {
      this.pageControl.order =
        this.pageControl.order === Order.ASC ? Order.DESC : Order.ASC;
    } else {
      this.pageControl.order = Order.ASC;
      this.pageControl.orderField = slug;
    }
    this.pageControl.page = 1;
    this.search();
  }

  pageEvent($event: any) {
    this.pageControl.page = $event.pageIndex + 1;
    this.pageControl.take = $event.pageSize;
    this.search();
  }

  // Methods

  protected openFile(file) {
    window.open(file.path, '_blank');
  }

}


