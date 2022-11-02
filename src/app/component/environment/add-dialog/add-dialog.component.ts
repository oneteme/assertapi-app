import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ApiServerConfig, ServerConfig } from 'src/app/model/environment.model';
import { EnvironmentService } from 'src/app/service/environment.service';

@Component({
  selector: 'app-add-dialog',
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss']
})
export class AddDialogComponent implements OnInit {
  isUpdate: boolean;

  formGroup = new UntypedFormGroup({
    host: new UntypedFormControl('', Validators.required),
    port: new UntypedFormControl('443', [Validators.required, Validators.pattern('[0-9]*')]),
    methodAuth: new UntypedFormControl(''),
    env: new UntypedFormControl('', Validators.required),
    app: new UntypedFormControl('', Validators.required)
  });

  constructor(
    public dialogRef: MatDialogRef<AddDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: ApiServerConfig,
    private _service: EnvironmentService
  ) { }

  ngOnInit(): void {
    this.methodAuth.valueChanges.subscribe(
      res => {
        if(res === "NOVA_BASIC") {
          this.formGroup.addControl("hostAuth", new UntypedFormControl('', Validators.required));
        } else {
          this.formGroup.removeControl("hostAuth");
        }
      }
    );
    if(this.data) {
      this.isUpdate = true;
      this.modelToForm(this.data);
    }
  }

  add() {
    if(this.formGroup.valid) {
      var apiServerConfig = this.formToModel();
      if(this.isUpdate) {
        apiServerConfig.id = this.data.id;
        this._service.updateEnvironment(apiServerConfig)
          .subscribe({
            next: () => {
              this.dialogRef.close(apiServerConfig)
            }
          });
      } else {
        this._service.putEnvironment(apiServerConfig)
          .subscribe({
            next: res => {
              apiServerConfig.id = res;
              this.dialogRef.close(apiServerConfig);
            }
          });
      }
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  formToModel(): ApiServerConfig {
    let model = new ApiServerConfig();
    model.app = this.app.value;
    model.env = this.env.value;
    model.serverConfig = new ServerConfig();
    model.serverConfig.host = this.host.value;
    model.serverConfig.port = this.port.value;
    if(this.methodAuth.value && this.methodAuth.value != "") {
      model.serverConfig.auth =  { type: this.methodAuth.value, 'access-token-url': this.hostAuth?.value };
    }
    return model;
  }

  modelToForm(data: ApiServerConfig) {
    this.host.setValue(data.serverConfig.host);
    this.port.setValue(data.serverConfig.port);
    this.methodAuth.setValue(data.serverConfig.auth.type);
    this.hostAuth.setValue(data.serverConfig.auth['access-token-url']);
    this.env.setValue(data.env);
    this.app.setValue(data.app);
  }

  get host(): AbstractControl | null {
    return this.formGroup.get('host');
  }

  get port(): AbstractControl | null {
    return this.formGroup.get('port');
  }

  get hostAuth(): AbstractControl | null {
    return this.formGroup.get('hostAuth');
  }

  get methodAuth(): AbstractControl | null {
    return this.formGroup.get('methodAuth');
  }

  get env(): AbstractControl | null {
    return this.formGroup.get('env');
  }

  get app(): AbstractControl | null {
    return this.formGroup.get('app');
  }
}
