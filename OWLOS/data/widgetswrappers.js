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

//-----------------------------------------------------------------------------------
//Devices classes -------------------------------------------------------------------
//Base radial class 
//-----------------------------------------------------------------------------------
var BaseWidgetWrapper =
    
    function () {
        "use strict";

        function BaseWidgetWrapper(parentPanel, device, deviceProperty, noWidget, configPropertiesWidget, widgetProperties) {
            this.configPropertiesWidget = configPropertiesWidget;
            this.widgetProperties = widgetProperties;

            if (device == undefined) {
                devices.addDeviceLoadedListner(this.onDeviceLoaded, this);
            } else {
                this.device = device;
                this.deviceProperty = deviceProperty;
                this.offlineStarter(parentPanel, device._id, deviceProperty.name, noWidget);
                
            }
        }

        var _proto = BaseWidgetWrapper.prototype;

        _proto.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName, noWidget) {
            this.deviceId = deviceId;
            this.devicePropertyName = devicePropertyName;
            dashboardUI.addDashboardModeListner(this.onDashboardModeChange, this);

            if (noWidget == undefined || !noWidget) {
                this.widget = new RadialWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
                this.widget.deviceClass = this;
                this.widget.onload = this.onWidgetLoad;                
            }
        };

        _proto.makeUniqueId = function (id) {
            var count = 1;
            var _id = id;
            while (document.getElementById(_id + "BaseWidget") != undefined) {
                _id = id + count;
                count++;
            }
            return _id;
        }

        _proto.onWidgetLoad = function onWidgetLoad(widget) {
            widget.widgetHolder.onclick = widget.deviceClass.widgetClick;
            
            //widget.deviceClass.draw();
            //widget.properties = widget.deviceClass.configPropertiesWidget;
            if (widget.deviceClass.widgetProperties != undefined) {
                widget.properties = widget.deviceClass.widgetProperties;
            }

            if (widget.deviceClass.device != undefined) {
                widget.deviceClass.joinDevice(widget.deviceClass.device, widget.deviceClass.deviceProperty);
            }

            if (widget.deviceClass._onload != undefined) {
                widget.deviceClass._onload(widget.deviceClass);
            }
        };


        _proto.getWidgetProperties = function () {
            if (this.widget != undefined) {
                return this.widget.properties;
            }
            return undefined;
        };

        _proto.joinDevice = function joinDevice(device, deviceProperty) {
            this.device = device;
            this.deviceProperty = deviceProperty;
            if (this.widget != undefined) {
                if (this.widget.deviceClass != undefined) {
                    this.widget.deviceClass.deviceProperty = deviceProperty;
                }
            }
            this.node = config.getNodeByHost(device._host); //devices.addNetworkStatusListner(this.onNetworkStatusChange, this);

            this.node.addNetworkStatusListner(this.onNetworkStatusChange, this);
            this.deviceProperty.addNetworkStatusListner(this.onNetworkStatusChange, this);
            this.deviceProperty.addValueListner(this.onValueChange, this);
        };

        _proto.onDeviceLoaded = function onDeviceLoaded(sender, device) {
            if (sender.device != undefined) return;

            if (sender.deviceId == device._id) {
                /*
                sender.device = device;
                sender.deviceProperty = device[sender.devicePropertyName];
                sender.widget.deviceClass.deviceProperty = sender.deviceProperty;
                devices.addNetworkStatusListner(sender.onNetworkStatusChange, sender);
                sender.deviceProperty.addNetworkStatusListner(sender.onNetworkStatusChange, sender);
                sender.deviceProperty.addValueListner(sender.onValueChange, sender);
                */
                sender.joinDevice(device, device[sender.devicePropertyName]);
            }
        };

        _proto.onValueChange = function onValueChange(sender, deviceProperty) {
            sender.draw();
        };

        _proto.onNetworkStatusChange = function onNetworkStatusChange(sender, deviceProperty) {
            if (sender.widget != undefined) {
                sender.widget.networkStatus = deviceProperty.networkStatus;
            }
        };

        _proto.onDashboardModeChange = function onDashboardModeChange(sender, mode) {
            if (sender.widget != undefined) {
                if (mode) {
                    sender.widget.mode = WORK_MODE;
                } else {
                    sender.widget.mode = MOVE_MODE;
                }
            }
        };

        _proto.widgetClick = function widgetClick(event) {
            event.stopPropagation();
            var widgetPanel = event.currentTarget;
            var widget = widgetPanel.widget;

            if (widget.mode == WORK_MODE) {
                widget.deviceClass.deviceProperty.getValue();
            }

            return true;
        };

        _proto.refresh = function refresh() { };

        _proto.draw = function draw() {};

        _createClass(BaseWidgetWrapper, [{
            key: "onload",
            get: function get() {
                return this._onload;
            },
            set: function set(onload) {
                this._onload = onload;
            }
        }]);

        return BaseWidgetWrapper;
    }();


