function screenToWorld(x, y) {
    
}

function worldToScreen(x, y) {
    
}

function relativate(x, y) {
	return {
		x: Math.floor(x - game._player.x - game._player.width / 2 + game._board.width / 2),
		y: Math.floor(y - game._player.y - game._player.width / 2 + game._board.height / 2)
	}
} 