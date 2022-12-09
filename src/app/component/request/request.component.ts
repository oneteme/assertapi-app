import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiRequestServer } from 'src/app/model/request.model';
import { MatDialog } from '@angular/material/dialog';
import { RemoveDialogComponent } from './remove-dialog/remove-dialog.component';
import { AddDialogComponent } from './add-dialog/add-dialog.component';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { RequestService } from 'src/app/service/request.service';
import { EnvironmentService } from 'src/app/service/environment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['name', 'app', 'envs', 'enable', 'action'];
  dataSource: MatTableDataSource<ApiRequestServer>;

  environments: Array<ApiServerConfig>;

  constructor(public dialog: MatDialog, private router: Router, private _requestService: RequestService, private _environmentService: EnvironmentService) {
    _environmentService.environments.subscribe({
      next: res => this.environments = res
    });
    _requestService.requests.subscribe({
      next: res => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.filterPredicate = (data: ApiRequestServer, filter) => {
          const a = !filter || 
            (data.request.name.toLowerCase().includes(filter.toLowerCase()) 
            || data.request.description.toLowerCase().includes(filter.toLowerCase()));
          
          return a;
        };
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  ngOnInit(): void {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  remove(element: ApiRequestServer) {
    const dialogRef = this.dialog.open(RemoveDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result === "remove") {
        this._requestService.deleteRequest([element.request.id])
          .subscribe();
      } 
    });
  }

  enableChange(element: ApiRequestServer) {
    if(element.request.configuration.enable) {
      this._requestService.disableRequest([element.request.id])
        .subscribe({
          next: () => element.request.configuration.enable = false
        });
    } else {
      this._requestService.enableRequest([element.request.id])
        .subscribe({
          next: () => element.request.configuration.enable = true
        });
    }
  }

  launchAll() {
    this.router.navigate(['home/launch']);
  }

  add() {
    this.dialog.open(AddDialogComponent, {
      data: {
        'environments': this.environments
      }
    });
  }

  update(element: ApiRequestServer) {
    this.dialog.open(AddDialogComponent, {
      data: {
        'tableElement': element,
        'environments': this.environments
      }
    });
  }
}