var RadialWidgetWrapper =

    function (_BaseWidgetWrapper) {
        "use strict";

        _inheritsLoose(RadialWidgetWrapper, _BaseWidgetWrapper);

        var _proto2 = RadialWidgetWrapper.prototype;

        _proto2.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new RadialWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
            this.widget.deviceClass = this;
            this.widget.onload = this.onWidgetLoad;
        };

        function RadialWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this;

            _this = _BaseWidgetWrapper.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this);
            return _this;
        }

        _proto2.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                this.widget.refresh(this.deviceProperty.value, this.deviceProperty.value, this.device._id);
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return RadialWidgetWrapper;
    }(BaseWidgetWrapper);

//-----------------------------------------------------------------------------------------------------------------------


var TemperatureWidgetWrapper =
    
    function (_BaseWidgetWrapper) {
        "use strict";

        _inheritsLoose(TemperatureWidgetWrapper, _BaseWidgetWrapper);

        var _proto2 = TemperatureWidgetWrapper.prototype;

        _proto2.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new TemperatureWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
            this.widget.deviceClass = this;
            this.widget.onload = this.onWidgetLoad;
        };

        function TemperatureWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this;

            _this = _BaseWidgetWrapper.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this);
            return _this;
        }

        _proto2.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                this.widget.refresh(this.deviceProperty.value, Math.round(this.deviceProperty.value), this.device._id + "-" + getLang("temperature"), this.device.temperaturehistorydata.value);
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return TemperatureWidgetWrapper;
    }(BaseWidgetWrapper); //-----------------------------------------------------------------------------------------------------------------------

var ValueWidgetWrapper =

    function (_BaseWidgetWrapper) {
        "use strict";

        _inheritsLoose(ValueWidgetWrapper, _BaseWidgetWrapper);

        var _proto2 = ValueWidgetWrapper.prototype;

        _proto2.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new ValueWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
            this.widget.deviceClass = this;
            this.widget.onload = this.onWidgetLoad;
        };

        function ValueWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this;

            _this = _BaseWidgetWrapper.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this);
            return _this;
        }

        _proto2.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                this.widget.refresh(this.deviceProperty.value, this.deviceProperty.value, this.device._id + "-" + getLang("value"));
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return ValueWidgetWrapper;
    }(BaseWidgetWrapper); //-----------------------------------------------------------------------------------------------------------------------


var HumidityWidgetWrapper =
    
    function (_BaseWidgetWrapper2) {
        "use strict";

        _inheritsLoose(HumidityWidgetWrapper, _BaseWidgetWrapper2);

        function HumidityWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this2;

            _this2 = _BaseWidgetWrapper2.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this2);
            return _this2;
        }


        var _proto3 = HumidityWidgetWrapper.prototype;

        _proto3.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper2.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new RadialWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
            this.widget.deviceClass = this;
            this.widget.onload = this.onWidgetLoad;
        };

        _proto3.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                this.widget.refresh(this.deviceProperty.value, Math.round(this.deviceProperty.value) + "%", this.device._id + "-"+ getLang("humidity"), this.device.humidityhistorydata.value);
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return HumidityWidgetWrapper;
    }(BaseWidgetWrapper); //HistoryData Graph ------------------------------------------------------------------------------------------------------


