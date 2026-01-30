import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ParseBoolPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/decorators/api-auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { OwnershipGuard } from 'src/auth/guards/roles-ownership.guard';
import { Owner } from 'src/auth/decorators/owner.decorator';

@ApiTags('Prescriptions')
@ApiAuth()
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  // ===============================================
  // CREATE PRESCRIPTION (Doctor only)
  // ===============================================

  @Post('connections/:connectionId')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Create Prescription (Doctor)',
    description: 'Doctor creates a new prescription for a connected patient',
  })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully',
  })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @ApiResponse({ status: 403, description: 'Not your patient' })
  @ApiResponse({
    status: 400,
    description: 'Connection not active or invalid data',
  })
  async createPrescription(
    @Param('connectionId', ParseUUIDPipe) connectionId: string,
    @CurrentUser('doctorId') doctorId: string,
    @Body() body: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.createPrescription(
      doctorId,
      connectionId,
      body,
    );
  }

  // ===============================================
  // GET PRESCRIPTIONS
  // ===============================================

  @Get('connections/:connectionId')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  @ApiOperation({
    summary: 'Get Connection Prescriptions',
    description:
      'Get all prescriptions for a specific doctor-patient connection',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescriptions retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getConnectionPrescriptions(
    @Param('connectionId', ParseUUIDPipe) connectionId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.prescriptionsService.getConnectionPrescriptions(
      connectionId,
      userId,
      userRole,
    );
  }

  @Get('my-prescriptions')
  @Roles(UserRole.PATIENT)
  @ApiOperation({
    summary: 'Get My Prescriptions (Patient)',
    description: 'Patient gets all their prescriptions from all doctors',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescriptions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              medications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Panadol' },
                    dosage: { type: 'string', example: '500mg' },
                    frequency: { type: 'number', example: 3 },
                    frequencyType: { type: 'string', example: 'daily' },
                    duration: { type: 'string', example: '7 days' },
                    notes: { type: 'string', example: 'After meals' },
                  },
                },
              },
              notes: { type: 'string' },
              isActive: { type: 'boolean' },
              prescribedAt: { type: 'string' },
              doctor: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                    },
                  },
                  specialization: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getMyPrescriptions(
    @CurrentUser('patientId') patientId: string,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ) {
    return this.prescriptionsService.getMyPrescriptions(patientId, isActive);
  }

  @Get('patients/:patientId')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Get Patient Prescriptions (Doctor)',
    description: 'Doctor gets all prescriptions for a specific patient',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescriptions retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No connection with this patient' })
  async getPatientPrescriptions(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser('doctorId') doctorId: string,
  ) {
    return this.prescriptionsService.getPatientPrescriptions(
      doctorId,
      patientId,
    );
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  @Owner('id')
  @ApiOperation({
    summary: 'Get Prescription by ID',
    description: 'Get detailed information about a specific prescription',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getPrescription(
    @Param('id', ParseUUIDPipe) prescriptionId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.prescriptionsService.getPrescription(
      prescriptionId,
      userId,
      userRole,
    );
  }

  // ===============================================
  // UPDATE PRESCRIPTION (Doctor only)
  // ===============================================

  @Put(':id')
  @UseGuards(OwnershipGuard)
  @Owner('id')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Update Prescription (Doctor)',
    description: 'Doctor updates an existing prescription',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({ status: 403, description: 'Not your prescription' })
  async updatePrescription(
    @Param('id', ParseUUIDPipe) prescriptionId: string,
    @CurrentUser('doctorId') doctorId: string,
    @Body() body: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.updatePrescription(
      prescriptionId,
      doctorId,
      body,
    );
  }

  @Put(':id/deactivate')
  @UseGuards(OwnershipGuard)
  @Owner('id')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Deactivate Prescription (Doctor)',
    description: 'Doctor marks a prescription as inactive (stopped)',
  })
  @ApiResponse({ status: 200, description: 'Prescription deactivated' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({ status: 403, description: 'Not your prescription' })
  async deactivatePrescription(
    @Param('id', ParseUUIDPipe) prescriptionId: string,
    @CurrentUser('doctorId') doctorId: string,
  ) {
    return this.prescriptionsService.deactivatePrescription(
      prescriptionId,
      doctorId,
    );
  }
}
