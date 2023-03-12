tool
extends Node

onready var server = $SocketServer

func find_viewport_3d(node: Node, recursive_level):
	if node.get_class() == "SpatialEditor":
		return node.get_child(1).get_child(0).get_child(0).get_child(0).get_child(0).get_child(0)
	else:
		recursive_level += 1
		if recursive_level > 15:
			return null
		for child in node.get_children():
			var result = find_viewport_3d(child, recursive_level)
			if result != null:
				return result

func get_camera():
	if Engine.editor_hint:
		return find_viewport_3d(get_node("/root/EditorNode"), 0).get_child(0).get_child(0)
	else:
		return get_viewport().get_camera()

func serialize():
	var camera = get_camera()
	var data = {"mat4": Util.to_mat4(camera.global_transform), "fov": camera.fov}

	return data

func _physics_process(_delta):
	var data = serialize()
	print(data)
	server.send_to_all_clients(data)