var HistoryDataGraphWidgetWrapper =
    
    function (_BaseWidgetWrapper3) {
        "use strict";

        _inheritsLoose(HistoryDataGraphWidgetWrapper, _BaseWidgetWrapper3);

        function HistoryDataGraphWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this3;

            _this3 = _BaseWidgetWrapper3.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this3);
            return _this3;
        }

        var _proto4 = HistoryDataGraphWidgetWrapper.prototype;

        _proto4.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper3.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new GraphWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize, temperatureIcon);
            this.widget.deviceClass = this;
            this.widget.onload = this.onWidgetLoad;                

           // this.widget.deviceClass = this;
            //this.widget.widgetHolder.onclick = this.widgetClick;
            //this.draw();

        };

        _proto4.onWidgetLoad = function onWidgetLoad(widget) {
            widget.widgetHolder.onclick = widget.deviceClass.widgetClick;

            //widget.deviceClass.draw();
            //widget.properties = widget.deviceClass.configPropertiesWidget;
            if (widget.deviceClass.widgetProperties != undefined) {
                widget.properties = widget.deviceClass.widgetProperties;
            }

            if (widget.deviceClass.device != undefined) {
                widget.deviceClass.joinDevice(widget.deviceClass.device, widget.deviceClass.deviceProperty);
            }

            if (widget.deviceClass._onload != undefined) {
                widget.deviceClass._onload(widget.deviceClass);
            }
        };


        _proto4.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                this.widget.refresh(this.deviceProperty.value, this.device._id, this.deviceProperty.value);
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return HistoryDataGraphWidgetWrapper;
    }(BaseWidgetWrapper);

var LightWidgetWrapper =
    
    function (_BaseWidgetWrapper4) {
        "use strict";

        _inheritsLoose(LightWidgetWrapper, _BaseWidgetWrapper4);

        var _proto5 = LightWidgetWrapper.prototype;

        _proto5.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper4.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new LightWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
            this.widget.deviceClass = this;            
            this.widget.onload = this.onWidgetLoad;
        };


        function LightWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this4;

            _this4 = _BaseWidgetWrapper4.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this4);
            return _this4;
        }

        _proto5.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                var percent = Math.round(this.deviceProperty.value / (1024.0 / 100.0));

                if (this.deviceProperty.value < 50) {
                    this.widget.refresh(percent, getLang("low"), this.device._id, this.device.historydata.value);
                } else if (this.deviceProperty.value < configProperties.widgetssize) {
                    this.widget.refresh(percent, getLang("norm"), this.device._id, this.device.historydata.value);
                } else {
                    this.widget.refresh(percent, getLang("high"), this.device._id, this.device.historydata.value);
                }
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return LightWidgetWrapper;
    }(BaseWidgetWrapper);

var SmokeWidgetWrapper =
    
    function (_BaseWidgetWrapper5) {
        "use strict";

        _inheritsLoose(SmokeWidgetWrapper, _BaseWidgetWrapper5);

        var _proto6 = SmokeWidgetWrapper.prototype;

        _proto6.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper5.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new SmokeWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
            this.widget.deviceClass = this;
            this.widget.onload = this.onWidgetLoad;
        };

        function SmokeWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this5;

            _this5 = _BaseWidgetWrapper5.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this5);
            return _this5;
        }

        _proto6.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                var percent = Math.round(this.deviceProperty.value / (1024.0 / 100.0));

                if (this.deviceProperty.value < 50) {
                    this.widget.refresh(percent, getLang("smokelow"), this.device._id, this.device.historydata.value);
                } else if (this.deviceProperty.value < configProperties.widgetssize) {
                    this.widget.refresh(percent, getLang("smokenorm"), this.device._id, this.device.historydata.value);
                } else {
                    this.widget.refresh(percent, getLang("smokehigh"), this.device._id, this.device.historydata.value);
                }
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return SmokeWidgetWrapper;
    }(BaseWidgetWrapper);

