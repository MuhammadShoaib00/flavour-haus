import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  InsertManyOptions,
  ProjectionType,
  PipelineStage,
  Callback,
  AggregateOptions,
  Expression,
  QueryOptions
} from 'mongoose';
import { AbstractSchema } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractSchema> {
  protected abstract readonly logger: Logger;
  private friendlyName: string;
  private singleName: string;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {
    this.friendlyName = this.model.collection.name.replace(
    /[^a-zA-Z0-9]+(.)/g,
    (_, chr) => chr.toUpperCase(),
  );
  let end: number;
  this.singleName = this.friendlyName.charAt(0).toUpperCase();
  if (this.friendlyName.slice(1).endsWith('ies')) {
    end = -3;
  } else if (this.friendlyName.slice(1).endsWith('es')) {
    end = -2;
  } else if (this.friendlyName.slice(1).endsWith('s')) {
    end = -1;
  }
  this.singleName += `${this.friendlyName
    .slice(1, end)
    .replace(/([A-Z]+)*([A-Z][a-z])/g, '$1 $2')}${
    end == -3 ? 'y' : ''
  }`.toLowerCase();
  }

  async create(document: TDocument, options?: SaveOptions): Promise<TDocument> {
    try {
      const createdDocument = new this.model({
        ...(!document._id && { _id: new Types.ObjectId() }),
        ...document,
      });
      return (
        await createdDocument.save(options)
      ).toJSON() as unknown as TDocument;
    } catch (err) {
      if (err.message.includes('duplicate')) {
        throw new ConflictException(`${this.friendlyName} already exists.`);
      }
      throw new BadRequestException(
        `Invalid ${this.singleName.toLowerCase()} data entered, ${err.message}`,
      );
    }
  }

  async createMany(
    documents: Omit<TDocument, '_id'>[],
    options?: InsertManyOptions,
  ): Promise<TDocument[]> {
    try {
      const insertedDocuments = await this.model.insertMany(documents, options);
      return insertedDocuments as unknown as TDocument[];
    } catch (err) {
      throw new BadRequestException(
        `Invalid ${this.singleName.toLowerCase()} data entered.`,
      );
    }
  }

  async delete(filterQuery?: FilterQuery<TDocument>): Promise<TDocument[]> {
    try {
      const deletedDocument = await this.model.deleteOne(filterQuery || {});
      if (deletedDocument.deletedCount === 0) {
        throw new NotFoundException(`${this.singleName} not found.`);
      }
      return deletedDocument as any;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(
        `Invalid ${this.singleName.toLowerCase()} data entered.`,
      );
    }
  }

  async deleteMany(
    filterQuery: FilterQuery<TDocument>,
    ids?: Array<string>,
    column: string = '_id',
  ): Promise<any> {
    try {
      filterQuery = filterQuery || {};
      const query = ids?.length ? { ...filterQuery, [column]: { $in: ids } } : filterQuery;
      const deletedDocument = await this.model.deleteMany(query);
      if (deletedDocument.deletedCount === 0) {
        this.logger.warn(
          `${this.singleName} not found with filterQuery`,
          filterQuery,
        );
        throw new NotFoundException(`${this.singleName} not found.`);
      }
      return deletedDocument as any;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(
        `Error ${this.friendlyName.toLowerCase()}, ${err.message}.`,
      );
    }
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model.findOneAndDelete(filterQuery, {});
    if (!document) {
      this.logger.warn(
        `${this.singleName} not found with filterQuery`,
        filterQuery,
      );
      throw new NotFoundException(`${this.singleName} not found.`);
    }
    return document;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    projection?: ProjectionType<TDocument>,
    options?: {},
  ): Promise<TDocument> {
    const document = await this.model.findOne(
      filterQuery,
      projection || {},
      options || { lean: true },
    );
    if (!document) {
      this.logger.warn(
        `${this.singleName} not found with filterQuery`,
        filterQuery,
      );
      throw new NotFoundException(`${this.singleName} not found.`);
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: Record<string, any>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
      ...(options || {}),
    });

    if (!document) {
      this.logger.warn(
        `${this.singleName} not found with filterQuery:`,
        filterQuery,
      );
      throw new NotFoundException(`${this.singleName} not found.`);
    }

    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  async find(
    filterQuery?: FilterQuery<TDocument>,
    projection?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>
  ) {
    return this.model.find(filterQuery || {}, projection || {}, options || { lean: true });
  }

  async updateMany(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<any> {
    return this.model.updateMany(filterQuery, update);
  }

  async removeMany(filterQuery: FilterQuery<TDocument>): Promise<any> {
    return this.model.deleteMany(filterQuery || {});
  }

  async findOneWithoutException(
    filterQuery: FilterQuery<TDocument>,
    projection?: ProjectionType<TDocument>,
    options?: {},
  ): Promise<TDocument | null> {
    return this.model.findOne(
      filterQuery,
      projection || {},
      options || { lean: true },
    );
  }

  async startTransaction(): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  async aggregate(
    pipeline?: PipelineStage[],
    options?: AggregateOptions,
    callback?: Callback<any[]>,
  ) {
    return await this.model.aggregate(pipeline, options, callback);
  }

  async count(filterQuery?: FilterQuery<TDocument>) {
    return await this.model.count(filterQuery);
  }

  async getDetails() {
    return await this.model.db.asPromise();
  }

  async paginate({
    filterQuery,
    offset = 0,
    limit = 10,
    returnKey,
    sort,
    pipelines,
    topPipelines,
  }: {
    filterQuery?: FilterQuery<TDocument>;
    offset: number;
    limit: number;
    returnKey?: string;
    sort?: Record<string, 1 | Expression.Meta | -1>;
    pipelines?: Array<any>;
    topPipelines?: Array<any>;
  }) {
    if (typeof offset !== 'number') {
      offset = Number(offset);
    }
    if (typeof limit !== 'number') {
      limit = Number(limit);
    }
    const [data] = await this.model.aggregate<any>([
      ...(topPipelines || []),
      {
        $match: {
          ...filterQuery,
        },
      },
      ...(pipelines || []),
      {
        $sort: {
          ...sort,
          createdAt: -1,
        },
      },
      {
        $facet: {
          total: [
            {
              $sortByCount: '$tag',
            },
          ],
          data: [
            {
              $addFields: {
                _id: '$_id',
              },
            },
          ],
        },
      },
      {
        $unwind: '$total',
      },
      {
        $project: {
          collections: {
            $slice: [
              '$data',
              offset,
              {
                $ifNull: [limit, '$total.count'],
              },
            ],
          },
          total: '$total.count',
          page: {
            $ceil: {$literal: offset / limit + 1},
          },
          pages: {
            $ceil: {
              $divide: ['$total.count', limit],
            },
          },
        },
      },
    ]);
    return {
      [!returnKey
        ? `${this.friendlyName[0].toLowerCase() + this.friendlyName.slice(1)}`
        : returnKey]: (<any>data)?.collections || [],
      meta: {
        page: (<any>data)?.page || 0,
        pages: (<any>data)?.pages || 0,
        limit,
        total: (<any>data)?.total || 0,
      },
    };
  }
}
