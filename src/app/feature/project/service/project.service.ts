import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectControllerService, UserControllerService } from 'src/app/core/api-client/services';
import { PagedProject, Project } from '../model/project.model';
import { PagedActivity, ProjectActivity } from '../model/activity.model';
import { mapProjectDetailDtoToProject, mapPagedActivityDetailDtoToPagedActivity, mapPagedProjectDtoToPagedProjects, mapActivityDetailDtoToProjectActivity } from '../model/project.mapper';
import { ProjectRefDataDto } from 'src/app/core/api-client/models';
import { mapPagedUserDtoToPagedUser } from '../../member/models/member.mapper';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


  constructor(
    private projectController: ProjectControllerService,
    private userController: UserControllerService
  ) { }

  /**
   * Fetch projects with pagination
   * Note: API returns Array<ProjectDetailDto>, so we convert it to PagedProject
   */
  fetchProjects(
    page?: number,
    size?: number,
  ): Observable<PagedProject> {
    return this.projectController.listProjects({
      pageIndex: page,
      pageSize: size
    }).pipe(
      map((d) => d.responsePayload),
      map(mapPagedProjectDtoToPagedProjects)
    );
  }

  /**
   * Get project detail by ID
   */
  getProjectDetail(id: string): Observable<Project> {
    return this.projectController.getProjectById({ id }).pipe(
      map((d) => d.responsePayload),
      map(mapProjectDetailDtoToProject)
    );
  }

  /**
   * Fetch activities
   * Note: API may need projectId filter in future, currently lists all activities
   */
  fetchProjectActivities(
    projectId: string,
    page?: number,
    size?: number,
  ): Observable<PagedActivity> {
    return this.projectController.listActivities({
      pageIndex: page,
      pageSize: size,
      id: projectId
    }).pipe(
      map((d) => d.responsePayload),
      map(mapPagedActivityDetailDtoToPagedActivity)
    );
  }

  /**
   * Create a new project
   */
  createProject(projectData: Partial<Project>): Observable<Project> {
    return this.projectController.createProject({
      body: {
        code: projectData.code!,
        name: projectData.name!,
        description: projectData.description!,
        category: projectData.category!,
        budget: projectData.budget!,
        currency: projectData.currency || 'INR',
        startDate: projectData.startDate!,
        endDate: projectData.endDate,
        location: projectData.location,
        managerId: projectData.managerId!,
        sponsorId: projectData.sponsorId,
        status: projectData.status || 'PLANNING',
        phase: projectData.phase || 'INITIATION',
        tags: projectData.tags || [],
        targetBeneficiaryCount: projectData.targetBeneficiaryCount,
        metadata: projectData.metadata
      }
    }).pipe(
      map((d) => d.responsePayload),
      map(mapProjectDetailDtoToProject)
    );
  }

  /**
   * Update a project
   */
  updateProject(id: string, projectData: Partial<Project>): Observable<Project> {
    return this.projectController.updateProject({
      id: id,
      body: {
        name: projectData.name,
        description: projectData.description,
        category: projectData.category,
        budget: projectData.budget,
        endDate: projectData.endDate,
        location: projectData.location,
        sponsorId: projectData.sponsorId,
        status: projectData.status,
        phase: projectData.phase,
        tags: projectData.tags,
        targetBeneficiaryCount: projectData.targetBeneficiaryCount,
        metadata: projectData.metadata
      }
    }).pipe(
      map((d) => d.responsePayload),
      map(mapProjectDetailDtoToProject)
    );
  }

  /**
   * Create a new activity
   * TODO: Implement when API endpoint is available
   */
  createActivity(projectId: string, activityData: Partial<ProjectActivity>): Observable<ProjectActivity> {
    return this.projectController.createActivity({
      id: projectId,
      body: {
        name: activityData.name!,
        description: activityData.description,
        endDate: activityData.endDate,
        priority: activityData.priority!,
        scale: activityData.scale!,
        type: activityData.type!,
        assignedTo: activityData.assignedTo,
        organizerId: activityData.organizerId,
        parentActivityId: activityData.parentActivityId,
        tags: activityData.tags,
        startDate: activityData.startDate!,
        currency: activityData.currency!,
        estimatedCost: activityData.estimatedCost,
        expectedParticipants: activityData.expectedParticipants,
        location: activityData.location,
        venue: activityData.venue,
        metadata: activityData.metadata
      }

    }).pipe(
      map((d) => d.responsePayload),
      map(mapActivityDetailDtoToProjectActivity)
    );
  }

  /**
   * Update an activity
   * TODO: Implement when API endpoint is available
   */
  updateActivity(id: string, activityData: Partial<ProjectActivity>): Observable<ProjectActivity> {
    return this.projectController.updateActivity({
      id: id,
      activityId: id,
      body: {
        name: activityData.name!,
        description: activityData.description,
        endDate: activityData.endDate,
        priority: activityData.priority!,
        scale: activityData.scale!,
        type: activityData.type!,
        assignedTo: activityData.assignedTo,
        organizerId: activityData.organizerId,
        tags: activityData.tags,
        startDate: activityData.startDate!,
        currency: activityData.currency!,
        estimatedCost: activityData.estimatedCost,
        expectedParticipants: activityData.expectedParticipants,
        location: activityData.location,
        venue: activityData.venue,
        metadata: activityData.metadata,
        actualCost: activityData.actualCost,
        status: activityData.status
      }
    }).pipe(
      map((d) => d.responsePayload),
      map(mapActivityDetailDtoToProjectActivity)
    );
  }

  /**
   * Get reference data for projects
   * TODO: Implement when API endpoint is available
   */
  getRefData(): Observable<ProjectRefDataDto> {
    return this.projectController.getReferenceData_1().pipe(
      map((d) => d.responsePayload)
    );
  }

  getManagers() {
    return this.userController.listUsers({
      status: 'ACTIVE'
    }).pipe(
      map(m => m.responsePayload),
      map(mapPagedUserDtoToPagedUser),
      map(p => p.content)
    )
  }
}
