const config = {
    "categories": [
        {
            "name" : "Waffen",
            "icon" : "far fa-raygun",
            "recipes": [
                {
                    "id": 1,
                    "name": "CZ Bren 2 MS 7.62mm",
                    "description": "Eine sehr durchschlagskräftiges halbautomatisches Sturmgewehr",
                    "image": "https://www.waffenboerse.ch/media/catalog/product/cache/ffc913e37455aa356ec9065e33b80e95/4/7/47476a_3.jpg",
                    "craft_duration": 20,
                    "craft_amount": 1,
                    "ingredients": [
                        {
                            "name": "Halbautomatischer Waffenverschluss",
                            "icon": "far fa-puzzle-piece",
                            "amount": 1,
                            "has": 1
                        },
                        {
                            "name": "11' Waffenlauf",
                            "icon": "far fa-puzzle-piece",
                            "amount": 1,
                            "has": 0
                        },
                        {
                            "name": "30 Schuss Magazin 7.62mm",
                            "icon": "far fa-puzzle-piece",
                            "amount": 1,
                            "has": 0
                        }
                    ]
                }
            ]
        },
        {
            "name" : "Rohstoffverarbeitung",
            "icon" : "far fa-atom",
            "recipes": [
                {
                    "id": 1,
                    "name": "Eisenbarren",
                    "description": "",
                    "image": "https://atlas.wiki.fextralife.com/file/Atlas/iron_ingot_intermediates_resources_atlas_mmo_game_wiki_guide.png",
                    "craft_duration": 5,
                    "craft_amount": 1,
                    "ingredients": [
                        {
                            "name": "Eisenerz",
                            "icon": "far fa-atom",
                            "amount": 5,
                            "has": 200
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "Goldbarren",
                    "icon": "far fa-atom",
                    "description": "",
                    "image": "https://toppng.com/uploads/preview/gold-ingot-png-115527230341z9lx3zltx.png",
                    "craft_duration": 8,
                    "craft_amount": 1,
                    "ingredients": [
                        {
                            "name": "Golderz",
                            "icon": "far fa-atom",
                            "amount": 3,
                            "has": 40
                        }
                    ]
                }
            ]
        },
        {
            "name" : "Sonstiges",
            "icon" : "far fa-box-open",
            "recipes": [
                {
                    "id": 1,
                    "name": "Wasserflasche",
                    "description": "",
                    "image": "https://veohops.com/wp-content/uploads/2016/09/45.jpg",
                    "craft_duration": 3,
                    "craft_amount": 1,
                    "ingredients": [
                        {
                            "name": "Flasche",
                            "amount": 1,
                            "has": 3
                        },
                        {
                            "name": "Nicht aufbereitetes Wasser",
                            "amount": 100,
                            "has": 50,
                        }
                    ]
                }
            ]
        }
    ]
}

const loadRecipe = (category, recipe) => {
    recipe = config.categories.find(cat => cat.name == category).recipes.find(rec => rec.id == recipe);
    $('#craftRecipe').removeClass('hidden')
    $('#recipeContainer').html(`
            <div class="bg-gray-900 pt-3 pb-3 shadow border-b border-gray-700">
                <div class="px-4 flex items-center">
                    <img class="h-20 w-20 rounded block mr-3" src="${recipe.image}" alt="">
                    <div class="sm:w-0 sm:flex-1">
                        <h1 id="message-heading" class="text-lg font-medium text-gray-300">
                            ${recipe.craft_amount}x ${recipe.name}
                        </h1>
                        <p class="mt-1 text-sm text-gray-500 truncate">
                            ${recipe.description}
                        </p>
                        <span class="mt-1 text-sm text-gray-300 truncate">
                            <i class="far fa-clock"></i> Herstellungsdauer: ${recipe.craft_duration} s
                        </span>
                    </div>
                </div>
            </div>
            <table class="min-w-full divide-y divide-gray-800">
                <tbody class="bg-gray-900 divide-y divide-gray-700" id="ingredientsContainer">
                    
                </tbody>
            </table>
        </div>`)

    recipe.ingredients.forEach((ingredient) => {
        $('#ingredientsContainer').append(` 
        <tr class="border-b border-gray-700">
            <td class="px-6 py-2 text-right w-1 whitespace-nowrap align-middle text-sm text-gray-500">
                <span class="font-bold">${ingredient.amount}x </span>
            </td>
            <td class="max-w-0 w-full px-6 whitespace-nowrap">
                <div class="flex">
                    <a href="#" class="space-x-2 truncate text-gray-400">
                        <i class="${ingredient.icon} "></i>
                        <span class=" font-medium truncate text-lg">
                            ${ingredient.name}
                        </span>
                    </a>
                </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap text-sm text-gray-500 block align-middle text-center">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${ingredient.amount <= ingredient.has ? 'bg-green-200 text-green-500' : 'bg-red-200 text-red-500' } capitalize">
                    ${ingredient.amount <= ingredient.has ? 'Vorhanden' : 'Fehlt' }
                </span>
            </td>
        </tr>`)
    })
}

function loadRecipes(search = '') {
    let recCount = 0
    $('#recipesContainer').html('')
    config.categories.forEach((category) => {
        if(search != '' && search.startsWith('@') && !category.name.toLowerCase().includes(search.substr(1, search.length).toLowerCase()))
            return

        $('#recipesContainer').append(`
        <li class="relative bg-gray-900 py-1 px-6 text-gray-500 font-medium">
           <span><i class="${category.icon}" aria-hidden="true"></i>&nbsp; ${category.name}</span>
        </li>`);
        category.recipes.forEach((recipe) => {
            if(search != '' && !recipe.name.toLowerCase().includes(search.toLowerCase()) && !search.startsWith('@'))
                return
            recCount++;
            $('#recipesContainer').append(`
            <li class="relative bg-gray-800 py-3 px-6 hover:bg-gray-900" onclick="loadRecipe('${category.name}', ${recipe.id})">
                <div class="flex justify-between space-x-3">
                    <div class="min-w-0 flex-1">
                        <a href="#" class="block focus:outline-none">
                            <span class="absolute inset-0" aria-hidden="true"></span>
                            <p class="text-sm font-medium text-gray-300 truncate">${recipe.craft_amount}x ${recipe.name}</p>
                        </a>
                    </div>
                    <time class="flex-shrink-0 whitespace-nowrap text-sm text-gray-400">${recipe.craft_duration} s</time>
                </div>
                <div class="mt-1">
                    <p class="line-clamp-2 text-sm text-gray-500">
                        ${recipe.description}
                    </p>
                </div>
            </li>`)
        })
    })
    $('#recCount').html(`${recCount} Rezepte gefunden`)
}

$(function() {

    loadRecipes();

    document.getElementById('searchRec').addEventListener('keydown', (event) => {
        if(event.key === 'Enter') {
            loadRecipes($('#searchRec').val())
        }
    })

    window.addEventListener('message', (event) => {
        //open crafting menu
        if(event.data.type == 'enableui') {
            $('#menu').toggleClass('hidden');
        }
    })

    window.addEventListener('keyup', (e) => {
        if(e.key === 'Escape') {
            $.post('https://oktagoncraftmenu/closeMenu', JSON.stringify({}));
        }
    })
})
