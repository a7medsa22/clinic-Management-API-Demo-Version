import { ForbiddenException, Injectable } from "@nestjs/common";
import { DayOfWeek } from "@prisma/client";
import { min } from "class-validator";
import { PrismaService } from "src/prisma/prisma.service";
interface TimeSlot {
    start: Date,
    end: Date
}

interface SlotGeneratorParams {
    doctorId: string;
    startDate: Date;
    endDate: Date;
    timezone?: string;
}

@Injectable()
export class SlotGeneratorService {
    private readonly MINUTES_PER_DAY = 24 * 60;

    constructor(
        private prisma: PrismaService
    ) { }

    async generateSlots(Param: SlotGeneratorParams) {
        const { doctorId, startDate, endDate, timezone = 'Africa/Cairo' } = Param
        const slots: TimeSlot[] = [];

        // 1. Get doctor's availability settings
        const availabilities = await this.prisma.doctorAvailability.findMany({
            where: { doctorId, isActive: true },
        });
        if (availabilities.length == 0) return []

        // 2. Get doctor's breaks
        const breaks = await this.prisma.doctorBreak.findMany({ where: { doctorId } })
        // 3. Get doctor's days off
        const dayOff = await this.prisma.doctorDayOff.findMany({
            where: {
                doctorId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });
        const doctorDayDates = new Set(
            dayOff.map(d => d.date.toISOString().split('T')[0])
        );
        // 4. Get already booked appointments
        const appointments = await this.prisma.appointment.findMany({
            where: {
                doctorId,
                status: { notIn: ['CANCELLED'] },
                startTime: { gte: startDate },
                endTime: { lte: endDate }
            },
            select: { startTime: true, endTime: true }
        });
        // 5. Generate slots for each day in range
        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);

        while (currentDate <= endDate) {
            const dayOfWeek = this.getDayOfWeek(currentDate)

            const dayAvailabilities = availabilities.filter(
                d => d.dayOfWeek == dayOfWeek
            );

            for (const availability of dayAvailabilities) {
                const daySlots = this.generateDaySlots(
                    currentDate,
                    availability.startTime,
                    availability.endTime,
                    availability.slotDuration
                )
                slots.push(...daySlots);
            }
            currentDate.setDate(currentDate.getDay() + 1);
        }
        return slots;
    }
    generateDaySlots(
        date: Date,
        startMin: number,
        endMin: number,
        slotDuration: number,

    ): TimeSlot[] {
        const slots: TimeSlot[] = [];
        let current = startMin;

        while (current + slotDuration <= endMin) {
            let startSlots = this.minutesToDate(date, startMin);
            let endSlots = this.minutesToDate(date, startMin + slotDuration);
            slots.push({
                start: startSlots,
                end: endSlots
            });
            current += slotDuration;
        }
        return slots
    }



    private getDayOfWeek(date: Date) {
        const dayNumber = date.getDate()
        const dayMap: { [key: number]: DayOfWeek } = {
            0: DayOfWeek.SUNDAY,
            1: DayOfWeek.MONDAY,
            2: DayOfWeek.TUESDAY,
            3: DayOfWeek.WEDNESDAY,
            4: DayOfWeek.THURSDAY,
            5: DayOfWeek.FRIDAY,
            6: DayOfWeek.SATURDAY,
        }
        return dayMap[dayNumber]
    }
    private timeToMinutes(time: string) {
        const [hours, minute] = time.split(':').map(Number);
        return hours * 60 + minute;
    }
    private minutesToDate(date: Date, minutes: number) {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        result.setMinutes(minutes)
        return result;
    }
    isValidTimeFormat(timeStr: string): boolean {
        const regex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
        return regex.test(timeStr);
    }
    private formatMinutes(minutes: number) {
        const hours = Math.floor(minutes / 60);
        const mins = hours % 60;
        return `${hours}h ${mins}m`
    }
};