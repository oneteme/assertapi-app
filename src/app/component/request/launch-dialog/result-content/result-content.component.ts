import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { ApiRequestServer } from 'src/app/model/request.model';
import { ApiAssertionsResult, ApiAssertionsResultServer, ApiExecution } from 'src/app/model/trace.model';

const STATUS: { [key: string]: Object } = {
  OK: {
    color: 'green',
    icon: 'done'
  },
  KO: {
    color: 'gold',
    icon: 'report'
  },
  SKIP: {
    color: 'black',
    icon: 'block'
  },
  FAIL: {
    color: 'red',
    icon: 'report'
  }
}

@Component({
  selector: 'app-result-content',
  templateUrl: './result-content.component.html',
  styleUrls: ['./result-content.component.scss']
})
export class ResultContentComponent implements OnInit {

  private _assertionResults: Array<ApiAssertionsResultServer>;

  @Input() set assertionResults(value: Array<ApiAssertionsResultServer>) {
    if(value) {
      this._assertionResults = value;
      console.log(this._assertionResults);
    }
  }

  get assertionResults(): Array<ApiAssertionsResultServer> {
    return this._assertionResults;
  }

  @Output() onLaunch = new EventEmitter<any>();

  options = {
    readOnly: true,
    scrollbar: {
      verticalScrollbarSize: 5,
		  horizontalScrollbarSize: 5,
    }
  };

  originalModel: DiffEditorModel;

  modifiedModel: DiffEditorModel;

  status = STATUS;
  selectedIndex: number;

  selection = new SelectionModel<ApiAssertionsResultServer>(true, []);

  constructor() { }

  ngOnInit(): void {
  }

  result(result: ApiAssertionsResult) {
    if(result) {
      this.originalModel = this.toCode(result.actExecution, result.step);
      this.modifiedModel = this.toCode(result.expExecution, result.step);
      this.selectedIndex = result.id;
    }
  }

  launch() {
    this.onLaunch.emit({ids: this.selection.selected.map(s => s.request.id)});
  }

  toCode(apiExecution: ApiExecution, step: string): DiffEditorModel {
    switch(step) {
      case 'HTTP_CODE' : {
        return {
          code: apiExecution.statusCode.toString(),
          language: 'text/plain'
        };
      }
      case 'CONTENT_TYPE' : {
        return {
          code: apiExecution.contentType,
          language: 'text/plain'
        };
      }
      case 'RESPONSE_CONTENT' : {
        return {
          code: JSON.stringify(JSON.parse(apiExecution.response), null, 1),
          language: 'json'
        };
      }
      default : {
        return {
          code: JSON.stringify(JSON.parse(apiExecution.response), null, 1),
          language: 'json'
        };
      }
    }
  }

}
