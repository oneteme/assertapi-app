import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { ApiAssertionsResultServer, ApiExecution } from 'src/app/model/trace.model';

@Component({
  selector: 'app-comparator-dialog',
  templateUrl: './comparator-dialog.component.html',
  styleUrls: ['./comparator-dialog.component.scss']
})
export class ComparatorDialogComponent implements OnInit {

  options = {
    readOnly: true,
    scrollbar: {
      verticalScrollbarSize: 5,
		  horizontalScrollbarSize: 5,
    }
  };

  originalModel: DiffEditorModel;

  modifiedModel: DiffEditorModel;

  constructor(
    public dialogRef: MatDialogRef<ComparatorDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: ApiAssertionsResultServer
  ) {
    
  }

  ngOnInit(): void {
    this.originalModel = this.toCode(this.data.result.actExecution);
  
    this.modifiedModel = this.toCode(this.data.result.expExecution);
  }

  toCode(apiExecution: ApiExecution): DiffEditorModel {
    switch(this.data.result.step) {
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
          code: null,
          language: 'text/plain'
        };
      }
    }
  }
}
