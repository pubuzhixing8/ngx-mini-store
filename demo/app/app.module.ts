import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxMiniStoreModule, ReduxDevtoolsPluginModule } from 'packages/store';
import { TasksStore } from './store/tasks-store';
import { TasksComponent } from './tasks/tasks.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileListComponent } from './file-list/file-list.component';
import { BreadCrumbComponent } from './bread-crumb/bread-crumb.component';
import { OperateComponent } from './operate/operate.component';
import { DriveStore } from './store/drive-store';
@NgModule({
  declarations: [
    AppComponent,
    TasksComponent,
    FileListComponent,
    BreadCrumbComponent,
    OperateComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgxMiniStoreModule.forRoot([
      TasksStore,
      DriveStore
    ]),
    ReduxDevtoolsPluginModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
