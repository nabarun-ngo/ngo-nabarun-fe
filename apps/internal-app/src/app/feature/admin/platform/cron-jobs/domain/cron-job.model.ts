export interface AdminCronJob {
  name: string;
  handler: string;
  description: string;
  expression: string;
  readableExpression: string;
  enabled: boolean;
  nextRun?: string;
  inputData?: Record<string, unknown>;
}

export interface CronJobContext {
  refData: Record<string, unknown>;
}

export interface CreateCronJobInput {
  name: string;
  handler: string;
  description: string;
  expression: string;
  enabled?: boolean;
  inputData?: Record<string, unknown>;
}

export interface UpdateCronJobInput {
  handler?: string;
  description?: string;
  expression?: string;
  enabled?: boolean;
  inputData?: Record<string, unknown>;
}
