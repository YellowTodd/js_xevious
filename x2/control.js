
const KEY_BS       = 8;
const KEY_TAB      = 9;
const KEY_ENTER    = 13;
const KEY_SHIFT    = 16;
const KEY_CTRL     = 17;
const KEY_ALT      = 18;
const KEY_ESC      = 27;
const KEY_SPACE    = 32;
const KEY_PAGEDOWN = 33;
const KEY_PAGEUP   = 34;
const KEY_END      = 35;
const KEY_HOME     = 36;
const KEY_LEFT     = 37;
const KEY_UP       = 38;
const KEY_RIGHT    = 39;
const KEY_DOWN     = 40;
const KEY_INSERT   = 45;
const KEY_DELETE   = 46;
const KEY_C        = 67;
const KEY_E        = 69;
const KEY_S        = 83;
const KEY_X        = 88;
const KEY_Z        = 90;
const KEY_F1       = 112;
const KEY_F2       = 113;
const KEY_F3       = 114;
const KEY_F4       = 115;
const KEY_F5       = 116;
const KEY_F6       = 117;
const KEY_F7       = 118;
const KEY_F8       = 119;
const KEY_F9       = 120;
const KEY_F10      = 121;
const KEY_F11      = 122;
const KEY_F12      = 123;
const KEY_WEB_PREV = 166;
const KEY_WEB_NEXT = 167;
const KEY_FN       = 255;

let g_bKeyUp     = false;
let g_bKeyDown   = false;
let g_bKeyLeft   = false;
let g_bKeyRight  = false;
let g_bKeyFire   = false;
let g_bKeyBomb   = false;
let g_bKeyShift  = false;
let g_bKeyStart  = false;
let g_bKeyMute   = false;
let g_bKeyPause  = false;
let g_bKeyConfig = false;

let g_bKeyFireOK   = true;
let g_bKeyBombOK   = true;
let g_bKeyStartOK  = true;
let g_bKeyPauseOK  = true;
let g_bKeyMuteOK   = true;
let g_bKeyConfigOK = true;

let g_bKeyRetrieved = true;
let g_nLastKeycode = 0;

function GetLastKeyCode() {
	if( !g_bKeyRetrieved ) {
		g_bKeyRetrieved = true;
		return g_nLastKeycode;
	}
	return 0;
}

const OnKeyDown = function(e) {
	if( !g_App )
		return;
	if( g_App.IsDemoMode()  && !g_App.IsConfigMode() ) {
		switch( e.keyCode ) {
			case KEY_S:       if( g_bKeyStartOK ) {g_bKeyStart  = true;  g_bKeyStartOK  = false;}  break;
			case KEY_ESC:     if( g_bKeyPauseOK ) {g_bKeyPause  = true;  g_bKeyPauseOK  = false;}  break;
			case KEY_E:       if( g_bKeyMuteOK )  {g_bKeyMute   = true;  g_bKeyMuteOK   = false;}  break;
			case KEY_C:       if( g_bKeyConfigOK ){g_bKeyConfig = true;  g_bKeyConfigOK = false;}  break;
			case KEY_SHIFT:   g_bKeyShift  = true;  break;
		}
	}
	else {
		switch( e.keyCode ) {
			case KEY_LEFT:    g_bKeyLeft  = true;  break;
			case KEY_RIGHT:   g_bKeyRight = true;  break;
			case KEY_UP:      g_bKeyUp    = true;  break;
			case KEY_DOWN:    g_bKeyDown  = true;  break;
			case KEY_Z: 
			case KEY_PAGEUP:  {
				if( g_App.GetConfigObject().GetKeyAsign() == 0 )
					g_bKeyBomb  = true;
				else
					g_bKeyFire = true;
				break;
			}
			case KEY_X: 
			case KEY_PAGEDOWN:{
				if( g_App.GetConfigObject().GetKeyAsign() == 0 )
					g_bKeyFire  = true;
				else
					g_bKeyBomb = true;
				break;
			}
			case KEY_S:       if( g_bKeyStartOK ) {g_bKeyStart  = true;  g_bKeyStartOK  = false;}  break;
			case KEY_ESC:     if( g_bKeyPauseOK ) {g_bKeyPause  = true;  g_bKeyPauseOK  = false;}  break;
			case KEY_E:       if( g_bKeyMuteOK )  {g_bKeyMute   = true;  g_bKeyMuteOK   = false;}  break;
			case KEY_C:       if( g_bKeyConfigOK ){g_bKeyConfig = true;  g_bKeyConfigOK = false;}  break;
			case KEY_SHIFT:   g_bKeyShift  = true;  break;
		}
	}
	g_nLastKeycode = e.keyCode;
	g_bKeyRetrieved = false;
}
const OnKeyUp = function(e) {
	if( !g_App )
		return;
	if( g_App.IsDemoMode() && !g_App.IsConfigMode() ) {
		switch( e.keyCode ) {
			case KEY_S:       g_bKeyStart  = false;  g_bKeyStartOK  = true;  break;
			case KEY_ESC:     g_bKeyPause  = false;  g_bKeyPauseOK  = true;  break;
			case KEY_E:       g_bKeyMute   = false;  g_bKeyMuteOK   = true;  break;
			case KEY_C:       g_bKeyConfig = false;  g_bKeyConfigOK = true;  break;
			case KEY_SHIFT:   g_bKeyShift  = false;  break;
		}
	}
	else {
		switch( e.keyCode ) {
			case KEY_LEFT:    g_bKeyLeft   = false;  break;
			case KEY_RIGHT:   g_bKeyRight  = false;  break;
			case KEY_UP:      g_bKeyUp     = false;  break;
			case KEY_DOWN:    g_bKeyDown   = false;  break;
			case KEY_Z:
			case KEY_PAGEUP:  {
				if( g_App.GetConfigObject().GetKeyAsign() == 0 ) {
					g_bKeyBomb = false;
					g_bKeyBombOK = true;
				}
				else {
					g_bKeyFire = false;
					g_bKeyFireOK = true;
				}
				break;
			}
			case KEY_X: 
			case KEY_PAGEDOWN:{
				if( g_App.GetConfigObject().GetKeyAsign() == 0 ) {
					g_bKeyFire = false;
					g_bKeyFireOK = true;
				}
				else {
					g_bKeyBomb = false;
					g_bKeyBombOK = true;
				}
				break;
			}
			case KEY_S:       g_bKeyStart  = false;  g_bKeyStartOK  = true;  break;
			case KEY_ESC:     g_bKeyPause  = false;  g_bKeyPauseOK  = true;  break;
			case KEY_E:       g_bKeyMute   = false;  g_bKeyMuteOK   = true;  break;
			case KEY_C:       g_bKeyConfig = false;  g_bKeyConfigOK = true;  break;
			case KEY_SHIFT:   g_bKeyShift  = false;  break;
		}
	}
	g_nLastKeycode = 0;
}
document.addEventListener( 'keydown', OnKeyDown );
document.addEventListener( 'keyup', OnKeyUp );

