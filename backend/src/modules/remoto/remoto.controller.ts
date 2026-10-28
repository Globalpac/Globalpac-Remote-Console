import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CreateMaquinaDto, UpdateMaquinaDto } from './dto/maquina.dto';
import { RemotoService } from './remoto.service';
import {
  RemotoInstaladoresError,
  RemotoMaquinaCode,
  RemotoMaquinaError,
} from './remoto.types';

const MAQUINA_ERRORS: Record<
  RemotoMaquinaCode,
  { status: number; message: string }
> = {
  invalid_id: {
    status: 400,
    message: 'ID inválido. Use o ID do acesso remoto, sem espaços.',
  },
  invalid_nome: {
    status: 400,
    message: 'Informe um nome com até 120 caracteres.',
  },
  duplicate: {
    status: 409,
    message: 'Já existe uma máquina com este ID.',
  },
  not_found: {
    status: 404,
    message: 'Máquina não encontrada.',
  },
};

function maquinaException(error: RemotoMaquinaError): HttpException {
  const mapped = MAQUINA_ERRORS[error.code];
  return new HttpException(
    { ok: false, error: error.code, message: mapped.message },
    mapped.status,
  );
}

@Controller('remoto')
@UseGuards(AdminGuard)
export class RemotoController {
  constructor(private readonly remoto: RemotoService) {}

  @Get('maquinas')
  @Header('Cache-Control', 'no-store')
  async list() {
    try {
      return { ok: true, maquinas: await this.remoto.list() };
    } catch {
      throw new HttpException(
        {
          ok: false,
          error: 'unavailable',
          message: 'Erro ao listar máquinas.',
        },
        503,
      );
    }
  }

  @Post('maquinas')
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'no-store')
  async create(@Body() body: CreateMaquinaDto) {
    try {
      const maquina = await this.remoto.create(body.id, body.nome);
      return { ok: true, maquina };
    } catch (error) {
      if (error instanceof RemotoMaquinaError) throw maquinaException(error);
      throw new HttpException(
        { ok: false, error: 'unavailable', message: 'Erro ao gravar máquina.' },
        503,
      );
    }
  }

  @Put('maquinas/:id')
  @Header('Cache-Control', 'no-store')
  async rename(@Param('id') id: string, @Body() body: UpdateMaquinaDto) {
    try {
      const maquina = await this.remoto.rename(id, body.nome);
      return { ok: true, maquina };
    } catch (error) {
      if (error instanceof RemotoMaquinaError) throw maquinaException(error);
      throw new HttpException(
        {
          ok: false,
          error: 'unavailable',
          message: 'Erro ao atualizar máquina.',
        },
        503,
      );
    }
  }

  @Delete('maquinas/:id')
  @Header('Cache-Control', 'no-store')
  async remove(@Param('id') id: string) {
    try {
      await this.remoto.remove(id);
      return { ok: true };
    } catch (error) {
      if (error instanceof RemotoMaquinaError) throw maquinaException(error);
      throw new HttpException(
        {
          ok: false,
          error: 'unavailable',
          message: 'Erro ao remover máquina.',
        },
        503,
      );
    }
  }

  @Get('instaladores')
  @Header('Cache-Control', 'private, max-age=60')
  async instaladores() {
    try {
      const instaladores = await this.remoto.instaladores();
      return { ok: true, ...instaladores };
    } catch (error) {
      const message =
        error instanceof RemotoInstaladoresError
          ? error.message
          : 'Erro ao ler os instaladores.';
      throw new HttpException(
        { ok: false, error: 'release_unavailable', message },
        502,
      );
    }
  }
}
