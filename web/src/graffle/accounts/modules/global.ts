import * as $$Data from "./data";
import * as $$MethodsSelect from "./methods-select";
import * as $$MethodsDocument from "./methods-document";
import * as $$MethodsRoot from "./methods-root";
import * as $$Schema from "./schema";

declare global {
  export namespace GraffleGlobal {
    export interface Clients {
      Accounts: {
        name: $$Data.Name;
        schema: $$Schema.Schema;
        interfaces: {
          MethodsSelect: $$MethodsSelect.$MethodsSelect;
          Document: $$MethodsDocument.BuilderMethodsDocumentFn;
          Root: $$MethodsRoot.BuilderMethodsRootFn;
        };
        defaultSchemaUrl: null;
      };
    }
  }
}
