import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('invite')
  invite(@Body() dto: InviteUserDto, @Req() req) {
    return this.authService.inviteUser(dto, req.user.companyId, req.user.role);
  }
}