var MotionWidgetWrapper =
    
    function (_BaseWidgetWrapper6) {
        "use strict";

        _inheritsLoose(MotionWidgetWrapper, _BaseWidgetWrapper6);

        var _proto7 = MotionWidgetWrapper.prototype;

        _proto7.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName) {
            _BaseWidgetWrapper6.prototype.offlineStarter.call(this, parentPanel, deviceId, devicePropertyName, true);

            this.widget = new MotionWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
            this.widget.deviceClass = this;
            this.widget.onload = this.onWidgetLoad;
        };

        function MotionWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            var _this6;

            _this6 = _BaseWidgetWrapper6.call(this, parentPanel, device, deviceProperty, true, configPropertiesWidget, widgetProperties) || this;
            if (device == undefined) return _assertThisInitialized(_this6);
            return _this6;
        }

        _proto7.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                var data = this.deviceProperty.value;

                if (this.device.historydata.value != undefined) {
                    var splitHistory = this.device.historydata.value.split(";");
                    var count = parseInt(splitHistory[0]);
                    var lastMotion = 0;

                    if (count > 6) {
                        //last minute 
                        for (var i = count - 6; i < count + 1; i++) {
                            lastMotion += parseFloat(splitHistory[i]);
                        }
                    } else {
                        for (var i = 1; i < count + 1; i++) {
                            lastMotion += parseFloat(splitHistory[i]);
                        }
                    }

                    if (lastMotion != 0) {
                        data = 1;
                    }
                }

                var text = "notdetect";

                if (data == 1) {
                    text = "detect";
                }

                this.widget.refresh(data, text, this.device._id, this.device.historydata.value);
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return MotionWidgetWrapper;
    }(BaseWidgetWrapper);

var SensorWidgetWrapper =
    
    function (_BaseWidgetWrapper7) {
        "use strict";

        _inheritsLoose(SensorWidgetWrapper, _BaseWidgetWrapper7);

        function SensorWidgetWrapper() {
            return _BaseWidgetWrapper7.apply(this, arguments) || this;
        }

        var _proto8 = SensorWidgetWrapper.prototype;

        _proto8.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                var percent = 0;
                var text = getLang("non");

                if (this.deviceProperty.value == 1) {
                    percent = 100;
                    text = getLang("yes");
                }

                this.widget.refresh(percent, text, this.device._id);
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        return SensorWidgetWrapper;
    }(BaseWidgetWrapper); //Acturator ----------------------------------------------------------------------------------


