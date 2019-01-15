import { Component, OnInit } from '@angular/core';
import { DriveStore, DriveState } from '../store/drive-store';

@Component({
  selector: 'app-bread-crumb',
  templateUrl: './bread-crumb.component.html',
  styleUrls: ['./bread-crumb.component.css']
})
export class BreadCrumbComponent implements OnInit {

  constructor(public store: DriveStore) { }

  ngOnInit() {
    this.store.select((state: DriveState) => {
      return state.parentFolds;
    }).subscribe((data) => {
      console.log(`导航接到通知：`);
      console.log(data);
    });
  }

}
