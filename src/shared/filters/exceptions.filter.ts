import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exceptionData: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    try {
      let exception = {
        message:
          typeof exceptionData?.message == 'string'
            ? exceptionData?.message
            : exceptionData || 'Pipeline Failed',
        ...(typeof exceptionData == 'object' && exceptionData),
      };

      let httpStatus: number = this.getStatusCode(exception);

      let message: string | null = this.getMessage(exception) || null;

      let errors: string[] = this.getErrors(exception, message);

      const responseBody = {
        data: null,
        message,
        errors,
      };

      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);

      this.logOnError(exception, httpStatus, message);
      if (httpStatus == 400 && errors.length > 1) {
        errors?.forEach((error) => {
          console.error(error);
        });
      }
    } catch (err) {
      console.log(exceptionData);
      httpAdapter.reply(
        ctx.getResponse(),
        {
          data: null,
          message: 'Contact Muhammad Shahzaib.',
          errors: ['Contact Muhammad Shahzaib.'],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getStatusCode(exception: any) {
    switch (true) {
      case exception instanceof HttpException:
        return exception.getStatus();
      case exception?.error?.statusCode:
        return exception?.error?.statusCode;
      case Boolean(exception?.code?.match(/(NotAuthorized|Unauthorized)/i)):
      case Boolean(exception?.message?.match(/(NotAuthorized|Unauthorized)/i)):
        return HttpStatus.UNAUTHORIZED;
      case Boolean(exception?.code?.match(/(NotFound|found)/i)):
      case Boolean(exception?.message?.match(/(NotFound|found)/i)):
        return HttpStatus.NOT_FOUND;
      case Boolean(exception?.code?.match(/(invalid|must|should)/i)):
      case Boolean(exception?.message?.match(/(invalid|must|should)/i)):
        return HttpStatus.BAD_REQUEST;
      case Boolean(exception?.code?.match(/(already|exists)/i)):
      case Boolean(exception?.message?.match(/(already|exists)/i)):
        return HttpStatus.CONFLICT;
      default:
        return (
          exception?.error?.statusCode ||
          exception?.statusCode ||
          (typeof exception?.status == 'number' && exception?.status) ||
          exception?.error?.code ||
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }

  private getMessage(exception: any) {
    switch (true) {
      case Array.isArray(exception?.response?.message):
        return exception?.response?.message[0];
      case ['CodeDeliveryFailureException', 'LimitExceededException']?.includes(
        exception?.code,
      ):
        return 'Unable to send an email, Kindly contact to support.';
      case exception.message?.includes('eu-west-2'):
        return 'Internal Server Error';
      default:
        return exception.message
          ?.replace(/group/i, 'Role')
          .replace('Password did not conform with policy: ', '');
    }
  }

  private getErrors(exception: any, message: string | null) {
    switch (true) {
      case Array.isArray(exception.errors):
        return exception.errors;
      case typeof exception.errors == 'object':
        return Object.values(exception.errors);
      case Array.isArray(exception?.response?.message):
        return exception?.response?.message;
      default:
        return message ? [message] : [];
    }
  }

  private logOnError(exception: any, httpStatus: number, message?: string) {
    const noLogStatus = [403];
    const noLogMessages = ["Token expired.", "Refresh Token has been revoked"];
    let titles = {
      401: 'Unauthorized',
      400: 'BadRequest',
      409: 'AlreadyExists',
      500: 'ServerFailure',
    };

    let exceptionTitle =
      exception?.name?.replace('NotAuthorized', 'Unauthorized') ||
      (typeof exception?.code == 'string' &&
        exception?.code?.replace('NotAuthorized', 'Unauthorized')) ||
      titles[httpStatus || 500];

    if (!noLogStatus.includes(httpStatus) && !noLogMessages.includes(message)) {
      this.logger.error(
        `[${exceptionTitle?.replace('Exception', '')}] ${
          exception.message.charAt(0).toUpperCase() +
          exception?.message?.slice(1)
        }`,
      );
      exception?.stack &&
        console.log(
          '    at ' +
            exception?.stack?.split('    at ')?.slice(1).join('    at '),
        );
    }
  }
}
