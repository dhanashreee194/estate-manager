import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ===============================
  // SIGNUP → Create Company + Admin
  // ===============================
  async signup(dto: {
    companyName: string;
    companyEmail: string;
    adminName: string;
    adminEmail: string;
    password: string;
  }) {
    // 1️⃣ Prevent duplicate company
    const existingCompany = await this.prisma.company.findUnique({
      where: { email: dto.companyEmail },
    });

    if (existingCompany) {
      throw new BadRequestException(
        'Company already registered. Please login.',
      );
    }

    // 2️⃣ Prevent duplicate admin email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 4️⃣ Create company + admin
    const company = await this.prisma.company.create({
      data: {
        name: dto.companyName,
        email: dto.companyEmail,
        users: {
          create: {
            name: dto.adminName,
            email: dto.adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
          },
        },
      },
      include: { users: true },
    });

    const admin = company.users[0];

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      companyId: company.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        companyId: company.id,
        companyName: company.name,
      },
    };
  }

  // ===============================
  // LOGIN
  // ===============================
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company.name,
      },
    };
  }

  // ===============================
  // INVITE USER (ADMIN ONLY)
  // ===============================
  async inviteUser(dto: InviteUserDto, companyId: string, inviterRole: string) {
    if (inviterRole !== 'ADMIN') {
      throw new ForbiddenException('Only admin can invite users');
    }

    const allowedRoles = ['SUPERVISOR', 'SALES', 'ACCOUNTANT'];
    if (!allowedRoles.includes(dto.role)) {
      throw new BadRequestException('Invalid role');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
      },
    });
  }
}
