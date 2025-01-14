import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGCybernetic extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.cybernetic = new fields.SchemaField({
      properties: new fields.StringField({ initial: "" })
    });

    return schema;
  }
}