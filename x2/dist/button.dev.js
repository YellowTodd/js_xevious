"use strict";

var HLMODE_OUT = 0;
var HLMODE_OVER = 1;
var HLMODE_DOWN = 2;
var HLMODE_GRAY = 3; //-------------------
// ボタンの基底クラス
//-------------------

function ButtonBase() {
  this.m_node;
  this.m_nX;
  this.m_nY;
  this.m_nW;
  this.m_nH;
  this.m_bEnabled = true;
  this.m_bShown = true;
  this.m_bPressed = false;
  this.m_objParent = null;
}

ButtonBase.prototype.Create = function (nLeft, nTop, nWidth, nHeight, strTitle) {
  this.m_nX = nLeft;
  this.m_nY = nTop;
  this.m_nW = nWidth;
  this.m_nH = nHeight;
  this.m_node.style.position = 'absolute';
  this.m_node.style.left = this.m_nX + 'px';
  this.m_node.style.top = this.m_nY + 'px';
  this.m_node.style.width = this.m_nW + 'px';
  this.m_node.style.height = this.m_nH + 'px';
  this.m_node.style.zIndex = 1;
  this.m_node.style.cursor = 'pointer';
  this.m_node.title = strTitle;
  var objThis = this;

  this.m_node.onmousemove = function (e) {
    objThis.OnMouseMove(e);
  };

  this.m_node.onmouseover = function (e) {
    objThis.OnMouseOver(e);
  };

  this.m_node.onmouseout = function (e) {
    objThis.OnMouseOut(e);
  };

  this.m_node.onmousedown = function (e) {
    objThis.OnMouseDown(e);
  };

  this.m_node.onmouseup = function (e) {
    objThis.OnMouseUp(e);
  };

  this.m_node.onclick = function () {
    objThis.OnClick();
  };
};

ButtonBase.prototype.Append = function (nodeParent) {
  nodeParent.appendChild(this.m_node);
};

ButtonBase.prototype.SetTitle = function (strTitle) {
  this.m_node.title = strTitle;
};

ButtonBase.prototype.SetPos = function (nX, nY) {
  this.m_nX = nX;
  this.m_nY = nY;
  this.m_node.style.left = this.m_nX + 'px';
  ;
  this.m_node.style.top = this.m_nY + 'px';
  ;
};

ButtonBase.prototype.SetZIndex = function (nZIndex) {
  this.m_node.style.zIndex = nZIndex;
};

ButtonBase.prototype.SetParentObj = function (obj) {
  this.m_objParent = obj;
};

ButtonBase.prototype.Show = function (bShow) {
  this.m_node.style.visibility = bShow ? 'visible' : 'hidden';
  this.m_nShown = bShow;
};

ButtonBase.prototype.Enable = function (bEnable) {
  this.m_node.style.cursor = bEnable ? 'pointer' : 'default';
  this.HighLight(HLMODE_GRAY);
  this.m_bEnabled = bEnable;
};

ButtonBase.prototype.HighLight = function () {};

ButtonBase.prototype.OnMouseMove = function (e) {};

ButtonBase.prototype.OnMouseDown = function (e) {
  _stopEvent(e);

  if (!this.m_bEnabled) return;
  if (!this.m_bShown) return;
  this.HighLight(HLMODE_DOWN);
  this.m_bPressed = true;
};

ButtonBase.prototype.OnMouseUp = function (e) {};

ButtonBase.prototype.OnMouseOver = function (e) {
  if (!this.m_bEnabled) return;
  if (!this.m_bShown) return;
  this.HighLight(HLMODE_OVER);
};

ButtonBase.prototype.OnMouseOut = function (e) {
  if (!this.m_bEnabled) return;
  if (!this.m_bShown) return;
  this.HighLight(HLMODE_OUT);
};

ButtonBase.prototype.OnClick = function () {
  if (!this.m_bEnabled) return;
  if (!this.m_bShown) return;
  if (this.m_objParent) this.m_objParent.OnButtonClick();
}; //-------------------
// ツールボタン
//-------------------


_inherit(ToolButton, ButtonBase);

function ToolButton() {
  this.base();
}

ToolButton.prototype.Create = function (strID, nLeft, nTop, nWidth, nHeight, strTitle) {
  this.m_node = g_Image.GetNode(strID);
  ButtonBase.prototype.Create.call(this, nLeft, nTop, nWidth, nHeight, strTitle);
  this.m_node.style.left = this.m_nX + 1 + 'px';
  this.m_node.style.top = this.m_nY + 1 + 'px';
  this.m_node.style.borderStyle = 'none';
  this.m_node.style.opacity = 0.8;
};

