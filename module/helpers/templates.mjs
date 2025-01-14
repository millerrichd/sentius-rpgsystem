/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/sentius-rpgsystem/templates/actor/parts/actor-abilities.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-hindrance.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-trait.hbs',
    //skills
    'systems/sentius-rpgsystem/templates/actor/parts/actor-skills.hbs',
    //equipment
    'systems/sentius-rpgsystem/templates/actor/parts/actor-combo-wapa.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-equipment.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-vehicle.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-cybernetics.hbs',
    //powers
    'systems/sentius-rpgsystem/templates/actor/parts/actor-spells.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-miracles.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-psychicpowers.hbs',
    //misc
    'systems/sentius-rpgsystem/templates/actor/parts/actor-effects.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-pools.hbs',
    
    // Item partials
    'systems/sentius-rpgsystem/templates/item/parts/item-effects.hbs',
  ]);
};
``