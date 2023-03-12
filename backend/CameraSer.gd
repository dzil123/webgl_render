extends Camera3D

func serialize():
	return {"mat4": Util.to_mat4(global_transform), "fov": fov}
