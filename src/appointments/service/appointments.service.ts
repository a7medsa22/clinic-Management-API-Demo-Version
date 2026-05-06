import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SlotGeneratorService } from './slot-generator.service';
import { AvailableSlotsResponse, CreateAppointmentDto, GetAvailableSlots } from '../dto/appointment.dto';
import { AppointmentStatusPolicy } from '../policies/appointment-status.policy';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slotService: SlotGeneratorService,

  ) { }
  async getAvailableSlots(params: GetAvailableSlots): Promise<AvailableSlotsResponse> {
    const { doctorId, startDate, endDate } = params;

    const availabilities = await this.prisma.doctorAvailability.findMany({
      where: { doctorId, }
    })
    if (!availabilities.length)
      throw new NotFoundException('Doctor has not set availability');

    const slots = await this.slotService.generateSlots({ doctorId, startDate, endDate });

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
        status: { in: AppointmentStatusPolicy.activeStatuses() },
      },
      select: { startTime: true, endTime: true }
    });

    const availableSlots = slots.filter(
      (slot) =>
        !bookedAppointments.some(
          (booked) =>
            slot.start < booked.endTime && slot.end > booked.startTime,
        ),
    );

    return {
      doctorId,
      availableCount: availableSlots.length,
      slots: availableSlots.slice(0, 100),
    }
  }

  async bookAppointment(patientId: string, createDto: CreateAppointmentDto) {
    const { doctorId, connectionId, startTime, type, reason, roomNumber } = createDto;
    let start = new Date(startTime);
    if (start < new Date())
      throw new BadRequestException('Cannot book appointments in the past');

    const availability = await this.prisma.doctorAvailability.findFirst({
      where: { doctorId }
    });
    if (!availability)
      throw new NotFoundException('Doctor has not set availability');

    const durationMinutes = availability.slotDuration;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

    const connection = await this.prisma.doctorPatientConnection.findUnique({
      where: { doctorId_patientId: { doctorId, patientId } }
    });

    if (!connection)
      throw new NotFoundException('Connection does not exist');

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        startTime: { lt: end },
        endTime: { gt: start },
        status: { in: AppointmentStatusPolicy.activeStatuses() }
      }
    });

    if (conflictingAppointment)
      throw new BadRequestException('Time slot is already booked');

    const slots = await this.slotService.generateSlots({ doctorId, startDate: start, endDate: end });

    const isValidSlot = slots.some(
      s => s.start.getTime() === start.getTime()
    );
    if (!isValidSlot)
      throw new BadRequestException('Invalid slot');

    const appointment = await this.prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        connectionId,
        startTime: start,
        endTime: end,
        type,
        reason,
        roomNumber,
        status: AppointmentStatus.PENDING
      },
      include: {
        doctor: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        patient: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return {
      id: appointment.id,
      status: appointment.status,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      message: 'Appointment booked successfully. Awaiting doctor confirmation.',
    };
  }

}
