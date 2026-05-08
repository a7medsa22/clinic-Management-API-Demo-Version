import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Appointments Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let doctorUserId: string;
  let patientUserId: string;
  let doctorId: string;
  let patientId: string;
  let connectionId: string;
  let appointmentId: string;

  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  const weekdayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

  function getFutureAppointmentDate() {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(9, 0, 0, 0);

    if (nextDay <= new Date()) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    const doctorEmail = `integration-doctor-${uniqueSuffix}@example.com`;
    const patientEmail = `integration-patient-${uniqueSuffix}@example.com`;

    const doctorUser = await prisma.user.create({
      data: {
        email: doctorEmail,
        password: 'password123',
        firstName: 'Doctor',
        lastName: 'Test',
        role: 'DOCTOR',
        status: 'ACTIVE',
        isActive: true,
      },
    });
    doctorUserId = doctorUser.id;

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUserId,
      },
    });
    doctorId = doctor.id;

    const patientUser = await prisma.user.create({
      data: {
        email: patientEmail,
        password: 'password123',
        firstName: 'Patient',
        lastName: 'Test',
        role: 'PATIENT',
        status: 'ACTIVE',
        isActive: true,
      },
    });
    patientUserId = patientUser.id;

    const patient = await prisma.patient.create({
      data: {
        userId: patientUserId,
      },
    });
    patientId = patient.id;

    const connection = await prisma.doctorPatientConnection.create({
      data: {
        doctorId,
        patientId,
        status: 'ACTIVE',
      },
    });
    connectionId = connection.id;

    const appointmentDate = getFutureAppointmentDate();
    const dayOfWeek = weekdayNames[appointmentDate.getDay()];

    await prisma.doctorAvailability.create({
      data: {
        doctorId,
        dayOfWeek,
        startTime: 9 * 60,
        endTime: 17 * 60,
        slotDuration: 30,
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.appointment.deleteMany({ where: { connectionId } });
      await prisma.doctorAvailability.deleteMany({ where: { doctorId } });
      await prisma.doctorPatientConnection.deleteMany({ where: { id: connectionId } });
      await prisma.doctor.deleteMany({ where: { id: doctorId } });
      await prisma.patient.deleteMany({ where: { id: patientId } });
      await prisma.user.deleteMany({ where: { id: { in: [doctorUserId, patientUserId] } } });
    } finally {
      await app.close();
    }
  });

  it('should execute the appointment lifecycle and preserve slot availability behavior', async () => {
    const appointmentDate = getFutureAppointmentDate();
    const appointmentEnd = new Date(appointmentDate.getTime() + 30 * 60 * 1000);

    const bookingResponse = await request(app.getHttpServer())
      .post('/appointments')
      .query({ patientId })
      .send({
        doctorId,
        connectionId,
        startTime: appointmentDate.toISOString(),
        type: 'IN_CLINIC',
        reason: 'Integration testing appointment',
        roomNumber: '101',
      })
      .expect(201);

    expect(bookingResponse.body).toMatchObject({
      doctorId,
      patientId,
      status: 'PENDING',
      startTime: appointmentDate.toISOString(),
    });

    appointmentId = bookingResponse.body.id;
    expect(appointmentId).toBeDefined();

    const doctorAppointments = await request(app.getHttpServer())
      .get(`/appointments/doctor/${doctorId}`)
      .expect(200);
    expect(Array.isArray(doctorAppointments.body)).toBe(true);
    expect(doctorAppointments.body.some((item: any) => item.id === appointmentId)).toBe(true);

    const patientAppointments = await request(app.getHttpServer())
      .get(`/appointments/patient/${patientId}`)
      .expect(200);
    expect(Array.isArray(patientAppointments.body)).toBe(true);
    expect(patientAppointments.body.some((item: any) => item.id === appointmentId)).toBe(true);

    const slotRangeStart = new Date(appointmentDate);
    slotRangeStart.setHours(0, 0, 0, 0);
    const slotRangeEnd = new Date(appointmentDate);
    slotRangeEnd.setHours(23, 59, 59, 999);

    const availableSlots = await request(app.getHttpServer())
      .get(`/appointments/doctor/${doctorId}/slots`)
      .query({
        startDate: slotRangeStart.toISOString(),
        endDate: slotRangeEnd.toISOString(),
      })
      .expect(200);

    expect(availableSlots.body.doctorId).toBe(doctorId);
    expect(availableSlots.body.availableCount).toBeGreaterThan(0);
    expect(availableSlots.body.slots.some((slot: any) => slot.start === appointmentDate.toISOString())).toBe(false);

    const legacySlots = await request(app.getHttpServer())
      .get('/appointments/slots/available')
      .query({
        doctorId,
        startDate: slotRangeStart.toISOString(),
        endDate: slotRangeEnd.toISOString(),
      })
      .expect(200);

    expect(legacySlots.body.doctorId).toBe(doctorId);
    expect(Array.isArray(legacySlots.body.slots)).toBe(true);

    const rangeSlots = await request(app.getHttpServer())
      .get(`/appointments/slots/range/${doctorId}`)
      .query({
        start: slotRangeStart.toISOString(),
        end: slotRangeEnd.toISOString(),
      })
      .expect(200);

    expect(rangeSlots.body.doctorId).toBe(doctorId);
    expect(Array.isArray(rangeSlots.body.slots)).toBe(true);

    const nextSlots = await request(app.getHttpServer())
      .get('/appointments/slots/next')
      .query({ doctorId, days: 7 })
      .expect(200);

    expect(nextSlots.body.doctorId).toBe(doctorId);
    expect(Array.isArray(nextSlots.body.nextSlots)).toBe(true);

    await request(app.getHttpServer())
      .patch(`/appointments/${appointmentId}/confirm`)
      .query({ patientId })
      .expect(200);

    const newAppointmentDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000);

    const rescheduleResponse = await request(app.getHttpServer())
      .patch(`/appointments/${appointmentId}/reschedule`)
      .query({ patientId })
      .send({
        newStartTime: newAppointmentDate.toISOString(),
        reason: 'Need a later slot',
      })
      .expect(200);

    expect(rescheduleResponse.body.startTime).toBe(newAppointmentDate.toISOString());
    expect(rescheduleResponse.body.status).toBe('CONFIRMED');

    const appointmentById = await request(app.getHttpServer())
      .get(`/appointments/${appointmentId}`)
      .query({ userId: patientId })
      .expect(200);

    expect(appointmentById.body.id).toBe(appointmentId);
    expect(appointmentById.body.startTime).toBe(newAppointmentDate.toISOString());

    const cancellationResponse = await request(app.getHttpServer())
      .patch(`/appointments/${appointmentId}/cancel`)
      .query({ userId: patientId })
      .send({ reason: 'PATIENT_REQUEST' })
      .expect(200);

    expect(cancellationResponse.body.status).toBe('CANCELLED');
    expect(cancellationResponse.body.message).toContain('cancelled');
  });
});
