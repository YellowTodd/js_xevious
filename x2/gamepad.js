
const PAD_BUTTON_A            = 0;
const PAD_BUTTON_B            = 1;
const PAD_BUTTON_X            = 2;
const PAD_BUTTON_Y            = 3;
const PAD_BUTTON_L1           = 4;
const PAD_BUTTON_R1           = 5;
const PAD_BUTTON_L2           = 6;
const PAD_BUTTON_R2           = 7;
const PAD_BUTTON_SELECT       = 8;
const PAD_BUTTON_START        = 9;
const PAD_BUTTON_L_AXIS       = 10;
const PAD_BUTTON_R_AXIS       = 11;
const PAD_BUTTON_PADDLE_UP    = 12;
const PAD_BUTTON_PADDLE_DOWN  = 13;
const PAD_BUTTON_PADDLE_LEFT  = 14;
const PAD_BUTTON_PADDLE_RIGHT = 15;
const PAD_BUTTON_CENTER       = 16;
const PAD_STICK_LEFT          = 0;
const PAD_STICK_RIGHT         = 1;
const PAD_STICK_UP            = 2;
const PAD_STICK_DOWN          = 3;
const g_GamePad = new GamePad

//게임패드 연결 시 이벤트
addEventListener("gamepadconnected", (e) => {
	g_GamePad.Connected();
});
//게임패드 연결 해제 시 이벤트
addEventListener("gamepaddisconnected", (e) => {
	g_GamePad.Disconnected(e.gamepad.index);
});

