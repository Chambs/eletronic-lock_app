"""!
@file display_oled_i2c_128x64_exemplo.py
@brief Programa para escrever em um display OLED I2C de 128x64 usando o Raspberry Pi Pico.
@details Este programa utiliza a biblioteca ssd1306 para escrever em um display OLED de 128x64 via barramento I2C.
         Referência: https://docs.micropython.org/en/latest/esp8266/tutorial/ssd1306.html
@author Rodrigo França
@date 2024-04-03
"""

# Importa as classes Pin e I2C da biblioteca machine para controlar o hardware do Raspberry Pi Pico
from machine import Pin, I2C
# Importa a classe SSD1306_I2C da biblioteca ssd1306.py
from OLED.ssd1306 import SSD1306_I2C

# Define os pinos do Raspberry Pi Pico conectados ao barramento I2C 0
i2c1_slc_pin = 27
i2c1_sda_pin = 26

# Inicializa o I2C0 com os pinos GPIO9 (SCL) e GPIO8 (SDA)
i2c1 = I2C(1, scl=Pin(i2c1_slc_pin), sda=Pin(i2c1_sda_pin), freq=400000)

# Inicializa o display OLED I2C de 128x64
display = SSD1306_I2C(128, 32, i2c1)

# Limpa o display
display.fill(0)
display.show()

# Desenha o logo do MicroPython e imprime um texto
display.fill(0)                        # preenche toda a tela com cor = 0
display.fill_rect(0, 0, 32, 16, 1)     # desenha um retângulo sólido de 0,0 a 32,32, cor = 1
display.fill_rect(2, 2, 28, 12, 0)     # desenha um retângulo sólido de 2,2 a 28,28, cor = 0
display.vline(9, 8, 14, 1)             # desenha uma linha vertical x = 9 , y = 8, altura = 22, cor = 1
display.vline(16, 2, 14, 1)            # desenha uma linha vertical x = 16, y = 2, altura = 22, cor = 1
display.vline(23, 8, 22, 1)            # desenha uma linha vertical x = 23, y = 8, altura = 22, cor = 1
display.fill_rect(26, 12, 2, 4, 1)     # desenha um retângulo sólido de 26,24 a 2,4, cor = 1
display.text('Prino', 40, 0, 1)  # desenha algum texto em x = 40, y = 0 , cor = 1
display.text('VIADO', 40, 12, 1)     # desenha algum texto em x = 40, y = 12, cor = 1
#display.text('chupa pau gozado', 40, 18, 1) # desenha algum texto em x = 40, y = 24, cor = 1
display.show()                         # escreve o conteúdo do FrameBuffer na memória do display

# Escreve na última linha do display
#display.text("Hello World!", 16, 26)

# Atualiza o display
display.show()