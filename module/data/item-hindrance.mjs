import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGHindrance extends SentiusRPGItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      rating: new fields.StringField({ required: true, nullable: false, initial: 'Minor' })
    });
    return schema;
  }
}