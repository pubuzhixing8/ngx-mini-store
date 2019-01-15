import { Component, OnInit, OnDestroy } from '@angular/core';
import { TasksStore, TaskInfo } from '../store/tasks-store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit, OnDestroy {

  addTaskTitle = '';

  editTask: TaskInfo;

  tasks$: Observable<TaskInfo[]>;

  projectMessage: string;

  unsubscribe$ = new Subject();

  constructor(public store: TasksStore) {
    this.tasks$ = this.store.select((state) => {
      return state.tasks;
    });
    // this.tasks$ = this.store.select<TaskInfo[]>('tasks');

    this.tasks$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((tasks) => {
        console.log('change tasks$');
      });

    this.store.select('project.detail.name')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((name: string) => {
        this.projectMessage = `project name is [${name || 'None'}]`;
      });
  }

  ngOnInit(): void {
    this.store.fetchTasks();
  }

  showTaskEdit(task: TaskInfo) {
    this.editTask = { ...task };
  }

  updateTask(task: TaskInfo) {
    if (!task.title) {
      return;
    }
    this.store.updateTask(task.id, task.title);
  }

  addTask(title: string) {
    if (title) {
      this.store.addTask(title);
      this.addTaskTitle = '';
    }
  }

  initializeProject() {
    this.store.initializeProjectDetail({
      id: 100,
      name: `ngx-mini-store`
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
