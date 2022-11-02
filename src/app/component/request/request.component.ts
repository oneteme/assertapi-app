import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiRequest, ApiRequestServer } from 'src/app/model/request.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { RemoveDialogComponent } from './remove-dialog/remove-dialog.component';
import { AddDialogComponent } from './add-dialog/add-dialog.component';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { LaunchDialogComponent } from './launch-dialog/launch-dialog.component';
import { RequestService } from 'src/app/service/request.service';
import { EnvironmentService } from 'src/app/service/environment.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['name', 'description', 'enable', 'action'];
  dataSource: MatTableDataSource<ApiRequestServer>;

  environments: Array<ApiServerConfig>;

  constructor(public dialog: MatDialog, private _requestService: RequestService, private _environmentService: EnvironmentService) {
    _environmentService.environments.subscribe({
      next: res => this.environments = res
    });
  }

  ngOnInit(): void {
    this.getRequests();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRequests() {
    this._requestService.getRequests()
    .subscribe({
      next: res => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  remove(element: ApiRequestServer) {
    const dialogRef = this.dialog.open(RemoveDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result === "remove") {
        this._requestService.deleteRequest([element.request.id])
          .subscribe({
            next: () => {
              let index = this.dataSource.data.findIndex(d => d.request.id === element.request.id);
              if(index !== -1) {
                this.dataSource.data.splice(index, 1);
                this.dataSource._updateChangeSubscription();
              }
            }
          });
      } 
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
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

  launch(element: ApiRequestServer) {
    this.dialog.open(LaunchDialogComponent, {
      data: {
        'tableElements': [element],
        'environments': this.environments
      }
    });
  }

  launchAll() {
    var tableElements = this.dataSource.data;
    this.dialog.open(LaunchDialogComponent, {
      data: {
        'tableElements': tableElements,
        'environments': this.environments
      }
    });
  }

  add() {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: {
        'environments': this.environments
      }
    });
    dialogRef.afterClosed().subscribe((result: ApiRequestServer) => {
      if(result) {
        this.dataSource.data.push(result);
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  update(element: ApiRequestServer) {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: {
        'tableElement': element,
        'environments': this.environments
      }
    });
    dialogRef.afterClosed().subscribe((result: ApiRequestServer) => {
      if(result) {
        var index = this.dataSource.data.findIndex(d => d.request.id == result.request.id);
        this.dataSource.data.splice(index, 1, result)
        this.dataSource._updateChangeSubscription();
      }
    });
  }
}
