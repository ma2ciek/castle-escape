function screenToWorld(x, y) {
    
}

function worldToScreen(x, y) {
    
}

function relativate(x, y) {
	return {
		x: x - game._player.x - game._player.width / 2 + game._board.width / 2,
		y: y - game._player.y - game._player.width / 2 + game._board.height / 2
	}
} 