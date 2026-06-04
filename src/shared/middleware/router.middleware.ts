import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RouterMiddleware implements NestMiddleware {
  private readonly logger = {
    GET: new Logger('GET'),
    POST: new Logger('POST'),
    PATCH: new Logger('PATCH'),
    PUT: new Logger('PUT'),
    DELETE: new Logger('DELETE'),
    HEAD: new Logger('HEAD'),
    OPTIONS: new Logger('OPTIONS'),
  };

  use(req: Request, res: Response, next: NextFunction) {
    const { method, headers, body, query, originalUrl } = req;
    const rawResponse = res.write;
    const rawResponseEnd = res.end;
    const chunkBuffers = [];
    res.write = (...chunks) => {
      const resArgs = [];
      for (let i = 0; i < chunks.length; i++) {
        resArgs[i] = chunks[i];
        if (!resArgs[i]) {
          res.once('drain', res.write);
          i--;
        }
      }
      if (resArgs[0]) {
        chunkBuffers.push(Buffer.from(resArgs[0]));
      }
      return rawResponse.apply(res, resArgs);
    };

    res.end = (...chunk) => {
      const resArgs = [];
      for (let i = 0; i < chunk.length; i++) {
        resArgs[i] = chunk[i];
      }
      if (resArgs[0]) {
        chunkBuffers.push(Buffer.from(resArgs[0]));
      }
      return rawResponseEnd.apply(res, resArgs);
    }

    res.on('finish', () => {
      const { statusCode } = res;
      const responseBody = Buffer.concat(chunkBuffers).toString('utf8');
      const logLevel = statusCode >= 200 && statusCode < 300 ? 'log' : 'error';
      let spacing = Array(6 - method.length).fill(">");
      spacing.length && (spacing[spacing.length - 1] = " ");
      this.logger?.[method.toUpperCase()]?.[logLevel](
        `${spacing.join("")}(${statusCode}) ${originalUrl}`,
      );
      if ([400, 404, 409].includes(statusCode)) {
        console.groupCollapsed('Request Headers');
        {
          console.log(JSON.stringify({
            'Content-Type': headers['Content-Type'] ?? 'application/json',
            ...(headers['authorization'] && { 'Authorization': headers['authorization']?.slice(0, 15) + "..." })
          }, null, 2))
        }
        console.groupEnd();
        if (query && Object.keys(query).length) {
          console.groupCollapsed('Query Params');
          {
            console.log(JSON.stringify(query, null, 2))
          }
          console.groupEnd();
        }
        if (body && Object.keys(body).length) {
          console.groupCollapsed('Request Body');
          {
            console.log(JSON.stringify(body, null, 2))
          }
          console.groupEnd();
        }
        console.groupCollapsed('Response Body');
        {
          console.log(JSON.stringify(JSON.parse(responseBody), null, 2))
        }
        console.groupEnd();
      }
    });

    next();
  }
}