var ActuatorWidgetWrapper =
    
    function () {
        "use strict";

        function ActuatorWidgetWrapper(parentPanel, device, deviceProperty, configPropertiesWidget, widgetProperties) {
            this.configPropertiesWidget = configPropertiesWidget;
            this.widgetProperties = widgetProperties;

            if (device == undefined) {
                devices.addDeviceLoadedListner(this.onDeviceLoaded, this);
            } else {
                this.device = device;
                this.deviceProperty = deviceProperty;
                this.offlineStarter(parentPanel, device._id, deviceProperty.name, false);
            }
        }

        var _proto9 = ActuatorWidgetWrapper.prototype;

        _proto9.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName, noWidget) {
            this.deviceId = deviceId;
            this.devicePropertyName = devicePropertyName;
            dashboardUI.addDashboardModeListner(this.onDashboardModeChange, this);

            if (noWidget == undefined || !noWidget) {
                this.widget = new ActuatorWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
                this.widget.deviceClass = this;
                this.widget.onload = this.onWidgetLoad;
            }
        };

        _proto9.makeUniqueId = function (id) {
            var count = 1;
            var _id = id;
            while (document.getElementById(_id + "BaseWidget") != undefined) {
                _id = id + count;
                count++;
            }
            return _id;
        }


        _proto9.onWidgetLoad = function onWidgetLoad(widget) {
            widget.widgetHolder.onclick = widget.deviceClass.widgetClick;

            if (widget.deviceClass.widgetProperties != undefined) {
                widget.properties = widget.deviceClass.widgetProperties;
            }

            if (widget.deviceClass.device != undefined) {
                widget.deviceClass.joinDevice(widget.deviceClass.device, widget.deviceClass.deviceProperty);
            }

            if (widget.deviceClass._onload != undefined) {
                widget.deviceClass._onload(widget.deviceClass);
            }

        };


        _proto9.joinDevice = function joinDevice(device, deviceProperty) {
            this.device = device;
            this.deviceProperty = deviceProperty;
            if (this.widget != undefined) {
                this.widget.deviceClass.deviceProperty = deviceProperty;
            }
            this.node = config.getNodeByHost(device._host); //devices.addNetworkStatusListner(this.onNetworkStatusChange, this);

            this.node.addNetworkStatusListner(this.onNetworkStatusChange, this);
            this.deviceProperty.addNetworkStatusListner(this.onNetworkStatusChange, this);
            this.deviceProperty.addValueListner(this.onValueChange, this);
        };

        _proto9.onDeviceLoaded = function onDeviceLoaded(sender, device) {
            if (sender.device != undefined) return;

            if (sender.deviceId == device._id) {
                sender.joinDevice(device, device[sender.devicePropertyName]);
            }
        };
            
        _proto9.onValueChange = function onValueChange(sender, deviceProperty) {
            sender.draw();
        };

        _proto9.onNetworkStatusChange = function onNetworkStatusChange(sender, deviceProperty) {
            if (sender.widget != undefined) {
                sender.widget.networkStatus = deviceProperty.networkStatus;
            }
        };

        _proto9.onDashboardModeChange = function onDashboardModeChange(sender, mode) {
            if (sender.widget != undefined) {
                if (mode) {
                    sender.widget.mode = WORK_MODE;
                } else {
                    sender.widget.mode = MOVE_MODE;
                }
            }
        };

        _proto9.widgetClick = function widgetClick(event) {
            event.stopPropagation();
            var actuatorWidgetPanel = event.currentTarget;
            var widget = actuatorWidgetPanel.widget;

            if (widget.mode == WORK_MODE) {
                var deviceProperty = widget.deviceClass.deviceProperty;

                if (parseInt(deviceProperty.value) == 1) {
                    deviceProperty.setValue(0);
                } else {
                    deviceProperty.setValue(1);
                }
            } //return actuatorWidget;


            return true;
        };

        _proto9.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.deviceProperty == undefined) return;

            if (this.deviceProperty.networkStatus == NET_ONLINE) {
                var text = "off";

                if (parseInt(this.deviceProperty.value) == 1) {
                    text = "on";
                }

                this.widget.refresh(this.deviceProperty.value, text, this.device._id);
            } else {
                this.widget.refresh(0, "--", this.device._id);
            }

            this.widget.networkStatus = this.deviceProperty.networkStatus;
            return true;
        };

        _createClass(ActuatorWidgetWrapper, [{
            key: "onload",
            get: function get() {
                return this._onload;
            },
            set: function set(onload) {
                this._onload = onload;
            }
        }]);


        return ActuatorWidgetWrapper;
    }(); //LCD ----------------------------------------------------------------------------------


