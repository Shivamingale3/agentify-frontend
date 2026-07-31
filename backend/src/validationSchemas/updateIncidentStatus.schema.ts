import z from 'zod';

const updateIncidentStatusValidationSchema = z.object({
  incidentId: z.string('Incident ID is required').nonempty('Incident ID is required').trim(),
  status: z.enum(
    ['OPEN', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    'Incident must be one of the following: OPEN, INVESTIGATING, IN_PROGRESS, RESOLVED, CLOSED',
  ),
});

export default updateIncidentStatusValidationSchema;
