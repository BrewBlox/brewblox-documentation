FROM python:3.11-slim

COPY script.py /app/script.py

RUN pip3 install paho-mqtt schedule

CMD ["python3", "-u", "/app/script.py"]
