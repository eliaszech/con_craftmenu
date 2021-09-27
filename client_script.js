const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(),'config.json'));

let menuOpen = false;
let ESX = null;

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
    CraftItem(ret.categoryID, ret.item, ret.amount)
    await new Promise(r => setTimeout(r, 500))
    SendNUIMessage({
        type: "reloadui",
        category: ret.categoryID,
        item: ret.item,
        data: prepareData(config)
    })
})

function toggleGui(state) {
    SetNuiFocus(state, state)
    SendNUIMessage({
        type: "enableui",
        enable: state,
        data: prepareData(config)
    })
}

function CraftItem(category, item, amount) {
    TriggerServerEvent('oktagon:craftItem', category, item, amount)
}

function prepareData(data) {
    let playerInventory = ESX.GetPlayerData().inventory
    console.log(playerInventory.find(item => item.name == 'wool'))
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