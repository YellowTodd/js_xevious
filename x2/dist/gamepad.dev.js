"use strict";

var PAD_BUTTON_A = 0;
var PAD_BUTTON_B = 1;
var PAD_BUTTON_X = 2;
var PAD_BUTTON_Y = 3;
var PAD_BUTTON_L1 = 4;
var PAD_BUTTON_R1 = 5;
var PAD_BUTTON_L2 = 6;
var PAD_BUTTON_R2 = 7;
var PAD_BUTTON_SELECT = 8;
var PAD_BUTTON_START = 9;
var PAD_BUTTON_L_AXIS = 10;
var PAD_BUTTON_R_AXIS = 11;
var PAD_BUTTON_PADDLE_UP = 12;
var PAD_BUTTON_PADDLE_DOWN = 13;
var PAD_BUTTON_PADDLE_LEFT = 14;
var PAD_BUTTON_PADDLE_RIGHT = 15;
var PAD_BUTTON_CENTER = 16;
var PAD_STICK_LEFT = 0;
var PAD_STICK_RIGHT = 1;
var PAD_STICK_UP = 2;
var PAD_STICK_DOWN = 3;
var g_GamePad = new GamePad(); //ゲームパッド接続時のイベント

addEventListener("gamepadconnected", function (e) {
  g_GamePad.Connected();
}); //ゲームパッド切断時のイベント

addEventListener("gamepaddisconnected", function (e) {
  g_GamePad.Disconnected(e.gamepad.index);
});

