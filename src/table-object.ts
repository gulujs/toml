import {
  DUPLICATE_KEY_MESSAGE,
  DUPLICATE_TABLE_NAME_MESSAGE,
  TABLE_ARRAY_NAME_IS_DECLARED_AS_KEY_MESSAGE,
  TABLE_ARRAY_NAME_IS_DECLARED_AS_OTHER_TYPE_MESSAGE,
  TABLE_NAME_IS_DECLARED_AS_KEY_MESSAGE,
  TABLE_NAME_IS_DECLARED_AS_TABLE_ARRAY_MESSAGE,
  KEY_IS_NOT_ALLOWED_TO_ADD_TO_TABLE_MESSAGE,
  FAILED_TO_ACCESS_AS_TABLE_MESSAGE,
  TableObjectError
} from './errors/index.js';
import { TableObjectOptions } from './interfaces.js';
import { setTableComment } from './utils.js';


const hasOwn = (obj: unknown, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key);

interface NodeResult {
  node: Record<string, unknown>;
  hasDefinedTable: boolean;
}

export class TableObject {
  root: Record<string, unknown> = {};
  currentTable = this.root;
  currentTablePath: string[] | null = null;
  isCurrentTableArray = false;
  enableTableComment = false;

  private readonly tableSet = new Set();
  private readonly arrayTableSet = new Set();
  private readonly objectSet = new Set();
  private comments: string[] = [];

  constructor(options?: TableObjectOptions) {
    this.enableTableComment = (options || {}).enableTableComment === true;
  }

  set(path: string[], value: unknown): void {
    this.clearComments();

    const { node } = this.getNode(this.currentTable, path, 'set');
    const key = path[path.length - 1]!;

    if (hasOwn(node, key)) {
      throw new TableObjectError(DUPLICATE_KEY_MESSAGE(path, this.currentTablePath, this.isCurrentTableArray));
    }

    node[key] = value;
  }

  switchTable(path: string[]): void {
    const { node, hasDefinedTable } = this.getNode(this.root, path, 'switchTable');

    const key = path[path.length - 1]!;
    if (!hasOwn(node, key)) {
      const child: Record<string, unknown> = {};
      node[key] = child;

      this.objectSet.add(child);
      this.tableSet.add(child);
      this.currentTable = child;
      this.currentTablePath = path;
      this.isCurrentTableArray = false;
      this.setCurrentTableComment();
      return;
    }

    if (hasDefinedTable) {
      throw new TableObjectError(TABLE_NAME_IS_DECLARED_AS_KEY_MESSAGE(path));
    }

    const child = node[key] as Record<string, any>;
    if (this.tableSet.has(child)) {
      throw new TableObjectError(DUPLICATE_TABLE_NAME_MESSAGE(path));
    }

    if (this.objectSet.has(child)) {
      this.tableSet.add(node);
      this.currentTable = child;
      this.currentTablePath = path;
      this.isCurrentTableArray = false;
      this.setCurrentTableComment();

    } else if (Array.isArray(child)) {
      throw new TableObjectError(TABLE_NAME_IS_DECLARED_AS_TABLE_ARRAY_MESSAGE(path));
    } else {
      throw new TableObjectError('Unexpected');
    }
  }


  switchTableArray(path: string[]): void {
    const { node } = this.getNode(this.root, path, 'switchTableArray');

    const key = path[path.length - 1]!;
    if (!hasOwn(node, key)) {
      const child: Record<string, unknown>[] = [{}];
      node[key] = child;
      this.arrayTableSet.add(child);
      this.currentTable = child[0]!;
      this.currentTablePath = path;
      this.isCurrentTableArray = true;
      this.setCurrentTableComment();
      return;
    }

    const child = node[key] as Record<string, unknown>[];

    if (!Array.isArray(child)) {
      throw new TableObjectError(TABLE_ARRAY_NAME_IS_DECLARED_AS_OTHER_TYPE_MESSAGE(path));
    }

    if (!this.arrayTableSet.has(child)) {
      throw new TableObjectError(TABLE_ARRAY_NAME_IS_DECLARED_AS_KEY_MESSAGE(path));
    }

    this.currentTable = {};
    this.currentTablePath = path;
    this.isCurrentTableArray = true;
    child.push(this.currentTable);
    this.setCurrentTableComment();
  }

  getNode(node: Record<string, unknown>, path: string[], from: 'set' | 'switchTable' | 'switchTableArray'): NodeResult {
    let hasDefinedTable = false;

    for (let i = 0, len = path.length - 1; i < len; i++) {
      const key = path[i]!;
      if (!hasOwn(node, key)) {
        node[key] = {};
        node = node[key] as Record<string, unknown>;
        this.objectSet.add(node);
        continue;
      }

      const child = node[key] as Record<string, unknown>;
      if (this.tableSet.has(child)) {
        hasDefinedTable = true;
        if (from === 'set') {
          throw new TableObjectError(KEY_IS_NOT_ALLOWED_TO_ADD_TO_TABLE_MESSAGE(path, this.currentTablePath!, i));
        }
      } else if (hasDefinedTable && from === 'switchTable') {
        throw new TableObjectError(TABLE_NAME_IS_DECLARED_AS_KEY_MESSAGE(path));
      }

      if (this.objectSet.has(child)) {
        node = child;
      } else if (Array.isArray(child)) {
        node = child[child.length - 1] as Record<string, unknown>;
      } else {
        throw new TableObjectError(FAILED_TO_ACCESS_AS_TABLE_MESSAGE(path, i, this.currentTablePath, this.isCurrentTableArray));
      }
    }

    return { node, hasDefinedTable };
  }

  addComment(comment: string): void {
    this.comments.push(comment);
  }

  clearComments(): void {
    if (this.enableTableComment) {
      this.comments = [];
    }
  }

  setCurrentTableComment(): void {
    if (!this.enableTableComment || !this.comments.length) {
      return;
    }

    setTableComment(this.currentTable, this.comments.join('\n'));
  }
}
