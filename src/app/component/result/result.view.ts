import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Point } from 'highcharts';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { combineLatest, distinctUntilChanged, filter, forkJoin } from 'rxjs';
import { ApiServerConfig, LoginTypeEnum } from 'src/app/model/environment.model';
import { LaunchForm, LoginForm } from 'src/app/model/form.model';
import { ApiRequest, ApiRequestServer, Configuration } from 'src/app/model/request.model';
import { ApiAssertionsResult, ApiAssertionsResultServer, ApiExecution, AssertionContext, ResponseComparator } from 'src/app/model/trace.model';
import { EnvironmentService } from 'src/app/service/environment.service';
import { MainService } from 'src/app/service/main.service';
import { RequestService } from 'src/app/service/request.service';
import { ServerSentEventService } from 'src/app/service/server-sent-event.service';
import { TraceService } from 'src/app/service/trace.service';
import { environment } from 'src/environments/environment';
import { ChartComponent } from './chart/chart.component';
import { ComparatorDialogComponent } from '../detail/comparator/comparator.component';

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
  }
}

@Component({
  templateUrl: './result.view.html',
  styleUrls: ['./result.view.scss']
})
export class ResultView implements OnInit, AfterViewInit {
  @ViewChild(ChartComponent, { static: true }) chart: ChartComponent;

  configuration: Configuration = new Configuration();
  ctx: AssertionContext;
  resultGroups: Array<ResultGroup> = [];

  status = STATUS;

  nbTests = 0;
  nbTestsOK = 0;
  nbTestsSkip = 0;
  nbTestsFail = 0;
  progress = 0;

  idGroup: number;

  constructor(private sseService: ServerSentEventService, private _service: MainService, private _traceService: TraceService, public dialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router) {

  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(res => {
      if (res['id']) {
        this.idGroup = res['id'];
        if (this.sseService.watch() != undefined) {
          this.sseService.watch().subscribe(
            result => {
              this.ctx = result.context;

              console.log("watch", result)
              result.evntSource.addEventListener(`nb tests launch ${this.idGroup}`, (event) => {
                this.nbTests = JSON.parse(event.data);

                console.log(`Nombre tests: ${JSON.parse(event.data)}`);
              });

              result.evntSource.addEventListener(`result ${this.idGroup}`, (event) => {
                const apiResult: ApiAssertionsResult = JSON.parse(event.data);
                switch (apiResult.status) {
                  case 'SKIP': {
                    this.nbTestsSkip++;
                    break;
                  }
                  case 'KO': {
                    this.nbTestsFail++;
                    break;
                  }
                  case 'FAIL': {
                    this.nbTestsFail++;
                    break;
                  }
                  case 'OK': {
                    this.nbTestsOK++;
                    break;
                  }
                }
                this.progress = ((this.nbTestsFail + this.nbTestsSkip + this.nbTestsOK) / this.nbTests) * 100;
                this.chart.showLoading(false);
                this.chart.update([{
                  id: 'OK',
                  name: `Test Passant (${this.nbTestsOK}/${this.nbTests})`,
                  y: (this.nbTestsOK / this.nbTests) * 100,
                  color: this.status['OK']['color']
                }, {
                  id: 'KO',
                  name: `Test Non Passant (${this.nbTestsFail}/${this.nbTests})`,
                  y: (this.nbTestsFail / this.nbTests) * 100,
                  color: this.status['KO']['color']
                }, {
                  id: 'SKIP',
                  name: `Test Désactivé (${this.nbTestsSkip}/${this.nbTests})`,
                  y: (this.nbTestsSkip / this.nbTests) * 100,
                  color: this.status['SKIP']['color']
                }]);
              });

              this._service.run(this.idGroup, result.app, result.actualEnv, result.expectedEnv, null, result.disabledIds, result.configuration)
                .subscribe();
            }
          );
        } else {
          this._traceService.getTraceGroup(this.idGroup)
            .subscribe(
              res => {
                this.ctx = new AssertionContext();
                this.ctx.user = res.user;
                this.progress = 100;
                this.nbTests = res.nbTest;
                this.nbTestsSkip = res.nbTestDisable;
                this.nbTestsOK = res.nbTestOk;
                this.nbTestsFail = this.nbTests - (this.nbTestsSkip + this.nbTestsOK);
                this.chart.showLoading(false);
                this.chart.update([{
                  id: 'OK',
                  name: `Test Passant (${this.nbTestsOK}/${this.nbTests})`,
                  y: (this.nbTestsOK / this.nbTests) * 100,
                  color: this.status['OK']['color']
                }, {
                  id: 'KO',
                  name: `Test Non Passant (${this.nbTestsFail}/${this.nbTests})`,
                  y: (this.nbTestsFail / this.nbTests) * 100,
                  color: this.status['KO']['color']
                }, {
                  id: 'SKIP',
                  name: `Test Désactivé (${this.nbTestsSkip}/${this.nbTests})`,
                  y: (this.nbTestsSkip / this.nbTests) * 100,
                  color: this.status['SKIP']['color']
                }]);
              }
            );
        }

      }
    });
  }

  ngAfterViewInit(): void {
    this.chart.showLoading(true);
  }

  onChartClick($event: Point) {
    if ($event.selected) {
      this.router.navigate(['home/launch', this.idGroup, 'detail'], { queryParams: { status: $event.options.id } })
    }
  }
}

export class ResultGroup {
  name: string;
  results: Array<ApiAssertionsResultServer>;


  constructor(name: string, results: Array<ApiAssertionsResultServer>) {
    this.name = name;
    this.results = results;
  }
}
