import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar salud del servicio y conexión a la base de datos' })
  @ApiResponse({ status: 200, description: 'Servicio en línea y base de datos conectada' })
  async getHello() {
    return this.appService.getHello();
  }
}
