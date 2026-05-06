import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { TimeSlot } from "../service/slot-generator.service";
import { AppointmentType } from "@prisma/client";


export class CreateAppointmentDto {
    @IsString()
    doctorId!: string;

    @IsString()
    connectionId!: string;

    @IsDateString()
    startTime!: string; // ISO datetime string

    @IsEnum(AppointmentType)
    type!: AppointmentType;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    clinicId?: string;

    @IsOptional()
    @IsString()
    roomNumber?: string;

    @IsOptional()
    @IsString()
    meetingLink?: string;
}

export class AvailableSlotsResponse {
    doctorId!: string;
    availableCount!: number
    slots!: TimeSlot[]
}
export class GetAvailableSlots {
    doctorId!: string;
    startDate!: Date
    endDate!: Date
}
