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

# Initialize RFID reader with correct pins
reader = MFRC522(18, 19, 16, 15, 14)

password_entering = False
entered_password = ""
correct_password = "12345"
last_activity_time = utime.time()
inactive_timeout = 10  # segundos
rfid_enabled = True  # flag para ativar/desativar RFID
access_granted_time = None

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


while True:
    keys = keyboard.get_pressed_keys()
    current_time = utime.time()

    # Se houver teclas pressionadas
    if keys:
        for key in keys:
            print(f"Tecla pressionada: {key}")

            if key == "*":
                # Inicia entrada de senha e desabilita RFID
                password_entering = True
                entered_password = ""
                display_message("Digite a senha")
                last_activity_time = current_time
                rfid_enabled = False

            elif password_entering and key in "1234567890":
                # Construindo senha
                entered_password += key
                display_message("Senha: " + "*" * len(entered_password))
                last_activity_time = current_time

            elif key == "#" and password_entering:
                # Finaliza senha e verifica
                password_entering = False
                display_message("Verificando...")
                last_activity_time = current_time

                if entered_password == correct_password:
                    display_message("Senha OK! Apresente RFID")
                    beep(3, 0.05, 0.05)

                    # Espera RFID por 5 segundos
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
                        access_granted_time = utime.time()  # Guarda o tempo do acesso liberado
                    else:
                        display_message("RFID nao detectado")
                        beep(2, 0.3, 0.3)
                else:
                    display_message("Senha incorreta")
                    beep(2, 0.3, 0.3)

                entered_password = ""
                last_activity_time = utime.time()
                rfid_enabled = True  # Reativa RFID após senha
                

    # Se RFID está habilitado, tenta detectar cartão
    if rfid_enabled:
        uid = check_rfid()
        if uid:
            display_message("Acesso Liberado")
            print(f"UID: {uid}")
            beep(3, 0.1, 0.1)
            led.value(1)
            access_granted_time = utime.time()
            rfid_enabled = False  # Desabilita RFID para não repetir leitura

    # Após liberar acesso, espera 10 segundos para limpar display
    if access_granted_time is not None:
        if current_time - access_granted_time > 10:
            display.fill(0)
            display.show()
            access_granted_time = None
            led.value(0)
            rfid_enabled = True  # Volta a habilitar RFID para novas leituras

    # Timeout para limpar tela e apagar LED após inatividade
    if current_time - last_activity_time > inactive_timeout:
        display.fill(0)
        display.show()
        led.value(0)

    utime.sleep_ms(100)

