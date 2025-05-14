import utime
from machine import Pin, SPI
from RFID.MFRC522 import MFRC522

# Configura os pinos para o SPI e o RC522
#sck = Pin(18, Pin.OUT)   # Pino SPI SCK
#mosi = Pin(19, Pin.OUT)  # Pino SPI MOSI
#miso = Pin(16, Pin.IN)   # Pino SPI MISO
#sda = Pin(14, Pin.OUT)    # Pino CS do RC522
#rst = Pin(15, Pin.OUT)   # Pino de Reset do RC522

# Configura o SPI
#spi = SPI(0, baudrate=50000, polarity=0, phase=0, sck=sck, mosi=mosi, miso=miso)

# Inicializa o leitor RC522
reader = MFRC522(18, 16, 19, 14, 15)

def read_card():
    # Tenta ler um cartão
    (status, tag_type) = reader.request(reader.REQIDL)
    if status == reader.OK:
        print("Cartão detectado!")
        (status, uid) = reader.anticoll()
        if status == reader.OK:
            print("UID do cartão: {}".format(uid))  # Exibe o UID do cartão
            return uid
    return None

def main():
    print("Aproxime o cartão ou token para obter o UID...")
    
    while True:
        # Verifica se há um cartão próximo
        uid = read_card()
        if uid:
            print("UID lido: {}".format(uid))
        utime.sleep(0.5)  # Aguarda antes de tentar ler novamente

# Executa o código
main()

