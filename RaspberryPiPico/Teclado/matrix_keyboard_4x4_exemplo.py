"""
@file matrix_keyboard_4x4_examplo.py
@brief Programa para detectar teclas pressionadas em um teclado matricial 4x4 usando Raspberry Pi Pico
@details Este programa demonstra como utilizar a biblioteca matrix_keyboard_4x4.py para detectar as teclas
         pressionadas em um teclado matricial 4x4 e um Raspberry Pi Pico rodando MicroPython.
         O código inclui um debounce para melhorar a estabilidade da leitura das teclas.
@author Rodrigo França
@date 2024-04-22
"""

# Importa a classe MatrixKeyboard da biblioteca matrix_keyboard_4x4.py
from Teclado.keyboard import MatrixKeyboard
# Importa a biblioteca utime para funções relacionadas ao tempo
import utime

# Configuração dos pinos do Raspberry Pi Pico conectados ao teclado matricial
rows_pins = [6, 7, 8, 9]  # Pinos GPIO para as linhas
cols_pins = [2, 3, 4, 5]  # Pinos GPIO para as colunas
debounce_time = 20  # Tempo de debounce em milissegundos

# Instancia o objeto teclado com a configuração de pinos e tempo de debounce
keyboard = MatrixKeyboard(rows_pins, cols_pins, debounce_time)

# Loop infinito para detectar teclas pressionadas continuamente
while True:
    key_chars = keyboard.get_pressed_keys()  # Obtém a lista de teclas pressionadas
    # Processa cada tecla pressionada
    for key in key_chars:
        #print("Tecla pressionada: {}".format(key))
        
        if key == '1':
            print("Key pressed: 1")
        elif key == '2':
            print("Key pressed: 2")
        elif key == '3':
            print("Key pressed: 3")
        elif key == 'A':
            print("Key pressed: A")
        elif key == '4':
            print("Key pressed: 4")
        elif key == '5':
            print("Key pressed: 5")
        elif key == '6':
            print("Key pressed: 6")
        elif key == 'B':
            print("Key pressed: B")
        elif key == '7':
            print("Key pressed: 7")
        elif key == '8':
            print("Key pressed: 8")
        elif key == '9':
            print("Key pressed: 9")
        elif key == 'C':
            print("Key pressed: C")
        elif key == '*':
            print("Key pressed: *")
        elif key == '0':
            print("Key pressed: 0")
        elif key == '#':
            print("Key pressed: #")
        elif key == 'D':
            print("Key pressed: D")
        else:
            print("Unknown key")

    # Pausa para debounce e redução do uso da CPU
    utime.sleep_ms(100)
