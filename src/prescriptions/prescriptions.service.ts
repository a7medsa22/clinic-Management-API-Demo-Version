import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async createPrescription(
    doctorId: string,
    connectionId: string,
    dto: CreatePrescriptionDto,
  ) {
    const connection = await this.prisma.doctorPatientConnection.findUnique({
      where: { id: connectionId },
      include: {
        ...this.patientInclude,
      },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    if (connection.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You can only prescribe for your own patients',
      );
    }

    if (connection.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'You can only prescribe for active connections',
      );
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        doctorId,
        connectionId,
        patientId: connection.patientId,
        medications: JSON.stringify(dto.medications),
        notes: dto.notes,
        prescribedAt: new Date(),
        updateAt: new Date(),
      },
      include: {
        ...this.doctorInclude,
        ...this.patientInclude,
      },
    });

    // TODO: Send notification to patient
    // await this.notificationsService.sendNewPrescriptionNotification(connection.patient.userId, prescription);

    return {
      message: 'Prescription created successfully',
      prescription,
    };
  }

  // Get all prescriptions for a connection
  async getConnectionPrescriptions(
    connectionId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const connection =
      await this.prisma.doctorPatientConnection.findUniqueOrThrow({
        where: { id: connectionId },
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
      });

    // Check access permission
    const hasAccess =
      (userRole === 'DOCTOR' && connection.doctor.userId === userId) ||
      (userRole === 'PATIENT' && connection.patient.userId === userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this connection');
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where: { connectionId },
      include: {
        ...this.doctorInclude,
      },
      orderBy: {
        prescribedAt: 'desc',
      },
    });
    return prescriptions;
  }
  // Get all patient prescriptions (Patient view)
  async getMyPrescriptions(patientId: string, isActive?: boolean) {
    const where: any = { patientId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where,
      include: {
        ...this.doctorInclude,
        connection: {
          select: { id: true, status: true },
        },
      },
      orderBy: {
        prescribedAt: 'desc',
      },
    });
    return prescriptions;
  }
  async getPatientPrescriptions(doctorId: string, patientId: string) {
    // Verify connection exists
    const connection = await this.prisma.doctorPatientConnection.findUnique({
      where: {
        doctorId_patientId: {
          doctorId,
          patientId,
        },
      },
    });

    if (!connection) {
      throw new NotFoundException('No connection found with this patient');
    }

    return this.prisma.prescription.findMany({
      where: {
        doctorId,
        patientId,
      },
      orderBy: {
        prescribedAt: 'desc',
      },
    });
  }

  // ===============================================
  // GET SINGLE PRESCRIPTION
  // ===============================================
  async getPrescription(
    prescriptionId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        ...this.doctorInclude,
        ...this.patientInclude,
      },
    });
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    const hasAccess =
      (userRole === 'DOCTOR' && prescription.doctor.userId === userId) ||
      (userRole === 'PATIENT' && prescription.patient.userId === userId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this prescription',
      );
    }
    return prescription;
  }

  // ===============================================
  // UPDATE PRESCRIPTION (Doctor only)
  // ===============================================
  async updatePrescription(
    prescriptionId: string,
    doctorId: string,
    dto: UpdatePrescriptionDto,
  ) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You can only update your own prescriptions',
      );
    }

    return this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        medications: dto.medications
          ? JSON.stringify(dto.medications)
          : undefined,
        notes: dto.notes,
        isActive: dto.isActive,
      },
      include: {
        ...this.patientInclude,
      },
    });
  }

  // ===============================================
  // DEACTIVATE PRESCRIPTION (Doctor only)
  // ===============================================
  async deactivatePrescription(prescriptionId: string, doctorId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You can only deactivate your own prescriptions',
      );
    }

    return this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: { isActive: false },
    });
  }

  // ===============================================
  // GET ACTIVE PRESCRIPTIONS COUNT
  // ===============================================
  async getActivePrescriptionsCount(patientId: string): Promise<number> {
    return this.prisma.prescription.count({
      where: {
        patientId,
        isActive: true,
      },
    });
  }

  private readonly patientInclude = {
    patient: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    },
  };

  private readonly doctorInclude = {
    doctor: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        specialization: true,
      },
    },
  };
}
