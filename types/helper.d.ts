interface Instance {
  GetAttribute<T extends Maybe<AttributeValue> = Maybe<AttributeValue>>(this: Instance, attribute: string): T
}