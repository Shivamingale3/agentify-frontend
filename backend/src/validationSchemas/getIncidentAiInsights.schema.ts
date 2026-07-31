import z from 'zod';

const getIncidentAiInsightsSchema = z.object({
  incidentId: z.string().nonoptional('Incident ID is required'),
});

export default getIncidentAiInsightsSchema;
