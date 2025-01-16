import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGPowerArmor extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.creditCost = new fields.StringField({ initial: "" });
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.rarity = new fields.StringField({ initial: "d4" });
    schema.armorRating = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.armorDie = new fields.StringField({ initial: "d4" });
    schema.armorCurrentDie = new fields.StringField({ initial: "" });
    schema.pace = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.paceDie = new fields.StringField({ initial: "d4" });
    schema.size = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.energy = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.properties = new fields.StringField({ initial: "None." });
    schema.targetSystem = new fields.BooleanField({ initial: false });
    schema.amEcm = new fields.BooleanField({ initial: false });
    schema.heavyArmor = new fields.BooleanField({ initial: false });
    schema.energyPod = new fields.BooleanField({ initial: false });
    schema.stabilizer = new fields.BooleanField({ initial: false });
    schema.jumpPack = new fields.BooleanField({ initial: false });
    schema.finicky = new fields.BooleanField({ initial: false });
    schema.flight = new fields.BooleanField({ initial: false });
    schema.flightSpeed = new fields.StringField({ initial: "0 mph" });
    schema.appliedStrengthDie = new fields.StringField({ initial: "d4" });
    schema.appliedStrengthBonus = new fields.NumberField({ ...requiredInteger, initial: 8, min: 0 });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    if (this.armorCurrentDie === '') {
      this.armorCurrentDie = this.armorDie;
    } else {
      this.armorCurrentDie = this.armorCurrentDie;
    }

    this.formula = `${this.armorCurrentDie}`
  }
}