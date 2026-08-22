import type { PagedWorkflowRequest } from '../domain';
import type { RequestListQuery } from './request-data.source';
import {
  mapPagedRequestDto,
  type WorkflowRequestDto,
} from './request-data.mapper';

export interface WorkflowRequestPageDto {
  items?: WorkflowRequestDto[];
  content?: WorkflowRequestDto[];
  total?: number;
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

/**
 * Applies the client-side portion of request list processing.
 * Both API and demo sources use this so mock mode cannot drift from live mode.
 */
export function mapRequestPageResponse(
  payload: WorkflowRequestPageDto,
  query: RequestListQuery,
): PagedWorkflowRequest {
  const page = mapPagedRequestDto(payload);
  const requestId = query.criteria?.requestId?.trim().toLowerCase();
  const search = query.searchText?.trim().toLowerCase();
  let content = page.content ?? [];

  if (requestId) {
    content = content.filter(item => item.id.toLowerCase().includes(requestId));
  }
  if (search) {
    content = content.filter(item =>
      item.id.toLowerCase().includes(search)
      || item.name.toLowerCase().includes(search)
      || item.type.toLowerCase().includes(search)
      || item.definitionId.toLowerCase().includes(search)
      || (item.executorInstructions ?? '').toLowerCase().includes(search));
  }

  return {
    ...page,
    content,
    totalSize: requestId || search ? content.length : page.totalSize,
    pageIndex: query.pageIndex,
    pageSize: query.pageSize,
  };
}