ToolButton.prototype.HighLight = function (nMode) {
  if (nMode == HLMODE_OUT) {
    this.m_node.style.left = this.m_nX + 1 + 'px';
    this.m_node.style.top = this.m_nY + 1 + 'px'; //this.m_node.style.borderStyle = 'none';

    this.m_node.style.opacity = 0.8;
  } else if (nMode == HLMODE_OVER) {
    this.m_node.style.left = this.m_nX - 1 + 'px';
    this.m_node.style.top = this.m_nY - 1 + 'px'; //this.m_node.style.borderStyle = 'outset';

    this.m_node.style.opacity = 1.0;
  } else if (nMode == HLMODE_DOWN) {
    this.m_node.style.left = this.m_nX + 1 + 'px';
    this.m_node.style.top = this.m_nY + 1 + 'px'; //this.m_node.style.borderStyle = 'inset';

    this.m_node.style.opacity = 1.0;
  }
}; //-------------------
// トグルボタン
//-------------------


function ToggleButton() {
  this.m_OnBtn;
  this.m_OffBtn;
  this.m_bOn;
}

ToggleButton.prototype.Append = function (nodeParent) {
  this.m_OnBtn.Append(nodeParent);
  this.m_OffBtn.Append(nodeParent);
};

ToggleButton.prototype.SetPos = function (nX, nY) {
  this.m_OnBtn.SetPos(nX, nY);
  this.m_OffBtn.SetPos(nX, nY);
};

ToggleButton.prototype.SetZIndex = function (nZIndex) {
  this.m_OnBtn.SetZIndex(nZIndex);
  this.m_OffBtn.SetZIndex(nZIndex);
};

ToggleButton.prototype.SetParentObj = function (obj) {
  this.m_OnBtn.SetParentObj(obj);
  this.m_OffBtn.SetParentObj(obj);
};

ToggleButton.prototype.SetButtons = function (objOnButton, objOffButton) {
  this.m_OnBtn = objOnButton;
  this.m_OffBtn = objOffButton;
  var objThis = this;

  this.m_OnBtn.OnClick = function () {
    if (!this.m_bEnabled) return;
    if (!this.m_bShown) return;
    objThis.On(false);
    ButtonBase.prototype.OnClick.call(this);
  };

  this.m_OffBtn.OnClick = function () {
    if (!this.m_bEnabled) return;
    if (!this.m_bShown) return;
    objThis.On(true);
    ButtonBase.prototype.OnClick.call(this);
  };

  this.SetParentObj(this);
  this.On(true);
};

ToggleButton.prototype.Show = function (bShow) {
  if (bShow) {
    this.On(this.m_bOn);
  } else {
    this.m_OnBtn.Show(false);
    this.m_OffBtn.Show(false);
  }
};

ToggleButton.prototype.Enable = function (bEnable) {
  this.m_OnBtn.Enable(bEnable);
  this.m_OffBtn.Enable(bEnable);
};

ToggleButton.prototype.On = function (bOn) {
  this.m_OnBtn.Show(bOn);
  this.m_OffBtn.Show(!bOn);
  this.m_bOn = bOn;
};

var g_bMuted = false;

_inherit(SEButton, ToggleButton);

function SEButton(nodeParent) {
  this.base();
  var m_objBtnOn = new ToolButton();
  var m_objBtnOff = new ToolButton();
  m_objBtnOn.Create('idImgBtnSEOn', 0, 0, 38, 38, 'Sound is ON (E)');
  m_objBtnOff.Create('idImgBtnSEOff', 0, 0, 38, 38, 'Sound is OFF (E)');
  this.SetButtons(m_objBtnOn, m_objBtnOff);
  this.Append(nodeParent);
  this.Enable(true);
  this.Show(false);
  this.SetPos(0, 0);
  this.SetZIndex(1);

  SEButton.prototype.OnButtonClick = function () {
    if (!this.m_bOn) {
      g_objSound.Mute(true);
      g_bMuted = true;
    } else {
      if (!g_bPaused) g_objSound.Mute(false);
      g_bMuted = false;
    }
  };

  this.Activate = function (bActive) {
    this.On(bActive);
    this.m_bOn = bActive;
    g_objSound.Mute(!bActive);
    g_bMuted = !bActive;
  };

  this.ClickByKey = function () {
    this.On(!this.m_bOn);
    this.OnButtonClick();
  };
}
//# sourceMappingURL=button.dev.js.map
