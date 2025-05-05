1: float eval() {
2:     float foo = 0.;
3:     if rand(offset(0, 0)) < 0.1 {
4:         foo[offset(0, 0)] += uv.x;
5:         foo[offset(-1, 0)] -= uv.y;
6:     }
7:     return foo;
8: }

->

me fwd:

float eval() {
    float foo = 0.;
    if rand(offset(0, 0)) < 0.1 {
        foo += uv(offset(0, 0)).x;
    }
    return foo;
}


them bkwd:

float eval() {
    float foo = 0.;
    if rand(offset(1, 0)) < 0.1 {
        foo -= uv(offset(1, 0)).y;
    }
    return foo;
}
->

void set(inout T outvar, ivec2 dispatch, ivec2 offset, T newval) {
    if (dispatch == offset) {
        outvar = newval;
    }
}


 : void _eval(inout float foo, ivec2 dispatch) {
3:     if rand(offset(-dispatch)) < 0.1 {
4:         set(foo, dispatch, ivec2(0, 0), foo + uv(-dispatch).x);
5:         set(foo, dispatch, ivec2(-1, 0), foo - uv(-dispatch).y);
6:     }
 : }

1: float eval() {
2:     float foo = 0.;
 :     _eval(foo, ivec2(0, 0));
 :     _eval(foo, ivec2(-1, 0));
7:     return foo;
8: }

eval()

float foo = 0.;
set(foo, ivec2(0, 0), foo + 0.5);
set(foo, ivec2(-1, 0), foo - 1.);






if rand(-offset(-1, 0)) < 0.1 {
    foo[-offset(-1, 0)] += 0.5;
    foo[-offset(0, 0)] -= 1;
}


float rand(ivec2 offset) { return hash(uv(offset), frame); }
float rand(ivec2 offset, ivec2 dispatch) { return rand(offset - dispatch); }

float uv(ivec2 offset) { return thisUV + offset; }
float uv(ivec2 offset, ivec2 dispatch) { return uv(offset - dispatch); }

1: float eval() {
2:     float foo = 0.;
3:     float cond = float(rand() < 0.1);
4:     foo[offset(0, 0)] += uv().x * cond;
5:     foo[offset(-1, 0)] -= uv().y * cond;
7:     return foo;
8: }


1: float eval() {
2:     float foo = 0.;
3: #define COND(O) float(rand(, O) < 0.1)
4:     foo += uv(, offset(0, 0)).x * COND(offset(0, 0));
5:     foo -= uv(, offset(-1, 0)).y * COND(offset(-1, 0));
7:     return foo;
8: }


1: float eval() {
2:     float foo = 0.;
3: #define COND(O) float(rand(, O) < 0.1)
4:     SET(foo, offset(0, 0), foo + UV(O).x * COND(O));
5:     SET(foo, offset(-1, 0), foo - UV(O).y * COND(O));
   #undef COND
7:     return foo;
8: }

// variable, offset (set this pixel relative to me), condition, expression
#define SET(var, _O, C, expr) do { ivec2 O = ivec2 _O; if (bool(C)) { var = (expr); } } while(0)

1: float eval() {
2:     float foo = 0.;
// 3: #define COND(O) float(rand(, O) < 0.1)
3: #define COND(O) rand(O) < 0.1
4:     foo = foo + UV().x * COND());
    // SET(foo, ( 0, 0), 1, foo + UV(O).x)
       SET(foo, ( 0, 0), COND, foo + UV(O).x)
5:     SET(foo, (-1, 0), COND, foo - UV(O).y);
   #undef COND
7:     return foo;
8: }

