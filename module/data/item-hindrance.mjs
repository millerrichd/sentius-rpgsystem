import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGHindrance extends SentiusRPGItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      rating: new fields.StringField({ required: true, nullable: false, initial: 'Minor' })
    });
    schema.hideShow = new fields.StringField({ initial: "none" })
    schema.rotate = new fields.StringField({ initial: "fa-caret-right" })
    return schema;
  }
}