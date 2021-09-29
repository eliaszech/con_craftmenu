let config = null;

function craftItem(category, item, amount) {
    $.post('https://oktagoncraftmenu/craftItem', JSON.stringify({
        "category": category, "item": item, "amount": amount
    }));
}

function cancelCraft(category, item) {
    $.post('https://oktagoncraftmenu/cancelCraft', JSON.stringify({
        "category": category, "item": item
    }));
}

function resetRecipe() {
    $('#recipeContainer').html(`<h1 class="text-gray-400 text-xl font-bold text-center w-full py-20">Wähle ein Rezept aus...</h1>`);
}

const loadRecipe = (category, item) => {
    let recipe = config.find(cat => cat.name == category).recipes.find(rec => rec.identifier == item);
    $('#craftRecipe').removeClass('hidden')
    $('#recipeContainer').html(`
        <div class="flex-shrink-0 bg-gray-900 border-b border-gray-700">
            <!-- Toolbar-->
            <div class="h-12 flex flex-col justify-center">
                <div class="px-4">
                    <div class="py-3 flex justify-between">
                        <!-- Left buttons -->
                        <div>
                            <h1 class="text-white text-xl font-medium">Herstellungsinfo</h1>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Message header -->
        </div>
        <div class="flex-shrink-0 bg-gray-900 border-b border-gray-700 hidden" id="craftTimer" style="background: linear-gradient(90deg, red 0%, #1A202C 100%);">
            <!-- Toolbar-->
            <div class="h-10 flex flex-col justify-center">
                <div class="px-4">
                    <div class="py-3 flex justify-between">
                        <!-- Left buttons -->
                        <div>
                            <h1 class="text-white text-xl font-medium" id="craftDuration"></h1>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Message header -->
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="bg-gray-900 pt-3 pb-3 shadow border-b border-gray-700">
                <div class="px-4 flex items-center">
                    <img class="h-20 w-20 rounded block mr-3" src="${recipe.image}" alt="">
                    <div class="sm:w-0 sm:flex-1">
                        <h1 class="text-lg font-medium text-gray-300">
                            ${recipe.name}
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
        </div>
        <div class="flex-shrink-0 bg-gray-900 border-t border-gray-700 hidden" id="cancelCraft">
            <div class="flex-shrink-0 bg-gray-900 ">
                <!-- Toolbar-->
                <div class="h-16 flex flex-col justify-center">
                    <div class="px-4">
                        <div class="py-3 flex justify-between">
                            <!-- Left buttons -->
                            <div>
                            </div>
                            <div>
                              <span class="relative z-0 inline-flex shadow-sm rounded-md sm:shadow-none sm:space-x-3">
                                <span class="inline-flex float-right">
                                  <button type="button" onclick="cancelCraft('${category}', '${recipe.identifier}')" class="relative inline-flex items-center px-4 py-2 rounded-md text-white border border-red-700 font-medium bg-red-500 hover:bg-red-300 shadow">
                                    <!-- Heroicon name: solid/reply -->
                                    <i class="far fa-times"></i>&nbsp;
                                    <span>Herstellen abbrechen</span>
                                  </button>
                                </span>
                              </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-shrink-0 bg-gray-900 border-t border-gray-700 hidden" id="craftRecipe">
            <div class="flex-shrink-0 bg-gray-900 ">
                <!-- Toolbar-->
                <div class="h-16 flex flex-col justify-center">
                    <div class="px-4">
                        <div class="py-3 flex justify-between">
                            <!-- Left buttons -->
                            <div>
                            </div>
                            <div>
                              <span class="relative z-0 inline-flex shadow-sm rounded-md sm:shadow-none sm:space-x-3">
                                <span class="inline-flex float-right">
                                  <button type="button" onclick="craftItem('${category}', '${recipe.identifier}', 1)" class="relative inline-flex items-center px-4 py-2 rounded-md text-gray-400  border border-gray-700 font-medium bg-gray-800 hover:bg-gray-700 shadow">
                                    <!-- Heroicon name: solid/reply -->
                                    <i class="far fa-pencil-ruler"></i>&nbsp;
                                    <span>Gegenstand herstellen</span>
                                  </button>
                                </span>
                              </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`)

    let hasAllIngreds = true
    recipe.ingredients.forEach((ingredient) => {
        let hasIngreds = ingredient.amount <= ingredient.has
        if(!hasIngreds)
            hasAllIngreds = false

        $('#ingredientsContainer').append(` 
        <tr class="border-b border-gray-700">
            <td class="px-6 py-2 text-right w-1 whitespace-nowrap align-middle text-md text-gray-500">
                <span class="font-bold ${hasIngreds ? 'text-green-500' : 'text-red-500' }">${ingredient.has}x</span>/<span>${ingredient.amount}x </span>
            </td>
            <td class="max-w-0 w-full px-6 whitespace-nowrap">
                <div class="flex">
                    <a href="#" class="space-x-2 truncate text-gray-400">
                        <i class="${ingredient.icon} "></i>
                        <span class=" font-medium truncate text-lg ${hasIngreds ? 'text-green-500' : 'text-red-500' }">
                            ${ingredient.name}
                        </span>
                    </a>
                </div>
            </td>
        </tr>`)
    })
    if(hasAllIngreds)
        $('#craftRecipe').removeClass('hidden')
    else
        $('#craftRecipe').addClass('hidden')
}

