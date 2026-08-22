import type {
  CreateProjectRiskDto,
  ProjectRiskDetailDto,
  ProjectRiskListResponseDto,
  UpdateProjectRiskDto,
} from 'src/app/core/api/api-client/models';
import type { PagedRisks, ProjectRisk, RiskRefDataMap } from '../domain';
import {
  RISK_CATEGORIES,
  RISK_PROBABILITIES,
  RISK_SEVERITIES,
  RISK_STATUSES,
  RiskRefData,
} from '../domain';

export function mapRiskDto(dto: ProjectRiskDetailDto): ProjectRisk {
  return { ...dto };
}

/** The risk list is returned whole; paging is applied by the caller. */
export function mapRiskList(dto: ProjectRiskListResponseDto): PagedRisks {
  return {
    content: (dto.items ?? []).map(mapRiskDto),
    totalSize: dto.total ?? 0,
  };
}

export function mapToCreateRisk(data: Partial<ProjectRisk>): CreateProjectRiskDto {
  return {
    title: String(data.title ?? ''),
    description: data.description ?? undefined,
    category: (data.category ?? 'OTHER') as CreateProjectRiskDto['category'],
    probability: (data.probability ?? 'MEDIUM') as CreateProjectRiskDto['probability'],
    severity: (data.severity ?? 'MEDIUM') as CreateProjectRiskDto['severity'],
    identifiedDate: String(data.identifiedDate ?? new Date().toISOString().slice(0, 10)),
    impact: data.impact ?? undefined,
    mitigationPlan: data.mitigationPlan ?? undefined,
    ownerId: data.ownerId ?? undefined,
  };
}

/** Category, impact and identified date are fixed once the risk is logged. */
export function mapToUpdateRisk(data: Partial<ProjectRisk>): UpdateProjectRiskDto {
  return {
    title: data.title,
    status: data.status as UpdateProjectRiskDto['status'],
    probability: data.probability as UpdateProjectRiskDto['probability'],
    severity: data.severity as UpdateProjectRiskDto['severity'],
    mitigationPlan: data.mitigationPlan ?? undefined,
  };
}

export function riskRefData(): RiskRefDataMap {
  return {
    [RiskRefData.refDataKey.statuses]: RISK_STATUSES,
    [RiskRefData.refDataKey.severities]: RISK_SEVERITIES,
    [RiskRefData.refDataKey.probabilities]: RISK_PROBABILITIES,
    [RiskRefData.refDataKey.categories]: RISK_CATEGORIES,
  };
}
