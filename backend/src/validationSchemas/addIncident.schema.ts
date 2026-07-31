import z from 'zod';
import stripHtml from '../utils/stripHtml.js';

export const addIncidentValidationSchema = z.object({
  title: z
    .string('Title is required')
    .min(1, 'Title is too short, must be at least 1 characters')
    .max(100, 'Title is too long, must not exceed 100 characters'),
  incidentId: z
    .string('Incident ID is missing')
    .startsWith('INC', 'Invalid Incident ID')
    .nonoptional(),
  description: z
    .string('Description must be a string')
    .nullish()
    .transform((val) => (!val || stripHtml(val).length === 0 ? null : val))
    .pipe(
      z
        .string()
        .refine(
          (val) => {
            const textContent = stripHtml(val);
            return textContent.length >= 5;
          },
          {
            message: 'Description content is too short, must be at least 5 characters',
          },
        )
        .refine(
          (val) => {
            const textContent = stripHtml(val);
            return textContent.length <= 500;
          },
          {
            message: 'Description content is too long, must not exceed 500 characters',
          },
        )
        .nullable(),
    ),
  service: z
    .string('Service must be a string')
    .min(1, 'Service name must be at least 1 characters')
    .max(100, 'Service name must not exceed 100 characters')
    .nullish(),

  severity: z
    .enum(
      ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      'Severity must be one of the following: LOW, MEDIUM, HIGH, or CRITICAL',
    )
    .optional(),

  status: z
    .enum(
      ['OPEN', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      'Status must be one of the following: OPEN, INVESTIGATING, IN_PROGRESS, RESOLVED, CLOSED',
    )
    .optional(),

  assignee: z
    .string('Assignee must be a string')
    .min(1, 'Assignee name must be at least 1 character')
    .max(100, 'Assignee name must not exceed 100 characters')
    .nullish(),
});
