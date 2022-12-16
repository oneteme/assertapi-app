import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { filter, finalize } from 'rxjs';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { ApiRequest, ApiRequestServer, AssertionConfig } from 'src/app/model/request.model';
import { RequestService } from 'src/app/service/request.service';

@Component({
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss']
})
export class AddDialogComponent implements OnInit {

  isUpdate: boolean;

  envs: Array<{name: string, value: string}>;
  apps: Array<{name: string, value: string}>;

  formGroup = new UntypedFormGroup({
    method: new UntypedFormControl('', Validators.required),
    uri: new UntypedFormControl('', [Validators.required]),
    name: new UntypedFormControl('', Validators.required),
    description: new UntypedFormControl('', Validators.required),
    app: new UntypedFormControl('', Validators.required),
    envs: new UntypedFormControl('', Validators.required),
    headers: new UntypedFormControl(null),
    body: new UntypedFormControl(null)
  });

  constructor(
    public dialogRef: MatDialogRef<AddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data,
    private _service: RequestService,
  ) {
    this.apps = Array.from(new Set(data.environments.map(d => d.app))).map(a => ({name: a, value: a}));
  }

  ngOnInit(): void {
    
    this.app.valueChanges.pipe(
      filter((form: any) => form)
    ).subscribe({
      next: res => {
        this.envs = Array.from(new Set(this.data.environments.filter(d => d.app == res).map(d => d.env))).map(e => ({name: e, value: e}));
        this.selectedEnvs.setValue('');
      }
    });

    if(this.data.tableElement) {
      this.isUpdate = true;
      this.modelToForm(this.data.tableElement);
    }
  }

  add() {
    if(this.formGroup.valid) {
      var apiRequestServer = this.formToModel();
      if(this.isUpdate) {
        apiRequestServer.request.id = this.data.tableElement.request.id;
        this._service.updateRequest(apiRequestServer)
          .subscribe({
            next: () => this.dialogRef.close(apiRequestServer)
          });
      } else {
        this._service.putRequest(apiRequestServer)
          .subscribe({
            next: res => {
              apiRequestServer.request.id = res;
              this.dialogRef.close(apiRequestServer);
            }
          });
      }
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  formToModel(): ApiRequestServer {
    let model = new ApiRequestServer();
    model.request = new ApiRequest();
    model.request.method = this.method.value;
    model.request.uri = this.uri.value;
    model.request.name = this.name.value;
    model.request.description = this.description.value;
    model.request.body = this.body.value;
    model.request.configuration = new AssertionConfig();
    model.request.configuration.enable = true;
    model.requestGroupList = this.selectedEnvs.value.map((v: string) => ({'app': this.app.value, 'env': v}));
    return model;
  }

  modelToForm(data: ApiRequestServer) {
    this.method.setValue(data.request.method);
    this.uri.setValue(data.request.uri);
    this.name.setValue(data.request.name);
    this.description.setValue(data.request.description);
    this.body.setValue(data.request.body);
    this.app.setValue(data.requestGroupList[0].app);
    this.selectedEnvs.setValue(data.requestGroupList.map(r => r.env));
  }

  get method(): AbstractControl | null {
    return this.formGroup.get('method');
  }

  get uri(): AbstractControl | null {
    return this.formGroup.get('uri');
  }

  get name(): AbstractControl | null {
    return this.formGroup.get('name');
  }

  get description(): AbstractControl | null {
    return this.formGroup.get('description');
  }

  get app(): AbstractControl | null {
    return this.formGroup.get('app');
  }

  get selectedEnvs(): AbstractControl | null {
    return this.formGroup.get('envs');
  }

  get headers(): AbstractControl | null {
    return this.formGroup.get('headers');
  }

  get body(): AbstractControl | null {
    return this.formGroup.get('body');
  }
}

class Data {
  tableElement: ApiRequestServer;
  environments: Array<ApiServerConfig>;
}
