import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGBionetic extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.creditCost = new fields.StringField({ initial: "2 dice." })
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 })
    schema.stability = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 })
    schema.rarity = new fields.StringField({ initial: "d6" });
    schema.properties = new fields.StringField({ initial: "None." })

    return schema;
  }
}