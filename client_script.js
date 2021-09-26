let menuOpen = false;

RegisterRawNuiCallback('closeMenu', () => {
    menuOpen = false;
    toggleGui(false);
})

function toggleGui(state) {
    SetNuiFocus(state, state)
    SendNUIMessage({
        type: "enableui",
        enable: state
    })
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