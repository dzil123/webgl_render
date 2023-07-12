def list_powerset(lst):
    # the power set of the empty set has one element, the empty set
    result = [[]]
    for x in lst:
        # for every additional element in our set
        # the power set consists of the subsets that don't
        # contain this element (just take the previous power set)
        # plus the subsets that do contain the element (use list
        # comprehension to add [x] onto everything in the
        # previous power set)
        result.extend([subset + [x] for subset in result])
    return result

def list_powerset(lst):
    result = [[]]
    for x in lst:
        result.extend([subset + [x] for subset in result])
    return result

def gen(n):
    class X:
        def __init__(self, x=None):
            self.x = []
            if x is not None:
                self.x.append(x)

        def __repr__(self):
            return f"{n}{self.x}"

        def __or__(self, other):
            if self.__class__ != other.__class__:
                raise ValueError
            x = self.__class__()
            x.x = self.x + other.x
            return x

        def last(self): # head
            if len(self.x) == 0:
                return None
            return self.x[-1]

        def poplast(self): # tail
            x = self.__class__()
            x.x = self.x[:-1]
            return x

    return X

Pick = gen("Pick")
List = gen("List")

def list_powerset(lst):
    result = [[]]
    for x in lst:
        new = []
        for subset in result:
            new.append(subset + [x])
        result.extend(new)
    return result

print(list_powerset([1, 2, 3]))


def list_powerset(lst):
    result = List(Pick())
    for x in lst.x:
        # result2 = result | List()
        # new = List()
        # for subset in result2.x:
        #     new |= List(subset | Pick(x))
        # result |= new
        result = sub1(result, x)
    return result

def sub1(result, x):
    new = List()
    for subset in result.x:
        new |= List(subset | Pick(x))
    return result | new

# 

def list_powerset(lst):
    result = List(Pick())
    for x in lst.x:
        result |= sub1(x, result)
    return result

# ApplyFoo
# Foo = Pick(x) | U
def sub1(x, rest):
    if rest.last() is None:
        return List()
    return sub1(x, rest.poplast()) | List(rest.last() | Pick(x))

# _A
def list_powerset(lst): # lst: keyof T
    result = List(Pick()) # result: Partial<T>
    # for x in lst.x:
    #     result |= sub1(x, result)
    # return result
    return sub2(result, lst)

# ApplyFoo
# Foo = Pick(x) | U
# _C
def _sub1(x, rest): # x: keyof T ;  rest: Partial<T>
    if rest.last() is None:
        return List()
    return sub1(x, rest.poplast()) | List(rest.last() | Pick(x))

def sub1(x, rest):
    ret = _sub1(x, rest)
    print(f"sub1: ({x}, {rest}) -> {ret}")
    return ret

# _B
def sub2(result, lst):
    if lst.last() is None:
        return result
    return sub2(result, lst.poplast()) | sub1(lst.last(), sub2(result, lst.poplast()))


print(list_powerset(List(1) | List(2) | List(3)))
