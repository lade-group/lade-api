import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Failed to hash password');
    }
  }

  async comparePasswords(plainText: string, hash: string): Promise<boolean> {
    try {
      const match = await bcrypt.compare(plainText, hash);
      if (!match) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Password comparison failed');
    }
  }
}