function GamePad() {
  var m_gamepads = null;
  var m_index = -1;
  var m_connected = false;
  var m_id = "";
  var m_mapping = "";
  var m_bButtonStateAr = new Array(17);
  var m_bStickStateAr = new Array(8);

  for (var i = 0; i < m_bButtonStateAr.length; i++) {
    m_bButtonStateAr[i] = false;
  }

  for (var _i = 0; _i < m_bStickStateAr.length; _i++) {
    m_bStickStateAr[_i] = false;
  } //->ゲーム別の処置ここから


  function onButton(iButton, bOn) {
    if (!g_App) return;
    var buttonA = KEY_Z;
    var buttonB = KEY_X;

    if (g_App.GetConfigObject().GetKeyAsign() == 0) {
      buttonA = KEY_X;
      buttonB = KEY_Z;
    }

    var e = {
      keyCode: 0
    };

    switch (iButton) {
      case PAD_BUTTON_PADDLE_UP:
        e.keyCode = KEY_UP;
        break;

      case PAD_BUTTON_PADDLE_DOWN:
        e.keyCode = KEY_DOWN;
        break;

      case PAD_BUTTON_PADDLE_LEFT:
        e.keyCode = KEY_LEFT;
        break;

      case PAD_BUTTON_PADDLE_RIGHT:
        e.keyCode = KEY_RIGHT;
        break;

      case PAD_BUTTON_A:
        e.keyCode = buttonA;
        break;

      case PAD_BUTTON_B:
        e.keyCode = buttonB;
        break;

      case PAD_BUTTON_START:
        e.keyCode = KEY_ESC;
        break;

      case PAD_BUTTON_SELECT:
        e.keyCode = KEY_C;
        break;
    }

    if (bOn) OnKeyDown(e);else OnKeyUp(e);
  }

  function onStick(iStick, bOn) {
    if (!g_App) return;
    var e = {
      keyCode: 0
    };

    switch (iStick) {
      case PAD_STICK_LEFT:
        e.keyCode = KEY_LEFT;
        break;

      case PAD_STICK_RIGHT:
        e.keyCode = KEY_RIGHT;
        break;

      case PAD_STICK_UP:
        e.keyCode = KEY_UP;
        break;

      case PAD_STICK_DOWN:
        e.keyCode = KEY_DOWN;
        break;
    }

    if (bOn) OnKeyDown(e);else OnKeyUp(e);
  } //<-ゲーム別の処置ここまで


  this.IsAvailable = function () {
    if (!m_connected || !m_gamepads || m_gamepads.length == 0 || !m_gamepads[0]) return false;
    return true;
  };

  this.Connected = function () {
    m_gamepads = navigator.getGamepads();
    if (!m_gamepads || !m_gamepads[0]) return;

    for (m_index = 0; m_index < m_gamepads.length; m_index++) {
      if (m_gamepads[m_index].connected) {
        m_connected = true;
        m_id = m_gamepads[m_index].id;
        m_mapping = m_gamepads[m_index].mapping;
        break;
      }
    }
  };

  this.Disconnected = function (index) {
    if (index == m_index) {
      m_index = -1;
      m_connected = false;

      for (var _i2 = 0; _i2 < m_bButtonStateAr.length; _i2++) {
        m_bButtonStateAr[_i2] = false;
      }

      for (var _i3 = 0; _i3 < m_bStickStateAr.length; _i3++) {
        m_bStickStateAr[_i3] = false;
      }
    }
  };

  this.UpdateStatus = function () {
    this.Connected();
    if (!m_connected || !m_gamepads || m_gamepads.length == 0 || !m_gamepads[0]) return;

    for (var _i4 = 0; _i4 < m_gamepads[m_index].buttons.length; _i4++) {
      var bState = m_gamepads[m_index].buttons[_i4].pressed | m_gamepads[m_index].buttons[_i4].touched;

      if (m_bButtonStateAr[_i4] != bState) {
        onButton(_i4, bState);
        m_bButtonStateAr[_i4] = bState;
      }
    }

    for (var _i5 = 0; _i5 < m_gamepads[m_index].axes.length; _i5++) {
      var fValue = m_gamepads[m_index].axes[_i5];

      if (fValue <= -0.5) {
        switch (_i5) {
          // 左スティック-左
          case 0:
            if (!m_bStickStateAr[0]) {
              m_bStickStateAr[0] = true;
              m_bStickStateAr[1] = false;
              onStick(0, true);
              onStick(1, false);
            }

            break;
          // 左スティック-上

          case 1:
            if (!m_bStickStateAr[2]) {
              m_bStickStateAr[2] = true;
              m_bStickStateAr[3] = false;
              onStick(2, true);
              onStick(3, false);
            }

            break;
          // 右スティック-左

          case 2:
            if (!m_bStickStateAr[4]) {
              m_bStickStateAr[4] = true;
              m_bStickStateAr[5] = false;
              onStick(4, true);
              onStick(5, false);
            }

            break;
          // 右スティック-上

          case 3:
            if (!m_bStickStateAr[6]) {
              m_bStickStateAr[6] = true;
              m_bStickStateAr[7] = false;
              onStick(6, true);
              onStick(7, false);
            }

            break;
        }
      } else if (fValue >= 0.5) {
        switch (_i5) {
          // 左スティック-右
          case 0:
            if (!m_bStickStateAr[1]) {
              m_bStickStateAr[0] = false;
              m_bStickStateAr[1] = true;
              onStick(0, false);
              onStick(1, true);
            }

            break;
          // 左スティック-下

          case 1:
            if (!m_bStickStateAr[3]) {
              m_bStickStateAr[2] = false;
              m_bStickStateAr[3] = true;
              onStick(2, false);
              onStick(3, true);
            }

            break;
          // 右スティック-右

          case 2:
            if (!m_bStickStateAr[5]) {
              m_bStickStateAr[4] = false;
              m_bStickStateAr[5] = true;
              onStick(4, false);
              onStick(5, true);
            }

            break;
          // 右スティック-下

          case 3:
            if (!m_bStickStateAr[7]) {
              m_bStickStateAr[6] = false;
              m_bStickStateAr[7] = true;
              onStick(6, false);
              onStick(7, true);
            }

            break;
        }
      } else {
        switch (_i5) {
          case 0:
            if (m_bStickStateAr[0]) {
              m_bStickStateAr[0] = false;
              onStick(0, false);
            }

            if (m_bStickStateAr[1]) {
              m_bStickStateAr[1] = false;
              onStick(1, false);
            }

            break;

          case 1:
            if (m_bStickStateAr[2]) {
              m_bStickStateAr[2] = false;
              onStick(2, false);
            }

            if (m_bStickStateAr[3]) {
              m_bStickStateAr[3] = false;
              onStick(3, false);
            }

            break;

          case 2:
            if (m_bStickStateAr[4]) {
              m_bStickStateAr[4] = false;
              onStick(4, false);
            }

            if (m_bStickStateAr[5]) {
              m_bStickStateAr[5] = false;
              onStick(4, false);
            }

            break;

          case 3:
            if (m_bStickStateAr[6]) {
              m_bStickStateAr[6] = false;
              onStick(6, false);
            }

            if (m_bStickStateAr[7]) {
              m_bStickStateAr[7] = false;
              onStick(7, false);
            }

            break;
        }
      }
    }
  };

  this.GetButtonState = function (iButton) {
    if (iButton < 0 || iButton >= m_bButtonStateAr.length) return false;
    return m_bButtonStateAr[iButton];
  };

  this.GetStickState = function (iAxis) {
    if (iAxis < 0 || iAxis >= m_bStickStateAr.length) return 0;
    return m_bStickStateAr[iAxis];
  };
}
//# sourceMappingURL=gamepad.dev.js.map
