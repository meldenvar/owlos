var LCDWidget =
    
    function (_BaseWidget) {
        "use strict";

        _inheritsLoose(LCDWidget, _BaseWidget);

        function LCDWidget(parentPanel, id, size) {            
            return _BaseWidget.call(this, parentPanel, id, size) || this;         
        }

        LCDWidget.prototype.onrPanelLoad = function onrPanelLoad(event) {
            _BaseWidget.prototype.onrPanelLoad.call(this, event);
            var rPanel = event.currentTarget;
            var widget = rPanel.widget;

            widget.widgetHolder.className = "col-sm-2";

            widget.topMargin = widget.size / 20; //this.panding = 5;
            widget.width = widget.size * 2;
            widget.height = widget.size;
            widget.centreX = widget.width / 2; //  this.centreY = this.height / 2;
            widget.widgetTextSize = widget.size / 110;

            widget.svgElement.setAttributeNS(null, "viewBox", "0 0 " + widget.width + " " + widget.height);

            //widget.svgElement.setAttributeNS(null, "width", widget.width);

            widget.SVGBackpanel.drawRoundedRect(widget.width, widget.height, 5, 10, true, true, true, true);
            widget.SVGBoxBackpanel.drawRoundedRect(widget.width, 26, 5, 0, true, true, false, false);
            widget.SVGBackdownpanel.y += 3;
            widget.SVGBackdownpanel.drawRoundedRect(widget.width, 10, 5, 0, false, false, true, true);
            widget.SVGWidgetText1 = new SVGText(widget.svgElement, widget.id + "widgettext1", widget.widgetTextSize);
            widget.SVGWidgetText1.fontFamily = "monospace";
            widget.SVGWidgetText2 = new SVGText(widget.svgElement, widget.id + "widgettext2", widget.widgetTextSize);
            widget.SVGWidgetText2.fontFamily = "monospace";
            widget.SVGWidgetText3 = new SVGText(widget.svgElement, widget.id + "widgettext3", widget.widgetTextSize);
            widget.SVGWidgetText3.fontFamily = "monospace";
            widget.SVGWidgetText4 = new SVGText(widget.svgElement, widget.id + "widgettext4", widget.widgetTextSize);
            widget.SVGWidgetText4.fontFamily = "monospace";
            widget.SVGWidgetText1.text = "1234567890ABCSDEFGHL"; //20 chars 

            widget.SVGLabel.text = "LCD";
            widget.textWidth = widget.SVGWidgetText1.width;
            widget.textHeight = widget.SVGWidgetText1.height;
            widget.widgetLeft = widget.centreX - widget.textWidth / 2;
            widget.widgetTop = widget.centreY + widget.SVGLabel.height - widget.textHeight * 4 / 2;
            widget.SVGWidgetBack = new SVGRect(widget.svgElement, widget.id + "widgetback", widget.widgetLeft - widget.panding, widget.widgetTop - parseFloat(widget.textHeight - widget.panding), widget.textWidth + widget.panding * 2, widget.textHeight * 4 + widget.panding);
            widget.SVGWidgetBack.opacity = 0.2;
            widget.SVGWidgetBack.color = theme.secondary;
            widget.SVGWidgetText1.text = "";
            widget.SVGLabel.text = "";

            widget.SVGWidgetText.hide();

            widget.SVGArcSpinner.x = widget.centreX;
            widget.widgetHolder.onclick = widget.showEditor; //Popup editor 

            widget.pre = widget.widgetHolder.appendChild(document.createElement('pre'));
            widget.pre.className = "LCDTextArea";
            widget.pre.style.display = 'none';
            widget.textarea = widget.pre.appendChild(document.createElement('textarea'));
            widget.textarea.className = "form-control text-white bg-primary";
            widget.textarea.id = "textarea" + widget.id;
            widget.textarea.rows = "4";
            widget.textarea.cols = "25";

            var elementHeight = widget.pre.getBoundingClientRect().height;

            widget.pre.style.marginTop = -(elementHeight / 2.0 + widget.size / 1.8) + "px";
            widget.btnGroup = widget.widgetHolder.appendChild(document.createElement("p"));
            widget.btnGroup.style.display = 'none';
            widget.btnGroup.className = "LCDButtons";
            widget.btnGroup.role = "group";
            widget.textElement = widget.btnGroup.appendChild(document.createElement('div'));
            widget.textElement.className = "text-white";
            widget.lcdButton = widget.btnGroup.appendChild(document.createElement('input'));
            widget.lcdButton.className = "btn btn-success text-white LCDButton";
            widget.lcdButton.id = widget.id + "lcdbutton";
            widget.lcdButton.type = "button";
            widget.lcdButton.edit = widget.textarea;
            widget.lcdButton.lcdid = widget.id;
            widget.lcdButton.widget = _assertThisInitialized(widget); // this.lcdButton.onclick = lcdButtonClick;

            widget.lcdButton.value = getLang("send");
            widget.lightButton = widget.btnGroup.appendChild(document.createElement('input'));
            widget.lightButton.className = "btn btn-info text-white LCDButton";
            widget.lightButton.id = widget.id + "clearbutton";
            widget.lightButton.type = "button";
            widget.lightButton.edit = widget.textarea;
            widget.lightButton.lcdid = widget.id;
            widget.lightButton.widget = _assertThisInitialized(widget); //  this.lightButton.onclick = lightButtonClick;

            widget.lightButton.value = getLang("shortlight");
            widget.ShowEqualizer = false;

            widget.proprties = widget._properties;
            widget.resize(widget.width);
            if (widget.onload != undefined) {
                widget.onload(widget);
            }

        };

        LCDWidget.prototype.resize = function resize(size) {
            this.size = size;
            this.svgElement.setAttributeNS(null, "width", size);
            this.svgElement.setAttributeNS(null, "height", size / 2);

        };
        

        LCDWidget.prototype.refresh = function refresh(widgetText, label, light) {
            label = getLang(label);
            this.widgetText = widgetText;
            this.label = label;
            this.spinnerAngle = 0;

            if (light != undefined) {
                this.light = light;
            } else {
                this.light = 0;
            }

            this.redrawAll();
        };

        LCDWidget.prototype.showEditor = function showEditor(event) {
            event.stopPropagation();
            var rPanel = event.currentTarget;
            var lcdWidget = rPanel.widget;

            if (!lcdWidget.pre.style.display.indexOf("block")!=-1) {
                lcdWidget.textarea.value = lcdWidget.widgetText;
                lcdWidget.pre.style.display = 'block';
                lcdWidget.btnGroup.style.display = 'block';
            } else {//TODO: direct click     
                //  lcdWidget.hideEditor(); 
            }

            return true;
        };

        LCDWidget.prototype.hideEditor = function hideEditor() {
            this.pre.style.display = 'none';
            this.btnGroup.style.display = 'none';
        }
            /*
                get _newtorkStatus() {
                    return this.networkStatus;
                }
            
                set _networkStatus(networkStatus) {
                    if ((networkStatus >= NET_OFFLINE) && (networkStatus <= NET_RECONNECT)) {
                        this.networkStatus = networkStatus;
                        this.redrawAll();
                    }
                }
            
                get _percent() {
                    return this.percent;
                }
            
                set _percent(percent) {
                    if ((percent >= 0) && (percent <= 100)) {
                        this.percent = percent;
                        this.redrawAll();
                    }
                }
            
                //---------------------------------------------------------------------------------------
                redrawAll() {
                    this.drawText();
                    this.starttime = 0;
                    requestAnimationFrame(() => this.drawWidget());
            
            
                }
                */
            //---------------------------------------------------------------------------------------
            //draw element text labels - percent value and text 
            ;

        LCDWidget.prototype.drawText = function drawText() {
            _BaseWidget.prototype.drawText.call(this);

            if (this.SVGWidgetText1 == undefined) return;

            switch (this._networkStatus) {
                case NET_ONLINE:
                    this.SVGWidgetText1.color = theme.light;
                    this.SVGWidgetText2.color = theme.light;
                    this.SVGWidgetText3.color = theme.light;
                    this.SVGWidgetText4.color = theme.light;
                    break;

                case NET_RECONNECT:
                    this.SVGWidgetText1.color = theme.info;
                    this.SVGWidgetText2.color = theme.info;
                    this.SVGWidgetText3.color = theme.info;
                    this.SVGWidgetText4.color = theme.info;
                    break;

                default:
                    //offline
                    this.SVGWidgetText1.color = theme.secondary;
                    this.SVGWidgetText2.color = theme.secondary;
                    this.SVGWidgetText3.color = theme.secondary;
                    this.SVGWidgetText4.color = theme.secondary;
                    break;
            }

            if (this.widgetText == undefined) {
                this.widgetText = "";
            }

            this.SVGWidgetText1.text = this.widgetText.substring(0, 20);
            this.SVGWidgetText2.text = this.widgetText.substring(20, 40);
            this.SVGWidgetText3.text = this.widgetText.substring(40, 60);
            this.SVGWidgetText4.text = this.widgetText.substring(60);
            this.SVGWidgetText1.x = this.widgetLeft;
            this.SVGWidgetText1.y = this.widgetTop;
            this.SVGWidgetText2.x = this.widgetLeft;
            this.SVGWidgetText2.y = this.SVGWidgetText1.y + this.SVGWidgetText1.height;
            this.SVGWidgetText3.x = this.widgetLeft;
            this.SVGWidgetText3.y = this.SVGWidgetText2.y + this.SVGWidgetText2.height;
            this.SVGWidgetText4.x = this.widgetLeft;
            this.SVGWidgetText4.y = this.SVGWidgetText3.y + this.SVGWidgetText4.height;
            /*
            this.SVGLabel.text = this.label;
            this.SVGLabel.x = this.width / 2 - this.SVGLabel.width / 2;
            this.SVGLabel.y = this.SVGLabel.height - this.panding;
             switch (this.networkStatus) {
                case NET_ONLINE: this.SVGLabel.color = theme.light; break;
                case NET_ERROR: this.SVGLabel.color = theme.danger; break;
                case NET_RECONNECT: this.SVGLabel.color = theme.info; break;
                default: //offline
                    this.SVGLabel.color = theme.secondary; break;
            }
               this.SVGWidgetText1.color = theme.light;
            this.SVGWidgetText2.color = theme.light;
            this.SVGWidgetText3.color = theme.light;
            this.SVGWidgetText4.color = theme.light;
             this.SVGWidgetText1.text = this.widgetText.substring(0, 20);
            this.SVGWidgetText2.text = this.widgetText.substring(20, 40);
            this.SVGWidgetText3.text = this.widgetText.substring(40, 60);
            this.SVGWidgetText4.text = this.widgetText.substring(60);
             this.SVGWidgetText1.x = this.widgetLeft;
            this.SVGWidgetText1.y = this.widgetTop;
             this.SVGWidgetText2.x = this.widgetLeft;
            this.SVGWidgetText2.y = this.SVGWidgetText1.y + this.SVGWidgetText1.height;
             this.SVGWidgetText3.x = this.widgetLeft;
            this.SVGWidgetText3.y = this.SVGWidgetText2.y + this.SVGWidgetText2.height;
             this.SVGWidgetText4.x = this.widgetLeft;
            this.SVGWidgetText4.y = this.SVGWidgetText3.y + this.SVGWidgetText4.height;
              */

            /*        
            //var newValue = getParsedDeviceProperty(this.id, "text");
            if (this.percent !== this.textarea.storedValue) {
                this.textarea.value = this.percent;
                this.textarea.storedValue = this.percent;
            }
             this.textElement.innerHTML = this.text;
            
            switch (this.networkStatus) {
                case NET_ONLINE:
                     this.textElement.className = "text-white text-center";
                    this.hintElement.innerHTML = getLang("rid_online");
                    this.hintElement.className = "LCDWidgetHint text-secondary text-center";
                    break;
                case NET_ERROR:
                    this.textElement.className = "text-danger text-center";
                    this.hintElement.innerHTML = getLang("rid_error");
                    this.hintElement.className = "LCDWidgetHint text-danger text-center";
                    break;
                case NET_RECONNECT:
                    this.textElement.className = "text-info text-center";
                    this.hintElement.innerHTML = getLang("rid_connect");
                    this.hintElement.className = "LCDWidgetHint text-info text-center";
                    break;
                default: //offline
                    this.textElement.className = "text-secondary text-center";
                    this.hintElement.innerHTML = getLang("rid_offline");
                    this.hintElement.className = "LCDWidgetHint text-secondary text-center";
                    break;
            }
            */
        };

        LCDWidget.prototype.drawWidget = function drawWidget() {
            if (this.SVGWidgetBack == undefined) return;
            if (this.light == 1) {
                this.SVGWidgetBack.color = theme.info;
            } else {
                this.SVGWidgetBack.color = theme.secondary;
            }

            _BaseWidget.prototype.drawWidget.call(this);
            /*
                    if (this.light == 1) {
                        this.SVGWidgetBack.color = theme.info;
                    }
                    else {
                        this.SVGWidgetBack.color = theme.secondary;
                    }
            
                    //spinner 
                    if (this.networkStatus == NET_RECONNECT) {
                        this.spinnerAngle += 1.5;
                        this.SVGArcSpinner.draw(this.spinnerAngle, 240 + this.spinnerAngle);
                        requestAnimationFrame(() => this.drawWidget());
                    }
                    else {
                        this.SVGArcSpinner.hide();
                    }
                    
                    */

        };

        return LCDWidget;
    }(BaseWidget);