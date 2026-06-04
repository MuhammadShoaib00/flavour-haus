import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateUserDto,
  DeleteUserDto,
  GetUserDto,
  UpdateUserDto,
  ListUsersDto,
  RemoveRoleDto,
  AssignRoleDto,
  ChangeStatusDto,
} from '../dto/admin-user';
import { AuditlogRepository } from '../repositories/auditlog.repository';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from '../../../shared/services/email.service';

@Injectable()
export class AdminUserService {
  protected readonly logger = new Logger(AdminUserService.name);

  constructor(
    private userRepository: UserRepository,
    private auditlogRepository: AuditlogRepository,
    private emailService: EmailService,
  ) {}

  async listUsers({ role, nextToken, search, limit = 60 }: ListUsersDto) {
    try {
      const filter: any = {};
      if (role) filter.defaultRole = role;
      if (search) {
        const isEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/.test(search);
        if (isEmail) {
          filter.email = { $regex: search, $options: 'i' };
        } else {
          filter.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
          ];
        }
      }

      const offset = nextToken ? parseInt(nextToken, 10) : 0;
      const users = await this.userRepository.find(
        filter,
        { _id: 1, email: 1, firstName: 1, lastName: 1, isEmailVerified: 1, isActive: 1, createdAt: 1 },
        { lean: true, skip: offset, limit: Number(limit), sort: { createdAt: -1 } },
      );

      const mapped = (users as any[]).map((user) => ({
        userId: user._id,
        email: user.email ? Buffer.from(user.email, 'base64').toString('utf-8') : '',
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        isEmailVerified: user.isEmailVerified === true,
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
      }));

      const newNextToken = mapped.length === Number(limit) ? String(offset + Number(limit)) : undefined;

      return {
        data: { users: mapped, limit: Number(limit), nextToken: newNextToken },
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async searchUsers({ search }: { search: string }) {
    try {
      const filter: any = search ? { email: { $regex: search, $options: 'i' } } : {};
      const users = await this.userRepository.find(filter, { _id: 1 }, { lean: true, limit: 50 });
      return (users as any[]).map((u) => String(u._id));
    } catch (err) {
      throw err;
    }
  }

  async getUser({ userId }: GetUserDto) {
    try {
      const user: any = await this.userRepository.findOne(
        { _id: userId },
        { _id: 1, email: 1, phoneNumber: 1, isEmailVerified: 1, isActive: 1 },
      );
      return {
        data: {
          userId: user._id,
          email: user.email ? Buffer.from(user.email, 'base64').toString('utf-8') : '',
          phoneNumber: user.phoneNumber,
          isEmailVerified: user.isEmailVerified === true,
          isActive: user.isActive !== false,
        },
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async confirmSignup({ userId }: { userId: string }) {
    try {
      await this.userRepository.findOneAndUpdate({ _id: userId }, { isEmailVerified: true });
      return { data: null, message: 'User confirmed.', errors: null };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async createUser({ email, phone_number }: CreateUserDto) {
    try {
      const tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const userId = uuidv4();
      let emailSent = false;

      await this.userRepository.create({
        _id: userId,
        email: Buffer.from(email).toString('base64'),
        phoneNumber: phone_number,
        password: hashedPassword,
        isEmailVerified: false,
        isActive: true,
        defaultRole: 'GUEST',
      } as any);

      try {
        await this.emailService.sendMail(
          email,
          'Your Flavor Haus account has been created',
          `
            <p>Hello,</p>
            <p>An account has been created for you on Flavor Haus.</p>
            <p><strong>Temporary password:</strong> ${tempPassword}</p>
            <p>Please sign in and change your password.</p>
          `,
        );
        emailSent = true;
      } catch (err) {
        this.logger.warn(`Account creation email was not sent to ${email}: ${err.message}`);
      }

      return {
        data: { userId, email, phoneNumber: phone_number, isEmailVerified: false, emailSent },
        message: emailSent
          ? 'User created successfully. Temporary password email sent.'
          : 'User created successfully, but temporary password email could not be sent.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async resendPassword(payload: { userId?: string; email?: string }) {
    try {
      const user = payload.userId
        ? await this.userRepository.findOne({ _id: payload.userId })
        : await this.userRepository.findOne({
            email: Buffer.from(payload.email).toString('base64'),
          });
      const email = Buffer.from(user.email, 'base64').toString('utf-8');
      const tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        { password: hashedPassword },
      );

      await this.emailService.sendMail(
        email,
        'Your Flavor Haus temporary password',
        `
          <p>Hello ${user.firstName || 'there'},</p>
          <p>Your temporary password is:</p>
          <p><strong>${tempPassword}</strong></p>
          <p>Please sign in and change your password.</p>
        `,
      );

      return { data: null, message: 'Temporary password email sent successfully.', errors: null };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async updateUser({ userId, email, phone_number, preferred_username }: UpdateUserDto) {
    try {
      const update: any = { isEmailVerified: true };
      if (email) update.email = Buffer.from(email).toString('base64');
      if (phone_number) update.phoneNumber = phone_number;
      if (preferred_username) update.preferredUsername = preferred_username;

      await this.userRepository.findOneAndUpdate({ _id: userId }, update);
      return { data: null, message: 'User updated successfully.', errors: null };
    } catch (err) {
      throw err;
    }
  }

  async deleteUser({ userId }: DeleteUserDto) {
    try {
      await this.userRepository.delete({ _id: userId });
      return { data: null, message: 'User deleted successfully.', errors: null };
    } catch (err) {
      throw err;
    }
  }

  async changeStatus({ userId, isActive }: ChangeStatusDto) {
    try {
      await this.userRepository.findOneAndUpdate({ _id: userId }, { isActive });
      return {
        data: null,
        message: isActive ? 'User account is activated successfully.' : 'User account is deactivated successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async assignRoleToUser({ userId, role }: AssignRoleDto) {
    try {
      await this.userRepository.findOneAndUpdate({ _id: userId }, { defaultRole: role });
      return { data: null, message: 'Role assigned to the user successfully.', errors: null };
    } catch (err) {
      throw err;
    }
  }

  async removeRoleOfUser({ userId }: RemoveRoleDto) {
    try {
      await this.userRepository.findOneAndUpdate({ _id: userId }, { defaultRole: 'GUEST' });
      return { data: null, message: 'Role removed from the user successfully.', errors: null };
    } catch (err) {
      throw err;
    }
  }

  async getUserCountbyStatus(_params: any) {
    try {
      const [activeCount, inactiveCount] = await Promise.all([
        this.userRepository.count({ isActive: true }),
        this.userRepository.count({ isActive: false }),
      ]);

      const recentActivity = await this.auditlogRepository.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 2 },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'profileImage' } },
        { $set: { profileImage: '$profileImage.profileImage' } },
      ]);

      return {
        data: {
          users: { totaluser: activeCount + inactiveCount, Active: activeCount, inActive: inactiveCount },
          recentActivity,
        },
        message: 'All Users count',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getalllogs(params: any) {
    try {
      let data = params.data;
      const offset = params.offset;
      const limit = params.limit;

      if (data.eventTime) {
        const ans = await this.eventTime(params.data.eventTime);
        delete data.eventTime;
        data.createdAt = { $lte: ans.lessthan, $gte: ans.greatthan };
      }

      const allLog = await this.auditlogRepository.paginate({ filterQuery: data, offset, limit });
      return { data: allLog, message: 'All Audit Logs', error: null };
    } catch (err) {
      throw err;
    }
  }

  private async eventTime(params: string) {
    const now = new Date();
    let greatthan: Date;
    let lessthan: Date = new Date();

    if (params === 'Today') {
      greatthan = new Date(new Date().setUTCHours(0, 0, 0, 0));
    } else if (params === 'Last_week') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      greatthan = new Date(d.setUTCHours(0, 0, 0, 0));
    } else if (params === 'This_month') {
      greatthan = new Date(new Date(`${now.getFullYear()}/${now.getMonth() + 1}/02`).setUTCHours(0, 0, 0, 0));
    } else if (params === 'Last_month') {
      const m = now.getMonth() + 1; const y = now.getFullYear();
      greatthan = new Date(new Date(`${y}/${m - 1}/02`).setUTCHours(0, 0, 0, 0));
      lessthan = new Date(new Date(`${y}/${m}/01`).setUTCHours(23, 59, 59, 0));
    } else if (params === 'Last_Year') {
      const y = now.getFullYear();
      greatthan = new Date(new Date(`${y - 1}/01/02`).setUTCHours(0, 0, 0, 0));
      lessthan = new Date(new Date(`${y}/01/01`).setUTCHours(23, 59, 59, 0));
    }

    return { greatthan, lessthan };
  }
}

