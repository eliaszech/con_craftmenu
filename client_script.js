let config = JSON.parse(LoadResourceFile(GetCurrentResourceName(),'config.json'));

let menuOpen = false;
let ESX = null;

let craftingInProgress = false;
let craftDuration = 0;
let craftingCanceled = false;
let elapsedTime = 0;
let ped = PlayerPedId();

const waitForESX = async () => {
    while(ESX == null) {
        TriggerEvent('esx:getSharedObject', (obj) => ESX = obj)
        await new Promise(r => setTimeout(r, 1))
    }
}

on('oktagon:reloadConfig', async () => {
    config = JSON.parse(LoadResourceFile(GetCurrentResourceName(),'config.json'));
    console.log("Initiated config reload from Server")
    if(craftingInProgress) {
        craftingCanceled = true
        toggleGui(false)
    }
    await new Promise(r => setTimeout(r, 1))
})

RegisterCommand('refreshconfig', () => {
    TriggerServerEvent('oktagon:refreshconfig')
}, true)

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
        data: prepareData(config.categories)
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

    if(state)
        SendNUIMessage({
            type: "enableui",
            enable: state,
            isCrafting: craftingInProgress,
            data: prepareData(config.categories)
        })
    else
        SendNUIMessage({
            type: "enableui",
            enable: state,
            isCrafting: craftingInProgress
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
            prevElapsedTime = -1
            elapsedTime = 0

            if(craftingCanceled) {
                craftingCanceled = false
                return
            }
        }

        TriggerServerEvent('oktagon:craftItem', category, item, amount)
        await new Promise(r => setTimeout(r, 500))
        SendNUIMessage({
            type: "reloadui",
            category: category,
            item: item.identifier,
            data: prepareData(config.categories)
        })
    })
}

async function timer(duration) {
    for(let i = 0; i < duration; i++) {
        if(craftingCanceled)
            return

        elapsedTime++

        await new Promise(r => setTimeout(r, 1000))
    }
}

let prevElapsedTime = -1;
const checkTime = async () => {
    while(true) {
        if(craftingInProgress && !craftingCanceled) {
            if(elapsedTime > prevElapsedTime || prevElapsedTime === -1) {
                SendNUIMessage({
                    type: "updateTimer",
                    time: craftDuration,
                    elapsed: elapsedTime
                })
                prevElapsedTime = elapsedTime
            }
        }
        await new Promise(r => setTimeout(r, 100))
    }
}

//Prepares the data that is sent to the GUI
function prepareData(data) {
    //get current player inventory
    let playerInventory = ESX.GetPlayerData().inventory
    //loop through each recipe and set the has attribute so the gui can check if the player has all the ingredients
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

//this is a helper function that can be used to call a function that runs async (used instead of CrateThread in lua)
async function executeAsync(targetFunction) {
    setTimeout(targetFunction, 0)
}

//Draws a given String on specified coordinates
function drawTextWorldToScreen(x, y, z, text) {
    //gets screen position of a the ingame position of the table location
    let onScreenPos = World3dToScreen2d(x, y, z)
    //get the coordinates the camera is located at
    let cCoords = GetGameplayCamCoords()
    //calculates the distance from the camera to the table location
    let dist = GetDistanceBetweenCoords(cCoords[0], cCoords[1], cCoords[2], x, y, z, true)

    //checks if camera is within 3 meters of the table and draws the string if true
    if(dist <= 3) {
        if (onScreenPos[0]) {
            BeginTextCommandDisplayText("STRING")

            SetTextScale(0.0, 0.55)
            SetTextFont(0)
            SetTextProportional(1)
            SetTextColour(255, 255, 255, 255)
            SetTextDropshadow(0, 0, 0, 0, 255)
            SetTextEdge(2, 0, 0, 0, 150)
            SetTextDropShadow()
            SetTextOutline()

            SetTextCentre(1)
            AddTextComponentString(text)
            EndTextCommandDisplayText(onScreenPos[1], onScreenPos[2])
        }
    }
}

//Scriptloop
//Checks button presses and draws strings on table locations
let isWithinCraftingTableRange = false;
const loop = async () => {
    while(true) {
        //current player position
        let pos = GetEntityCoords(ped, true)

        //loops tables in config and draws string on table the player is close to
        config.tables.forEach((table) => {
            if(GetDistanceBetweenCoords(pos[0], pos[1], pos[2], table.x, table.y, table.z, true) <= 1) {
                isWithinCraftingTableRange = true
                drawTextWorldToScreen(table.x, table.y, table.z, "Drücke ~g~[E] ~s~um das Herstellungsmenü zu öffnen")
                break
            }
            isWithinCraftingTableRange = false
        })

        //checks if player presses the key which is configured in the config and is within 1 meter of a crafting table
        if(IsControlJustReleased(0, config.activation_key)) {
            if(isWithinCraftingTableRange) {
                menuOpen = true;
                toggleGui(true);
                break
            }
        }

        //checks if the player presses [X] while crafting something, then sets the craftingCanceled flag
        if(IsControlJustReleased(0, 73)) {
            if(craftingInProgress)
                craftingCanceled = true;
        }

        //TODO: remove on live version
        //checks if the player presses presses [Y] and teleports to this coordinates
        if(IsControlJustReleased(0, 48)) {
            SetEntityCoords(ped, 1691.17, 3588.65, 35.62, true, false, false, false)
        }

        //waits for one millisecond so the game does not freeze
        await new Promise(r => setTimeout(r, 1))
    }
}