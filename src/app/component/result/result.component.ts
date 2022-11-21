import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { combineLatest, distinctUntilChanged, filter, forkJoin } from 'rxjs';
import { ApiServerConfig, LoginTypeEnum } from 'src/app/model/environment.model';
import { LaunchForm, LoginForm } from 'src/app/model/form.model';
import { ApiRequest, ApiRequestServer, Configuration } from 'src/app/model/request.model';
import { ApiAssertionsResult, ApiAssertionsResultServer, ApiExecution } from 'src/app/model/trace.model';
import { EnvironmentService } from 'src/app/service/environment.service';
import { MainService } from 'src/app/service/main.service';
import { RequestService } from 'src/app/service/request.service';
import { environment } from 'src/environments/environment';
import { LaunchDialogService } from '../request/launch-dialog/launch-dialog.service';
import { ChartComponent } from './chart/chart.component';
import { ComparatorDialogComponent } from './comparator/comparator.component';

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
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, AfterViewInit {

  @ViewChild(ChartComponent, { static: false }) chart: ChartComponent;
  @ViewChild('launchPanel', { static: false }) launchPanel: MatExpansionPanel;
  @ViewChild('launchPanelHeader', { static: false }) launchPanelHeader: MatExpansionPanelHeader;
  @ViewChild('choosePanel', { static: false }) choosePanel: MatExpansionPanel;
  @ViewChild('choosePanelHeader', { static: false }) choosePanelHeader: MatExpansionPanelHeader;
  @ViewChild('choosePaginator', { static: true }) choosePaginator: MatPaginator;
  @ViewChild('chooseSort', { static: true }) chooseSort: MatSort;
  @ViewChild('resultPaginator', { static: false }) resultPaginator: MatPaginator;
  @ViewChild('resultSort', { static: false }) resultSort: MatSort;

  status = STATUS;

  chooseDisplayedColumns: string[] = ['name', 'select'];
  chooseDataSource: MatTableDataSource<ApiRequestServer>;
  chooseSelection = new SelectionModel<ApiRequestServer>(true, []);

  resultDisplayedColumns: string[] = ['status', 'name', 'select'];
  resultDataSource: MatTableDataSource<ApiAssertionsResultServer> = new MatTableDataSource([]);
  resultSelection = new SelectionModel<ApiAssertionsResultServer>(true, []);

  actualForm = new FormGroup<LaunchForm>({
    app: new FormControl<string>(null, Validators.required),
    env: new FormControl<string>(null, Validators.required),
    loginForm: new FormGroup<LoginForm>({
      type: new FormControl<LoginTypeEnum>(null, Validators.required),
      username: new FormControl<string>(null, Validators.required),
      password: new FormControl<string>(null, Validators.required)
    })
  });

  expectedForm = new FormGroup<LaunchForm>({
    app: new FormControl<string>(null, Validators.required),
    env: new FormControl<string>(null, Validators.required),
    loginForm: new FormGroup<LoginForm>({
      type: new FormControl<LoginTypeEnum>(null, Validators.required),
      username: new FormControl<string>(null, Validators.required),
      password: new FormControl<string>(null, Validators.required)
    })
  });

  filterForm = new FormGroup<{filter: FormControl<string>, status: FormControl<Array<string>>}>({
    filter: new FormControl<string>(null),
    status: new FormControl<Array<string>>(null)
  });

  hide: boolean = true;

  step: number = 1;

  actualEnvs: Array<{ name: string, value: string }>;
  actualApps: Array<{ name: string, value: string }>;

  expectedEnvs: Array<{ name: string, value: string }>;
  expectedApps: Array<{ name: string, value: string }>;

  requests: Array<ApiRequestServer> = [];
  environments: Array<ApiServerConfig> = [];
  configuration: Configuration = new Configuration();

  nbTests = 0;
  nbTestsOK = 0;
  nbTestsSkip = 0;
  nbTestsKO = 0;
  nbTestsFail = 0;
  progress = 0;

  constructor(private _service: MainService, private _requestService: RequestService, private _environmentService: EnvironmentService, public dialog: MatDialog) {
    combineLatest([
      this._requestService.requests,
      this._environmentService.environments
    ]).subscribe({
      next: ([requests, envs]) => {
        this.requests = requests;
        this.environments = envs;
        this.actualApps = Array.from(new Set(this.environments.filter(e => this.requests.map(t => t.requestGroupList[0].app).includes(e.app)).map(d => d.app))).map(a => ({ name: a, value: a }));
        this.expectedApps = Array.from(new Set(this.environments.filter(e => this.requests.map(t => t.requestGroupList[0].app).includes(e.app)).map(d => d.app))).map(a => ({ name: a, value: a }));
      }
    });

    this.resultDataSource.filterPredicate = (data: ApiAssertionsResultServer, filter) => {
      const a = !filter['filter'] || 
        (data.request.name.toLowerCase().includes(filter['filter'].toLowerCase()) 
        || data.request.description.toLowerCase().includes(filter['filter'].toLowerCase()) 
        || data.result?.status.toLowerCase().includes(filter['filter'].toLowerCase()));
      const b = !filter['status']?.length || filter['status'].some(s => data.result?.status == s); 
      
      return a && b;
    };

    this.filterForm.valueChanges.subscribe(value => {
      const filter = value as string;
      this.resultDataSource.filter = filter;
    });
  }
  
  onResetFilter(): void {
    this.filterForm.get('filter').setValue('');
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.actualApp.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => prev == curr),
      filter(form => form != null)
    ).subscribe({
      next: res => {
        this.actualEnvs = Array.from(new Set(this.environments.filter(d => d.app == res && this.requests.flatMap(t => t.requestGroupList.map(r => r.env)).includes(d.env)).map(d => d.env))).map(e => ({ name: e, value: e }));
        this.actualEnv.setValue(null);
        this.expectedApp.setValue(res);
      }
    });
    this.actualEnv.valueChanges.pipe(
      filter(form => form != null)
    ).subscribe({
      next: res => {
        var environment = this.environments.find(d => d.app == this.actualApp.value && d.env == res).serverConfig;
        this.actualLoginType.setValue(environment.auth.type);
        if (this.actualLoginType.value !== 'NOVA_BASIC' && this.actualLoginType.value !== 'BASIC') {
          this.actualLoginUsername.disable();
          this.actualLoginpassword.disable();
        }
        this.configuration.target = environment;
      }
    });
    this.expectedApp.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => prev == curr),
      filter(form => form != null)
    ).subscribe({
      next: res => {
        this.expectedEnvs = Array.from(new Set(this.environments.filter(d => d.app == res && this.requests.flatMap(t => t.requestGroupList.map(r => r.env)).includes(d.env)).map(d => d.env))).map(e => ({ name: e, value: e }));
        this.expectedEnv.setValue(null);
        this.actualApp.setValue(res);
      }
    });
    this.expectedEnv.valueChanges.pipe(
      filter(form => form != null)
    ).subscribe({
      next: res => {
        var environment = this.environments.find(d => d.app == this.expectedApp.value && d.env == res).serverConfig;
        this.expectedLoginType.setValue(environment.auth.type);
        if (this.actualLoginType.value !== 'NOVA_BASIC' && this.actualLoginType.value !== 'BASIC') {
          this.expectedLoginUsername.disable();
          this.expectedLoginpassword.disable();
        }
        this.configuration.refer = environment;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.chooseDataSource.filter = filterValue.trim().toLowerCase();
    if (this.chooseDataSource.paginator) {
      this.chooseDataSource.paginator.firstPage();
    }
  }

  isChooseAllSelected() {
    const numSelected = this.chooseSelection.selected.length;
    const numRows = this.chooseDataSource.data.length;;
    return numSelected === numRows;
  }

  toggleChooseAllRows() {
    if (this.isChooseAllSelected()) {
      this.chooseSelection.clear();
      return;
    }

    this.chooseSelection.select(...this.chooseDataSource.data);
  }

  isResultAllSelected() {
    const numSelected = this.resultSelection.selected.length;
    const numRows = this.filterNotOK().length;
    return numSelected === numRows;
  }

  toggleResultAllRows() {
    if (this.isResultAllSelected()) {
      this.resultSelection.clear();
      return;
    }

    this.resultSelection.select(...this.filterNotOK());
  }

  filterNotOK(): Array<ApiAssertionsResultServer> {
    return this.resultDataSource?.data.filter(d => d.result && d.result?.status != 'OK');
  }

  compare(element: ApiAssertionsResultServer) {
    this.dialog.open(ComparatorDialogComponent, {
      data: element
    });
  }

  choose() {
    if (this.actualForm.valid && this.expectedForm.valid) {
      this.launchPanel.close();
      this.launchPanelHeader.focus('mouse');
      this.choosePanel.open();
      this.step = 2;
      this.chooseDataSource = new MatTableDataSource(this.requests.filter(t => t.requestGroupList[0].app == this.actualApp.value && t.requestGroupList.map(r => r.env).includes(this.actualEnv.value) && t.requestGroupList.map(r => r.env).includes(this.expectedEnv.value)));
      this.chooseDataSource.filterPredicate = (data: ApiRequestServer, filter) => {
        const a = !filter || 
          (data.request.name.toLowerCase().includes(filter.toLowerCase()) 
          || data.request.description.toLowerCase().includes(filter.toLowerCase()));
        
          return a;
      };
      this.chooseDataSource.paginator = this.choosePaginator;
      this.chooseDataSource.sort = this.chooseSort;
    } else {
      this.actualForm.markAllAsTouched();
      this.expectedForm.markAllAsTouched();
    }
  }

  launch() {
    if (this.actualForm.valid && this.expectedForm.valid) {
      this.resultDataSource.data = [];
      this.configuration.refer.auth = { ...this.configuration.refer.auth, username: this.expectedLoginUsername?.value, password: this.expectedLoginpassword?.value };
      this.configuration.target.auth = { ...this.configuration.target.auth, username: this.actualLoginUsername?.value, password: this.actualLoginpassword?.value };
      const eventSource = new EventSource(`${environment.server}/v1/assert/api/progress`);
      let guidValue = null;
      eventSource.addEventListener("GUI_ID", (event) => {
        guidValue = JSON.parse(event.data);
        console.log(`Guid from server: ${guidValue}`);
        eventSource.addEventListener(`nb tests launch ${guidValue}`, (event) => {
          this.choosePanel.close();
          this.choosePanelHeader.focus('mouse');
          this.step = 3;
          this.progress = 0;
          this.nbTestsOK = 0;
          this.nbTestsSkip = 0;
          this.nbTestsKO = 0;
          this.nbTestsFail = 0;
          this.nbTests = JSON.parse(event.data);
          this.chart.update(this.progress, false);
          console.log(`Nombre tests: ${JSON.parse(event.data)}`);
        });
        eventSource.addEventListener(`start ${guidValue}`, (event) => {
          const request: ApiRequest = JSON.parse(event.data);
          const assertionResultServer = new ApiAssertionsResultServer();
          assertionResultServer.request = request;
          const index = this.resultDataSource.data.findIndex(a => a.request.id == request.id);
          if (index != -1) {
            this.resultDataSource.data.splice(index, 1, assertionResultServer)
          } else {
            this.resultDataSource.data.push(assertionResultServer);
          }
          this.resultDataSource.paginator = this.resultPaginator;
          this.resultDataSource.sort = this.resultSort;
          // var element = document.getElementById('ton_element_avec_scroll');
          // element.scrollTop = element.scrollHeight;
          console.log("request", request);
          eventSource.addEventListener(`${request.id} end ${guidValue}`, (event) => {
            const result: ApiAssertionsResult = JSON.parse(event.data);
            assertionResultServer.result = result;
            this.progress += ((1 / this.nbTests) * 100);
            this.chart.update(Number(this.progress.toFixed(2)), true);
            if(result.status == 'OK') {
              this.nbTestsOK++;
            } else if(result.status == 'SKIP') {
              this.nbTestsSkip++;
            } else if(result.status == 'KO') {
              this.nbTestsKO++;
            } else if(result.status == 'FAIL') {
              this.nbTestsFail++;
            }
            console.log("result", result, this.progress.toFixed(2));
          });
        });
        var disabledIds = this.chooseSelection.selected.length ? this.chooseSelection.selected.map(s => s.request.id) : null;
        this._service.run(guidValue, this.actualApp.value, this.actualEnv.value, this.expectedEnv.value, null, disabledIds, this.configuration)
          .subscribe({
            next: res => {
              console.log(res);
            }
          });
      })
      eventSource.onerror = (event) => {
        eventSource.close();
      };

      eventSource.onopen = () => {
        console.log("connection opened");
      };
    } else {
      this.actualForm.markAllAsTouched();
      this.expectedForm.markAllAsTouched();
    }
  }

  get actualApp(): AbstractControl<string> {
    return this.actualForm.get('app');
  }

  get actualEnv(): AbstractControl<string> {
    return this.actualForm.get('env');
  }

  get actualLogin(): FormGroup<LoginForm> {
    return <FormGroup<LoginForm>>this.actualForm.get('loginForm');
  }

  get actualLoginType(): AbstractControl<string> {
    return this.actualLogin.get('type');
  }

  get actualLoginUsername(): AbstractControl<string> {
    return this.actualLogin.get('username');
  }

  get actualLoginpassword(): AbstractControl<string> {
    return this.actualLogin.get('password');
  }

  get expectedApp(): AbstractControl<string> {
    return this.expectedForm.get('app');
  }

  get expectedEnv(): AbstractControl<string> {
    return this.expectedForm.get('env');
  }

  get expectedLogin(): FormGroup<LoginForm> {
    return <FormGroup<LoginForm>>this.expectedForm.get('loginForm');
  }

  get expectedLoginType(): AbstractControl<string> {
    return this.expectedLogin.get('type');
  }

  get expectedLoginUsername(): AbstractControl<string> {
    return this.expectedLogin.get('username');
  }

  get expectedLoginpassword(): AbstractControl<string> {
    return this.expectedLogin.get('password');
  }
}
