# Importa a classe MatrixKeyboard da biblioteca matrix_keyboard_4x4.py
from Teclado.keyboard import MatrixKeyboard
# Importa a biblioteca utime para funções relacionadas ao tempo
import utime
# Importa as classes Pin e I2C da biblioteca machine para controlar o hardware do Raspberry Pi Pico
from machine import Pin, I2C
# Importa a classe SSD1306_I2C da biblioteca ssd1306.py
from OLED.ssd1306 import SSD1306_I2C

# Configuração dos pinos do Raspberry Pi Pico conectados ao teclado matricial
rows_pins = [6, 7, 8, 9]  # Pinos GPIO para as linhas
cols_pins = [2, 3, 4, 5]  # Pinos GPIO para as colunas
debounce_time = 20  # Tempo de debounce em milissegundos

# Instancia o objeto teclado com a configuração de pinos e tempo de debounce
keyboard = MatrixKeyboard(rows_pins, cols_pins, debounce_time)

# Configuração do LED
led = Pin(15, Pin.OUT)  # Pin 15 conectado ao LED (ajuste conforme necessário)

# Define os pinos do Raspberry Pi Pico conectados ao barramento I2C 0
i2c0_slc_pin = 17
i2c0_sda_pin = 16

# Inicializa o I2C0 com os pinos GPIO9 (SCL) e GPIO8 (SDA)
i2c0 = I2C(0, scl=Pin(i2c0_slc_pin), sda=Pin(i2c0_sda_pin), freq=400000)

# Inicializa o display OLED I2C de 128x32
display = SSD1306_I2C(128, 32, i2c0)

# Limpa o display
display.fill(0)
display.show()

# Função para exibir mensagem no display
def display_message(message):
    display.fill(0)  # Limpa o display
    display.text(message, 10, 10, 1)  # Escreve o texto no display
    display.show()  # Atualiza o display

# Senha correta
correct_password = "12345"
entered_password = ""
password_entering = False  # Variável para controlar se a senha está sendo digitada

# Tempo máximo de inatividade (10 segundos)
inactive_time_limit = 10  # segundos
last_activity_time = utime.time()  # Hora do último teclado pressionado

# Loop infinito para detectar teclas pressionadas continuamente
while True:
    key_chars = keyboard.get_pressed_keys()  # Obtém a lista de teclas pressionadas

    # Processa cada tecla pressionada
    for key in key_chars:
        print(f"Tecla pressionada: {key}")  # Exibe o valor da tecla pressionada para depuração
        
        # Se pressionar *, começa a coletar a senha
        if key == "*":
            password_entering = True  # Começa a coletar a senha após pressionar '*'
            entered_password = ""  # Limpa qualquer senha anterior
            display_message("Digite a senha")  # Exibe mensagem no display
            print("Iniciando digitação da senha...")
        
        if password_entering and key in "1234567890":  # Considera apenas números
            entered_password += key
            print(f"Senha digitada até agora: {entered_password}")
        
        # Atualiza o tempo da última atividade
        last_activity_time = utime.time()

        # Quando o botão # for pressionado, tenta verificar a senha
        if key == "#" and password_entering:
            # Remover espaços extras e comparar as senhas
            entered_password = entered_password.strip()  # Remove espaços extras
            print(f"Senha digitada: '{entered_password}'")  # Exibe a senha digitada para depuração
            print(f"Senha correta: '{correct_password}'")  # Exibe a senha correta para depuração

            # Verifica se a senha digitada está correta
            if entered_password == correct_password:
                led.value(1)  # Acende o LED
                display_message("Senha correta")  # Exibe "Senha correta" no display
                print("Senha correta!")
            else:
                led.value(0)  # Apaga o LED
                display_message("Senha incorreta")  # Exibe "Senha incorreta" no display
                print("Senha incorreta!")

            # Limpa a senha digitada e aguarda nova tentativa
            password_entering = False  # Desativa o modo de digitação de senha
            entered_password = ""  # Limpa a senha digitada
            print("Aguarde nova tentativa...")

    # Verifica se o tempo de inatividade foi atingido
    if utime.time() - last_activity_time >= inactive_time_limit:
        print("Desligando LED após 10 segundos de inatividade.")
        display.fill(0)   # Mensagem inicial
        display.show()
        last_activity_time = utime.time()  # Reinicia o tempo após desligar o LED

    # Pausa para debounce e redução do uso da CPU
    utime.sleep_ms(100)

