import z from 'zod';
import stripHtml from '../utils/stripHtml.js';

const suggestSeverityValidationSchema = z.object({
  title: z
    .string('Title is required')
    .min(1, 'Title is too short, must be at least 1 characters')
    .max(100, 'Title is too long, must not exceed 100 characters'),

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
});

export default suggestSeverityValidationSchema;
