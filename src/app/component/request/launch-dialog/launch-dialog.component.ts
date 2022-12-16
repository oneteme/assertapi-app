import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, filter } from 'rxjs';
import { ApiRequestServer, Configuration, Data } from 'src/app/model/request.model';
import { MainService } from 'src/app/service/main.service';

@Component({
  templateUrl: './launch-dialog.component.html',
  styleUrls: ['./launch-dialog.component.scss']
})
export class LaunchDialogComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  hide: boolean = true;
  step: number = 1;

  actualForm: UntypedFormGroup = new UntypedFormGroup({
    app: new UntypedFormControl('', Validators.required),
    env: new UntypedFormControl('', Validators.required),
    login: new UntypedFormGroup({
      type: new UntypedFormControl('', Validators.required)
    })
  });

  expectedForm: UntypedFormGroup = new UntypedFormGroup({
    app: new UntypedFormControl('', Validators.required),
    env: new UntypedFormControl('', Validators.required),
    login: new UntypedFormGroup({
      type: new UntypedFormControl('', Validators.required)
    })
  })

  actualEnvs: Array<{name: string, value: string}>;
  actualApps: Array<{name: string, value: string}>;

  expectedEnvs: Array<{name: string, value: string}>;
  expectedApps: Array<{name: string, value: string}>;

  configuration: Configuration = new Configuration();

  displayedColumns: string[] = ['name', 'description', 'select'];
  dataSource: MatTableDataSource<ApiRequestServer>;
  selection = new SelectionModel<ApiRequestServer>(true, []);

  constructor(
    public dialogRef: MatDialogRef<LaunchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data,
    private _service: MainService,
    private router: Router, 
    private activatedRoute: ActivatedRoute
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
        this.actualLoginType.setValue(environment.auth.type);
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
      this.configuration.refer.auth = {...this.configuration.refer.auth, username: this.expectedLoginUsername.value, password: this.expectedLoginpassword.value}; 
      this.configuration.target.auth = {...this.configuration.target.auth, username: this.actualLoginUsername.value, password: this.actualLoginpassword.value}; 
      this._service.run(this.actualApp.value, this.actualEnv.value, this.expectedEnv.value, null, this.selection.selected.map(t => t.request.id), this.configuration)
        .subscribe({
          next: res => {
            this.dialogRef.close();
            this.router.navigate(['home/trace'], {relativeTo: this.activatedRoute, queryParams: {id: res}});
          }
      });
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


