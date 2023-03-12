extends Node

@onready var server = $SocketServer

func serialize():
	var camera = get_viewport().get_camera()
	var data = camera.serialize()

	return data

func _physics_process(_delta):
	var data = serialize()
	server.send_to_all_clients(data)
