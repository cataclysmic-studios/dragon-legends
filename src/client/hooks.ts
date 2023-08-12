import { DataKey, DataValue } from "../shared/data-models";

export interface DataLinked {
  onDataUpdate(key: DataKey, value: DataValue): void;
}