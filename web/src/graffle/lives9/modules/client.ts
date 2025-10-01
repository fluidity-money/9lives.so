import * as $$SchemaDrivenDataMap from "./schema-driven-data-map";
import * as $$Data from "./data";
import * as $$Scalar from "./scalar";
import * as $$Utilities from "graffle/utilities-for-generated";
import { TransportHttp } from "graffle/extensions/transport-http";

const context = $$Utilities.useReducer(
  {
    ...$$Utilities.Context.States.contextEmpty,
    name: $$Data.Name,
    schemaMap: $$SchemaDrivenDataMap.schemaDrivenDataMap,
    scalars: $$Scalar.$registry,
  },
  TransportHttp({
    url: $$Data.defaultSchemaUrl,
  }),
);

export const create = $$Utilities.createConstructorWithContext(context);
