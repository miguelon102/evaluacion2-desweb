print('Soy a.py')

from lib2 import b

def printFilename():
    print(__file__)
    print('Invocando a printFilename de b.py')
    b.printFilename()