﻿/* ----------------------------------------------------------------------------
Ready IoT Solution - OWLOS
Copyright 2019, 2020 by:
- Konstantin Brul (konstabrul@gmail.com)
- Vitalii Glushchenko (cehoweek@gmail.com)
- Denys Melnychuk (meldenvar@gmail.com)
- Denis Kirin (deniskirinacs@gmail.com)

This file is part of Ready IoT Solution - OWLOS

OWLOS is free software : you can redistribute it and/or modify it under the
terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

OWLOS is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with OWLOS. If not, see < https://www.gnu.org/licenses/>.

GitHub: https://github.com/KirinDenis/owlos

(Этот файл — часть Ready IoT Solution - OWLOS.

OWLOS - свободная программа: вы можете перераспространять ее и/или изменять
ее на условиях Стандартной общественной лицензии GNU в том виде, в каком она
была опубликована Фондом свободного программного обеспечения; версии 3
лицензии, любой более поздней версии.

OWLOS распространяется в надежде, что она будет полезной, но БЕЗО ВСЯКИХ
ГАРАНТИЙ; даже без неявной гарантии ТОВАРНОГО ВИДА или ПРИГОДНОСТИ ДЛЯ
ОПРЕДЕЛЕННЫХ ЦЕЛЕЙ.
Подробнее см.в Стандартной общественной лицензии GNU.

Вы должны были получить копию Стандартной общественной лицензии GNU вместе с
этой программой. Если это не так, см. <https://www.gnu.org/licenses/>.)
--------------------------------------------------------------------------------------*/

var stopScriptStatus = 0;  //скрипт остановлен не выполняется
var runScriptStatus = 1;   //скрипт выполняется
var debugScriptStatus = 4;
var compilerScriptErrorStatus = 2; //ошибка компиляции скрипта
var runtimeScriptErrorStatus = 3; //ошибка выполнения скрипта (возможно был фатальный сбой, не возобновляейте выполнение такого скрипта, без проверки). 


function createScript(_node) {
    return {
        node: _node,
        name: "",
        status: "",
        debuglinenumber: "",
        bytecode: "",
        codecount: 0,
        datacount: 0,
        timequant: 0,
        ip: 0,
        variables: "",
        deleted: false
    };
}

