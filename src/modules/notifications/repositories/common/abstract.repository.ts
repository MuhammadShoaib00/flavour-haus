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
} from 'mongoose';

export abstract class AbstractRepository<TDocument extends any> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) { }

  async create(document: TDocument, options?: SaveOptions): Promise<TDocument> {
    try {
      const createdDocument = new this.model(document);
      return (
        await createdDocument.save(options)
      ).toJSON() as unknown as TDocument;
    } catch (err) {
      if (err.message.includes('duplicate')) {
        throw new ConflictException(`${this.model.modelName} already exists`);
      }
      throw new BadRequestException(
        `Invalid ${this.model.modelName.toLowerCase()} data entered, ` + err.message,
      );
    }
  }

  async batchCreate(
    documents: Omit<TDocument, '_id'>[],
    options?: InsertManyOptions,
  ): Promise<TDocument[]> {
    try {
      const insertedDocuments = await this.model.insertMany(documents, options);
      return insertedDocuments as unknown as TDocument[];
    } catch (err) {
      throw new BadRequestException(
        `Invalid ${this.model.modelName.toLowerCase()}s data entered`,
      );
    }
  }

  async delete(filterQuery?: FilterQuery<TDocument>): Promise<TDocument[]> {
    try {
      const deletedDocument = await this.model.deleteOne(filterQuery || {});
      if (deletedDocument.deletedCount === 0) {
        throw new NotFoundException(`${this.model.modelName} not found.`);
      }
      return deletedDocument as any;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(
        `Invalid ${this.model.modelName.toLowerCase()} data entered, ${err.message}`,
      );
    }
  }

  async updateMany(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<any> {
    return this.model.updateMany(filterQuery, update);
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>, ids?: Array<string>, column: string = '_id'): Promise<any> {
    try {
      filterQuery = filterQuery || {};
      const query = ids?.length ? { ...filterQuery, [column]: { $in: ids } } : filterQuery;
      const deletedDocument = await this.model.deleteMany(query);
      if (deletedDocument.deletedCount === 0) {
        throw new NotFoundException(`${this.model.modelName}s not found.`);
      }
      return deletedDocument as any;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(
        `Error ${this.model.modelName.toLowerCase()}, ${err.message}`,
      );
    }
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn(
        `${this.model.modelName} not found with filterQuery`,
        filterQuery,
      );
      throw new NotFoundException(`${this.model.modelName} not found.`);
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn(
        `${this.model.modelName} not found with filterQuery:`,
        filterQuery,
      );
      throw new NotFoundException(`${this.model.modelName} not found.`);
    }

    return document;
  }

  async findOneAndDelete(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOneAndDelete(filterQuery, {});
    if (!document) {
      this.logger.warn(
        `${this.model.modelName} not found with filterQuery`,
        filterQuery,
      );
      throw new NotFoundException(`${this.model.modelName} not found.`);
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
  ) {
    return this.model.find(filterQuery || {}, projection || {}, { lean: true });
  }

  async startTransaction(): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  async aggregate(query) {
    return await this.model.aggregate(query);
  }

  async count(filterQuery?: FilterQuery<TDocument>) {
    return await this.model.count(filterQuery);
  }

  async paginate(filterQuery?: FilterQuery<TDocument>, offset: number = 0, limit: number = 20) {
    const totalDocs = await this.count(filterQuery);
    const data = await this.model.find(filterQuery).skip(offset).limit(limit);
    return {
      collections: data,
      total: totalDocs,
      offset: offset,
      limit: limit,
    }
  }


  async fastPaginate(filterQuery: object, offset: Number = 0, limit: Number = 20, sortby: string = 'createdAt', sort: number = -1) {
    filterQuery = filterQuery || {};
    offset = Number(offset);
    limit = Number(limit);
    const query = [
      { '$match': filterQuery },
      { '$sort': { sortby: sort } },
      {
        '$facet': {
          count: [{ $count: "total" }], //{ $addFields: { skip: skip, limit: limit } }
          data: [{ $skip: offset }, { $limit: limit }]
        }
      }
    ]
    const data = await this.aggregate(query);
    return {
      collections: data[0].data,
      total: data[0]?.count[0]?.total || 0,
      offset: offset,
      limit: limit,
    }
  }
}
