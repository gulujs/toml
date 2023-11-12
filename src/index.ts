import {
  Parser,
  ParserOptions,
  Source
} from './parser/index.js';
import {
  Schema,
  SchemaModeSerializer,
  SchemaModeSerializerOptions,
  SchemaValidator,
  SimpleModeSerializer,
  SimpleModeSerializerOptions
} from './serializer/index.js';

export const version = '1.0.0';

export { ParserOptions } from './parser/index.js';
export { InvalidValueError, TableObjectError } from './errors/index.js';
export { TableComment } from './table-object/index.js';

export * from './date.js';
export * from './converter/index.js';
export * from './serializer/schema.js';

export type SerializerOptions = SimpleModeSerializerOptions | SchemaModeSerializerOptions;

export function parse<T = Record<string, unknown>>(source: string, options?: ParserOptions): T {
  const parser = new Parser(new Source(source), options);
  return parser.parse() as T;
}

export function stringify(obj: object, options?: SerializerOptions): string {
  if ((options as SchemaModeSerializerOptions | undefined)?.schemata) {
    const serializer = new SchemaModeSerializer(obj as Record<string, unknown>, options as SchemaModeSerializerOptions);
    return serializer.serialize();
  } else {
    const serializer = new SimpleModeSerializer(obj as Record<string, unknown>, options);
    return serializer.serialize();
  }
}

export function isValidSchema(schemata: Schema[]): boolean {
  const validator = new SchemaValidator(schemata);
  try {
    validator.validate();
    return true;
  } catch (e) {
    return false;
  }
}
