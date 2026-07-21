import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoleRepository } from './role.repository';
import { currentTimestamp } from 'libs/common/utils/date.util';

@Injectable()
export class RolesService {

  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly dataSource: DataSource,
  ) {
  }

  async create(body: any) {
    try {
      const dataRef = {
        name: body.name,
        created_at: currentTimestamp()
      }
      // check tồn tại
      const existing = await this.dataSource.query(
        `SELECT id FROM roles WHERE name = $1 LIMIT 1`,
        [body.name],
      );

      if (existing.length > 0) {
        return {
          code: 0,
          message: 'Role name already exists',
        };
      }
      return await this.roleRepo.create(dataRef);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  async findAll() {
    try {
      return await this.roleRepo.findAll();
    } catch (error) {

      console.error(error);
      throw error;
    }
  }

  async getPaging(query: any) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const filters: any = {};
      if (query.name) {
        filters.name = query.name;
      }
      //created_from: thời gian bắt đầu, created_to: thời gian kết thúc
      if (query.created_to && query.created_from) {
        filters.created_to = query.created_to;
        filters.created_from = query.created_from;
      }

      const result = await this.roleRepo.getPaging({
        page,
        limit,
        sortBy: 'created_at',
        sortOrder: 'DESC',
        filters,
      });

      return result
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}