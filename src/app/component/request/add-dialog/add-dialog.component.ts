import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { filter, finalize } from 'rxjs';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { ApiRequest, ApiRequestServer, AssertionConfig } from 'src/app/model/request.model';
import { RequestService } from 'src/app/service/request.service';
import { TableElement } from '../request.component';

@Component({
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss']
})
export class AddDialogComponent implements OnInit {

  isUpdate: boolean;

  envs: Array<{name: string, value: string}>;
  apps: Array<{name: string, value: string}>;

  formGroup = new FormGroup({
    method: new FormControl('', Validators.required),
    uri: new FormControl('', [Validators.required]),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    app: new FormControl('', Validators.required),
    envs: new FormControl('', Validators.required),
    headers: new FormControl(null),
    body: new FormControl(null)
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
      (!this.isUpdate ? this._service.putRequest(apiRequestServer) : this._service.updateRequest(apiRequestServer))
        .pipe(finalize(() => this.dialogRef.close(apiRequestServer)))
        .subscribe();
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  formToModel(): ApiRequestServer {
    let model = new ApiRequestServer();
    model.request = new ApiRequest();
    model.request.id = this.data.tableElement?.id;
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

  modelToForm(data: TableElement) {
    this.method.setValue(data.method);
    this.uri.setValue(data.uri);
    this.name.setValue(data.name);
    this.description.setValue(data.description);
    this.body.setValue(data.body);
    this.app.setValue(data.app);
    this.selectedEnvs.setValue(data.envs);
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
  tableElement: TableElement;
  environments: Array<ApiServerConfig>;
}
