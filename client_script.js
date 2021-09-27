const data = require('config.json');

let menuOpen = false;


RegisterRawNuiCallback('closeMenu', () => {
    menuOpen = false;
    toggleGui(false);
})

function toggleGui(state) {
    SetNuiFocus(state, state)
    SendNUIMessage({
        type: "enableui",
        enable: state,
        data: prepareData(data)
    })
}

function prepareData(data) {
    data.categories.each((category) => {
        category.recipes.each((recipe) => {
            recipe.ingredients.each((ingredient) => {
                ingredient.add('has', 2, 0)
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