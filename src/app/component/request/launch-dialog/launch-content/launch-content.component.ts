import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, filter } from 'rxjs';
import { LoginTypeEnum } from 'src/app/model/environment.model';
import { LaunchForm, LoginForm } from 'src/app/model/form.model';
import { Configuration, Data } from 'src/app/model/request.model';

@Component({
  selector: 'app-launch-content',
  templateUrl: './launch-content.component.html',
  styleUrls: ['./launch-content.component.scss']
})
export class LaunchContentComponent implements OnInit {

  @Input() set data(value: Data) {
    if(value) {
      this.actualApps = Array.from(new Set(value.environments.filter(e => value.tableElements.map(t => t.requestGroupList[0].app).includes(e.app)).map(d => d.app))).map(a => ({name: a, value: a}));
      this.expectedApps = Array.from(new Set(value.environments.filter(e => value.tableElements.map(t => t.requestGroupList[0].app).includes(e.app)).map(d => d.app))).map(a => ({name: a, value: a}));
    }
  }

  @Output() onLaunch = new EventEmitter<any>();
  @Output() onChoose = new EventEmitter<any>();
  
  actualForm = new FormGroup<LaunchForm>({
    app: new FormControl<string>(null, Validators.required),
    env: new FormControl<string>(null, Validators.required),
    loginForm: new FormGroup<LoginForm>({
      type: new FormControl<LoginTypeEnum>(null, Validators.required)
    })
  });

  expectedForm = new FormGroup<LaunchForm>({
    app: new FormControl<string>(null, Validators.required),
    env: new FormControl<string>(null, Validators.required),
    loginForm: new FormGroup<LoginForm>({
      type: new FormControl<LoginTypeEnum>(null, Validators.required)
    })
  });

  hide: boolean = true;

  actualEnvs: Array<{name: string, value: string}>;
  actualApps: Array<{name: string, value: string}>;

  expectedEnvs: Array<{name: string, value: string}>;
  expectedApps: Array<{name: string, value: string}>;

  configuration: Configuration = new Configuration();

  constructor() { }

  ngOnInit(): void {
    this.actualApp.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => prev == curr),
      filter(form => form != null)
    ).subscribe({
      next: res => {
        this.actualEnvs = Array.from(new Set(this.data.environments.filter(d => d.app == res && this.data.tableElements.flatMap(t => t.requestGroupList.map(r => r.env)).includes(d.env)).map(d => d.env))).map(e => ({name: e, value: e}));
        this.actualEnv.setValue(null);
        this.expectedApp.setValue(res);
      }
    });
    this.actualEnv.valueChanges.pipe(
      filter(form => form != null)
    ).subscribe({
      next: res => {
        var environment = this.data.environments.find(d => d.app == this.actualApp.value && d.env == res).serverConfig;
        this.actualLoginType.setValue(environment.auth?.type);
        if(this.actualLoginType.value === 'NOVA_BASIC' || this.actualLoginType.value === 'BASIC') {
          this.actualLogin.addControl('username', new FormControl<string>(null, Validators.required));
          this.actualLogin.addControl('password', new FormControl<string>(null, Validators.required));
        } else {
          this.actualLogin.removeControl('username');
          this.actualLogin.removeControl('password');
        }
        this.configuration.target = environment;
      }
    });
    this.expectedApp.valueChanges.pipe(
      distinctUntilChanged((prev, curr) => prev == curr),
      filter(form => form != null)
    ).subscribe({
      next: res => {
        this.expectedEnvs = Array.from(new Set(this.data.environments.filter(d => d.app == res && this.data.tableElements.flatMap(t => t.requestGroupList.map(r => r.env)).includes(d.env)).map(d => d.env))).map(e => ({name: e, value: e}));
        this.expectedEnv.setValue(null);
        this.actualApp.setValue(res);
      }
    });
    this.expectedEnv.valueChanges.pipe(
      filter(form => form != null)
    ).subscribe({
      next: res => {
        var environment = this.data.environments.find(d => d.app == this.expectedApp.value && d.env == res).serverConfig;
        this.expectedLoginType.setValue(environment.auth.type);
        if(this.expectedLoginType.value === 'NOVA_BASIC' || this.expectedLoginType.value === 'BASIC') {
          this.expectedLogin.addControl('username', new FormControl<string>(null, Validators.required));
          this.expectedLogin.addControl('password', new FormControl<string>(null, Validators.required));
        } else {
          this.expectedLogin.removeControl('username');
          this.expectedLogin.removeControl('password');
        }
        this.configuration.refer = environment;
      }
    });
  }

  launch(): void {
    if(this.actualForm.valid && this.expectedForm.valid) {
      this.configuration.refer.auth = {...this.configuration.refer.auth, username: this.expectedLoginUsername?.value, password: this.expectedLoginpassword?.value}; 
      this.configuration.target.auth = {...this.configuration.target.auth, username: this.actualLoginUsername?.value, password: this.actualLoginpassword?.value}; 
      this.onLaunch.emit({actualApp: this.actualApp.value, actualEnv: this.actualEnv.value, expectedEnv: this.expectedEnv.value, configuration: this.configuration})
    }
  }

  choose(): void {
    if(this.actualForm.valid && this.expectedForm.valid) {
      this.onChoose.emit({actualApp: this.actualApp.value, actualEnv: this.actualEnv.value, expectedEnv: this.expectedEnv.value, elements: this.data.tableElements.filter(t => t.requestGroupList[0].app == this.actualApp.value && t.requestGroupList.map(r => r.env).includes(this.actualEnv.value) && t.requestGroupList.map(r => r.env).includes(this.expectedEnv.value))});
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
