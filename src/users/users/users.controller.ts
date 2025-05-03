import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Auth } from '@/utils/decorators/auth.decorator';
import { UsersService } from '@/users/users/users.service';
import { UpdateUserDto } from '@/users/dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth()
  @Patch('profile')
  updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.userId, dto);
  }
}
