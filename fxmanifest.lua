---
--- Generated by EmmyLua(https://github.com/EmmyLua)
--- Created by Concado.
--- DateTime: 26.09.2021 20:39
---

fx_version 'cerulean'
games { 'gta5' }

author 'Concado (Baumi)'
description 'A crafting system to craft items'
version '2.0.1'

-- What to run
client_scripts {
    'client.lua',
    'config.lua'
}
server_script 'server.lua'

files {
    'menu/menu.html',
    'menu/js/jquery.min.js',
    'menu/js/jquery.blockUi.js',
    'menu/js/scripts.js',
}
ui_page 'menu/menu.html'


