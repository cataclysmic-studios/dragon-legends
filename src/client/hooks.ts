import { DataKey, DataValue } from "shared/data-models/generic";

export interface DataLinked {
  onDataUpdate(key: DataKey, value: DataValue): void;
}