import z from 'zod';

const getIncidentByIdValidationSchema = z.object({
  id: z.string('ID must be string').nonoptional(),
});
export default getIncidentByIdValidationSchema;
