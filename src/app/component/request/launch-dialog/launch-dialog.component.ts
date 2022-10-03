import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { Configuration, Data } from 'src/app/model/request.model';
import { AssertapiClientService } from 'src/app/service/assertapi-client.service';
import { MainService } from 'src/app/service/main.service';

@Component({
  templateUrl: './launch-dialog.component.html',
  styleUrls: ['./launch-dialog.component.scss']
})
export class LaunchDialogComponent implements OnInit, AfterViewInit {

  hide: boolean = true;

  actualForm: FormGroup = new FormGroup({
    app: new FormControl('', Validators.required),
    env: new FormControl('', Validators.required),
    login: new FormGroup({
      type: new FormControl('', Validators.required)
    })
  });

  expectedForm: FormGroup = new FormGroup({
    app: new FormControl('', Validators.required),
    env: new FormControl('', Validators.required),
    login: new FormGroup({
      type: new FormControl('', Validators.required)
    })
  })

  actualEnvs: Array<{name: string, value: string}>;
  actualApps: Array<{name: string, value: string}>;

  expectedEnvs: Array<{name: string, value: string}>;
  expectedApps: Array<{name: string, value: string}>;

  configuration: Configuration = new Configuration();

  constructor(
    public dialogRef: MatDialogRef<LaunchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data,
    private _service: MainService,
    private router: Router, 
    private activatedRoute: ActivatedRoute
  ) { 
    this.actualEnvs = Array.from(new Set(data.environments.map(d => d.env))).map(e => ({name: e, value: e}));
    this.expectedEnvs = Array.from(new Set(data.environments.map(d => d.env))).map(e => ({name: e, value: e}));
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.actualEnv.valueChanges.pipe(
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        this.actualApps = Array.from(new Set(this.data.environments.filter(d => d.env == res).map(d => d.app))).map(a => ({name: a, value: a}));
        this.actualApp.setValue('');
      }
    });
    this.actualApp.valueChanges.pipe(
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        var environment = this.data.environments.find(d => d.env == this.actualEnv.value && d.app == res).serverConfig;
        this.actualLoginType.setValue(environment.auth.type);
        if(this.actualLoginType.value === ('NOVA_BASIC' || 'BASIC')) {
          this.actualLogin.addControl('username', new FormControl('', Validators.required));
          this.actualLogin.addControl('password', new FormControl('', Validators.required));
        } 
        this.configuration.refer = environment;
      }
    });
    this.expectedEnv.valueChanges.pipe(
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        this.expectedApps = Array.from(new Set(this.data.environments.filter(d => d.env == res).map(d => d.app))).map(a => ({name: a, value: a}));
        this.expectedApp.setValue('');
      }
    });
    this.expectedApp.valueChanges.pipe(
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        var environment = this.data.environments.find(d => d.env == this.expectedEnv.value && d.app == res).serverConfig;
        this.expectedLoginType.setValue(environment.auth.type);
        if(this.expectedLoginType.value === ('NOVA_BASIC' || 'BASIC')) {
          this.expectedLogin.addControl('username', new FormControl('', Validators.required));
          this.expectedLogin.addControl('password', new FormControl('', Validators.required));
        } 
        this.configuration.target = environment;
      }
    });
  }

  launch(): void {
    if(this.actualForm.valid && this.expectedForm.valid) {
      this.configuration.refer.auth = {...this.configuration.refer.auth, username: this.actualLoginUsername.value, password: this.actualLoginpassword.value}; 
      this.configuration.target.auth = {...this.configuration.refer.auth, username: this.expectedLoginUsername.value, password: this.expectedLoginpassword.value}; 
      this._service.run(this.data.ids, this.configuration)
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

  get actualApp(): AbstractControl | null {
    return this.actualForm.get('app');
  }

  get actualEnv(): AbstractControl | null {
    return this.actualForm.get('env');
  }

  get actualLogin(): FormGroup {
    return <FormGroup>this.actualForm.get('login');
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

  get expectedLogin(): FormGroup {
    return <FormGroup>this.expectedForm.get('login');
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


