let ESX = null

TriggerEvent('esx:getSharedObject', (obj) => ESX = obj)

RegisterServerEvent('oktagon:craftItem')
on('oktagon:craftItem', (category, blueprint, amount) => {
    let player = ESX.GetPlayerFromId(source)
    removeItemsFromBlueprint(player, blueprint, amount).then(() => {
        logRequest(player, blueprint, amount)
    })
})

RegisterServerEvent('oktagon:refreshConfig')
on('oktagon:refreshConfig', () => {
    TriggerClientEvent('oktagon:reloadConfig')
})

async function logRequest(source, item, amount) {
    const request = new XMLHttpRequest();
    request.open('POST', 'https://discord.com/api/webhooks/892725627336142900/NJ02OJjHz8GgojPD1WUecNTYbsz0hNDhiXwV4_Uws20sd5_sOrZ44olSafa_LUt_RxiR')
    request.setRequestHeader('Content-type', 'application/json')
    const params = {
        username: "Oktagon-x Herstellungsmenü",
        avatar_url: "",
        "embeds": [
            {
                "title": "Gegenstandsherstellung",
                "description": `Der Spieler ${source.id} hat das Item ${item.name} hergestellt`,
                "color": 14177041
            }
        ]
    }
    request.send(JSON.stringify(params))
    await new Promise(r => setTimeout(r, 1))
}

async function removeItemsFromBlueprint(source, blueprint, amount) {
    blueprint.ingredients.forEach((ingredient) => {
        source.removeInventoryItem(ingredient.identifier, ingredient.amount)
    })
    source.addInventoryItem(blueprint.identifier, blueprint.craft_amount * amount)
    await new Promise(r => setTimeout(r, 1))
}