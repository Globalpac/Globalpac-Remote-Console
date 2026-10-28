import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMaquinaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nome!: string;
}

export class UpdateMaquinaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nome!: string;
}