var LCDWidgetWrapper =
    
    function () {
        "use strict";

        function LCDWidgetWrapper(parentPanel, device, deviceProperty, noWidget, configPropertiesWidget, widgetProperties) {
            this.configPropertiesWidget = configPropertiesWidget;

            if (device == undefined) {
                devices.addDeviceLoadedListner(this.onDeviceLoaded, this);
            } else {
                this.offlineStarter(parentPanel, device._id, deviceProperty.name, noWidget);
                this.joinDevice(device, deviceProperty);
            }
        }

        var _proto10 = LCDWidgetWrapper.prototype;

        _proto10.offlineStarter = function offlineStarter(parentPanel, deviceId, devicePropertyName, noWidget) {
            this.deviceId = deviceId;
            this.devicePropertyName = devicePropertyName;
            dashboardUI.addDashboardModeListner(this.onDashboardModeChange, this);

            if (noWidget == undefined || !noWidget) {
                this.widget = new LCDWidget(parentPanel, this.makeUniqueId(deviceId), configProperties.widgetssize);
                this.widget.deviceClass = this; // this.widget.widgetHolder.onclick = this.widgetClick;
                this.widget.onload = this.onWidgetLoad;
            }
        };

        _proto10.makeUniqueId = function (id) {
            var count = 1;
            var _id = id;
            while (document.getElementById(_id + "BaseWidget") != undefined) {
                _id = id + count;
                count++;
            }
            return _id;
        }


        _proto10.onWidgetLoad = function onWidgetLoad(widget) {
            this.widget.lcdButton.onclick = this.lcdTextClick;
            this.widget.lightButton.onclick = this.lcdLightClick;
            this.draw();
        };


        _proto10.joinDevice = function joinDevice(device, deviceProperty) {
            this.device = device;
            this.device["text"].addNetworkStatusListner(this.onTextChange, this);
            this.device["text"].addValueListner(this.onTextChange, this);
            this.device["backlight"].addValueListner(this.onLightChange, this);
            this.deviceProperty = deviceProperty;
            this.widget.deviceClass.deviceProperty = deviceProperty;
            this.node = config.getNodeByHost(device._host);
            this.node.addNetworkStatusListner(this.onNetworkStatusChange, this);
            this.deviceProperty.addNetworkStatusListner(this.onNetworkStatusChange, this);
            this.deviceProperty.addValueListner(this.onValueChange, this);
        };

        _proto10.onDeviceLoaded = function onDeviceLoaded(sender, device) {
            if (sender.device != undefined) return;

            if (sender.deviceId == device._id) {
                sender.joinDevice(device, device[sender.devicePropertyName]);
            }
        } //---------------------------------------

            /*
            offlineStarter(parentPanel, deviceId, devicePropertyName, noWidget) {
                this.deviceId = deviceId;
                this.devicePropertyName = devicePropertyName;
                devices.addNetworkStatusListner(this.onNetworkStatusChange, this);
                 dashboardUI.addDashboardModeListner(this.onDashboardModeChange, this);
                 this.widget = new LCDWidget(parentPanel, deviceId, configProperties.widgetssize);
                this.widget.deviceClass = this;
                this.widget.lcdButton.onclick = this.lcdTextClick;
                this.widget.lightButton.onclick = this.lcdLightClick;
                this.draw();
             }
             constructor(parentPanel, device, deviceProperty, configPropertiesWidget) {
                this.configPropertiesWidget = configPropertiesWidget;
                if (device == undefined) {
                    devices.addDeviceLoadedListner(this.onDeviceLoaded, this);
                }
                else {
                    this.offlineStarter(parentPanel, device._id, deviceProperty.name);
                    this.device = device;
                    this.device["text"].addNetworkStatusListner(this.onTextChange, this);
                    this.device["text"].addValueListner(this.onTextChange, this);
                    this.device["backlight"].addValueListner(this.onLightChange, this);
                   //  this.deviceProperty = deviceProperty;
                 //   this.deviceProperty.addNetworkStatusListner(this.onNetworkStatusChange, this);
                 //  this.deviceProperty.addValueListner(this.onValueChange, this);
                 }
            }
              onDeviceLoaded(sender, device) {
                if (sender.device != undefined) return;
                if (sender.deviceId == device._id) {
                    sender.device = device;
                     sender.device["text"].addNetworkStatusListner(sender.onTextChange, sender);
                    sender.device["text"].addValueListner(sender.onTextChange, sender);
                    sender.device["backlight"].addValueListner(sender.onLightChange, sender);
                     devices.addNetworkStatusListner(sender.onNetworkStatusChange, sender);
                 }
            }
            */
            ;

        _proto10.onDashboardModeChange = function onDashboardModeChange(sender, mode) {
            if (sender.widget != undefined) {
                if (mode) {
                    sender.widget.mode = WORK_MODE;
                } else {
                    sender.widget.mode = MOVE_MODE;
                }
            }
        };

        _proto10.onNetworkStatusChange = function onNetworkStatusChange(sender, deviceProperty) {
            if (sender.widget != undefined) {
                sender.widget.networkStatus = deviceProperty.networkStatus;
            }
        };

        _proto10.onTextChange = function onTextChange(sender, deviceProperty) {
            sender.draw();
        };

        _proto10.onLightChange = function onLightChange(sender, deviceProperty) {
            sender.draw();
        };

        _proto10.lcdTextClick = function lcdTextClick(event) {
            event.stopPropagation();
            var lcdWidgetPanel = event.currentTarget;
            var widget = lcdWidgetPanel.widget;

            if (widget.mode == WORK_MODE) {
                widget.hideEditor();
                var deviceProperty = widget.deviceClass.device["text"];
                deviceProperty.setValue(widget.textarea.value);
            }
        };

        _proto10.lcdLightClick = function lcdLightClick(event) {
            event.stopPropagation();
            var lcdWidgetPanel = event.currentTarget;
            var widget = lcdWidgetPanel.widget;

            if (widget.mode == WORK_MODE) {
                widget.hideEditor();
                var deviceProperty = widget.deviceClass.device["backlight"];

                if (parseInt(deviceProperty.value) == 1) {
                    deviceProperty.setValue(0);
                } else {
                    deviceProperty.setValue(1);
                }
            }
        };

        _proto10.draw = function draw() {
            if (this.widget == undefined) return;
            if (this.device == undefined) return;

            if (this.device["text"].networkStatus == NET_ONLINE) {
                if (this.device["text"].value != undefined) {
                    this.widget.refresh(this.device["text"].value, this.device._id, this.device["backlight"].value);
                } else {
                    this.widget.refresh("", this.device._id, this.device["backlight"].value);
                }
            } else {
                this.widget.refresh("", this.device._id, 0);
            }

            this.widget.networkStatus = this.device["text"].networkStatus;
            return true;
        } //set _networkStatus(networkStatus) {
            //this.lcdWidget.networkStatus = networkStatus;
            //}
            ;

        return LCDWidgetWrapper;
    }(); //Stepper ----------------------------------------------------------------------------------


