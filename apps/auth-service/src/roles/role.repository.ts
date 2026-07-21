import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'libs/database/base.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class RoleRepository extends BaseRepository<any> {
    constructor(dataSource: DataSource) {
        super(dataSource, 'roles', ['id', 'name', 'created_at']);
    }
}