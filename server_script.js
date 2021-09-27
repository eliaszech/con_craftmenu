const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(),'config.json'));

let ESX = null

TriggerEvent('esx:getSharedObject', (obj) => ESX = obj)

RegisterServerEvent('oktagon:craftItem')
AddEventHandler('oktagon:craftItem', (category, item, amount) => {
    let blueprint = config.categories.find(cat => cat.name == category).recipes.find(rec => rec.identifier == item)
    removeItemsFromBlueprint(ESX.GetPlayerFromId(source), blueprint, amount)
})

function removeItemsFromBlueprint(source, blueprint, amount) {
    blueprint.ingredients.forEach((ingredient) => {
        source.removeInventoryItem(ingredient.identifier, ingredient.amount)
    })
    source.addInventoryItem(blueprint.identifier, blueprint.craft_amount * amount)
}