var StepperWidgetWrapper =
    
    function () {
        "use strict";

        function StepperWidgetWrapper(parentPanel, id, propertyName) {
            this.id = id;
            this.propertyName = propertyName;
            this.stepperWidget = new StepperWidget(parentPanel, id, configProperties.widgetssize);
            this.stepperWidget.deviceClass = this;
            this.stepperWidget.positionChangeReciever = this.positionChange;
        }

        var _proto11 = StepperWidgetWrapper.prototype;

        _proto11.positionChange = function positionChange(toPercent) {
            //this is caller (stepperWidget)
            if (this.atProcess) {
                //todo cancel
                this.atProcess = false;
                return;
            }

            this.atProcess = true;
            var deviceClass = this.deviceClass;
            var newToPosition = toPercent * (deviceClass.range / 100);
            setDevicePropertyAsyncWithReciever(deviceClass.id, "toposition", newToPosition, deviceClass.clientCallback, deviceClass);
        };

        _proto11.clientCallback = function clientCallback(data, deviceClass) {
            if (!data.indexOf("%error") == 0) {
                deviceClass.stepperWidget.networkStatus = NET_RECONNECT;
            } else {
                if (!data.indexOf("response")!=-1) {//offline 
                    //  deviceClass.stepperWidget.networkStatus = NET_OFFLINE;
                } else {
                    //device error
                    deviceClass.draw(data);
                }
            }
        };

        _proto11.refresh = function refresh() {
            if (status_online == NET_ONLINE) {
                this.position = getParsedDeviceProperty(this.id, "position");
                this.toposition = getParsedDeviceProperty(this.id, "toposition");
                this.range = getParsedDeviceProperty(this.id, "range");
                this.draw(this.position, this.toposition, this.range);
            } else {
                this.stepperWidget.networkStatus = status_online;
            }
        };

        _proto11.draw = function draw(position, toposition, range) {
            if (this.deviceProperty == undefined) return;

            if (!isNaN(position)) {
                var percent = position / (range / 100);
                var toPercent = toposition / (range / 100);
                this.stepperWidget.refresh(percent, toPercent, Math.round(percent) + "%", this.id);
                this.stepperWidget.networkStatus = NET_ONLINE;
            } else {//TODO
                // this.stepperWidget.refresh(0, 0, "--", this.id);
                // this.stepperWidget.networkStatus = NET_ERROR;
            }
        };

        _createClass(StepperWidgetWrapper, [{
            key: "_networkStatus",
            set: function set(networkStatus) {
                this.stepperWidget.networkStatus = networkStatus;
            }
        }]);

        return StepperWidgetWrapper;
    }(); //Widget layer -------------------------------------------------


