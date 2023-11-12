const tableCommentMap = new WeakMap<object, string>();

export class TableComment {
  static getComment(obj: object): string | undefined {
    return tableCommentMap.get(obj);
  }

  static setComment(obj: object, comment: string): void {
    tableCommentMap.set(obj, comment);
  }
}
