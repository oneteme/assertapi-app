import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiRequest, ApiRequestServer } from 'src/app/model/request.model';
import { AssertapiServerService } from 'src/app/service/assertapi-server.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { RemoveDialogComponent } from './remove-dialog/remove-dialog.component';

export interface TableElement {
  id: number;
  name: string;
  description: string;
  app: string;
  env: string;
  enable: boolean;
}

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['name', 'description', 'app', 'env', 'enable', 'action', 'select'];
  dataSource: MatTableDataSource<TableElement>;
  selection = new SelectionModel<TableElement>(true, []);

  // @Input() set data(value: Array<ApiRequestServer>) {
  //   if (value) {
  //     this.dataSource = new MatTableDataSource(
  //       value.map(v => ({ id: v.request.id, name: v.request.name, description: v.request.description, app: v.metadata['app'], env: v.metadata['env'], enable: v.request.configuration.enable }))
  //     );
  //     this.dataSource.paginator = this.paginator;
  //     this.dataSource.sort = this.sort;
  //   }
  // }

  constructor(public dialog: MatDialog, private _service: AssertapiServerService) { }

  ngOnInit(): void {
    this.getRequests();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getRequests() {
    this._service.requests()
    .subscribe({
      next: res => {
        this.dataSource = new MatTableDataSource(
          res.map(v => ({ id: v.request.id, name: v.request.name, description: v.request.description, app: v.metadata['app'], env: v.metadata['env'], enable: v.request.configuration.enable }))
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  remove(element: TableElement) {
    const dialogRef = this.dialog.open(RemoveDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result === "remove") {
        this._service.remove([element.id])
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
      this._service.disable([element.id])
        .subscribe({
          next: () => element.enable = false
        });
    } else {
      this._service.enable([element.id])
        .subscribe({
          next: () => element.enable = true
        });
    }
  }

  run(element: TableElement) {
    console.log(`Lancement du test numéro ${element.id}`)
  }
}
