import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { first } from 'rxjs';
import { MonacoEditorService } from 'src/app/service/monaco-editor.service';

@Component({
  selector: 'app-comparator-dialog',
  templateUrl: './comparator-dialog.component.html',
  styleUrls: ['./comparator-dialog.component.scss']
})
export class ComparatorDialogComponent implements OnInit, AfterViewInit {

  public _editor: any;

  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

  constructor(public dialogRef: MatDialogRef<ComparatorDialogComponent>, public monacoEditorService: MonacoEditorService) {
    // monacoEditorService.load();
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    // this.initMonaco();

    
  }

  initMonaco() {
    // console.log("before")
    // if(!this.monacoEditorService.loaded) {
    //   this.monacoEditorService.loadingFinished.pipe(first()).subscribe(() => {
    //     this.initMonaco();
    //   });
    //   return;
    // }

    // console.log("after")
    // var originalModel = monaco.editor.createModel(
    //   'just some text\n\nHello World\n\nSome more text',
    //   'text/plain'
    // );
    // var modifiedModel = monaco.editor.createModel(
    //   'just some Text\n\nHello World\n\nSome more changes',
    //   'text/plain'
    // );
    // this._editor = monaco.editor.create(this._editorContainer.nativeElement);
    // var diffEditor = monaco.editor.createDiffEditor(document.getElementById('container'));
    // diffEditor.setModel({
    //   original: originalModel,
    //   modified: modifiedModel
    // });

    // var navi = monaco.editor.createDiffNavigator(diffEditor, {
    //   followsCaret: true, // resets the navigator state when the user selects something in the editor
    //   ignoreCharChanges: true // jump from line to line
    // });

    // window.setInterval(function () {
    //   navi.next();
    // }, 2000);
  }
}
