import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGTrait extends SentiusRPGItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.hideShow = new fields.StringField({ initial: "none" })
    schema.rotate = new fields.StringField({ initial: "fa-caret-right" })
    return schema;
  }
}