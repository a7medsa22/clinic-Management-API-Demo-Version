import { NotificationHandler } from "../interfaces/notification-handler.interface";
import { NotificationsType as T } from "../enums/notifications.enum";

export class PrescriptionHandler implements NotificationHandler {
    build(data: any, type: T): { title: string; message: string; metadata?: any; } {
        switch (type) {
            case T.PRESCRIPTION_RENEWAL_REQUEST:
                return {
                    title: 'Prescription Renewal Request',
                    message: `Patient ${data.patientName} has requested a renewal for ${data.medicationName}`,
                    metadata: {
                        patientId: data.patientId,
                        prescriptionId: data.prescriptionId,
                    },
                };
            case T.NEW_PRESCRIPTION:
                return {
                    title: 'New Prescription',
                    message: `Dr. ${data.doctorName} has prescribed new medication for you.`,
                    metadata: {
                        prescriptionId: data.prescriptionId,
                        actionUrl: data.actionUrl,
                    },
                };
            default:
                return {
                    title: 'Prescription Notification',
                    message: `A new prescription has been added for ${data.medicationName}`,
                    metadata: {
                        patientId: data.patientId,
                        prescriptionId: data.prescriptionId,
                    },
                };
        }
    }
}