import { ObjectPath } from '@gulujs/object-path';
import { TableObject } from '../table-object/index.js';
import { Schema, SchemaType } from './schema.js';
import { SCHEMA_TYPE_NOT_IN_RANGE_ERROR_MESSAGE } from '../errors/index.js';

const SUPPORTED_TYPES_IN_TABLE = [
  SchemaType.Any,
  SchemaType.String,
  SchemaType.Integer,
  SchemaType.Float,
  SchemaType.Boolean,
  SchemaType.DateTime,
  SchemaType.Array,
  SchemaType.InlineTable
];

export class SchemaValidator {
  private readonly tableObject = new TableObject();

  constructor(public items: Schema[]) {}

  validate(): void {
    for (let i = 0; i < this.items.length; i++) {
      this.checkSchema(this.items[i]!);
    }
  }

  checkSchema(schema: Schema): void {
    let path: string[];
    if (Array.isArray(schema.key)) {
      path = schema.key as string[];
    } else {
      path = ObjectPath.quoteStyle.keyPath.parse(schema.key) as string[];
    }

    switch (schema.type) {
      case SchemaType.Any:
        this.tableObject.set(path, {});
        return;
      case SchemaType.String:
        this.tableObject.set(path, '1');
        return;
      case SchemaType.Integer:
        this.tableObject.set(path, 1);
        return;
      case SchemaType.Float:
        this.tableObject.set(path, 1.1);
        return;
      case SchemaType.Boolean:
        this.tableObject.set(path, true);
        return;
      case SchemaType.DateTime:
        this.tableObject.set(path, new Date());
        return;
      case SchemaType.Array:
        this.tableObject.set(path, []);
        return;
      case SchemaType.InlineTable:
        this.tableObject.set(path, {});
        return;
      case SchemaType.Table:
        this.tableObject.switchTable(path);
        for (let i = 0; i < schema.items.length; i++) {
          const itemSchema = schema.items[i]!;
          if (!SUPPORTED_TYPES_IN_TABLE.includes(itemSchema.type)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new RangeError(SCHEMA_TYPE_NOT_IN_RANGE_ERROR_MESSAGE([...path, i], (itemSchema as any).type as string, SUPPORTED_TYPES_IN_TABLE));
          }
          this.checkSchema(itemSchema);
        }
        return;
      case SchemaType.ArrayOfTables:
        this.tableObject.switchArrayOfTables(path);
        for (let i = 0; i < schema.items.length; i++) {
          const itemSchema = schema.items[i]!;
          if (!SUPPORTED_TYPES_IN_TABLE.includes(itemSchema.type)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new RangeError(SCHEMA_TYPE_NOT_IN_RANGE_ERROR_MESSAGE([...path, i], (itemSchema as any).type as string, SUPPORTED_TYPES_IN_TABLE));
          }
          this.checkSchema(itemSchema);
        }
        return;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new RangeError(SCHEMA_TYPE_NOT_IN_RANGE_ERROR_MESSAGE(path, (schema as any).type as string, Object.keys(SchemaType)));
    }
  }
}
