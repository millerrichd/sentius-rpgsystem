import SentiusRPGItemBase from "./base-item.mjs";

export default class SentiusRPGVehicle extends SentiusRPGItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Break down roll formula into three independent fields
    schema.armorRating = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    schema.armorDie = new fields.StringField({ initial: "d4" })
    schema.armorCurrentDie = new fields.StringField({ initial: "" })
    schema.properties = new fields.StringField({ initial: "None." })
    schema.motionType = new fields.StringField({ initial: "Wheeled, ATV" })
    schema.rarity = new fields.StringField({ initial: "d12" })
    schema.creditCost = new fields.StringField({ initial: "2 dice." })
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 })
    schema.speed = new fields.StringField({ initial: "10 mph" })
    schema.size = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.defense = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.handling = new fields.NumberField({ ...requiredInteger, initial: 0 })
    schema.handlingType = new fields.StringField({ initial: "Drive" })
    schema.handlingIsNeg = new fields.BooleanField({ initial: false });
    schema.crew = new fields.StringField({ initial: "1" })
    schema.energy = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    schema.av = new fields.BooleanField({ initial: false });
    schema.amEcm = new fields.BooleanField({ initial: false });
    schema.cmdSuite = new fields.BooleanField({ initial: false });
    schema.heavyArmor = new fields.BooleanField({ initial: false });
    schema.energyPod = new fields.BooleanField({ initial: false });
    schema.stabilizer = new fields.BooleanField({ initial: false });
    schema.cargo = new fields.StringField({ initial: "125 cubic feet" });
    schema.exposedCrew = new fields.BooleanField({ initial: false });
    schema.targetSystem = new fields.BooleanField({ initial: false });
    schema.passengers = new fields.BooleanField({ initial: false });
    schema.passengerCount = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const vehicle = this

    if (vehicle.handling < 0) {
      vehicle.handlingIsNeg = true;
    } else {
      vehicle.handlingIsNeg = false;
    }

    if (vehicle.armorCurrentDie === '') {
      this.armorCurrentDie = vehicle.armorDie;
    }

    this.formula = `${this.armorCurrentDie}`
  }
}