import { db } from '../config/db.config.js';
import type {
  AddNewIncidentData,
  GetIncidentsByFilter,
  IncidentSeverityType,
  IncidentStatusType,
} from '../types/incident.types.js';
import { HttpException } from '../exceptions/http.exception.js';
import { logger } from '../utils/logger.js';
import { Prisma, type Incident } from '@prisma/client';
import { IncidentSeverity, IncidentStatus } from '../constants/incident.constants.js';
import type {
  GetIncidentsByFilterResponse,
  IncidentAiInsights,
} from '../interfaces/incident.interfaces.js';

export async function getIncidentById(id: string): Promise<Incident> {
  try {
    const incident = await db.incident.findUniqueOrThrow({
      where: { id },
    });
    return incident;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpException(404, 'Incident not found');
    }
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(
      `Error getting incident by ID: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to get incident by ID');
  }
}

export async function createNewIncident(incidentData: AddNewIncidentData): Promise<Incident> {
  try {
    if (!incidentData.title) {
      throw new HttpException(400, 'Incident title is required');
    }

    const existingIncident = await db.incident.findUnique({
      where: { incidentId: incidentData.incidentId },
      select: { id: true },
    });

    if (existingIncident) {
      throw new HttpException(409, 'Incident with this ID already exists');
    }

    const newIncident = await db.incident.create({
      data: {
        incidentId: incidentData.incidentId,
        title: incidentData.title,
        description: incidentData.description ?? null,
        service: incidentData.service ?? null,
        severity: incidentData.severity ?? IncidentSeverity.LOW,
        status: incidentData.status ?? IncidentStatus.OPEN,
        assignee: incidentData.assignee ?? null,
      },
    });

    return newIncident;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(
      `Error creating new incident: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to create new incident');
  }
}

export async function getAllIncidentsByFilter(
  filters: GetIncidentsByFilter,
): Promise<GetIncidentsByFilterResponse> {
  const { pageNo, pageSize, searchQuery, status, severity } = filters;
  const skip = (pageNo - 1) * pageSize;

  const conditions: Prisma.IncidentWhereInput[] = [];

  if (searchQuery) {
    const searchTerm = searchQuery.trim();
    conditions.push({
      OR: [{ title: { contains: searchTerm } }, { incidentId: { contains: searchTerm } }],
    });
  }

  if (status) {
    conditions.push({ status });
  }

  if (severity) {
    conditions.push({ severity });
  }

  const where: Prisma.IncidentWhereInput = conditions.length > 0 ? { AND: conditions } : {};

  try {
    const [incidents, total] = await Promise.all([
      db.incident.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.incident.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: incidents,
      page: pageNo,
      totalPages,
      total,
      pageSize,
    };
  } catch (error) {
    logger.error(
      `Error fetching incidents: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to fetch incidents');
  }
}

export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatusType,
): Promise<Incident> {
  try {
    if (!incidentId) {
      throw new HttpException(400, 'Incident ID is required');
    }

    await db.incident.findUniqueOrThrow({
      where: { id: incidentId },
      select: { incidentId: true },
    });

    const updatedIncident = await db.incident.update({
      where: { id: incidentId },
      data: { status },
    });

    return updatedIncident;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpException(404, 'Incident not found');
    }
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(
      `Error updating incident status: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to update incident status');
  }
}

export async function updateIncidentSeverity(
  incidentId: string,
  severity: IncidentSeverityType,
): Promise<Incident> {
  try {
    if (!incidentId) {
      throw new HttpException(400, 'Incident ID is required');
    }

    await db.incident.findUniqueOrThrow({
      where: { id: incidentId },
      select: { incidentId: true },
    });

    const updatedIncident = await db.incident.update({
      where: { id: incidentId },
      data: { severity },
    });

    return updatedIncident;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpException(404, 'Incident not found');
    }
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(
      `Error updating incident severity: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to update incident severity');
  }
}

export async function updateIncidentAiInsights(
  incidentId: string,
  aiInsights: IncidentAiInsights,
): Promise<Incident> {
  try {
    if (!incidentId) {
      throw new HttpException(400, 'Incident ID is required');
    }

    await db.incident.findUniqueOrThrow({
      where: { id: incidentId },
      select: { incidentId: true },
    });

    const updatedIncident = await db.incident.update({
      where: { id: incidentId },
      data: {
        summary: aiInsights.summary,
        possibleCauses: JSON.stringify(aiInsights.possibleCauses),
        recommendedActions: JSON.stringify(aiInsights.recommendedActions),
      },
    });

    return updatedIncident;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpException(404, 'Incident not found');
    }
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(
      `Error updating incident AI insights: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to update incident AI insights');
  }
}

export async function getCachedIncidentAiInsights(
  incidentId: string,
): Promise<IncidentAiInsights | null> {
  try {
    const incident = await db.incident.findUnique({
      where: { id: incidentId },
      select: {
        summary: true,
        possibleCauses: true,
        recommendedActions: true,
      },
    });

    if (!incident) {
      throw new HttpException(404, 'Incident not found');
    }

    if (
      incident.summary &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      incident.possibleCauses !== null &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      incident.recommendedActions != null
    ) {
      return {
        summary: incident.summary,
        possibleCauses: JSON.parse(incident.possibleCauses) as string[],
        recommendedActions: JSON.parse(incident.recommendedActions) as string[],
      };
    }

    return null;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(
      `Error getting incident AI insights: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to get incident AI insights');
  }
}

export async function getIncidentKpis(): Promise<{
  total: number;
  open: number;
  critical: number;
  resolved: number;
}> {
  try {
    const [total, open, critical, resolved] = await Promise.all([
      db.incident.count(),
      db.incident.count({ where: { status: IncidentStatus.OPEN } }),
      db.incident.count({ where: { severity: IncidentSeverity.CRITICAL } }),
      db.incident.count({ where: { status: IncidentStatus.RESOLVED } }),
    ]);
    return { total, open, critical, resolved };
  } catch (error) {
    logger.error(
      `Error getting incident KPIs: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new HttpException(500, 'Internal Server Error: Failed to get incident KPIs');
  }
}
