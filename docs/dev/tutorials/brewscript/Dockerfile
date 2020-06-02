# We use the official `python` image as base.
FROM python:3.7-slim

# Copy the python script into the image
# Syntax: `COPY [SOURCE] [DESTINATION]`
COPY script.py /app/script.py

# We need to run commands while building the image
# This will install the `requests` package so we can use it in script.py
RUN pip3 install requests

# The command is executed when the container starts
CMD ["python3", "/app/script.py"]
