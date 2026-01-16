// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });
      await expect(service.register('test@example.com', 'password')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a new user and return user without password', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      const newUser = { id: 1, email: 'test@example.com', password: hashedPassword, name: 'Test' };
      mockUsersService.create.mockResolvedValue(newUser);

      const result = await service.register('test@example.com', 'password', 'Test');
      expect(result).toEqual({ id: 1, email: 'test@example.com', name: 'Test' });
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test',
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.login('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('test@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return access token and user info on success', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedPassword', name: 'Test' };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login('test@example.com', 'password');
      expect(result).toEqual({
        access_token: 'token',
        user: { id: 1, email: 'test@example.com', name: 'Test' },
      });
    });
  });
});
