import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { AssertapiClientService } from 'src/app/service/assertapi-client.service';
import { EnvironmentService } from 'src/app/service/environment.service';
import { AddDialogComponent } from './add-dialog/add-dialog.component';
import { RemoveDialogComponent } from './remove-dialog/remove-dialog.component';

export interface TableElement {
  id: number;
  host: string;
  port: string;
  authMethod: string;
  app: string;
  env: string;
  isProd: boolean;
}

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.scss']
})
export class EnvironmentComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['host', 'port', 'authMethod', 'env', 'app', 'action'];
  dataSource: MatTableDataSource<TableElement>;

  constructor(public dialog: MatDialog, private _service: EnvironmentService) { }

  ngOnInit(): void {
    this.getEnvironment();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  add() {
    const dialogRef = this.dialog.open(AddDialogComponent);
    dialogRef.afterClosed().subscribe((result: ApiServerConfig) => {
      if(result) {
        let lastElement: TableElement = this.dataSource.data.sort((a, b) => a.id - b.id)[this.dataSource.data.length - 1];
        this.dataSource.data.push({id: lastElement ? lastElement.id + 1 : 1, host: result.serverConfig.host, port: result.serverConfig.port, authMethod: result.serverConfig.auth?.type, app: result.app, env: result.env, isProd: result.isProd});
        this.dataSource._updateChangeSubscription();
      }
    });
  }

  remove(element: TableElement) {
    const dialogRef = this.dialog.open(RemoveDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result === "remove") {
        this._service.deleteEnvironment([element.id])
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

  getEnvironment() {
    this._service.getEnvironment()
      .subscribe({
        next: res => {
          this.dataSource = new MatTableDataSource(
            res.map(v => ({id: v.id, host: v.serverConfig.host, port: v.serverConfig.port, authMethod: v.serverConfig.auth['type'], app: v.app, env: v.env, isProd: v.isProd }))
          );
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      })
  }

}
