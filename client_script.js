const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(),'config.json'));

let menuOpen = false;
let ESX = null;

let craftingInProgress = false;
let craftDuration = 0;
let craftingCanceled = false;
let elapsedTime = 0;
let ped = PlayerPedId();

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

RegisterRawNuiCallback('cancelCraft', (data) => {
    const ret = JSON.parse(data.body)
    craftingCanceled = true;
    SendNUIMessage({
        type: "reloadui",
        category: ret.category,
        item: ret.item,
        data: prepareData(config)
    })
})

RegisterRawNuiCallback('craftItem', async (data) => {
    const ret = JSON.parse(data.body)
    CraftItem(ret.category, getRecipeByIdentifier(ret.category, ret.item), ret.amount)
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
    executeAsync(async () => {
        let time = item.craft_duration

        if(time > 0) {
            let animDict = "amb@world_human_hammering@male@base"
            let anim = "base"

            RequestAnimDict(animDict)
            while(!HasAnimDictLoaded(animDict)) { await new Promise(r => setTimeout(r, 1)) }

            craftingInProgress = true
            craftDuration = time

            ClearPedTasksImmediately(ped)
            TaskPlayAnim(ped, animDict, anim, 8.0, -8.0, craftDuration * 1000, 1, 1, true, true, true)
            await timer(craftDuration)
            ClearPedTasksImmediately(ped)

            craftingInProgress = false
            elapsedTime = 0

            if(craftingCanceled) {
                craftingCanceled = false
                return
            }
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

async function timer(duration) {
    for(let i = 0; i < duration; i++) {
        if(craftingCanceled)
            return

        await new Promise(r => setTimeout(r, 1000))
    }
}

const checkTime = executeAsync(async () => {
    while(true) {
        if(craftingInProgress && !craftingCanceled) {
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

executeAsync(async () => {
    while(true) {
        if(IsControlJustReleased(0, 38)) {
            let pos = GetEntityCoords(ped, true)

            if(GetDistanceBetweenCoords(pos.x, pos.y, pos.z, 1691.17, 3588.65, 35.62, true) <= 2) {
                menuOpen = true;
                toggleGui(true);
            }
        }
        if(IsControlJustReleased(0, 73)) {
            craftingCanceled = true;
        }
        await new Promise(r => setTimeout(r, 1))
    }
})