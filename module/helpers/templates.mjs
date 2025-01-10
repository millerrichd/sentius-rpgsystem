/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/sentius-rpgsystem/templates/actor/parts/actor-abilities.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-features.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-items.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-spells.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-effects.hbs',
    'systems/sentius-rpgsystem/templates/actor/parts/actor-pools.hbs',
    
    // Item partials
    'systems/sentius-rpgsystem/templates/item/parts/item-effects.hbs',
  ]);
};
``