var scriptsManager = {
    scripts: [],

    _onnew: [],
    doOnNew: function (script) {
        for (var key in scriptsManager._onnew) {
            scriptsManager._onnew[key](script);
        }
    },

    set onNew(onnew) {
        scriptsManager._onnew.push(onnew);
    },

    _onchange: [],
    doOnChange: function (script) {
        for (var key in scriptsManager._onchange) {
            scriptsManager._onchange[key](script);
        }
    },

    set onChange(onchange) {
        scriptsManager._onchange.push(onchange);
    },

    _ondelete: [],
    doOnDelete: function (script) {
        for (var key in scriptsManager._ondelete) {
            scriptsManager._ondelete[key](script);
        }
    },

    set onDelete(ondelete) {
        scriptsManager._ondelete.push(ondelete);
    },


    refresh: function (node) {
        node.networkStatus = NET_REFRESH;
        // асинхронный HTTP запрос
        // this.refreshResult - метод который будет вызван HTTPClient-ом по окончанию асинхронного запроса
        // this - ссылка на экземпляр этого объекта        
        httpGetAsyncWithReciever(node.host + "getallscripts", scriptsManager.refreshResult, node);
    },

    //вызывается асинхронным HTTPClient по окончанию запроса, указан как параметр в httpGetAsyncWithReciever, смотрите this.refresh()
    //httpResult - результат запроса
    //asyncReciever - ссылка на объект сделавший запрос (этот метод будет вызван в контексте другого потока, для него this. это другой объект - занимательный мир JS)
    //мы не можем использовать this, для обращения к методам этого объекта, поэтому заведомо передали себе ссылку на себя "asyncReciever"
    refreshResult: function (httpResult, node) {
        //HTTPClient добавляет строку "%error" в начало Response если запрос не был завешен HTTPCode=200 или произошел TimeOut
        if (!httpResult.indexOf("%error") == 0) {
            node.networkStatus = NET_ONLINE;
            scriptsManager.parseScripts(httpResult, node);
        }
        else { //если HTTPClient вернул ошибку, сбрасываемый предыдущий результат
            if (httpResult.indexOf("reponse") != -1) {
                node.networkStatus = NET_ERROR;
            }
            else {
                node.networkStatus = NET_OFFLINE;
            }
            
        }
    },

    createOrReplace: function (script, asyncReciever, sender) {
        //JavaScript escape function not code "+" char as %2B - we need this char for Script 
        var byteCodeEscape = escape(script.bytecode).replace("+", "%2B").replace(">", "%3E").replace("<", "%3C");
        // %3E >
        // %3C <
        httpPostAsyncWithErrorReson(script.node.host + "createscript", "?name=" + escape(script.name), byteCodeEscape, asyncReciever, sender);
    },

    startDebug: function (script) {
        httpGet(script.node.host + "startdebugscript?name=" + escape(script.name));
    },

    debugNext: function (script) {
        var httpResult = httpGet(script.node.host + "debugnextscript?name=" + escape(script.name));
        if (!httpResult.indexOf("%error") == 0) {
            script.node.networkStatus = NET_ONLINE;
            scriptsManager.parseScripts(httpResult, script.node);
            return true;
        }
        else { //если HTTPClient вернул ошибку, сбрасываемый предыдущий результат
            if (httpResult.indexOf("reponse") != -1) {
                script.node.networkStatus = NET_ERROR;
            }
            else {
                script.node.networkStatus = NET_OFFLINE;
            }
        }
        return false;
    },

    delete: function (script, asyncReciever, sender) {
        deleteScriptAsync(script.node.host, escape(script.name), asyncReciever, sender);
    },

    getScript: function (node, name) {
        for (var scriptKey in scriptsManager.scripts) {
            if ((scriptsManager.scripts[scriptKey].node === node) && (scriptsManager.scripts[scriptKey].name === name)) {
                return scriptsManager.scripts[scriptKey];
            }
        }
        return undefined;
    },

    pushScript: function (script) {
        for (var scriptKey in scriptsManager.scripts) {
            if ((scriptsManager.scripts[scriptKey].node === script.node) && (scriptsManager.scripts[scriptKey].name === script.name)) {
                scriptsManager.scripts[scriptKey] = script;
                scriptsManager.doOnChange(scriptsManager.scripts[scriptKey]);
                return;
            }
        }
        
         scriptsManager.scripts.push(script); //TODO onNew event 
         this.doOnNew(script);            
        
    },

    parseScripts: function (httpResult, node) {

        for (var scriptKey in scriptsManager.scripts) {
            if ((scriptsManager.scripts[scriptKey].node === node)) {
                scriptsManager.scripts[scriptKey].deleted = true; //все удалены перед началом парсинга
            }
        }

        var recievedScripts = httpResult.split("\r");


        if (recievedScripts !== "") {//если первичный парсинг удался

            var script = undefined;

            for (var i = 0; i < recievedScripts.length; i++) {//перечисляем все строки в HTTPResult 
                if (recievedScripts[i] === "") continue; //если строка пуста, берем следующею

                if (recievedScripts[i].indexOf("script:") == 0) { //если заголовок устройства найден                    
                    //add previos 
                    if (script != undefined) {
                        scriptsManager.pushScript(script);
                    }

                    script = createScript(node);
                    script.name = recievedScripts[i].split(":")[1];
                }
                else {
                    if (script == undefined) continue;

                    var splitterPos = recievedScripts[i].indexOf("=");
                    if (splitterPos != -1) {
                        var key = recievedScripts[i].slice(0, splitterPos);
                        var value = recievedScripts[i].slice(splitterPos + 1, recievedScripts[i].lenght);
                        if (script[key] != undefined) {
                            script[key] = value;
                        }
                    }
                }
            }
            if (script != undefined) {
                scriptsManager.pushScript(script);
            }
        }

        var deleted = false;
        while (!deleted) {
            deleted = true;
            for (var scriptKey in scriptsManager.scripts) { //удаляем удаленные на стороне ноды 
                if ((scriptsManager.scripts[scriptKey].node === node)) {
                    if (scriptsManager.scripts[scriptKey].deleted === true) {
                        this.doOnDelete(scriptsManager.scripts[scriptKey]);
                        scriptsManager.scripts.splice(scriptKey, 1);
                        deleted = false;
                        break;
                    }
                }
            }
        }


    }

}