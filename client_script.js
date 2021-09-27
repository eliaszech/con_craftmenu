const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(),'config.json'));

let menuOpen = false;
let ESX = null;

let craftingInProgress = false;
let currentlyCraftingItem = { "category": null, "item": null }
let craftDuration = 0;
let elapsedTime = 0;

const waitForESX = executeAsync(async () => {
    while(ESX == null) {
        TriggerEvent('esx:getSharedObject', (obj) => ESX = obj)
        await new Promise(r => setTimeout(r, 1))
    }
})

RegisterRawNuiCallback('closeMenu', () => {
    menuOpen = false;
    toggleGui(false);
})

RegisterRawNuiCallback('craftItem', async (data) => {
    const ret = JSON.parse(data.body)
    CraftItem(ret.categoryID, getRecipeByIdentifier(ret.categoryID, ret.item), ret.amount)
})

function getRecipeByIdentifier(category, identifier) {
    return config.categories.find(cat => cat.name == category).recipes.find(rec => rec.identifier == identifier)
}

function toggleGui(state) {
    SetNuiFocus(state, state)
    SendNUIMessage({
        type: "enableui",
        enable: state,
        isCrafting: craftingInProgress,
        data: prepareData(config)
    })
}

function CraftItem(category, item, amount) {
    const craftTime = executeAsync(async () => {
        let time = item.craft_duration

        if(time > 0) {
            craftingInProgress = true;
            currentlyCraftingItem.category = category
            currentlyCraftingItem.item = item
            craftDuration = time
            await new Promise(r => setTimeout(r, time * 1000))
            craftingInProgress = false;
            elapsedTime = 0
        }

        TriggerServerEvent('oktagon:craftItem', category, item.identifier, amount)
        await new Promise(r => setTimeout(r, 500))
        SendNUIMessage({
            type: "reloadui",
            category: category,
            item: item.identifier,
            data: prepareData(config)
        })
    })
}

const checkTime = executeAsync(async () => {
    while(true) {
        if(craftingInProgress) {
            elapsedTime++
            SendNUIMessage({
                type: "updateTimer",
                time: craftDuration,
                elapsed: elapsedTime
            })
        }
        await new Promise(r => setTimeout(r, 1000))
    }
})

function prepareData(data) {
    let playerInventory = ESX.GetPlayerData().inventory
    data.categories.forEach((category) => {
        category.recipes.forEach((recipe) => {
            recipe.ingredients.forEach((ingredient) => {
                let item = playerInventory.find(item => item.name == ingredient.identifier)
                if(item == null)
                    ingredient.has = 0
                else
                    ingredient.has = item.count
            })
        })
    })
    return data;
}

async function executeAsync(targetFunction) {
    setTimeout(targetFunction, 0)
}

const loop = executeAsync(async () => {
    while(true) {
        if(IsControlJustReleased(0, 38)) {
            menuOpen = true;
            toggleGui(true);
        }
        await new Promise(r => setTimeout(r, 1))
    }
})