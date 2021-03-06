import { Store, Action } from 'packages/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RootContainer } from 'packages/store/src/root_container';
import { HttpClient } from '@angular/common/http';
import { Optional, Inject, Injector } from '@angular/core';
import { DriveStore } from './drive-store';

export interface TaskInfo {
    id: number;
    title: string;
}

export interface ProjectInfo {
    id?: number;
    name?: string;
}

interface TasksState {

    tasks: TaskInfo[];

    project: {
        detail: ProjectInfo,
        views: {
            id: number,
            name: string
        }[]
    };
}

export class TasksStore extends Store<TasksState> {

    getInitialState(): TasksState {
        return {
            tasks: [],
            project: null
        };
    }

    constructor(
        @Inject(Injector)
        _injector: Injector,
        private driveStore: DriveStore) {
        super(_injector);
    }


    private getTaskNewId(): number {
        const maxTaskId = (this.snapshot.tasks || []).reduce((maxId, task) => {
            if (task.id > maxId) {
                return task.id;
            } else {
                return maxId;
            }
        }, 0);
        return maxTaskId + 1;
    }

    @Action()
    fetchTasks() {
        const apiMockTasks: TaskInfo[] = [
            { id: 1, title: 'Todo 1' },
            { id: 2, title: 'Todo 2' }
        ];
        return of(apiMockTasks)
            .pipe(tap((tasks) => {
                this.snapshot.tasks = tasks;
                this.next();
            }));
    }

    @Action()
    addTask(title: string) {
        return of({ id: this.getTaskNewId(), title: title }).pipe(tap((task) => {
            const state = this.snapshot;
            // state.tasks = [...state.tasks, task];
            state.tasks.push(task);
            this.next(state);
        }));
    }

    @Action()
    updateTask(taskId: number, title: string) {
        const updatedTask = this.snapshot.tasks.find((task) => {
            return task.id === taskId;
        });
        if (updatedTask) {
            updatedTask.title = title;
        }
    }

    @Action()
    initializeProjectDetail(project: ProjectInfo) {
        this.snapshot.project = { detail: project, views: [] };
        this.next();
    }
}
