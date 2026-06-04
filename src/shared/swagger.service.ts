import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export class SwaggerService {
  static _document: OpenAPIObject;
  static _currentPermissionId: string;
  static _currentPermissionDependencies = new Set<string>();

  constructor(
    private route: string,
    private app: INestApplication,
    private config: Omit<OpenAPIObject, 'paths'>,
  ) {
    SwaggerService._document = SwaggerModule.createDocument(
      this.app,
      this.config,
      {
        operationIdFactory: (controllerKey, methodKey) => {
          return `${controllerKey.replace('Controller', '')}.${methodKey.charAt(0).toUpperCase() + methodKey.slice(1)}`;
        },
      },
    );
  }

  public init() {
    SwaggerModule.setup(this.route, this.app, SwaggerService._document, {
      customCss: CUSTOM_CSS,
      //! this is to remove Schemas tab underneath api in swagger document
      swaggerOptions: {defaultModelsExpandDepth: -1}
    });
  }

  static setCurrentApiUrl(controllerKey, methodKey) {
    this._currentPermissionId = `${controllerKey.replace('Controller', '')}.${methodKey.charAt(0).toUpperCase() + methodKey.slice(1)}`;
  }

  static setCurrentApiDependencies(dependency) {
    this._currentPermissionDependencies.add(dependency);
  }

  static resetApi() {
    this._currentPermissionId = undefined;
    this._currentPermissionDependencies = new Set();
  }
}

const CUSTOM_CSS = `
  .json-schema-form-item-add {
    color: transparent !important;
    font-size: 0 !important;
    padding-top: 7px !important;
    margin-top: 10px !important;
  }

  .json-schema-form-item-add::after {
    content: 'Add new file';
    font-size: 12px;
    color: black
  }

  .json-schema-form-item-remove {
    color: transparent !important;
    font-size: 0 !important;
    padding-top: 7px !important;
    margin-left: 10px !important;
  }

  .json-schema-form-item-remove::after {
    content: 'Remove file';
    font-size: 12px;
    color: black
  }

  .parameter__empty_value_toggle {
    display: flex !important;
  }

  .parameters-col_description input {
    width: unset !important;
  }
`;
