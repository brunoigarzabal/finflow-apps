import { httpClient } from '@/lib/httpClient'

import { RECURRING_RULES_ENDPOINTS } from './config'
import type {
  CancelRecurringOccurrenceBody,
  DeleteRecurringRuleBody,
  RecurringRuleListResponse,
  UpdateRecurringRuleBody,
  UpdateRecurringRuleResponse,
} from './types'

export const listRecurringRules = (): Promise<RecurringRuleListResponse> =>
  httpClient
    .authorized()
    .get(RECURRING_RULES_ENDPOINTS.list)
    .json<RecurringRuleListResponse>()

export const updateRecurringRule = (
  id: string,
  body: UpdateRecurringRuleBody
): Promise<UpdateRecurringRuleResponse> =>
  httpClient
    .authorized()
    .patch(RECURRING_RULES_ENDPOINTS.update(id), { json: body })
    .json<UpdateRecurringRuleResponse>()

export const cancelRecurringOccurrence = (
  id: string,
  body: CancelRecurringOccurrenceBody
): Promise<void> =>
  httpClient
    .authorized()
    .delete(RECURRING_RULES_ENDPOINTS.cancelOccurrence(id), { json: body })
    .then(() => undefined)

export const deleteRecurringRule = (
  id: string,
  body: DeleteRecurringRuleBody
): Promise<void> =>
  httpClient
    .authorized()
    .delete(RECURRING_RULES_ENDPOINTS.delete(id), { json: body })
    .then(() => undefined)
