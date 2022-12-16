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
import { AssertionResult, AssertionResultServer, RequestExecution, ApiTraceGroup, AssertionContext, ResponseComparator } from 'src/app/model/trace.model';
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
  apiTraceGroup: ApiTraceGroup;
  resultGroups: Array<ResultGroup> = [];

  status = STATUS;

  nbTests = 0;
  nbTestsOK = 0;
  nbTestsSkip = 0;
  nbTestsFail = 0;
  progress = 0;

  idGroup: number;

  constructor(private _traceService: TraceService, public dialog: MatDialog, private activatedRoute: ActivatedRoute, private router: Router) {

  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(res => {
      if (res['id']) {
        this.idGroup = res['id'];
        this._traceService.getTraceGroup(this.idGroup).subscribe(
          res => {
            this.apiTraceGroup = res;
            if (this.apiTraceGroup.status == 'PENDING') {
              const eventSource = new EventSource(`${environment.server}/v1/assert/api/subscribe?ctx=${this.idGroup}`);

              eventSource.addEventListener("result", result => {
                this.apiTraceGroup = JSON.parse(result.data);
                this.updateChart();
                console.log("result", this.apiTraceGroup, this.progress);
              });

              eventSource.onopen = (event) => {
                console.log("connection opened", event);
              };
              eventSource.onerror = (event) => {
                eventSource.close();
              };
            } else {
              this.updateChart();
            }
          }
        )
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

  updateChart() {
    console.log(this.apiTraceGroup)
    this.progress = ((this.apiTraceGroup.nbTestKo + this.apiTraceGroup.nbTestSkip + this.apiTraceGroup.nbTestOk) / this.apiTraceGroup.nbTest) * 100;
    if (this.progress > 0) this.chart.showLoading(false);
    this.chart.update([
      {
        id: 'SKIP',
        name: `Test Désactivé (${this.apiTraceGroup.nbTestSkip}/${this.apiTraceGroup.nbTest})`,
        y: (this.apiTraceGroup.nbTestSkip / this.apiTraceGroup.nbTest) * 100,
        color: this.status['SKIP']['color']
      }, {
        id: 'OK',
        name: `Test Passant (${this.apiTraceGroup.nbTestOk}/${this.apiTraceGroup.nbTest})`,
        y: (this.apiTraceGroup.nbTestOk / this.apiTraceGroup.nbTest) * 100,
        color: this.status['OK']['color']
      }, {
        id: 'KO',
        name: `Test Non Passant (${this.apiTraceGroup.nbTestKo}/${this.apiTraceGroup.nbTest})`,
        y: (this.apiTraceGroup.nbTestKo / this.apiTraceGroup.nbTest) * 100,
        color: this.status['KO']['color']
      }]);
  }
}

export class ResultGroup {
  name: string;
  results: Array<AssertionResultServer>;


  constructor(name: string, results: Array<AssertionResultServer>) {
    this.name = name;
    this.results = results;
  }
}
