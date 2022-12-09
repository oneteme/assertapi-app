import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { EnvironmentService } from 'src/app/service/environment.service';
import { AddDialogComponent } from './add-dialog/add-dialog.component';
import { RemoveDialogComponent } from './remove-dialog/remove-dialog.component';

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.scss']
})
export class EnvironmentComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['host', 'port', 'authMethod', 'env', 'app', 'action'];
  dataSource: MatTableDataSource<ApiServerConfig>;

  constructor(public dialog: MatDialog, private _environmentService: EnvironmentService) {
    _environmentService.environments.subscribe({
      next: res => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.filterPredicate = (data: ApiServerConfig, filter) => {
          const a = !filter || 
            (data.serverConfig.host.toLowerCase().includes(filter.toLowerCase()) 
            || data.serverConfig.port.toString().includes(filter.toLowerCase())
            || data.serverConfig.auth.type.toLowerCase().includes(filter.toLowerCase())
            || data.app.toLowerCase().includes(filter.toLowerCase())
            || data.env.toLowerCase().includes(filter.toLowerCase()));
          
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

  add() {
    this.dialog.open(AddDialogComponent);
  }

  update(element: ApiServerConfig) {
    this.dialog.open(AddDialogComponent, {
      data: element
    });
  }

  remove(element: ApiServerConfig) {
    const dialogRef = this.dialog.open(RemoveDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result === "remove") {
        this._environmentService.deleteEnvironment([element.id])
          .subscribe();
      } 
    });
  }

}
