# Режимы использования OWLOS 

IoT применим во множестве областей - от управления производством и сельского хозяйства, до офисов, квартир, частных домов и подсобных помещений. 
Каждая из областей накладывает свои правила и ограничения на IoT устройства. Осознавая это, мы заложили в архитектуру OWLOS возможность гибко и быстро адаптироваться к условиям применения.
Одним из способов адаптации являются настройка режимов встроенного WiFi модуля и расположение компонентов пользовательского интерфейса (UI).

Приведем практическое примеры:
- Если OWLOS устройства используются на дачном участке, например для управления освещением и поливом растений. Отсутствует Интернет и доступ OWLOS устройствам должен быть у всех владельцев участка. В этом случае OWLOS настраивает WiFi модуль в режим самостоятельной точки доступа, в память микроконтроллера загружаются файлы необходимые для работы с UI. В таком режиме OWLOS доступна как обычный роутер со своим WiFi SSID и паролем. В таком случае к OWLOS может быть подключено любое WiFi устройство, например мобильный телефон. А так как файлы UI сохранены в OWLOS и OWLOS обладает встроенным Веб сервером все у кого есть доступ могут управлять доступными OWLOS устройствами. Обратите внимание, вам не нужен не Интернет, не дополнительное оборудование в виде роутера - все что вам нужно микроконтроллер ESP8266 с OWLOS в прошивке (и разумеется сенсоры и актуаторы на ваш вкус).
- Если OWLOS используется в офисе, этих устройств очень много, есть Интернет и WiFi роутеры, то OWLOS может быть переведена в режим WiFi станции (обычного клиента), а файлы UI располагаться на офисном веб сервере. В этом случае UI работает несколько быстрее, по той причине что возможности микроконтроллера в качестве веб сервера разумеется уступают "настоящему" серверу. Настроив OWLOS в таком режиме, вы можете администрировать права доступа к тем или иным устройствам, написать свой собственный код для контроля и управления вашим офисом - ведь вся функциональность OWLOS доступна через RESTful и MQTT протоколы. 

# Доступные режимы OWLOS 
1. OWLOS WiFi в режиме точки доступа, файлы UI находятся в SPIFFS ESP8266 - клиент любое устройство с доступом к WiFi и браузером. (Работает медленно, но клиент не нуждается в подготовке)
[![OWLOS в режиме WiFi точки доступа с файлами UI](https://github.com/KirinDenis/owlos/raw/master/Documentation/En/Documentation/owlos_scheme_WiFIAPusage.png)

2. OWLOS WiFi в режиме точки доступа, файлы UI находятся на стороне клиента - клиент любое устройство с доступом к WiFi и браузером. (Работает быстро, но на стороне клиента должна быть копия всех UI файлов)
[![OWLOS в режиме WiFi точки доступа без файлов UI](https://github.com/KirinDenis/owlos/raw/master/Documentation/En/Documentation/owlos_scheme_WiFIAPusageUintClient.png)

3. OWLOS WiFi в режиме станции, файлы UI находятся в SPIFFS ESP8266 (необходим WiFi роутер) - клиент любое устройство с доступом к WiFi и браузером. (Работает медленно, но клиент не нуждается в подготовке. ESP8266 и клиент подключены к WiFi роутеру, вы можете использовать много OWLOS устройств из одного UI одновременно)
[![OWLOS в режиме WiFi станции с файлами UI](https://github.com/KirinDenis/owlos/raw/master/Documentation/En/Documentation/owlos_scheme_WiFISTusage.png)

4. OWLOS WiFi в режиме точки доступа, файлы UI находятся на стороне (необходим WiFi роутер) клиента - клиент любое устройство с доступом к WiFi и браузером. (Работает быстро, но на стороне клиента должна быть копия всех UI файлов)
[![OWLOS в режиме WiFi станции без файлов UI](https://github.com/KirinDenis/owlos/raw/master/Documentation/En/Documentation/owlos_scheme_WiFISTusageUintClient.png)

5. Смешанный режим, OWLOS одновременно и WiFi точка доступа и WiFi рабочая станция, файлы UI находятся в SPIFFS ESP8266 - клиент любое WiFi устройство с браузером. У клиента есть два канала доступа к OWLOS. Клиент может подключатся на прямую с OWLOS точке доступа в случае отсутствия WiFi роутора или каких либо проблем с локальной сетью. (Работает медленно из за необходимость передавать файлы UI со стороны OWLOS.

6. Смешанный режим, OWLOS одновременно и WiFi точка доступа и WiFi рабочая станция, файлы UI находятся на стороне клиента. Как и в режиме 5. у клиента есть два канала связи с OWLOS. (Работает быстро, клиент использует только RESTful API предоставляемые OWLOS, файлы UI доступны браузеру клиента локально)

7. OWLOS либо в режиме WiFi станции или в смешанном режиме (5.,6.). При этом WiFi роутер к которому подключена OWLOS настроен в режиме тоннеля и позволяет обращаться к OWLOS из сети Интернет. Это достаточно опасное, с точки зрения безопасности, решение - но дает вам доступ к вашим OWLOS устройством из любой точки мира. Без использования сервера. В этом случае OWLOS выступает в роли IoT Интернет сервера. 
[![OWLOS в режиме WiFi в смешанном режиме](https://github.com/KirinDenis/owlos/raw/master/Documentation/En/Documentation/owlos_scheme_WiFIMixedUsage.png)
