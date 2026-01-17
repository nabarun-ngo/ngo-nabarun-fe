import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { ProjectConstant, ProjectDefaultValue } from '../../project.const';
import { Project, PagedProject } from '../../model/project.model';
import { getProjectSection } from '../../fields/project.field';
import { Accordion } from 'src/app/shared/utils/accordion';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { ProjectService } from '../../service/project.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { compareObjects, removeNullFields } from 'src/app/core/service/utilities.service';
import { User } from 'src/app/feature/member/models/member.model';

@Component({
  selector: 'app-project-list-tab',
  templateUrl: './project-list-tab.component.html',
  styleUrls: ['./project-list-tab.component.scss']
})
export class ProjectListTabComponent extends Accordion<Project> implements TabComponentInterface<PagedProject> {

  @Input() managers: User[] | undefined;

  constructor(
    protected projectService: ProjectService,
    protected router: Router
  ) {
    super();
  }

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: ProjectDefaultValue.pageNumber,
      pageSize: ProjectDefaultValue.pageSize,
      pageSizeOptions: ProjectDefaultValue.pageSizeOptions
    };
  }

  override onInitHook(): void {
    this.setHeaderRow([
      {
        value: 'Project Name',
        rounded: true
      },
      {
        value: 'Category',
        rounded: true
      },
      {
        value: 'Status',
        rounded: true
      },
      {
        value: 'Phase',
        rounded: true
      }
    ]);
  }

  protected override prepareHighLevelView(data: Project, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.name,
      },
      {
        type: 'text',
        value: data?.category,
        showDisplayValue: true,
        refDataSection: ProjectConstant.refDataKey.categories
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: ProjectConstant.refDataKey.statuses
      },
      {
        type: 'text',
        value: data?.phase,
        showDisplayValue: true,
        refDataSection: ProjectConstant.refDataKey.phases
      }
    ];
  }

  protected override activeButtonId: string = '';

  protected override prepareDefaultButtons(data: Project, options?: { [key: string]: any; }): AccordionButton[] {
    const isCreate = options && options['create'];
    if (isCreate) {
      return [
        {
          button_id: 'CANCEL_CREATE',
          button_name: 'Cancel'
        },
        {
          button_id: 'CONFIRM_CREATE',
          button_name: 'Confirm'
        }
      ];
    }
    return [
      {
        button_id: 'VIEW_ACTIVITIES',
        button_name: 'Add/View Activities'
      },
      {
        button_id: 'UPDATE_PROJECT',
        button_name: 'Update Project'
      }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'VIEW_ACTIVITIES') {
      const project = this.itemList[event.rowIndex];
      this.router.navigate(
        [
          AppRoute.secured_project_activities_page.url.replace(
            ':id',
            btoa(project.id)
          ),
        ],
        { state: project }
      );
    } else if (event.buttonId === 'UPDATE_PROJECT') {
      this.showEditForm(event.rowIndex, ['project_detail']);
      this.activeButtonId = event.buttonId;
    } else if (event.buttonId === 'CANCEL') {
      this.hideForm(event.rowIndex);
    } else if (event.buttonId === 'CONFIRM') {
      if (this.activeButtonId === 'UPDATE_PROJECT') {
        this.performUpdateProject(event.rowIndex);
      }
    } else if (event.buttonId === 'CANCEL_CREATE') {
      this.hideForm(0, true);
    } else if (event.buttonId === 'CONFIRM_CREATE') {
      this.performCreateProject();
    }
  }

  initCreateProjectForm(): void {
    this.showCreateForm();
  }

  private performCreateProject(): void {
    const projectForm = this.getSectionForm('project_detail', 0, true);
    projectForm?.markAllAsTouched();
    if (projectForm?.valid) {
      this.projectService.createProject(removeNullFields(projectForm.value)).subscribe((data) => {
        this.hideForm(0, true);
        this.addContentRow(data, true);
      });
    }
  }

  private performUpdateProject(rowIndex: number): void {
    const project = this.itemList[rowIndex];
    const projectForm = this.getSectionForm('project_detail', rowIndex);
    projectForm?.markAllAsTouched();
    if (projectForm?.valid) {
      const updatedProject = compareObjects(projectForm.value, project);
      this.projectService.updateProject(project.id, updatedProject).subscribe((data) => {
        this.hideForm(rowIndex);
        this.updateContentRow(data, rowIndex);
      });
    }
  }

  protected override prepareDetailedView(data: Project, options?: { [key: string]: any; }): DetailedView[] {
    return [
      getProjectSection(
        data,
        this.getRefData({ isActive: true }) || {},
        this.managers ?? [],
        options && options['create']
      ),
    ];
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    // TODO: Load additional data when accordion opens (e.g., activities, documents)
    console.log('Accordion opened for project:', this.itemList[event.rowIndex]);
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.projectService.fetchProjects(
      $event.pageIndex,
      $event.pageSize
    ).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    });
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch) {
      // TODO: Implement advanced search
      this.projectService.fetchProjects().subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
    else if ($event.reset) {
      this.projectService.fetchProjects().subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
  }

  loadData(): void {
    this.projectService.fetchProjects(
      ProjectDefaultValue.pageNumber,
      ProjectDefaultValue.pageSize
    ).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    });
  }
}
