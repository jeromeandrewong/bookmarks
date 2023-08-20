import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);

    // save new user to db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;

      // return user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // this is prisma's error code for failed unique constraint
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
        throw error;
      }
    }
  }
  async signin(dto: AuthDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if no user, throw error
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }
    // compare password hash
    const match = await argon.verify(user.hash, dto.password);

    // if no match, throw error
    if (!match) {
      throw new ForbiddenException('Invalid credentials');
    }

    // return user
    delete user.hash;
    return user;
  }
}
