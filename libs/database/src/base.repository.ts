import { DataSource } from 'typeorm';

export class BaseRepository<T> {
    constructor(
        protected readonly dataSource: DataSource,
        protected readonly tableName: string,
        protected allowedSort: string[] = [],
    ) { }


    async findAll(): Promise<T[]> {
        return this.dataSource.query(`SELECT * FROM ${this.tableName}`);
    }

    async findById(id: number): Promise<T | null> {
        const result = await this.dataSource.query(
            `SELECT * FROM ${this.tableName} WHERE id = $1 LIMIT 1`,
            [id],
        );
        return result[0] || null;
    }

    async create(data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const columns = keys.join(', ');
        const params = keys.map((_, i) => `$${i + 1}`).join(', ');

        const result = await this.dataSource.query(
            `INSERT INTO ${this.tableName} (${columns}) VALUES (${params}) RETURNING *`,
            values,
        );

        return result[0];
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);

        const setQuery = keys
            .map((key, i) => `${key} = $${i + 1}`)
            .join(', ');

        const result = await this.dataSource.query(
            `UPDATE ${this.tableName} SET ${setQuery} WHERE id = $${keys.length + 1
            } RETURNING *`,
            [...values, id],
        );

        return result[0];
    }

    async delete(id: number): Promise<void> {
        await this.dataSource.query(
            `DELETE FROM ${this.tableName} WHERE id = $1`,
            [id],
        );
    }

    async getPaging(options: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
        filters?: Record<string, any>;
    }): Promise<{
        data: T[];
        total: number;
        page: number;
        limit: number;
    }> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'id',
            sortOrder = 'DESC',
            filters = {},
        } = options;

        const offset = (page - 1) * limit;

        const whereClauses: string[] = [];
        const values: any[] = [];

        // 🔥 FILTER DYNAMIC
        Object.keys(filters).forEach((key) => {
            const value = filters[key];

            if (value === undefined || value === null || value === '') return;

            // 👉 LIKE search (string)
            if (
                typeof value === 'string' &&
                key !== 'created_from' &&
                key !== 'created_to'
            ) {
                whereClauses.push(`${key} ILIKE $${values.length + 1}`);
                values.push(`%${value}%`);
            }

            // 👉 exact match (number, boolean)
            else if (typeof value === 'number' || typeof value === 'boolean') {
                whereClauses.push(`${key} = $${values.length + 1}`);
                values.push(value);
            }
        });

        // 🔥 DATE RANGE
        if (filters.created_from) {
            whereClauses.push(`created_at >= $${values.length + 1}`);
            values.push(filters.created_from);
        }

        if (filters.created_to) {
            whereClauses.push(`created_at <= $${values.length + 1}`);
            values.push(filters.created_to);
        }

        const whereQuery =
            whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // 🔥 SORT ANTI SQL INJECTION
        const safeSortBy = this.allowedSort.includes(sortBy)
            ? sortBy
            : this.allowedSort[0] || 'id';

        const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

        // 🔥 QUERY DATA
        const dataQuery = `
            SELECT * FROM ${this.tableName}
            ${whereQuery}
            ORDER BY ${safeSortBy} ${safeSortOrder}
            LIMIT $${values.length + 1}
            OFFSET $${values.length + 2}
            `;

        const data = await this.dataSource.query(dataQuery, [
            ...values,
            limit,
            offset,
        ]);

        // 🔥 QUERY TOTAL
        const countQuery = `
        SELECT COUNT(*) as total FROM ${this.tableName}
        ${whereQuery}
        `;

        const countResult = await this.dataSource.query(countQuery, values);

        return {
            data,
            total: parseInt(countResult[0].total, 10),
            page,
            limit,
        };
    }
}