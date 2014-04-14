//Nathan Murray

window.onload = function() {
    
    "use strict";
    
    
    
    var game = new Phaser.Game( 1600, 1000, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload(){}
    
    function create(){
    //dd = new DungeonState(game);
    game.state.add('dungeon', States.DungeonState);
    game.state.start('dungeon');
    }
    
    function update(){}
};