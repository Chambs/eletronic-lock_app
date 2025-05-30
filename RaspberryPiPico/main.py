from Teclado.keyboard import MatrixKeyboard
from machine import Pin, I2C
from OLED.ssd1306 import SSD1306_I2C
from RFID.MFRC522 import MFRC522
import utime

# Configuração hardware
rows_pins = [6, 7, 8, 9]
cols_pins = [2, 3, 4, 5]
debounce_time = 5
keyboard = MatrixKeyboard(rows_pins, cols_pins, debounce_time)

i2c = I2C(0, scl=Pin(21), sda=Pin(20), freq=400000)
display = SSD1306_I2C(128, 32, i2c)

buzzer = Pin(28, Pin.OUT)
lock = Pin(13, Pin.OUT)  # Fechadura solenoide no pino 27

reader = MFRC522(18, 19, 16, 15, 14)  # SCK=18, MOSI=19, MISO=16, RST=15, SDA=14

# Estado do sistema
password_entering = False
entered_password = ""
password_start_time = None
correct_password = "12345"
last_activity_time = utime.time()
inactive_timeout = 7  # segundos
password_timeout = 7  # segundos

access_granted_time = None
access_granted = False
display_cleared = False

def beep(times, duration_on=0.05, duration_off=0.05):
    for _ in range(times):
        buzzer.on()
        utime.sleep(duration_on)
        buzzer.off()
        utime.sleep(duration_off)

def display_message(line1="", line2=""):
    display.fill(0)
    display.text(line1, 0, 0, 1)
    display.text(line2, 0, 10, 1)
    display.show()

def check_rfid():
    try:
        status, _ = reader.request(reader.REQIDL)
        if status == reader.OK:
            status, uid = reader.anticoll()
            if status == reader.OK:
                return uid
    except Exception as e:
        print("RFID error:", e)
    return None

def open_lock(duration=5):
    lock.on()
    utime.sleep(duration)
    lock.off()

# Mensagem inicial
print("Aproxime um cartão RFID ou digite senha")
display_message("Aproxime RFID", "ou digite senha")

while True:
    keys = keyboard.get_pressed_keys()
    current_time = utime.time()

    # Limpa após acesso
    if access_granted and (current_time - access_granted_time >= 10):
        display.fill(0)
        display.show()
        access_granted = False
        display_cleared = True

    # Limpa após inatividade
    if not access_granted and (current_time - last_activity_time > inactive_timeout):
        if not display_cleared:
            display.fill(0)
            display.show()
            display_cleared = True

    # Mostra mensagem se tela limpa e houve interação
    if display_cleared:
        if keys or check_rfid():
            display_message("Aproxime RFID", "ou digite senha")
            display_cleared = False
            last_activity_time = current_time

    # RFID sempre ativo (independente do modo senha)
    uid = check_rfid()
    if uid and not access_granted:
        open_lock()  # <- Fechadura acionada
        display_message("Acesso Liberado")
        print(f"UID: {uid}")
        beep(3, 0.1, 0.1)
        access_granted_time = current_time
        access_granted = True
        last_activity_time = current_time

    # Timeout de senha
    if password_entering and password_start_time is not None:
        if current_time - password_start_time > password_timeout:
            display_message("Tempo esgotado")
            beep(2, 0.2, 0.2)
            password_entering = False
            entered_password = ""
            password_start_time = None
            utime.sleep(1)
            display_message("Aproxime RFID", "ou digite senha")
            last_activity_time = utime.time()

    # Teclado
    if keys:
        for key in keys:
            print(f"Tecla pressionada: {key}")
            last_activity_time = current_time

            # Se não estava no modo senha, já entra ao pressionar qualquer tecla
            if not password_entering:
                password_entering = True
                entered_password = ""
                password_start_time = current_time
                display_message("Digite a senha")

            # Se já está no modo senha, processa as teclas digitadas
            if password_entering:
                if key in "1234567890":
                    entered_password += key
                    display_message("Senha:", "*" * len(entered_password))
                    password_start_time = current_time  # Reinicia timeout a cada tecla
                elif key == "*":  # Apagar tudo
                    entered_password = ""
                    display_message("Digite a senha")
                    beep(1, 0.1, 0.05)
                    password_start_time = current_time
                elif key == "#":  # Confirmar senha
                    password_entering = False
                    password_start_time = None
                    display_message("Verificando...")

                    if entered_password == correct_password:
                        open_lock()  # <- Fechadura acionada
                        display_message("Acesso Liberado")
                        beep(3, 0.1, 0.1)
                        access_granted_time = current_time
                        access_granted = True
                    else:
                        display_message("Senha incorreta")
                        beep(2, 0.3, 0.3)

                    entered_password = ""

    utime.sleep_ms(10)

