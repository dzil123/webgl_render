class_name Util
extends Object

static func to_mat4(transform: Transform):
	var b = transform.basis
	var t = transform.origin

	return [
		b.x.x,
		b.x.y,
		b.x.z,
		0.0,
		b.y.x,
		b.y.y,
		b.y.z,
		0.0,
		b.z.x,
		b.z.y,
		b.z.z,
		0.0,
		t.x,
		t.y,
		t.z,
		1.0
	]
