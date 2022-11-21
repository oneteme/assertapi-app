import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiRequest, ApiRequestServer, Configuration, Data } from 'src/app/model/request.model';
import { ApiAssertionsResult, ApiAssertionsResultServer } from 'src/app/model/trace.model';
import { MainService } from 'src/app/service/main.service';
import { environment } from 'src/environments/environment';
import { LaunchDialogService } from './launch-dialog.service';

@Component({
  templateUrl: './launch-dialog.component.html',
  styleUrls: ['./launch-dialog.component.scss']
})
export class LaunchDialogComponent implements OnInit, AfterViewInit {

  step: number = 1;

  assertionResults: Array<ApiAssertionsResultServer> = [];

  actualApp: string;
  actualEnv: string;
  expectedEnv: string;
  elements: Array<ApiRequestServer>;
  configuration: Configuration;

  constructor(
    public dialogRef: MatDialogRef<LaunchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data,
    private _service: MainService,
    private _launchDialogService: LaunchDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
  
  }

  onLaunch($event: any): void {
      // this.step = 3;
      if($event.actualApp) this.actualApp = $event.actualApp;
      if($event.actualEnv) this.actualEnv = $event.actualEnv;
      if($event.expectedEnv) this.expectedEnv = $event.expectedEnv;
      if($event.configuration) this.configuration = $event.configuration;

      // const eventSource = new EventSource(`${environment.server}/v1/assert/api/progress`);
      // let guidValue = null;
      // eventSource.addEventListener("GUI_ID", (event) => {
      //   guidValue = JSON.parse(event.data);
      //   console.log(`Guid from server: ${guidValue}`);
      //   eventSource.addEventListener(`start ${guidValue}`, (event) => {
      //     const request: ApiRequest = JSON.parse(event.data);
      //     const assertionResultServer = new ApiAssertionsResultServer();
      //     assertionResultServer.request = request;
      //     const index = this.assertionResults.findIndex(a => a.request.id == request.id);
      //     if(index != -1) {
      //       this.assertionResults.splice(index, 1, assertionResultServer)
      //     } else {
      //       this.assertionResults.push(assertionResultServer);
      //     }
      //     console.log("request", request, this.assertionResults);
      //     eventSource.addEventListener(`${request.id} end ${guidValue}`, (event) => {
      //       const result: ApiAssertionsResult = JSON.parse(event.data);
      //       assertionResultServer.result = result;
      //       console.log("result", result, this.assertionResults);
      //     });
      //   });
        
      //   var ids = $event.ids ? $event.ids :
      //     this.data.tableElements.length == 1 ? 
      //     [this.data.tableElements[0].request.id] : null;
      //   var disabledIds = $event.disabledIds;

      //   this._service.run(guidValue, this.actualApp, this.actualEnv, this.expectedEnv, ids, disabledIds, this.configuration)
      //     .subscribe({
      //       next: res => {
      //         console.log(res);
      //       }
      //     });
      // });

      // eventSource.onerror = (event) => {
      //   eventSource.close();
      // };
  
      // eventSource.onopen = () => {
      //   console.log("connection opened");
      // };
      var ids = $event.ids ? $event.ids :
        this.data.tableElements.length == 1 ? 
        [this.data.tableElements[0].request.id] : null;
      var disabledIds = $event.disabledIds;
      this._launchDialogService.launchDialog.next({
        actualApp: this.actualApp, 
        actualEnv: this.actualEnv,
        expectedEnv: this.expectedEnv,
        ids: ids,
        disabledIds: disabledIds,
        configuration: this.configuration
      });
      this.router.navigate(['home/result']).then(res => this.dialogRef.close());
  }

  onChoose($event: any) {
      this.step = 2;
      if($event.elements) this.elements = $event.elements;
      if($event.actualApp) this.actualApp = $event.actualApp;
      if($event.actualEnv) this.actualEnv = $event.actualEnv;
      if($event.expectedEnv) this.expectedEnv = $event.expectedEnv;
      if($event.configuration) this.configuration = $event.configuration;
  }
}


