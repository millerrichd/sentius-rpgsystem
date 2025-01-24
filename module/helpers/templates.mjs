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
    'systems/sentius-rpgsystem/templates/actor/parts/actor-augmentation.hbs',
    //magic words
    'systems/sentius-rpgsystem/templates/actor/parts/actor-spells.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-armor.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-banish.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-control.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-create.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-destroy.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-repair.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-shield.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-summon.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-transform.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-air.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-animal.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-ash.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-dark.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-earth.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-fire.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-fissure.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-force.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-lava.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-light.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-mist.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-mud.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-plant.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-spirit.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-steam.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-water.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-it.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-me.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-them.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-there.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-us.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/magic-words/word-you.hbs',

    //totems
    'systems/sentius-rpgsystem/templates/actor/parts/actor-totems.hbs',

    //psychic powers
    'systems/sentius-rpgsystem/templates/actor/parts/actor-psychicpowers.hbs',
    
    //misc
    'systems/sentius-rpgsystem/templates/actor/parts/actor-effects.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-pools.hbs',
    
    // Item partials
    'systems/sentius-rpgsystem/templates/item/parts/item-effects.hbs',
  ]);
};
``