import { BaseRepository } from '@app/database/base.repository';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class FanPagesRepository extends BaseRepository<any> {
    constructor(dataSource: DataSource) {
        super(dataSource, 'fanpages', ["id"]);
    }
}