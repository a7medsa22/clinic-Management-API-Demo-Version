import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';

@Injectable()
export class SpecializationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSpecializationDto) {
    const { name, nameAr, description } = dto;
    const existingSpecialization = await this.prisma.specialization.findUnique({
      where: { name },
    });
    if (existingSpecialization) {
      throw new ConflictException('Specialization already exists');
    }

    return this.prisma.specialization.create({
      data: {
        name,
        nameAr,
        description,
      },
    });
  }

  async findAll() {
    return this.prisma.specialization.findMany({
      include: {
        _count: { select: { doctors: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
      include: {
        doctors: {
          where: {
            user: {
              status: 'ACTIVE',
              isActive: true,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            doctors: true,
          },
        },
      },
    });
    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    return specialization;
  }
  async update(id: string, dto: UpdateSpecializationDto) {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    // Check for name conflicts if name is being updated
    if (dto.name && dto.name !== specialization.name) {
      const existingSpecialization =
        await this.prisma.specialization.findUnique({
          where: { name: dto.name },
        });

      if (existingSpecialization) {
        throw new ConflictException('Specialization name already exists');
      }
    }

    return this.prisma.specialization.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            doctors: true,
          },
        },
      },
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    if (specialization._count.doctors > 0) {
      throw new ConflictException(
        `Cannot delete specialization with ${specialization._count.doctors} associated doctors`,
      );
    }

    return this.prisma.specialization.delete({
      where: { id },
    });
  }

  async getPopularSpecializations(limit: number = 10) {
    return this.prisma.specialization.findMany({
      include: {
        _count: {
          select: {
            doctors: true,
          },
        },
      },
      orderBy: {
        doctors: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }
}
