import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServerConfig, LoginTypeEnum, ServerAuth, ServerConfig } from 'src/app/model/environment.model';
import { LoginForm } from 'src/app/model/form.model';
import { Configuration } from 'src/app/model/request.model';
import { ApiAssertionsResultServer, Data } from 'src/app/model/trace.model';
import { MainService } from 'src/app/service/main.service';

@Component({
  selector: 'app-launch-dialog',
  templateUrl: './launch-dialog.component.html',
  styleUrls: ['./launch-dialog.component.scss']
})
export class LaunchDialogComponent implements OnInit {
  loginTypeEnum = LoginTypeEnum;

  hide: boolean = true;

  actualLoginForm = new FormGroup<LoginForm>({
    type: new FormControl<LoginTypeEnum>(null, Validators.required)
  });

  expectedLoginForm = new FormGroup<LoginForm>({
    type: new FormControl<LoginTypeEnum>(null, Validators.required)
  });

  actualLogin: ApiServerConfig;
  expectedLogin: ApiServerConfig;

  constructor(public dialogRef: MatDialogRef<LaunchDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Data,
              private _mainService: MainService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.actualLogin = this.data.environments.find(e => this.data.tableElements[0].result.actExecution.host.includes(e.serverConfig.host));
    this.actualLoginType.setValue(this.actualLogin.serverConfig.auth.type);
    if(this.actualLoginType.value === LoginTypeEnum.NOVA_BASIC || this.actualLoginType.value === LoginTypeEnum.BASIC) {
      this.actualLoginForm.addControl('username', new FormControl<string>('', Validators.required));
      this.actualLoginForm.addControl('password', new FormControl<string>('', Validators.required));
    }
    
    this.expectedLogin = this.data.environments.find(e => this.data.tableElements[0].result.expExecution.host.includes(e.serverConfig.host));
    this.expectedLoginType.setValue(this.expectedLogin.serverConfig.auth.type);
    if(this.expectedLoginType.value === LoginTypeEnum.NOVA_BASIC || this.expectedLoginType.value === LoginTypeEnum.BASIC) {
      this.expectedLoginForm.addControl('username', new FormControl<string>('', Validators.required));
      this.expectedLoginForm.addControl('password', new FormControl<string>('', Validators.required));
    } 
  }

  launch() {
    if(this.actualLoginForm.valid && this.expectedLoginForm.valid) {
      var configuration: Configuration = {refer: this.expectedLogin.serverConfig, target: this.actualLogin.serverConfig};
      configuration.refer.auth = {...configuration.refer.auth, username: this.expectedLoginUsername.value, password: this.actualLoginPassword.value};
      configuration.target.auth = {...configuration.target.auth, username: this.actualLoginUsername.value, password: this.actualLoginPassword.value};
      this._mainService.run(null, this.actualLogin.app, this.actualLogin.env, this.expectedLogin.env, this.data.tableElements.map(t => t.request.id), null, configuration)
        .subscribe({
          next: res => {
            this.dialogRef.close();
            this.router.navigate(['home/trace'], {relativeTo: this.activatedRoute, queryParams: {id: res}});
            
          }
      });
    }
  }

  get actualLoginType(): AbstractControl<LoginTypeEnum> {
    return this.actualLoginForm.get('type');
  }

  get actualLoginUsername(): AbstractControl<string> {
    return this.actualLoginForm.get('username');
  }

  get actualLoginPassword(): AbstractControl<string> {
    return this.actualLoginForm.get('password');
  }

  get expectedLoginType(): AbstractControl<LoginTypeEnum> {
    return this.expectedLoginForm.get('type');
  }

  get expectedLoginUsername(): AbstractControl<string> {
    return this.expectedLoginForm.get('username');
  }

  get expectedLoginPassword(): AbstractControl<string> {
    return this.expectedLoginForm.get('password');
  }
}
