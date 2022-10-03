import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { ApiServerConfig } from 'src/app/model/environment.model';
import { ApiRequest, ApiRequestServer, AssertionConfig } from 'src/app/model/request.model';
import { AssertapiClientService } from 'src/app/service/assertapi-client.service';
import { RequestService } from 'src/app/service/request.service';

@Component({
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss']
})
export class AddDialogComponent implements OnInit {

  formGroup = new FormGroup({
    method: new FormControl('', Validators.required),
    uri: new FormControl('', [Validators.required]),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    app: new FormControl('', Validators.required),
    env: new FormControl('', Validators.required),
    headers: new FormControl(null),
    body: new FormControl(null)
  });

  constructor(
    public dialogRef: MatDialogRef<AddDialogComponent>,
    private _service: RequestService) { }

  ngOnInit(): void {
  }

  add() {
    if(this.formGroup.valid) {
      this._service.putRequest(this.formToModel())
        .pipe(finalize(() => this.dialogRef.close(this.formToModel())))
        .subscribe()
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
    model.metadata = {'app': this.app.value, 'env': this.env.value };
    return model;
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

  get env(): AbstractControl | null {
    return this.formGroup.get('env');
  }

  get headers(): AbstractControl | null {
    return this.formGroup.get('headers');
  }

  get body(): AbstractControl | null {
    return this.formGroup.get('body');
  }
}
