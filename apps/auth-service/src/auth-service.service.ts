import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface AuthServiceGrpc {
  Create(data: { name: string }): Observable<any>;
}

@Injectable()
export class AuthServiceService implements OnModuleInit {
  private service!: AuthServiceGrpc;

  constructor(
    @Inject('auth')
    private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.service = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  create(name: string) {
    return this.service.Create({ name });
  }


}