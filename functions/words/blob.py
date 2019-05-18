import json

a1 = [x.strip() for x in open('a1.csv').readlines()]
a2 = [x.strip() for x in open('a2.csv').readlines()]
b1 = [x.strip() for x in open('b1.csv').readlines()]
b2 = [x.strip() for x in open('b2.csv').readlines()]
c1 = [x.strip() for x in open('c1.csv').readlines()]
c2 = [x.strip() for x in open('c2.csv').readlines()]

full = {
    'a1': a1,
    'a2': a2,
    'b1': b1,
    'b2': b2,
    'c1': c1,
    'c2': c2
}


print(json.dumps(full))