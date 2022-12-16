import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, distinctUntilChanged, filter } from 'rxjs';
import { ApiRequest, Configuration } from 'src/app/model/request.model';
import { AssertionResultServer, AssertionContext, ApiTraceGroup } from 'src/app/model/trace.model';
import { MainService } from 'src/app/service/main.service';
import { TraceService } from 'src/app/service/trace.service';
import { ResultGroup } from '../result/result.view';
import { ComparatorDialogComponent } from './comparator/comparator.component';

const STATUS: { [key: string]: Object } = {
  OK: {
    color: 'green',
    icon: 'done'
  },
  KO: {
    color: 'gold',
    icon: 'report'
  },
  SKIP: {
    color: 'black',
    icon: 'block'
  },
  FAIL: {
    color: 'red',
    icon: 'report'
  }
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class DetailComponent implements OnInit, AfterViewInit {
  @ViewChild('resultPaginator', { static: true }) resultPaginator: MatPaginator;
  @ViewChild('resultSort', { static: true }) resultSort: MatSort;

  configuration: Configuration;
  traceGroup: ApiTraceGroup;
  resultDisplayedColumns: string[] = ['name', 'expand', 'select'];
  resultDataSource: MatTableDataSource<ResultGroup> = new MatTableDataSource([]);
  resultSelection = new SelectionModel<ResultGroup>(true, []);
  expandedElement: ResultGroup | null;

  filterForm = new FormGroup<{ filter: FormControl<string>, status: FormControl<Array<string>> }>({
    filter: new FormControl<string>(null),
    status: new FormControl<Array<string>>(null)
  });

  status = STATUS;

  idGroup: number;
  constructor(private _service: MainService, private _traceService: TraceService, private router: Router, private _activatedRoute: ActivatedRoute, private _router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    // this.resultDataSource.filterPredicate = (data: ResultGroup, filter) => {
    //   const a = !filter || 
    //     (data.results.request.name.toLowerCase().includes(filter.toLowerCase()) 
    //     || data.request.description.toLowerCase().includes(filter.toLowerCase()) 
    //     || data.result?.status.toLowerCase().includes(filter.toLowerCase()));

    //   return a;
    // };

    // this.filterForm.valueChanges.subscribe(value => {
    //   const filter = value as string;
    //   this.resultDataSource.filter = filter;
    // });
    this._service.$configuration.subscribe(
      res => this.configuration = res
    )
    
    combineLatest([
      this._activatedRoute.params,
      this._activatedRoute.queryParams
    ]).subscribe(
      ([params, queryParams]) => {
        this.filterForm.get('status').setValue(typeof queryParams['status'] == 'string' ? [queryParams['status']] : queryParams['status']);
        combineLatest([
          this._traceService.getTraces(params['id'], queryParams['status'] == 'KO' ? ['KO', 'FAIL'] : queryParams['status']),
          this._traceService.getTraceGroup(params['id'])
        ]).subscribe(
            ([traces, traceGroup]) => {
              this.traceGroup = traceGroup;
              var resultGroups = traces.reduce((prev, current) => {
                let groupIndex = prev.findIndex(a => a.name == current.request.name);
                if (groupIndex != -1) {
                  prev[groupIndex].results.push(current);
                } else {
                  const resultGroup = new ResultGroup(current.request.name, [current]);
                  prev.push(resultGroup);
                }
                return prev;
              }, []);
              this.resultDataSource = new MatTableDataSource(resultGroups);
              this.resultDataSource.sort = this.resultSort;
              this.resultDataSource.paginator = this.resultPaginator;
            }
          )
      }
    )
  }

  ngAfterViewInit(): void {
    this.filterForm.get('status').valueChanges
      .pipe(
        distinctUntilChanged((prev, curr) => prev == curr),
        filter(form => form != null)
      ).subscribe(
        res => {
          this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: {status: res},
            queryParamsHandling: 'merge'
          })
        }
      )
  }

  onResetFilter(): void {
    this.filterForm.get('filter').setValue('');
  }

  isResultAllSelected() {
    const numSelected = this.resultSelection.selected.length;
    const numRows = this.resultDataSource.data.length;
    return numSelected === numRows;
  }

  toggleResultAllRows() {
    if (this.isResultAllSelected()) {
      this.resultSelection.clear();
      return;
    }

    this.resultSelection.select(...this.resultDataSource.data);
  }

  filterNotOK(): Array<AssertionResultServer> {
    return null;
    // return this.resultDataSource?.data.filter(d => d.result && d.result?.status != 'OK');
  }

  compare(request: ApiRequest) {
    this._service.rerun(request.id, this.configuration).subscribe({
      next: res => {
        this.dialog.open(ComparatorDialogComponent, {
          data: {
            request: request,
            responseComparator: res
          }
        });
      }
    });
  }

  replay() {
    this._service.run(this.traceGroup.app, this.traceGroup.actualEnv, this.traceGroup.expectedEnv, this.resultSelection.selected.flatMap(s => s.results.map(r => r.request.id)), false, this.configuration)
      .subscribe(
        res => this.router.navigate(['home/launch', res])
      );
  }
}
