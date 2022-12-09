import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiServerConfig, LoginTypeEnum } from 'src/app/model/environment.model';
import { LaunchForm, LoginForm } from 'src/app/model/form.model';
import { EnvironmentService } from 'src/app/service/environment.service';
import { RequestService } from 'src/app/service/request.service';
import { combineLatest, distinctUntilChanged, filter, Observable } from 'rxjs';
import { ApiRequestServer, Configuration } from 'src/app/model/request.model';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ServerSentEventService } from 'src/app/service/server-sent-event.service';

@Component({
  templateUrl: './launch.component.html',
  styleUrls: ['./launch.component.scss']
})
export class LaunchComponent implements OnInit, AfterViewInit {

  @ViewChild('launchPanel', { static: false }) launchPanel: MatExpansionPanel;
  @ViewChild('launchPanelHeader', { static: false }) launchPanelHeader: MatExpansionPanelHeader;
  @ViewChild('choosePanel', { static: false }) choosePanel: MatExpansionPanel;
  @ViewChild('choosePanelHeader', { static: false }) choosePanelHeader: MatExpansionPanelHeader;

  @ViewChild('choosePaginator', { static: true }) choosePaginator: MatPaginator;
  @ViewChild('chooseSort', { static: true }) chooseSort: MatSort;
  
  hide: boolean = true;

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

  actualEnvs: Array<{ name: string, value: string }>;
  actualApps: Array<{ name: string, value: string }>;

  expectedEnvs: Array<{ name: string, value: string }>;
  expectedApps: Array<{ name: string, value: string }>;

  requests: Array<ApiRequestServer> = [];
  environments: Array<ApiServerConfig> = [];
  configuration: Configuration = new Configuration();

  chooseDisplayedColumns: string[] = ['name', 'select'];
  chooseDataSource: MatTableDataSource<ApiRequestServer> = new MatTableDataSource([]);
  chooseSelection = new SelectionModel<ApiRequestServer>(true, []);

  constructor(private _requestService: RequestService, private _environmentService: EnvironmentService, private sseService: ServerSentEventService, private router: Router) { 
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
  
  choose() {
    if (this.actualForm.valid && this.expectedForm.valid) {
      this.launchPanel.close();
      this.launchPanelHeader.focus('mouse');
      this.choosePanel.open();
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
      this.configuration.refer.auth = { ...this.configuration.refer.auth, username: this.expectedLoginUsername?.value, password: this.expectedLoginpassword?.value };
      this.configuration.target.auth = { ...this.configuration.target.auth, username: this.actualLoginUsername?.value, password: this.actualLoginpassword?.value };
      var disabledIds = this.chooseSelection.selected.length ? this.chooseSelection.selected.map(s => s.request.id) : null;
      const eventSource = new EventSource(`${environment.server}/v1/assert/api/progress?app=${this.actualApp.value}&actual_env=${this.actualEnv.value}&expected_env=${this.expectedEnv.value}`);
      eventSource.onopen = (event) => {
        console.log("connection opened", event);
      };
      eventSource.onerror = (event) => {
        eventSource.close();
      };
      eventSource.addEventListener("GROUP_ID", (id) => {
        eventSource.addEventListener(`ctx ${JSON.parse(id.data)}`, (ctx) => {
          this.router.navigate(['home/launch', JSON.parse(id.data)]);
          this.sseService.process({evntSource: eventSource, context: JSON.parse(ctx.data), app: this.actualApp.value, actualEnv: this.actualEnv.value, expectedEnv: this.expectedEnv.value, disabledIds: disabledIds, configuration: this.configuration});
        })
      });
    } else {
      this.actualForm.markAllAsTouched();
      this.expectedForm.markAllAsTouched();
    }
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
