import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ApiServerConfig, ServerConfig } from 'src/app/model/environment.model';
import { AssertapiClientService } from 'src/app/service/assertapi-client.service';
import { EnvironmentService } from 'src/app/service/environment.service';

@Component({
  selector: 'app-add-dialog',
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss']
})
export class AddDialogComponent implements OnInit {
  formGroup = new FormGroup({
    host: new FormControl('', Validators.required),
    port: new FormControl('443', [Validators.required, Validators.pattern('[0-9]*')]),
    methodAuth: new FormControl(''),
    env: new FormControl('', Validators.required),
    app: new FormControl('', Validators.required)
  });

  constructor(
    public dialogRef: MatDialogRef<AddDialogComponent>, 
    private _service: EnvironmentService
  ) { }

  ngOnInit(): void {
    this.methodAuth.valueChanges.subscribe(
      res => {
        if(res === "NOVA_BASIC") {
          this.formGroup.addControl("hostAuth", new FormControl('', Validators.required));
        } else {
          this.formGroup.removeControl("hostAuth");
        }
      }
    )
  }

  add() {
    if(this.formGroup.valid) {
      this._service.putEnvironment(this.formToModel())
        .pipe(finalize(() => this.dialogRef.close(this.formToModel())))
        .subscribe()
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