var WidgetsLayer = {
    
    RadialWidget: {
        id: "radialwidget",
        name: getLang("radial"),
        widget: RadialWidgetWrapper,
        devicesTypes: "any",
        devicesProperties: "any"
    },    
    TemperatureWidget: {
        id: "temperature",
        name: getLang("temperature"),
        widget: TemperatureWidgetWrapper,
        devicesTypes: ";" + DHTDeviceType + ";",
        devicesProperties: ";temperature;"
    },
    HumidityWidget: {
        id: "humidity",
        name: getLang("humidity"),
        widget: HumidityWidgetWrapper,
        devicesTypes: ";" + DHTDeviceType + ";",
        devicesProperties: ";humidity;"
    },
    HistoryDataGraphWidget: {
        id: "historydatagraph",
        name: getLang("historydatagraph"),
        widget: HistoryDataGraphWidgetWrapper,
        devicesTypes: "any",
        devicesProperties: ";historydata;historyfile;temperaturehistorydata;humidityhistorydata;"
    },
    LightWidget: {
        id: "light",
        name: getLang("light"),
        widget: LightWidgetWrapper,
        devicesTypes: ";" + LightDeviceType + ";",
        devicesProperties: ";light;"
    },
    SmokeWidget: {
        id: "smoke",
        name: getLang("smoke"),
        widget: SmokeWidgetWrapper,
        devicesTypes: ";" + SmokeDeviceType + ";",
        devicesProperties: ";smoke;"
    },
    MotionWidget: {
        id: "motion",
        name: getLang("motion"),
        widget: MotionWidgetWrapper,
        devicesTypes: ";" + MotionDeviceType + ";",
        devicesProperties: ";motion;"
    },
    SensorWidget: {
        id: "sensor",
        name: getLang("sensor"),
        widget: SensorWidgetWrapper,
        devicesTypes: ";" + SensorDeviceType + ";",
        devicesProperties: ";data;"
    },
    LCDWidget: {
        id: "lcd",
        name: getLang("lcd"),
        widget: LCDWidgetWrapper,
        devicesTypes: ";" + LCDDeviceType + ";",
        devicesProperties: "any"
    },
    ActuatorWidget: {
        id: "actuator",
        name: getLang("actuator"),
        widget: ActuatorWidgetWrapper,
        devicesTypes: ";" + ActuatorDeviceType + ";",
        devicesProperties: ";data;"
    },

    ValueWidget: {
        id: "value",
        name: getLang("value"),
        widget: ValueWidgetWrapper,
        devicesTypes: "any",
        devicesProperties: "any"
    },


    /*
    StepperWidget: {
        id: "stepper",
        name: getLang("stepper"),
        widget: StepperWidgetWrapper,
        devicesTypes: ";" + StepperDeviceType + ";",
        devicesProperties: "any",
     },
    */
    getWidgetById: function getWidgetById(id) {
        if (id == undefined) return undefined;

        for (var widgetProp in WidgetsLayer) {
            if (WidgetsLayer[widgetProp].id == undefined) continue;

            if (WidgetsLayer[widgetProp].id == id) {
                return WidgetsLayer[widgetProp];
            }
        }

        return undefined;
    }
};