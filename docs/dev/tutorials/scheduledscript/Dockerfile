FROM python:3.7-slim

COPY script.py /app/script.py

RUN pip3 install paho-mqtt schedule

CMD ["python3", "/app/script.py"]