let g_nMouseX = 0;
let g_nMouseY = 0;

function IsMobileControlTarget(e) {
	return !!(e.target && e.target.closest && e.target.closest('#idJoyStick, #idActionButtons'));
}

const OnMouseDown = function(e) {
	_stopEvent(e);

	if( IsMobileControlTarget(e) )
		return;

	if( e.targetTouches ) {
		if(e.targetTouches.length > 1)
			return;

		g_bKeyFire = true;
		g_bKeyBomb = true;
		return;
	}

	if( !g_App )
		return;

	if( !g_App.GetConfigObject().IsMouse() )
		return;

	if( g_App.IsConfigMode() )
		return;

	switch( e.button ) {
		case 0: g_bKeyFire = true;  break;
		case 2: g_bKeyBomb = true;  break;
	}
}

const OnMouseUp = function(e) {
	_stopEvent(e);

	if( IsMobileControlTarget(e) )
		return;

	if( e.targetTouches ) {
		if(e.targetTouches.length > 1)
			return;

		g_bKeyFire = false;  g_bKeyFireOK = true;
		g_bKeyBomb = false;  g_bKeyBombOK = true;
		return;
	}

	if( !g_App )
		return;

	if( !g_App.GetConfigObject().IsMouse() )
		return;

	if( g_App.IsConfigMode() )
		return;

	switch( e.button ) {
		case 0: g_bKeyFire = false;  g_bKeyFireOK = true;  break;
		case 2: g_bKeyBomb = false;  g_bKeyBombOK = true;  break;
	}
}

const OnMouseMove = function(e) {
	_stopEvent(e);

	if( IsMobileControlTarget(e) )
		return;

	if( !g_App )
		return;

	if( !g_App.GetConfigObject().IsMouse() )
		return;

	if( g_GamePad.IsAvailable() )
		return;

	if( g_App.IsDemoMode() )
		return;

	if( e.targetTouches ) {
		e = e.targetTouches[0];
	}

	const nLeft = (window.innerWidth-SCREEN_WIDTH*g_fScale)/2;
	const nTop = parseInt(document.getElementById('idMain').offsetTop);
	g_nMouseX = (e.clientX - nLeft) / g_fScale;
	g_nMouseY = (e.clientY - nTop) / g_fScale;
	/*
	if( g_Debug ) {
		g_Debug.Print('X:'+g_nMouseX+'<br>Y:'+g_nMouseY+'<br>Scale:'+g_fScale);
	}
	*/
}

window.addEventListener( 'mousedown',  OnMouseDown );
window.addEventListener( 'touchstart', OnMouseDown );
window.addEventListener( 'mouseup',    OnMouseUp );
window.addEventListener( 'touchend',   OnMouseUp );
window.addEventListener( 'mousemove',  OnMouseMove );
window.addEventListener( 'touchmove',  OnMouseMove );

