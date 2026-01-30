import { stat } from 'fs';

export const patientInclude = {
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

export const doctorInclude = {
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
export const userInclude = {
  id: true,
  firstName: true,
  lastName: true,
  status: true,
} as const;

export const participantSelect = {
  id: true,
  userId: true,
  user: { select: userInclude },
} as const;
