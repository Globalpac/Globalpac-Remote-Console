import { Injectable } from '@nestjs/common';
import { loadLatestInstaladores } from './remoto-instaladores';
import {
  createRemotoMaquina,
  deleteRemotoMaquina,
  listRemotoMaquinas,
  updateRemotoMaquinaNome,
} from './remoto-maquinas';
import { InstaladoresPayload, RemotoMaquina } from './remoto.types';

@Injectable()
export class RemotoService {
  list(): Promise<RemotoMaquina[]> {
    return listRemotoMaquinas();
  }

  create(id: string, nome: string): Promise<RemotoMaquina> {
    return createRemotoMaquina({ id, nome });
  }

  rename(id: string, nome: string): Promise<RemotoMaquina> {
    return updateRemotoMaquinaNome(id, nome);
  }

  remove(id: string): Promise<void> {
    return deleteRemotoMaquina(id);
  }

  instaladores(): Promise<InstaladoresPayload> {
    return loadLatestInstaladores();
  }
}