function GamePad() {
	let m_gamepads = null;
	let m_index = -1;
	let m_connected = false;
	let m_id = "";
	let m_mapping = "";
	let m_bButtonStateAr = new Array(17);
	let m_bStickStateAr = new Array(8);

	for( let i=0;i<m_bButtonStateAr.length; i++ )
		m_bButtonStateAr[i] = false
	for( let i=0;i<m_bStickStateAr.length; i++ )
		m_bStickStateAr[i] = false;

//->게임별 처리 시작
	function onButton( iButton, bOn ) {
		if( !g_App )
			return;

		let buttonA = KEY_Z;
		let buttonB = KEY_X;
		if( g_App.GetConfigObject().GetKeyAsign() == 0 ) {
			buttonA = KEY_X;
			buttonB = KEY_Z;
		}
		
		const e = {keyCode:0}
		switch( iButton ) {
			case PAD_BUTTON_PADDLE_UP:     e.keyCode = KEY_UP;     break;
			case PAD_BUTTON_PADDLE_DOWN:   e.keyCode = KEY_DOWN;   break;
			case PAD_BUTTON_PADDLE_LEFT:   e.keyCode = KEY_LEFT;   break;
			case PAD_BUTTON_PADDLE_RIGHT:  e.keyCode = KEY_RIGHT;  break;
			case PAD_BUTTON_A:             e.keyCode = buttonA;     break;
			case PAD_BUTTON_B:             e.keyCode = buttonB;    break;
			case PAD_BUTTON_START:         e.keyCode = KEY_ESC;    break;
			case PAD_BUTTON_SELECT:        e.keyCode = KEY_C;      break;
		}
		if( bOn )
			OnKeyDown(e);
		else
			OnKeyUp(e);
	}

	function onStick( iStick, bOn ) {
		if( !g_App )
			return;

		const e = {keyCode:0}
		switch( iStick ) {
			case PAD_STICK_LEFT:   e.keyCode = KEY_LEFT;     break;
			case PAD_STICK_RIGHT:  e.keyCode = KEY_RIGHT;    break;
			case PAD_STICK_UP:     e.keyCode = KEY_UP;       break;
			case PAD_STICK_DOWN:   e.keyCode = KEY_DOWN;     break;
		}
		if( bOn )
			OnKeyDown(e);
		else
			OnKeyUp(e);
	}
//<-게임별 처리 끝

	this.IsAvailable = function() {
		if( !m_connected || !m_gamepads || m_gamepads.length==0 || !m_gamepads[0] )
			return false;
		return true;
	}

	this.Connected = function() {
		m_gamepads = navigator.getGamepads();
		if( !m_gamepads || !m_gamepads[0] )
			return;
		for( m_index=0; m_index<m_gamepads.length; m_index++ ) {
			if( m_gamepads[m_index].connected ) {
				m_connected = true;
				m_id = m_gamepads[m_index].id;
				m_mapping = m_gamepads[m_index].mapping;
				break;
			}
		}
	}

	this.Disconnected = function( index ) {
		if( index == m_index ) {
			m_index = -1;
			m_connected = false;
			for( let i=0; i<m_bButtonStateAr.length; i++ )
				m_bButtonStateAr[i] = false;
			for( let i=0; i<m_bStickStateAr.length; i++ )
				m_bStickStateAr[i] = false;
		}
	}

	this.UpdateStatus = function() {
		this.Connected();
		if( !m_connected || !m_gamepads || m_gamepads.length==0 || !m_gamepads[0] )
			return;

		for( let i=0; i<m_gamepads[m_index].buttons.length; i++ ) {
			const bState = m_gamepads[m_index].buttons[i].pressed | m_gamepads[m_index].buttons[i].touched;
			if( m_bButtonStateAr[i] != bState ) {
				onButton( i, bState );
				m_bButtonStateAr[i] = bState;
			}
		}

		for( let i=0; i<m_gamepads[m_index].axes.length; i++ ) {
			const fValue = m_gamepads[m_index].axes[i];
			if( fValue <= -0.5 ) {
				switch( i ) {
				// 왼쪽 스틱-왼쪽
				case 0:
					if( !m_bStickStateAr[0] ) {
						m_bStickStateAr[0] = true;
						m_bStickStateAr[1] = false;
						onStick( 0, true );
						onStick( 1, false );
					}
					break;
				// 왼쪽 스틱-위
				case 1:
					if( !m_bStickStateAr[2] ) {
						m_bStickStateAr[2] = true;
						m_bStickStateAr[3] = false;
						onStick( 2, true );
						onStick( 3, false );
					}
					break;
				// 오른쪽 스틱-왼쪽
				case 2:
					if( !m_bStickStateAr[4] ) {
						m_bStickStateAr[4] = true;
						m_bStickStateAr[5] = false;
						onStick( 4, true );
						onStick( 5, false );
					}
					break;
				// 오른쪽 스틱-위
				case 3:
					if( !m_bStickStateAr[6] ) {
						m_bStickStateAr[6] = true;
						m_bStickStateAr[7] = false;
						onStick( 6, true );
						onStick( 7, false );
					}
					break;
				}
			}
			else if( fValue >= 0.5 ) {
				switch( i ) {
				// 왼쪽 스틱-오른쪽
				case 0:
					if( !m_bStickStateAr[1] ) {
						m_bStickStateAr[0] = false;
						m_bStickStateAr[1] = true;
						onStick( 0, false );
						onStick( 1, true );
					}
					break;
				// 왼쪽 스틱-아래
				case 1:
					if( !m_bStickStateAr[3] ) {
						m_bStickStateAr[2] = false;
						m_bStickStateAr[3] = true;
						onStick( 2, false );
						onStick( 3, true );
					}
					break;
				// 오른쪽 스틱-오른쪽
				case 2:
					if( !m_bStickStateAr[5] ) {
						m_bStickStateAr[4] = false;
						m_bStickStateAr[5] = true;
						onStick( 4, false );
						onStick( 5, true );
					}
					break;
				// 오른쪽 스틱-아래
				case 3:
					if( !m_bStickStateAr[7] ) {
						m_bStickStateAr[6] = false;
						m_bStickStateAr[7] = true;
						onStick( 6, false );
						onStick( 7, true );
					}
					break;
				}
			}
			else {
				switch( i ) {
				case 0:
					if( m_bStickStateAr[0] ) {
						m_bStickStateAr[0] = false;
						onStick( 0, false );
					}
					if( m_bStickStateAr[1] ) {
						m_bStickStateAr[1] = false;
						onStick( 1, false );
					}
					break;
				case 1:
					if( m_bStickStateAr[2] ) {
						m_bStickStateAr[2] = false;
						onStick( 2, false );
					}
					if( m_bStickStateAr[3] ) {
						m_bStickStateAr[3] = false;
						onStick( 3, false );
					}
					break;
				case 2:
					if( m_bStickStateAr[4] ) {
						m_bStickStateAr[4] = false;
						onStick( 4, false );
					}
					if( m_bStickStateAr[5] ) {
						m_bStickStateAr[5] = false;
						onStick( 4, false );
					}
					break;
				case 3:
					if( m_bStickStateAr[6] ) {
						m_bStickStateAr[6] = false;
						onStick( 6, false );
					}
					if( m_bStickStateAr[7] ) {
						m_bStickStateAr[7] = false;
						onStick( 7, false );
					}
					break;
				}
			}
		}
	}

	this.GetButtonState = function( iButton ) {
		if( iButton < 0 || iButton >= m_bButtonStateAr.length )
			return false;
		return m_bButtonStateAr[iButton];
	}
	
	this.GetStickState = function( iAxis ) {
		if( iAxis < 0 || iAxis >= m_bStickStateAr.length )
			return 0;
		return m_bStickStateAr[iAxis];
	}
}