function loadRecipes(search = '') {
    let recCount = 0
    $('#recipesContainer').html('')
    $('#searchRec').val('')
    config.forEach((category) => {
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
            <li class="relative bg-gray-800 py-3 px-6 hover:bg-gray-900" onclick="loadRecipe('${category.name}', '${recipe.identifier}')">
                <div class="flex justify-between space-x-3">
                    <div class="min-w-0 flex-1">
                        <a href="#" class="block focus:outline-none">
                            <span class="absolute inset-0" aria-hidden="true"></span>
                            <p class="text-sm font-medium text-gray-300 truncate">${recipe.craft_amount}x ${recipe.name}</p>
                        </a>
                    </div>
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
    document.getElementById('searchRec').addEventListener('keydown', (event) => {
        if(event.key === 'Enter') {
            loadRecipes($('#searchRec').val())
        }
    })

    window.addEventListener('message', (event) => {
        //open crafting menu
        if(event.data.type == 'enableui') {
            config = event.data.data
            loadRecipes();
            if(!event.data.isCrafting) {
                resetRecipe()
                $('#leftContainer').unblock();
            }

            $('#menu').toggleClass('hidden');
        } else if(event.data.type == 'reloadui') {
            config = event.data.data
            loadRecipes();
            loadRecipe(event.data.category, event.data.item)
            $('#leftContainer').unblock();
        } else if(event.data.type == 'setTitle') {
            $('#menuTitle').html(event.data.title)
        } else if(event.data.type == 'updateTimer') {
            let progress = (event.data.elapsed / event.data.time) * 100
            $('#leftContainer').block({
                message: "<i class='far fa-spin fa-spinner'></i> Item wird hergestellt...",
                css: { width: '200px', margin: '10px', padding: '5px', backgroundColor: '#2D3748', color: 'white', border: '1px solid #4A5568' },
                overlayCSS:  {
                    backgroundColor: '#000',
                    opacity:         0.6,
                    cursor:          'wait'
                },
                ignoreIfBlocked: true
            })
            $('#craftTimer').removeClass('hidden')
            $('#craftRecipe').addClass('hidden')
            $('#cancelCraft').removeClass('hidden')
            $('#craftDuration').html(event.data.time - event.data.elapsed + " Sekunden übrig")
            $('#craftTimer').css('background', `linear-gradient(to right, #2D3748 ${progress}%, #1A202C 0%)`)
        }
    })

    window.addEventListener('keyup', (e) => {
        if(e.key === 'Escape') {
            $.post('https://oktagoncraftmenu/closeMenu', JSON.stringify({}));
        }
    })
})
