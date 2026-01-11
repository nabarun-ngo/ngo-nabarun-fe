import { ProjectDetailDto, ActivityDetailDto, PagedResultActivityDetailDto, PagedResultProjectDetailDto } from "src/app/core/api-client/models";
import { Project, PagedProject } from "./project.model";
import { ProjectActivity, PagedActivity } from "./activity.model";
import { mapPagedResult } from "src/app/shared/model/paged-result.model";

/**
 * Map API ProjectDetailDto to domain Project
 */
export function mapProjectDetailDtoToProject(dto: ProjectDetailDto): Project {
    return {
        id: dto.id,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        phase: dto.phase,
        status: dto.status,
        budget: dto.budget ?? 0,
        spentAmount: dto.spentAmount ?? 0,
        currency: dto.currency,
        startDate: dto.startDate,
        endDate: dto.endDate,
        actualEndDate: dto.actualEndDate,
        location: dto.location,
        managerId: dto.managerId,
        sponsorId: dto.sponsorId,
        targetBeneficiaryCount: dto.targetBeneficiaryCount,
        actualBeneficiaryCount: dto.actualBeneficiaryCount,
        tags: dto.tags || [],
        metadata: dto.metadata,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

export function mapPagedProjectDtoToPagedProjects(dto: PagedResultProjectDetailDto): PagedProject {
    return mapPagedResult(dto, mapProjectDetailDtoToProject);
}

/**
 * Map API ActivityDetailDto to domain ProjectActivity
 */
export function mapActivityDetailDtoToProjectActivity(dto: ActivityDetailDto): ProjectActivity {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        projectId: dto.projectId,
        type: dto.type,
        scale: dto.scale,
        priority: dto.priority,
        status: dto.status,
        startDate: dto.startDate,
        endDate: dto.endDate,
        actualStartDate: dto.actualStartDate,
        actualEndDate: dto.actualEndDate,
        location: dto.location,
        venue: dto.venue,
        estimatedCost: dto.estimatedCost,
        actualCost: dto.actualCost,
        currency: dto.currency,
        expectedParticipants: dto.expectedParticipants,
        actualParticipants: dto.actualParticipants,
        assignedTo: dto.assignedTo,
        organizerId: dto.organizerId,
        parentActivityId: dto.parentActivityId,
        tags: dto.tags || [],
        metadata: dto.metadata,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

/**
 * Map API PagedResultActivityDetailDto to domain PagedActivity
 */
export function mapPagedActivityDetailDtoToPagedActivity(dto: PagedResultActivityDetailDto): PagedActivity {
    return mapPagedResult(dto, mapActivityDetailDtoToProjectActivity);
}
