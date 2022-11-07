import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { distinctUntilChanged, filter } from 'rxjs';
import { ApiRequest, ApiRequestServer, Configuration, Data } from 'src/app/model/request.model';
import { ApiAssertionsResult, ApiAssertionsResultServer, ApiExecution } from 'src/app/model/trace.model';
import { MainService } from 'src/app/service/main.service';
import { environment } from 'src/environments/environment';

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
  templateUrl: './launch-dialog.component.html',
  styleUrls: ['./launch-dialog.component.scss']
})
export class LaunchDialogComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  options = {
    readOnly: true,
    scrollbar: {
      verticalScrollbarSize: 5,
		  horizontalScrollbarSize: 5,
    }
  };

  originalModel: DiffEditorModel;

  modifiedModel: DiffEditorModel;

  status = STATUS;

  hide: boolean = true;
  step: number = 1;
  selectedIndex: number;

  actualForm: UntypedFormGroup = new UntypedFormGroup({
    app: new UntypedFormControl('', Validators.required),
    env: new UntypedFormControl('', Validators.required),
    login: new UntypedFormGroup({
      type: new UntypedFormControl('')
    })
  });

  expectedForm: UntypedFormGroup = new UntypedFormGroup({
    app: new UntypedFormControl('', Validators.required),
    env: new UntypedFormControl('', Validators.required),
    login: new UntypedFormGroup({
      type: new UntypedFormControl('')
    })
  });

  actualEnvs: Array<{name: string, value: string}>;
  actualApps: Array<{name: string, value: string}>;

  expectedEnvs: Array<{name: string, value: string}>;
  expectedApps: Array<{name: string, value: string}>;

  configuration: Configuration = new Configuration();

  displayedColumns: string[] = ['name', 'description', 'select'];
  dataSource: MatTableDataSource<ApiRequestServer>;
  selection = new SelectionModel<ApiRequestServer>(true, []);

  assertionResults: Array<ApiAssertionsResultServer> = [];

  constructor(
    public dialogRef: MatDialogRef<LaunchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data,
    private _service: MainService,
  ) { 
    this.actualApps = Array.from(new Set(data.environments.filter(e => data.tableElements.map(t => t.requestGroupList[0].app).includes(e.app)).map(d => d.app))).map(a => ({name: a, value: a}));
    this.expectedApps = Array.from(new Set(data.environments.filter(e => data.tableElements.map(t => t.requestGroupList[0].app).includes(e.app)).map(d => d.app))).map(a => ({name: a, value: a}));
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.actualApp.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => prev == curr),
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        this.actualEnvs = Array.from(new Set(this.data.environments.filter(d => d.app == res && this.data.tableElements.flatMap(t => t.requestGroupList.map(r => r.env)).includes(d.env)).map(d => d.env))).map(e => ({name: e, value: e}));
        this.actualEnv.setValue('');
        this.expectedApp.setValue(res);
      }
    });
    this.actualEnv.valueChanges.pipe(
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        var environment = this.data.environments.find(d => d.app == this.actualApp.value && d.env == res).serverConfig;
        this.actualLoginType.setValue(environment.auth?.type);
        if(this.actualLoginType.value === 'NOVA_BASIC' || this.actualLoginType.value === 'BASIC') {
          this.actualLogin.addControl('username', new UntypedFormControl('', Validators.required));
          this.actualLogin.addControl('password', new UntypedFormControl('', Validators.required));
        } 
        this.configuration.target = environment;
      }
    });
    this.expectedApp.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => prev == curr),
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        this.expectedEnvs = Array.from(new Set(this.data.environments.filter(d => d.app == res && this.data.tableElements.flatMap(t => t.requestGroupList.map(r => r.env)).includes(d.env)).map(d => d.env))).map(e => ({name: e, value: e}));
        this.expectedEnv.setValue('');
        this.actualApp.setValue(res);
      }
    });
    this.expectedEnv.valueChanges.pipe(
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        var environment = this.data.environments.find(d => d.app == this.expectedApp.value && d.env == res).serverConfig;
        this.expectedLoginType.setValue(environment.auth.type);
        if(this.expectedLoginType.value === 'NOVA_BASIC' || this.expectedLoginType.value === 'BASIC') {
          this.expectedLogin.addControl('username', new UntypedFormControl('', Validators.required));
          this.expectedLogin.addControl('password', new UntypedFormControl('', Validators.required));
        } 
        this.configuration.refer = environment;
      }
    });
  }

  launch(): void {
    if(this.actualForm.valid && this.expectedForm.valid) {
      this.step = 3;
      this.configuration.refer.auth = {...this.configuration.refer.auth, username: this.expectedLoginUsername?.value, password: this.expectedLoginpassword?.value}; 
      this.configuration.target.auth = {...this.configuration.target.auth, username: this.actualLoginUsername?.value, password: this.actualLoginpassword?.value}; 
      
      const eventSource = new EventSource(`${environment.server}/v1/assert/api/progress`);
      let guidValue = null;
      eventSource.addEventListener("GUI_ID", (event) => {
        guidValue = JSON.parse(event.data);
        console.log(`Guid from server: ${guidValue}`);
        eventSource.addEventListener(`start ${guidValue}`, (event) => {
          const request: ApiRequest = JSON.parse(event.data);
          const assertionResultServer = new ApiAssertionsResultServer();
          assertionResultServer.request = request;
          this.assertionResults.push(assertionResultServer);
          console.log("request", request, this.assertionResults);
          eventSource.addEventListener(`${request.id} end ${guidValue}`, (event) => {
            const result: ApiAssertionsResult = JSON.parse(event.data);
            assertionResultServer.result = result;
            console.log("result", result, this.assertionResults);
          });
        });
        
        this._service.run(guidValue, this.actualApp.value, this.actualEnv.value, this.expectedEnv.value, this.data.tableElements.length == 1 ? [this.data.tableElements[0].request.id] : null, this.selection.selected.map(t => t.request.id), this.configuration)
          .subscribe({
            next: res => {
              console.log(res);
            }
          });
      });

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

  choose() {
    if(this.actualForm.valid && this.expectedForm.valid) {
      this.step = 2;
      this.dataSource = new MatTableDataSource(
        this.data.tableElements.filter(t => t.requestGroupList[0].app == this.actualApp.value && t.requestGroupList.map(r => r.env).includes(this.actualEnv.value) && t.requestGroupList.map(r => r.env).includes(this.expectedEnv.value))
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      this.actualForm.markAllAsTouched();
      this.expectedForm.markAllAsTouched();
    }
  }

  onResult(result: ApiAssertionsResult) {
    if(result) {
      this.originalModel = this.toCode(result.actExecution, result.step);
      this.modifiedModel = this.toCode(result.expExecution, result.step);
      this.selectedIndex = result.id;
    }
  }

  toCode(apiExecution: ApiExecution, step: string): DiffEditorModel {
    switch(step) {
      case 'HTTP_CODE' : {
        return {
          code: apiExecution.statusCode.toString(),
          language: 'text/plain'
        };
      }
      case 'CONTENT_TYPE' : {
        return {
          code: apiExecution.contentType,
          language: 'text/plain'
        };
      }
      case 'RESPONSE_CONTENT' : {
        return {
          code: JSON.stringify(JSON.parse(apiExecution.response), null, 1),
          language: 'json'
        };
      }
      default : {
        return {
          code: JSON.stringify(JSON.parse(apiExecution.response), null, 1),
          language: 'json'
        };
      }
    }
  }

  get actualApp(): AbstractControl | null {
    return this.actualForm.get('app');
  }

  get actualEnv(): AbstractControl | null {
    return this.actualForm.get('env');
  }

  get actualLogin(): UntypedFormGroup {
    return <UntypedFormGroup>this.actualForm.get('login');
  }

  get actualLoginType(): AbstractControl | null {
    return this.actualLogin.get('type');
  }

  get actualLoginUsername(): AbstractControl | null {
    return this.actualLogin.get('username');
  }

  get actualLoginpassword(): AbstractControl | null {
    return this.actualLogin.get('password');
  }

  get expectedApp(): AbstractControl | null {
    return this.expectedForm.get('app');
  }

  get expectedEnv(): AbstractControl | null {
    return this.expectedForm.get('env');
  }

  get expectedLogin(): UntypedFormGroup {
    return <UntypedFormGroup>this.expectedForm.get('login');
  }

  get expectedLoginType(): AbstractControl | null {
    return this.expectedLogin.get('type');
  }

  get expectedLoginUsername(): AbstractControl | null {
    return this.expectedLogin.get('username');
  }

  get expectedLoginpassword(): AbstractControl | null {
    return this.expectedLogin.get('password');
  }
}


