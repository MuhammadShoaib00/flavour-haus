import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { InvalidFileFormatException } from '../../../shared/exceptions/invalid-file-format.exception';
import { FileExtender } from '../../../shared/interceptors/file-extender.interceptor';
/**
 * @description ApiFormData specifies Content-Type as 'multipart/form-data'
 */
export const ApiFormData = ({
  single,
  fieldName,
  multiple,
  fileType,
  fileTypes,
  errorMessage,
  required,
}: {
  single?: boolean;
  fieldName?: string;
  multiple?: boolean;
  fileType?: string;
  fileTypes?: string[];
  errorMessage?: string;
  required?: boolean;
}) =>
  applyDecorators(
    ApiConsumes('multipart/form-data'),
    UseInterceptors(
      single || (!multiple && !fieldName)
        ? FileInterceptor(fieldName, {
            fileFilter(req, file, callback) {
              if (
                (required === false && !file) ||
                !Boolean(
                  file.mimetype.match(
                    RegExp(`(${fileType || fileTypes?.join('|')})`, 'i'),
                  ),
                )
              ) {
                const message =
                  errorMessage == null || errorMessage == ''
                    ? 'Invalid file format provided'
                    : errorMessage;
                callback(new InvalidFileFormatException(message), false);
              }
              callback(null, true);
            },
          })
        : AnyFilesInterceptor({
            fileFilter(req, file, callback) {
              if (
                !Boolean(
                  (required === false && !file) ||
                    file.mimetype.match(
                      RegExp(`(${fileType || fileTypes?.join('|')})`, 'i'),
                    ),
                )
              ) {
                callback(new InvalidFileFormatException(errorMessage), false);
              }
              callback(null, true);
            },
          }),
      new FileExtender(),
    ),
  );
