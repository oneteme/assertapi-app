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

export interface TableElement {
  id: number;
  name: string;
  description: string;
  uri: string;
  method: string;
  app: string;
  envs: string[];
  body: string;
  enable: boolean;
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['name', 'description', 'enable', 'action'];
  dataSource: MatTableDataSource<TableElement>;
  selection = new SelectionModel<TableElement>(true, []);

  environments: Array<ApiServerConfig>;

  // @Input() set data(value: Array<ApiRequestServer>) {
  //   if (value) {
  //     this.dataSource = new MatTableDataSource(
  //       value.map(v => ({ id: v.request.id, name: v.request.name, description: v.request.description, app: v.metadata['app'], env: v.metadata['env'], enable: v.request.configuration.enable }))
  //     );
  //     this.dataSource.paginator = this.paginator;
  //     this.dataSource.sort = this.sort;
  //   }
  // }

  constructor(public dialog: MatDialog, private _requestService: RequestService, private _environmentService: EnvironmentService) { }

  ngOnInit(): void {
    this.getRequests();
    this.getEnvironment();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRequests() {
    this._requestService.getRequest()
    .subscribe({
      next: res => {
        this.dataSource = new MatTableDataSource(
          res.map(v => (
            { 
              id: v.request.id, 
              name: v.request.name, 
              description: v.request.description, 
              uri: v.request.uri,
              method: v.request.method,
              app: v.requestGroupList[0].app,
              envs: v.requestGroupList.map(r => r.env),
              body: v.request.body,
              enable: v.request.configuration.enable
            }
          ))
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  getEnvironment() {
    this._environmentService.getEnvironment()
      .subscribe({
        next: res => {
          this.environments = res;
        }
      });
  }

  remove(element: TableElement) {
    const dialogRef = this.dialog.open(RemoveDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result === "remove") {
        this._requestService.deleteRequest([element.id])
          .subscribe({
            next: () => {
              let index = this.dataSource.data.findIndex(d => d.id === element.id);
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

  enableChange(element: TableElement) {
    if(element.enable) {
      this._requestService.disableRequest([element.id])
        .subscribe({
          next: () => element.enable = false
        });
    } else {
      this._requestService.enableRequest([element.id])
        .subscribe({
          next: () => element.enable = true
        });
    }
  }

  launch(element: TableElement) {
    this.dialog.open(LaunchDialogComponent, {
      data: {
        'tableElements': [element],
        'environments': this.environments
      }
    });
  }

  launchAll() {
    var tableElements = this.selection.selected.length ? this.selection.selected : this.dataSource.data;
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
        let lastElement: TableElement = this.dataSource.data.sort((a, b) => a.id - b.id)[this.dataSource.data.length - 1];
        this.dataSource.data.push(
          {
            id: lastElement ? lastElement.id + 1 : 1, 
            name: result.request.name, 
            description: result.request.description, 
            uri: result.request.uri,
            method: result.request.method,
            app: result.requestGroupList[0].app,
            envs: result.requestGroupList.map(r => r.env),
            body: result.request.body,
            enable: result.request.configuration.enable
          }
        );
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  update(element: TableElement) {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: {
        'tableElement': element,
        'environments': this.environments
      }
    });
    dialogRef.afterClosed().subscribe((result: ApiRequestServer) => {
      if(result) {
        var index = this.dataSource.data.find
        // this.dataSource.data.splice()
        let lastElement: TableElement = this.dataSource.data.sort((a, b) => a.id - b.id)[this.dataSource.data.length - 1];
        // this.dataSource.data.push({id: lastElement ? lastElement.id + 1 : 1, name: result.request.name, description: result.request.description, app: result.metadata['app'], env:  result.metadata['env'], enable: result.request.configuration.enable});
        // this.dataSource._updateChangeSubscription();
      }
    });
  }
}
