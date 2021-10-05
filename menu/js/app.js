$(function() {
    let categories = null
    let recipes = null

    window.addEventListener('message', (e) => {
        if(e.data.type == 'enableui') {
            categories = e.data.categories
            recipes = e.data.recipes

            $('#menu').toggleClass('hidden');
        }
    })

    const app = Vue.createApp({})

    app.component('recipe-category', {
        template:
        `<li class="relative bg-gray-900 py-1 px-6 text-gray-500 font-medium">
           <span><i class="{{}}" aria-hidden="true"></i>&nbsp; {{}}</span>
        </li>`
    })

    app.mount('#menu')
})

