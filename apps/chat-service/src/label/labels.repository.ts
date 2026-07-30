import { BaseRepository } from '@app/database/base.repository';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LabelsRepository extends BaseRepository<any> {
    constructor(dataSource: DataSource) {
        super(dataSource, 'labels', ["id"]);
    }
}