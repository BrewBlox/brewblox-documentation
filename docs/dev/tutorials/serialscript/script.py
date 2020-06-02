"""
Example for reading from a serial port inside a container

Dependencies:
- pyserial
"""

import serial

# This is the default serial port
PORT = '/dev/ttyACM0'

# You may need to further configure settings
# See the pyserial documentation for more info
# https://pythonhosted.org/pyserial/pyserial_api.html#classes
ser = serial.Serial(port=PORT,
                    baudrate=9600,
                    timeout=1)

try:
    while True:
        # Read raw data from the stream
        # Convert the binary string to a normal string
        # Remove the trailing newline character
        message = ser.readline().decode().rstrip()

        print(f'recv {message}')
finally:
    ser.close()
