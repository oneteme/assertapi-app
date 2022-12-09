import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApiTraceGroup } from 'src/app/model/trace.model';
import { TraceService } from 'src/app/service/trace.service';

const STATUS: { [key: string]: Object } = {
  OK: {
    color: 'green',
    icon: 'done'
  },
  KO: {
    color: 'red',
    icon: 'report'
  },
  SKIP: {
    color: 'black',
    icon: 'block'
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
  displayedColumns: string[] = ['event', 'user', 'ip', 'app', 'envAct', 'envExp', 'fail', 'skip', 'ok', 'pending', 'action'];
  dataSource: MatTableDataSource<ApiTraceGroup>;

  constructor(public dialog: MatDialog, private _traceService: TraceService, private router: Router) {
  }

  ngOnInit(): void {
    this.getTraceGroups();
  }

  ngAfterViewInit(): void {
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getTraceGroups() {
    this._traceService.getTraceGroups()
      .subscribe({
        next: res => {
          this.dataSource = new MatTableDataSource(res);
          this.dataSource.filterPredicate = (data: ApiTraceGroup, filter) => {
            const a = !filter || 
              (data.user.toLowerCase().includes(filter.toLowerCase()) 
              || data.address.toLowerCase().includes(filter.toLowerCase()) 
              || data.app.toLowerCase().includes(filter.toLowerCase())
              || data.actualEnv.toLowerCase().includes(filter.toLowerCase())
              || data.expectedEnv.toLowerCase().includes(filter.toLowerCase()));
            
            return a;
          };
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });
  }

  resultClick(id: number) {
    this.router.navigate(['home/launch', id]);
  }

  detailClick(id: number) {
    this.router.navigate(['home/launch', id, 'detail']);
  }
}
