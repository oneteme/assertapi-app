import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RequestComponent } from './component/request/request.component';
import { TraceComponent } from './component/trace/trace.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button'; 
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu'; 
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { RemoveDialogComponent as RemoveDialogEnvironmentComponent} from './component/environment/remove-dialog/remove-dialog.component'; 
import { RemoveDialogComponent as RemoveDialogRequestComponent} from './component/request/remove-dialog/remove-dialog.component'; 
import { MatDialogModule } from '@angular/material/dialog';
import { EnvironmentComponent } from './component/environment/environment.component';
import { AddDialogComponent as  AddDialogEnvironmentComponent} from './component/environment/add-dialog/add-dialog.component';
import { AddDialogComponent as  AddDialogRequestComponent } from './component/request/add-dialog/add-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';  
import { DefaultValueAccessor, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { LaunchDialogComponent } from './component/request/launch-dialog/launch-dialog.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    RequestComponent,
    TraceComponent,
    RemoveDialogEnvironmentComponent,
    RemoveDialogRequestComponent,
    EnvironmentComponent,
    AddDialogEnvironmentComponent,
    AddDialogRequestComponent,
    LaunchDialogComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    DragDropModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatTooltipModule,
    MatToolbarModule, 
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    try {
      const original = DefaultValueAccessor.prototype.registerOnChange;

      DefaultValueAccessor.prototype.registerOnChange = function (fn) {
        return original.call(this, value => {
          const trimmed = typeof value === 'string' ? value.trim() : value;
          return fn(trimmed);
        });
      }
      registerLocaleData(localeFr, 'fr-FR', localeFrExtra);
    } catch (e) {
      console.error("Error while setting Date.prototype.toJSON :", e);
    }
  }
}
