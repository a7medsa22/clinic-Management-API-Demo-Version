import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LoginProvider } from './providers/login.provider';
import { RegisterProvider } from './providers/register.provider';
import { PasswordProvider } from './providers/password.provider';
import { OtpProvider } from './providers/otp.provider';
import { TokenProvider } from './providers/token.provider';
import { GoogleOauth } from './providers/login-google.provider';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: LoginProvider, useValue: {} },
        { provide: RegisterProvider, useValue: {} },
        { provide: PasswordProvider, useValue: {} },
        { provide: OtpProvider, useValue: {} },
        { provide: TokenProvider, useValue: {} },
        { provide: GoogleOauth, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
