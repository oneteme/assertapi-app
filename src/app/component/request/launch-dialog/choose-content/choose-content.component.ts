import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiRequestServer } from 'src/app/model/request.model';

@Component({
  selector: 'app-choose-content',
  templateUrl: './choose-content.component.html',
  styleUrls: ['./choose-content.component.scss']
})
export class ChooseContentComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input() set elements(value: Array<ApiRequestServer>) {
    if(value) {
      this.dataSource = new MatTableDataSource(value);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  @Output() onLaunch = new EventEmitter<any>();

  displayedColumns: string[] = ['name', 'description', 'select'];
  dataSource: MatTableDataSource<ApiRequestServer>;
  selection = new SelectionModel<ApiRequestServer>(true, []);

  constructor() { }

  ngOnInit(): void {
  }

  launch() {
    this.onLaunch.emit({disabledIds: this.selection.selected?.map(t => t.request.id)});
  }
}
