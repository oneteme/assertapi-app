import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanelHeader } from '@angular/material/expansion';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { ApiRequest, ApiRequestServer } from 'src/app/model/request.model';
import { AssertionResultServer, RequestExecution, ApiResponseServer, ComparatorData, ResponseComparator } from 'src/app/model/trace.model';

@Component({
  selector: 'app-comparator',
  templateUrl: './comparator.component.html',
  styleUrls: ['./comparator.component.scss']
})
export class ComparatorDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('requestPanelHeader', { static: false }) requestPanelHeader: MatExpansionPanelHeader;

  editorOptions = {
    language: 'json',
    readOnly: true,
    scrollBeyondLastLine: false,
    scrollbar: {
      verticalScrollbarSize: 5,
      horizontalScrollbarSize: 5
    }
  };

  options = {
    readOnly: true,
    scrollBeyondLastLine: false,
    scrollbar: {
      verticalScrollbarSize: 5,
      horizontalScrollbarSize: 5,
    }
  };

  request: ApiRequest;

  originalModel: DiffEditorModel;
  modifiedModel: DiffEditorModel;

  constructor(
    public dialogRef: MatDialogRef<ComparatorDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: ComparatorData
  ) { }

  ngOnInit(): void {
    this.request = this.data.request;
    this.request.body = JSON.stringify(JSON.parse(this.data.responseComparator.exp.response), null, 1);
    this.request.headers = JSON.parse(this.data.responseComparator.exp.response);
    this.originalModel = this.toCode(this.data.responseComparator.act);
    this.modifiedModel = this.toCode(this.data.responseComparator.exp);
  }

  ngAfterViewInit(): void {
    this.requestPanelHeader.focus('mouse');
  }

  toCode(apiResponseServer: ApiResponseServer): DiffEditorModel {
    switch (this.data.responseComparator.step) {
      case 'HTTP_CODE': {
        return {
          code: apiResponseServer.statusCode.toString(),
          language: 'text/plain'
        };
      }
      case 'CONTENT_TYPE': {
        return {
          code: apiResponseServer.contentType,
          language: 'text/plain'
        };
      }
      case 'RESPONSE_CONTENT': {
        return {
          code: JSON.stringify(JSON.parse(apiResponseServer.response), null, 1),
          language: 'json'
        };
      }
      default: {
        return {
          code: JSON.stringify(JSON.parse(apiResponseServer.response), null, 1),
          language: 'json'
        };
      }
    }
  }
}
