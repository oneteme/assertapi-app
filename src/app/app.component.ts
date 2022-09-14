import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiRequestServer } from './model/request.model';
import { ApiAssertionsResultServer } from './model/trace.model';
import { AssertapiServerService } from './service/assertapi-server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  templateSelected    : TemplateRef<any>;
  requests: Array<ApiRequestServer>;
  traces: Array<ApiAssertionsResultServer>;

  constructor(private _service: AssertapiServerService) { }

  ngOnInit(): void {
    this.getRequests();
    this.getTraces();
  }

  getRequests() {
    this._service.requests()
    .subscribe({
      next: res => {
        this.requests = res;
      }
    });
  }

  getTraces() {
    this._service.traces()
      .subscribe({
        next: res => {
          this.traces = res;
        }
      });
  }
}
