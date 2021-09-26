$(function() {
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
