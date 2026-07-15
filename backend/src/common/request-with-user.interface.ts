// **************************************************************************
//
//  Trippier Project - API
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { Request as ExpressRequest } from 'express';
import { Role } from '@prisma/client';

export interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
    email: string;
    role: Role;
  };
}

export interface RequestWithOptionalUser extends ExpressRequest {
  user:
    | {
        id: number;
        email: string;
        role: Role;
      }
    | undefined;
}
