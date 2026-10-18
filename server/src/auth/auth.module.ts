import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { JwtAuth } from './jwt_auth.provider.js';
import { Profile } from './entities/profile.entity.js';
import { AuthenticationStorageProvider } from './authentication-storage.provider.js';
import { EmailModule } from '../email/email.module.js';
import { TemplateModule } from '../template/template.module.js';
import { MicrosoftModule } from '../microsoft/microsoft.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    EmailModule,
    TemplateModule,
    MicrosoftModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuth, AuthenticationStorageProvider],
  exports: [AuthService],
})
export class AuthModule {}
