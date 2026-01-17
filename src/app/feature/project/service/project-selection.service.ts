import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { ProjectService } from './project.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { Project } from '../model/project.model';
import { ProjectActivity } from '../model/activity.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { Validators } from '@angular/forms';

export interface ProjectSelectionResult {
    projectId: string;
    activityId: string;
    project: Project;
    activity: ProjectActivity;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectSelectionService {
    constructor(
        private projectService: ProjectService,
        private modalService: ModalService
    ) { }

    /**
     * Opens a modal to select a project and an activity.
     * Returns an Observable that emits the selected project and activity, or null if cancelled.
     */
    selectProject(): Observable<ProjectSelectionResult | null> {
        const selection$ = new Subject<ProjectSelectionResult | null>();

        this.projectService.fetchProjects().pipe(take(1)).subscribe(data => {
            const projects = data.content || [];

            const projectSearch: SearchAndAdvancedSearchModel = {
                normalSearchPlaceHolder: '',
                showOnlyAdvancedSearch: true,
                advancedSearch: {
                    buttonText: { search: 'Select', close: 'Close' },
                    title: 'Select Project & Activity',
                    searchFormFields: [
                        {
                            formControlName: 'projectId',
                            inputModel: {
                                html_id: 'project_search',
                                inputType: 'text',
                                tagName: 'input',
                                autocomplete: true,
                                placeholder: 'Select a project',
                                labelName: 'Project',
                                selectList: projects.map(p => ({ key: p.id, displayValue: p.name } as KeyValue))
                            }
                        },
                        {
                            formControlName: 'activityId',
                            inputModel: {
                                html_id: 'activity_search',
                                inputType: 'text',
                                tagName: 'input',
                                autocomplete: true,
                                placeholder: 'Select an activity',
                                labelName: 'Activity',
                                selectList: []
                            },
                            validations: [Validators.required]
                        }
                    ]
                }
            };

            const modal = this.modalService.openComponentDialog(
                SearchAndAdvancedSearchFormComponent,
                projectSearch,
                {
                    height: 300,
                    width: 700,
                    disableClose: true
                }
            );

            // Handle project selection change to load activities
            modal.componentInstance.searchformGroup.get('projectId')?.valueChanges.subscribe(projId => {
                if (projId) {
                    this.projectService.fetchProjectActivities(projId).pipe(take(1)).subscribe(activityData => {
                        const activities = activityData.content || [];
                        const activityField = projectSearch.advancedSearch?.searchFormFields.find(f => f.inputModel.html_id === 'activity_search');
                        if (activityField) {
                            activityField.inputModel.selectList = activities.map(a => ({ key: a.id, displayValue: a.name } as KeyValue));
                        }
                    });
                } else {
                    const activityField = projectSearch.advancedSearch?.searchFormFields.find(f => f.inputModel.html_id === 'activity_search');
                    if (activityField) {
                        activityField.inputModel.selectList = [];
                    }
                }
            });

            // Handle modal search event
            modal.componentInstance.onSearch.pipe(take(1)).subscribe(searchEvent => {
                if (searchEvent.reset) {
                    modal.close();
                    selection$.next(null);
                    selection$.complete();
                } else {
                    const formValues = modal.componentInstance.searchformGroup.value;
                    modal.close();

                    const projectId = formValues.projectId;
                    const activityId = formValues.activityId;

                    const project = projects.find(p => p.id === projectId);

                    if (project) {
                        // Fetch activities again to get the full object or use a cached version if we had one
                        this.projectService.fetchProjectActivities(projectId).pipe(take(1)).subscribe(activityData => {
                            const activity = activityData.content?.find(a => a.id === activityId);
                            if (activity) {
                                selection$.next({
                                    projectId,
                                    activityId,
                                    project,
                                    activity
                                });
                            } else {
                                selection$.next(null);
                            }
                            selection$.complete();
                        });
                    } else {
                        selection$.next(null);
                        selection$.complete();
                    }
                }
            });
        });

        return selection$.asObservable();
    }
}
