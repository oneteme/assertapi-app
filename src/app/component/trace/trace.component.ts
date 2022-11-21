import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { ApiAssertionsResultServer } from 'src/app/model/trace.model';
import { EnvironmentService } from 'src/app/service/environment.service';
import { TraceService } from 'src/app/service/trace.service';
import { ComparatorDialogComponent } from './comparator-dialog/comparator-dialog.component';
import { LaunchDialogComponent } from './launch-dialog/launch-dialog.component';

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
  selector: 'app-trace',
  templateUrl: './trace.component.html',
  styleUrls: ['./trace.component.scss'],
  providers: [DatePipe]
})
export class TraceComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  status = STATUS;
  displayedColumns: string[];
  dataSource: MatTableDataSource<ApiAssertionsResultServer>;
  selection = new SelectionModel<ApiAssertionsResultServer>(true, []);

  isTestGroup: boolean;

  environments: Array<ApiServerConfig>;

  constructor(public dialog: MatDialog, private _traceService: TraceService, private _environmentService: EnvironmentService, private router: Router, private activatedRoute: ActivatedRoute) {
    _environmentService.environments.subscribe({
      next: res => this.environments = res
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(
      res => {
        this.selection.clear();
        if(res['id']) {
          this.isTestGroup = true;
          this.displayedColumns = ['name', 'event', 'envAct', 'envExp', 'result', 'action', 'select'];
          this.getTraces(res['id']);
        } else {
          this.isTestGroup = false;
          this.displayedColumns = ['name', 'event', 'envAct', 'envExp', 'result', 'action'];
          this.getTraces();
        }
      }
    )
    
  }

  ngAfterViewInit(): void {
    
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.filter(d => d.result.status != 'OK').length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.filterNotOK());
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getTraces(id?: number) {
    this._traceService.getTrace(id)
      .subscribe({
        next: res => {
          this.dataSource = new MatTableDataSource(res);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });
  }

  refresh(){
    this.router.navigate(['home/trace']);
  }

  launch(element: ApiAssertionsResultServer) {
    this.dialog.open(LaunchDialogComponent, {
      data: {
        'tableElements': [element],
        'environments': this.environments
      }
    });
  }

  launchAll() {
    var elements = this.selection.selected?.length ? this.selection.selected : this.filterNotOK();
    this.dialog.open(LaunchDialogComponent, {
      data: {
        'tableElements': elements,
        'environments': this.environments
      }
    });
  }

  compare(element: ApiAssertionsResultServer) {
    element.result.step = "RESPONSE_CONTENT";
    console.log(element)
    this.dialog.open(ComparatorDialogComponent, {
      data: element
    });
  }

  filterNotOK(): Array<ApiAssertionsResultServer> {
    return this.dataSource?.data.filter(d => d.result.status != 'OK');
  }
}
