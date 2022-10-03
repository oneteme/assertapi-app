import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiAssertionsResultServer } from 'src/app/model/trace.model';
import { AssertapiClientService } from 'src/app/service/assertapi-client.service';
import { TraceService } from 'src/app/service/trace.service';


interface TableElement {
  id: number;
  name: string;
  description: string;
  event: string;
  envAct: string;
  envExp: string;
  result: string;
}

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

  private datePipe: DatePipe = new DatePipe("fr-FR");

  status = STATUS;
  displayedColumns: string[] = ['name', 'description', 'event', 'envExp', 'envAct', 'result', 'action'];
  dataSource: MatTableDataSource<TableElement>;
  selection = new SelectionModel<TableElement>(true, []);

  // @Input() set data(value: Array<ApiAssertionsResultServer>) {
  //   if(value) {
  //     this.dataSource = new MatTableDataSource(
  //       value.map(v => ({id: v.request.id, name: v.request.name, description: v.request.description, event: this.datePipe.transform(new Date(v.result.id), 'dd/MM/yyyy HH:mm:ss'), envAct: v.result.actExecution.host, envExp: v.result.expExecution.host, result: v.result.status}))
  //     );
  //     this.dataSource.paginator = this.paginator;
  //     this.dataSource.sort = this.sort;
  //   }
  // }

  constructor(private _service: TraceService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(
      res => this.getTraces(res['id'] ? res['id'] : null)
    )
    
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

  getTraces(id: number) {
    this._service.getTrace(id)
      .subscribe({
        next: res => {
          this.dataSource = new MatTableDataSource(
            res.map(v => ({id: v.request.id, name: v.request.name, description: v.request.description, event: this.datePipe.transform(new Date(v.result.id), 'dd/MM/yyyy HH:mm:ss'), envAct: v.result.actExecution.host, envExp: v.result.expExecution.host, result: v.result.status}))
          );
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });
  }

  refresh(){
    this.router.navigate(['home/trace']);
  }

  run(element: TableElement) {
    console.log(`Lancement du test numéro ${element.id}`)
  }
}
