(function() {
	'use strict';

	const nodeJoystick = document.getElementById('idJoyStick');
	const nodeButtonStart = document.getElementById('idButtonStart');
	const nodeButtonA = document.getElementById('idButtonA');
	const nodeButtonB = document.getElementById('idButtonB');
	if( !nodeJoystick || !nodeButtonStart || !nodeButtonA || !nodeButtonB )
		return;

	const directionState = {
		up: false,
		down: false,
		left: false,
		right: false
	};

	function SetKeyState(keyCode, bPressed) {
		if( bPressed )
			OnKeyDown({keyCode: keyCode});
		else
			OnKeyUp({keyCode: keyCode});
	}

	function SetDirectionKeyState(direction, bPressed) {
		switch( direction ) {
			case 'up':    g_bKeyUp = bPressed;    break;
			case 'down':  g_bKeyDown = bPressed;  break;
			case 'left':  g_bKeyLeft = bPressed;  break;
			case 'right': g_bKeyRight = bPressed; break;
		}
	}

	function SetDirectionState(nextState) {
		for( const direction in directionState ) {
			if( directionState[direction] == nextState[direction] )
				continue;
			directionState[direction] = nextState[direction];
			SetDirectionKeyState(direction, nextState[direction]);
		}
	}

	function ResetDirection() {
		SetDirectionState({up:false, down:false, left:false, right:false});
	}

	const nodeKnob = document.getElementById('idKnob');
	let activeJoystickPointerId = null;

	function ResetJoystick() {
		activeJoystickPointerId = null;
		ResetDirection();
		if( nodeKnob )
			nodeKnob.style.transform = 'translate(0,0)';
	}

	function UpdateJoystick(e) {
		const rect = nodeJoystick.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const knobRect = nodeKnob ? nodeKnob.getBoundingClientRect() : null;
		const knobRadius = knobRect ? Math.min(knobRect.width, knobRect.height) / 2 : 19;
		const scaleX = rect.width / Math.max(1, nodeJoystick.offsetWidth);
		const scaleY = rect.height / Math.max(1, nodeJoystick.offsetHeight);
		const maxDistance = Math.max(1, Math.min(rect.width, rect.height) / 2 - knobRadius - 2 * Math.max(scaleX, scaleY));
		let deltaX = e.clientX - centerX;
		let deltaY = e.clientY - centerY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		if( distance > maxDistance ) {
			const scale = maxDistance / distance;
			deltaX *= scale;
			deltaY *= scale;
		}
		if( nodeKnob )
			nodeKnob.style.transform = 'translate(' + deltaX / scaleX + 'px,' + deltaY / scaleY + 'px)';

		const x = deltaX / maxDistance;
		const y = -deltaY / maxDistance;
		SetDirectionState({
			up: y > 0.25,
			down: y < -0.25,
			left: x < -0.25,
			right: x > 0.25
		});
	}

	nodeJoystick.addEventListener('pointerdown', function(e) {
		e.preventDefault();
		if( activeJoystickPointerId !== null )
			return;
		activeJoystickPointerId = e.pointerId;
		if( nodeJoystick.setPointerCapture )
			nodeJoystick.setPointerCapture(e.pointerId);
		UpdateJoystick(e);
	});
	nodeJoystick.addEventListener('pointermove', function(e) {
		if( e.pointerId === activeJoystickPointerId ) {
			e.preventDefault();
			UpdateJoystick(e);
		}
	});
	nodeJoystick.addEventListener('pointerup', function(e) {
		if( e.pointerId === activeJoystickPointerId ) {
			e.preventDefault();
			ResetJoystick();
		}
	});
	nodeJoystick.addEventListener('pointercancel', function(e) {
		if( e.pointerId === activeJoystickPointerId )
			ResetJoystick();
	});
	nodeJoystick.addEventListener('lostpointercapture', function(e) {
		if( e.pointerId === activeJoystickPointerId )
			ResetJoystick();
	});

	function GetActionKey(button) {
		if( button == 'start' )
			return KEY_S;
		if( !g_App || g_App.GetConfigObject().GetKeyAsign() == 0 )
			return button == 'a' ? KEY_X : KEY_Z;
		return button == 'a' ? KEY_Z : KEY_X;
	}

	function BindActionButton(nodeButton, button) {
		let activePointerId = null;

		const press = function(e) {
			e.preventDefault();
			if( activePointerId !== null )
				return;
			activePointerId = e.pointerId;
			nodeButton.classList.add('is-pressed');
			if( nodeButton.setPointerCapture )
				nodeButton.setPointerCapture(e.pointerId);
			SetKeyState(GetActionKey(button), true);
		};

		const release = function(e) {
			e.preventDefault();
			if( activePointerId !== e.pointerId )
				return;
			activePointerId = null;
			nodeButton.classList.remove('is-pressed');
			SetKeyState(GetActionKey(button), false);
		};

		nodeButton.addEventListener('pointerdown', press);
		nodeButton.addEventListener('pointerup', release);
		nodeButton.addEventListener('pointercancel', release);
		nodeButton.addEventListener('lostpointercapture', function(e) {
			if( activePointerId === e.pointerId )
				release(e);
		});

		return function() {
			if( activePointerId === null )
				return;
			const pointerId = activePointerId;
			activePointerId = null;
			nodeButton.classList.remove('is-pressed');
			SetKeyState(GetActionKey(button), false);
			if( nodeButton.releasePointerCapture )
				nodeButton.releasePointerCapture(pointerId);
		};
	}

	const resetButtonStart = BindActionButton(nodeButtonStart, 'start');
	const resetButtonA = BindActionButton(nodeButtonA, 'a');
	const resetButtonB = BindActionButton(nodeButtonB, 'b');
	window.addEventListener('blur', function() {
		ResetJoystick();
		resetButtonStart();
		resetButtonA();
		resetButtonB();
	});
})();
