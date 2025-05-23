from Teclado.keyboard import MatrixKeyboard
from machine import Pin, I2C
from OLED.ssd1306 import SSD1306_I2C
from RFID.MFRC522 import MFRC522
import utime

# Configuração hardware
rows_pins = [6, 7, 8, 9]
cols_pins = [2, 3, 4, 5]
debounce_time = 20
keyboard = MatrixKeyboard(rows_pins, cols_pins, debounce_time)

i2c = I2C(0, scl=Pin(21), sda=Pin(20), freq=400000)
display = SSD1306_I2C(128, 32, i2c)

led = Pin(15, Pin.OUT)
buzzer = Pin(28, Pin.OUT)

# Initialize RFID reader with correct pins (match your wiring)
reader = MFRC522(18, 19, 16, 15, 14)  # SCK=18, MOSI=19, MISO=16, RST=15, SDA=14

# Estado do sistema
password_entering = False
entered_password = ""
correct_password = "12345"
last_activity_time = utime.time()
inactive_timeout = 10  # segundos

def beep(times, duration_on=0.05, duration_off=0.05):
    for _ in range(times):
        buzzer.on()
        utime.sleep(duration_on)
        buzzer.off()
        utime.sleep(duration_off)

def display_message(msg):
    display.fill(0)
    display.text(msg, 5, 10, 1)
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

print("Aproxime um cartão RFID ou digite senha")
display_message("Aproxime um cartão RFID ou digite senha")

access_granted_time = None
access_granted = False
rfid_enabled = True
display_cleared = False  # True quando display está limpo (sem mensagem)

while True:
    keys = keyboard.get_pressed_keys()
    current_time = utime.time()

    # Se acesso liberado, verifica timeout para limpar display
    if access_granted:
        if current_time - access_granted_time >= 10:
            display.fill(0)    # Limpa o display
            display.show()
            access_granted = False
            rfid_enabled = True  # reativa RFID após limpar display
            display_cleared = True
            led.value(0)

    # Timeout para limpar tela e apagar LED após inatividade (quando não estiver com acesso liberado)
    if (not access_granted) and (current_time - last_activity_time > inactive_timeout):
        if not display_cleared:
            display.fill(0)  # Limpa o display
            display.show()
            led.value(0)
            display_cleared = True

    # Se o display está limpo e houver interação, mostra a mensagem inicial
    if display_cleared:
        if keys or (rfid_enabled and check_rfid()):
            display_message("Aproxime um cartão RFID ou digite senha")
            display_cleared = False
            last_activity_time = current_time

    # Processa RFID (só se não estiver no modo senha e se RFID estiver habilitado)
    if not password_entering and rfid_enabled and not display_cleared:
        uid = check_rfid()
        if uid:
            display_message("Acesso Liberado")
            print(f"UID: {uid}")
            beep(3, 0.1, 0.1)
            led.value(1)
            access_granted_time = current_time
            access_granted = True
            rfid_enabled = False  # evita múltiplas leituras do mesmo cartão
            last_activity_time = current_time

    # Processa teclado
    if keys:
        for key in keys:
            print(f"Tecla pressionada: {key}")
            last_activity_time = current_time

            if key == "*":
                password_entering = True
                entered_password = ""
                display_message("Digite a senha")
                rfid_enabled = False  # desativa RFID ao entrar senha
                display_cleared = False

            elif password_entering and key in "1234567890":
                entered_password += key
                display_message("Senha: " + "*" * len(entered_password))

            elif key == "#" and password_entering:
                password_entering = False
                display_message("Verificando...")

                if entered_password == correct_password:
                    display_message("Senha OK! Apresente RFID")
                    beep(3, 0.05, 0.05)
                    # Espera o cartão ser apresentado durante 5 segundos
                    start_wait = utime.ticks_ms()
                    uid = None
                    while utime.ticks_diff(utime.ticks_ms(), start_wait) < 5000:
                        uid = check_rfid()
                        if uid:
                            break
                        utime.sleep_ms(100)

                    if uid:
                        display_message("Acesso Liberado")
                        print(f"UID: {uid}")
                        beep(3, 0.1, 0.1)
                        led.value(1)
                        access_granted_time = utime.time()
                        access_granted = True
                    else:
                        display_message("RFID nao detectado")
                        beep(2, 0.3, 0.3)

                else:
                    display_message("Senha incorreta")
                    beep(2, 0.3, 0.3)

                entered_password = ""
                rfid_enabled = True  # reativa RFID depois da senha

    utime.sleep_ms(100)

