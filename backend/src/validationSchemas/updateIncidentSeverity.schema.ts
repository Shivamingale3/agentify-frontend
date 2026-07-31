import z from 'zod';

const updateIncidentSeverityValidationSchema = z.object({
  incidentId: z.string('Incident ID is required').nonempty('Incident ID is required').trim(),
  severity: z.enum(
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    'Incident must be one of the following: LOW, MEDIUM, HIGH, CRITICAL',
  ),
});

export default updateIncidentSeverityValidationSchema;
