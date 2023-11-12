import { DecodedPath, EncodedPath, Key } from '@gulujs/object-path';
import { DateTimeType } from '../date.js';

export { DecodedPath, EncodedPath, Key };

export enum SchemaType {
  /**
   * exclude `Table` and `ArrayOfTables`
   */
  Any = 'Any',
  String = 'String',
  Integer = 'Integer',
  Float = 'Float',
  Boolean = 'Boolean',
  DateTime = 'DateTime',
  Array = 'Array',
  InlineTable = 'InlineTable',
  Table = 'Table',
  ArrayOfTables = 'ArrayOfTables'
}
export type SimpleSchemaType = Exclude<SchemaType, SchemaType.Any | SchemaType.Table | SchemaType.ArrayOfTables>;

export type SerializeFn = (value: unknown) => string;
export type SplitFn = (value: string) => string[];
export interface AnySchema {
  type: SchemaType.Any;
  key: Key;
}
export interface StringSchema {
  type: SchemaType.String;
  key: Key;
  split?: string | SplitFn;
}
export interface IntegerSchema {
  type: SchemaType.Integer;
  key: Key;
  radix?: 10 | 16 | 8 | 2;
}
export interface FloatSchema {
  type: SchemaType.Float;
  key: Key;
}
export interface BooleanSchema {
  type: SchemaType.Boolean;
  key: Key;
}
export interface DateTimeSchema {
  type: SchemaType.DateTime;
  key: Key;
  dateTimeType?: DateTimeType;
}
export type AnyArrayItemSchema = Omit<AnySchema, 'key'>;
export type StringArrayItemSchema = Omit<StringSchema, 'key'>;
export type IntegerArrayItemSchema = Omit<IntegerSchema, 'key'>;
export type FloatArrayItemSchema = Omit<FloatSchema, 'key'>;
export type BooleanArrayItemSchema = Omit<BooleanSchema, 'key'>;
export type DateTimeArrayItemSchema = Omit<DateTimeSchema, 'key'>;
export type InlineTableArrayItemSchema = Omit<InlineTableSchema, 'key'>;
export type ArrayItemSchema =
  | SchemaType.Any
  | SchemaType.String
  | SchemaType.Integer
  | SchemaType.Float
  | SchemaType.Boolean
  | AnyArrayItemSchema
  | StringArrayItemSchema
  | IntegerArrayItemSchema
  | FloatArrayItemSchema
  | BooleanArrayItemSchema
  | DateTimeArrayItemSchema
  | InlineTableArrayItemSchema;
export interface ArraySchema {
  type: SchemaType.Array;
  key: Key;
  items: ArrayItemSchema | ArrayItemSchema[];
}
export type KeyValueSchema =
  | AnySchema
  | StringSchema
  | IntegerSchema
  | FloatSchema
  | BooleanSchema
  | DateTimeSchema
  | ArraySchema
  | InlineTableSchema;
export interface InlineTableSchema {
  type: SchemaType.InlineTable;
  key: Key;
  items: KeyValueSchema[] | SchemaType.Any;
}
export interface TableSchema {
  type: SchemaType.Table;
  key: Key;
  items: KeyValueSchema[];
}
export interface ArrayOfTablesSchema {
  type: SchemaType.ArrayOfTables;
  key: Key;
  items: KeyValueSchema[];
}
export type Schema = KeyValueSchema | TableSchema | ArrayOfTablesSchema;
