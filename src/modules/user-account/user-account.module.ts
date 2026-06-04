import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { AdminUserService } from './services/admin-user.service';
import { PermissionRepository } from './repositories/permission.repository';
import { AuditlogRepository } from './repositories/auditlog.repository';
import { RightRepository } from './repositories/right.repository';
import { UserRepository } from './repositories/user.repository';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { AuditLogSchema } from './schemas/auditlog.schema';
import { Right, RightSchema } from './schemas/right.schema';
import { User, UserSchema } from './schemas/user.schema';
import { EmailModule } from '../../shared/services/email.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema, collection: process.env?.PERMISSION_COLLECTION },
      { name: 'auditlogs', schema: AuditLogSchema },
      { name: Right.name, schema: RightSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    AuthService,
    TokenService,
    RoleService,
    PermissionService,
    AdminUserService,
    PermissionRepository,
    AuditlogRepository,
    RightRepository,
    UserRepository,
  ],
  exports: [
    AuthService,
    TokenService,
    RoleService,
    PermissionService,
    AdminUserService,
    UserRepository,
  ],
})
export class UserAccountModule {}
