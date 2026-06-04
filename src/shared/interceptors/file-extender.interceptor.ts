import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import _ from 'lodash';
import { Observable } from 'rxjs';
@Injectable()
export class FileExtender implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers['content-type'].includes('multipart/form-data')) {
      throw new BadRequestException('Invalid Content Type.')
    }
    if (req.files) {
      const files = {};
      req.files?.forEach((file) => {
        const { fieldname, ...newFile } = file;
        files[file.fieldname] = [...(files[file.fieldname] || []), newFile];
      });
      req.files = files;
    }
    if (req.file || req.files) {
      Object.keys(req.body).forEach((key) => {
        try {
          req.body[key] = JSON.parse(req.body[key].replace('\r\n', ''));
        } catch {
          req.body[key] = _(req.body[key]).isNumber()
            ? _(req.body[key]).toNumber()
            : ['true', 'false'].includes(req.body[key])
              ? req.body[key] === 'true'
              : req.body[key];
        }
      });
    }
    return next.handle();
  }
}
