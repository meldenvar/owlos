﻿# OWL OS
Open Source IoT Operation System.
- не требует наличие сервера
- готова для подключения устройств, actuators, LCD, DHT, Stepper and other devices
- does't require programming skills
- built-in user interface - use web browser to access and manage your OWL OS nodes
- built-in RESTful server
- built-in MQTT client
- at the same time WiFi access point and station, in any combination: 
	- can be used autonomously
	- can work on a local network
	- can work via the Internet 
- can integrate with other nodes running under OWL OS - organizing an internal network. without using a servers
- available in source code

# How to build:
  - isnstall Arduino Studio 1.8.9. or upper.
  - isnstall COM port driver if your ESP8266 board use CH340 chip https://wiki.wemos.cc/downloads
  - at Arduino Studio menu File\Preferenses -> Addition board managers -> http://arduino.esp8266.com/stable/package_esp8266com_index.json (NOTE: version 2.5.0)
  - at Arduino Studio menu Tools\Board->Board manager find and install ESP8266 community (https://github.com/esp8266/Arduino)
  * see: https://github.com/wemos/Arduino_D1
  - build and upload OWL firmware on your board.
  * after uploading:  
	- connect to WiFi access point owlunit[YOURESPCHIPID]  PWD: 1122334455
	- browse http://192.168.4.1:8084 to access OWL OS UI LGN: admin PWD: admin