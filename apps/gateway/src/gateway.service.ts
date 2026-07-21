import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface AuthServiceGrpc {
  Create(data: { name: string }): Observable<any>;
}
@Injectable()
export class GatewayService implements OnModuleInit {
  private service!: AuthServiceGrpc;

  constructor(
    @Inject('auth')
    private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.service = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  Create(name: string) {
    return this.service.Create({ name });
  }
}
