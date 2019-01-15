import { Component, OnInit } from '@angular/core';
import { DriveStore } from '../store/drive-store';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {

  constructor(public store: DriveStore) { }

  ngOnInit() {
    this.store.fetchFiles();
  }

  addFile() {
    this.store.addFile();
  }

  changeFold() {
    this.store.changeFold();
  }
}
