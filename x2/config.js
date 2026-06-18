
function Config( objApp ) {
	const m_objApp = objApp;
	const m_nodeConfig = document.getElementById('idConfig');
	const m_objText = m_objApp.GetTextObject();

	const MENU_X = 8*1;
	const ITEM_X = 8*17;
	const MENU_Y = 8*3;
	const DIFFICULTY_Y = MENU_Y;
	const SOLVALOUS_Y = DIFFICULTY_Y + 8*5;
	const AREA_Y = SOLVALOUS_Y + 8*3;
	const KEY_Y = AREA_Y + 8*3;
	const MOUSE_Y = KEY_Y + 8*3;
	const INVINCIBLE_Y = MOUSE_Y + 8*3;
	const SHADOW_Y = INVINCIBLE_Y + 8*3;
	const HIGHSCORE_Y = SHADOW_Y + 8*3;
	const EXIT_Y = HIGHSCORE_Y + 8*4;
	const EXIT_X = ITEM_X;
	const INSTRUCTION_Y = 8*34;
	const HIGHLIGHT = COLOR_ORANGE;

	let m_nDifficulty = 1;
	let m_nSolvalous = 3;
	let m_nStartArea = 1;
	let m_nKeyAsign = 0;
	let m_nMouse = 0;
	let m_nInvincible = 0;
	let m_nShadow = 0;
	let m_nResetHiScore = 0;

	this.GetDifficulty = function() {
		return m_nDifficulty;
	}
	
	this.NumSolvalous = function() {
		return m_nSolvalous;
	}
	
	this.GetStartArea = function() {
		return m_nStartArea;
	}

	this.GetKeyAsign = function() {
		return m_nKeyAsign;
	}

	this.IsMouse = function() {
		return m_nMouse;
	}

	this.IsGamePadAvailable = function() {
		return false;
	}

	this.IsInvincible = function() {
		return m_nInvincible;
	}

	this.IsShadow = function() {
		return m_nShadow;
	}

	let m_nodeDifficultyAr = [null,null,null,null];
	let m_nodeSolvalous = null;
	let m_nodeSolvalousDec = null;
	let m_nodeSolvalousInc = null;
	let m_nodeStartArea = null;
	let m_nodeStartAreaDec = null;
	let m_nodeStartAreaInc = null;
	let m_nodeKeyAsignAr = [null,null];
	let m_nodeMouseAr = [null,null];
	let m_nodeInvincibleAr = [null,null];
	let m_nodeShadowAr = [null,null];
	let m_nodeHighScoresAr = [null,null];
	let m_nodeExit = null;
	let m_nodePrev = null;
	let m_nodeCursor = null;
	let m_posCursor = {x:ITEM_X-8, y:DIFFICULTY_Y+8};
	let m_nMenu = 1;

	function setMouseBehavior() {
		function getMenuNoByNode( node ) {
			let nMenu = 0;
			switch( node ) {
				case m_nodeDifficultyAr[0]: nMenu =  0;  break;
				case m_nodeDifficultyAr[1]: nMenu =  1;  break;
				case m_nodeDifficultyAr[2]: nMenu =  2;  break;
				case m_nodeDifficultyAr[3]: nMenu =  3;  break;
				case m_nodeSolvalousDec:    nMenu =  4;  break;
				case m_nodeSolvalousInc:    nMenu =  5;  break;
				case m_nodeStartAreaDec:    nMenu =  6;  break;
				case m_nodeStartAreaInc:    nMenu =  7;  break;
				case m_nodeKeyAsignAr[0]:   nMenu =  8;  break;
				case m_nodeKeyAsignAr[1]:   nMenu =  9;  break;
				case m_nodeMouseAr[0]:      nMenu = 10;  break;
				case m_nodeMouseAr[1]:      nMenu = 11;  break;
				case m_nodeInvincibleAr[0]: nMenu = 12;  break;
				case m_nodeInvincibleAr[1]: nMenu = 13;  break;
				case m_nodeShadowAr[0]:     nMenu = 14;  break;
				case m_nodeShadowAr[1]:     nMenu = 15;  break;
				case m_nodeHighScoresAr[0]: nMenu = 16;  break;
				case m_nodeHighScoresAr[1]: nMenu = 17;  break;
				case m_nodeExit:            nMenu = 18;  break;
			}
			return nMenu;
		}
		function on_mouse_move(e) {
			const node = e.currentTarget;
			m_nMenu = getMenuNoByNode( node );
			setCursor();

			m_objText.SetColor( node, COLOR_YELLOW );
			m_nodePrev = node;

			m_objText.SetColor( m_nodeDifficultyAr[m_nDifficulty], HIGHLIGHT );
			m_objText.SetColor( m_nodeKeyAsignAr[m_nKeyAsign], HIGHLIGHT );
			m_objText.SetColor( m_nodeMouseAr[1-m_nMouse], HIGHLIGHT );
			m_objText.SetColor( m_nodeInvincibleAr[1-m_nInvincible], HIGHLIGHT );
			m_objText.SetColor( m_nodeShadowAr[1-m_nShadow], HIGHLIGHT );
			m_objText.SetColor( m_nodeHighScoresAr[m_nResetHiScore], HIGHLIGHT );
		}
		function on_click(e) {
			switch( m_nMenu ) {
				case  0:
				case  1:
				case  2:
				case  3: m_nDifficulty = m_nMenu;  break;
				case  4: showSolvalous(-1);        break;
				case  5: showSolvalous(1);         break;
				case  6: showStartArea(-1);        break;
				case  7: showStartArea(1);         break;
				case  8: m_nKeyAsign = 0;          break;
				case  9: m_nKeyAsign = 1;          break;
				case 10: m_nMouse = 1;             break;
				case 11: m_nMouse = 0;             break;
				case 12: m_nInvincible = 1;        break;
				case 13: m_nInvincible = 0;        break;
				case 14: m_nShadow = 1;            break;
				case 15: m_nShadow = 0;            break;
				case 16: m_nResetHiScore = 0;      break;
				case 17: m_nResetHiScore = 1;      break;
				case 18: objThis.End();            break;
			}
			recreateScreen();
		}
		function setIndividualBehavior( node ) {
			node.style.cursor = 'pointer';
			node.addEventListener( 'mousemove', on_mouse_move );
			node.addEventListener( 'click', on_click );
		}

		for( let i=0; i<4; i++ )
			setIndividualBehavior(m_nodeDifficultyAr[i]);
		setIndividualBehavior(m_nodeSolvalousDec);
		setIndividualBehavior(m_nodeSolvalousInc);
		setIndividualBehavior(m_nodeStartAreaDec);
		setIndividualBehavior(m_nodeStartAreaInc);
		for( let i=0; i<2; i++ )
			setIndividualBehavior(m_nodeKeyAsignAr[i]);
		for( let i=0; i<2; i++ )
			setIndividualBehavior(m_nodeMouseAr[i]);
		for( let i=0; i<2; i++ )
			setIndividualBehavior(m_nodeInvincibleAr[i]);
		for( let i=0; i<2; i++ )
			setIndividualBehavior(m_nodeShadowAr[i]);
		for( let i=0; i<2; i++ )
			setIndividualBehavior(m_nodeHighScoresAr[i]);
		setIndividualBehavior(m_nodeExit);
	}

	function createNumField( nX, nY ) {
		let node = document.createElement( 'div' );
		node.style.position = 'absolute';
		node.style.left = nX + 'px';
		node.style.top = nY + 'px';
		node.style.width = '24px';
		node.style.height = '8px';
		node.style.zIndex = 0;
		m_nodeConfig.appendChild( node );
		return node;
	}

	function createCursor() {
		const nCode = 0x10;
		const nOftX = nCode % 16;
		const nOftY = (nCode / 16)|0;

		m_nodeCursor = document.createElement( 'div' );
		m_nodeCursor.classList.add( 'text' );
		m_nodeCursor.style.backgroundPosition = '-' + (nOftX*10) + 'px -' + (nOftY*10) + 'px';
		m_nodeConfig.appendChild( m_nodeCursor );

		const nodePalette = document.createElement( 'div' );
		nodePalette.classList.add( 'text_palette' );
		nodePalette.style.left = '0px';
		nodePalette.style.top = '0px';
		nodePalette.style['-webkit-mask-position'] = '-' + (nOftX*10) + 'px -' + (nOftY*10) + 'px';
		nodePalette.style.backgroundColor = 'rgb(0,200,255)';
		m_nodeCursor.appendChild( nodePalette );
	}

	function setCursor() {
		let nX = ITEM_X-8;
		let nY;
		switch( m_nMenu ) {
			case  0:
			case  1:
			case  2:
			case  3:  nY = DIFFICULTY_Y + m_nMenu*8;     break;
			case  4:
			case  5:  nY = SOLVALOUS_Y;  break;
			case  6:
			case  7:  nY = AREA_Y;       break;
			case  8:
			case  9:  nY = KEY_Y + (m_nMenu-8)*8;      break;
			case 10:
			case 11:  nY = MOUSE_Y + (m_nMenu-10)*8;      break;
			case 12:
			case 13:  nY = INVINCIBLE_Y + (m_nMenu-12)*8;break;
			case 14:
			case 15:  nY = SHADOW_Y + (m_nMenu-14)*8;break;
			case 16:
			case 17:  nY = HIGHSCORE_Y + (m_nMenu-16)*8; break;
			case 18:  nY = EXIT_Y;  nX = EXIT_X-8;       break;
		}

		m_nodeCursor.style.left = nX + 'px';
		m_nodeCursor.style.top = nY + 'px';

		if( m_nodePrev )
			m_objText.SetColor( m_nodePrev, COLOR_WHITE );
	}

	function showDifficulty() {
		let itemNameAr = ['EASY', 'NORMAL', 'HARD', 'VERY HARD'];
		for( let i=0; i<itemNameAr.length; i++ ) {
			let strCol = (i == m_nDifficulty)? HIGHLIGHT : COLOR_WHITE;
			m_nodeDifficultyAr[i] = m_objText.Print( m_nodeConfig, ITEM_X, DIFFICULTY_Y+8*i, itemNameAr[i], strCol );
		}
	}

	function showSolvalous( nDelta ) {
		m_objText.Clear( m_nodeSolvalous );
		m_nSolvalous += nDelta;
		if( m_nSolvalous < 1 )
			m_nSolvalous = 255;
		if( m_nSolvalous > 255 )
			m_nSolvalous = 1;
		let str = ('   ' + m_nSolvalous).slice(-3);
		m_objText.Print( m_nodeSolvalous, 0, 0, str );
	}

	function showStartArea( nDelta ) {
		m_objText.Clear( m_nodeStartArea );
		m_nStartArea += nDelta;
		let nFinalArea = 16;
		if( DEBUG_LEVEL )
			nFinalArea = 17;
		if( m_nStartArea < 1 )
			m_nStartArea = nFinalArea;
		if( m_nStartArea > nFinalArea )
			m_nStartArea = 1;
		let str = ('   ' + m_nStartArea).slice(-3);
		m_objText.Print( m_nodeStartArea, 0, 0, str );
	}

	function showKeyAsign() {
		let itemNameAr = ['X/Z', 'Z/X'];

		m_nodeKeyAsignAr[0] = m_objText.Print( m_nodeConfig, ITEM_X, KEY_Y, itemNameAr[0], (m_nKeyAsign==0)? HIGHLIGHT:COLOR_WHITE );
		m_nodeKeyAsignAr[1] = m_objText.Print( m_nodeConfig, ITEM_X, KEY_Y+8, itemNameAr[1], (m_nKeyAsign!=0)? HIGHLIGHT:COLOR_WHITE );
	}

	function showMouse() {
		let itemNameAr = ['ON', 'OFF'];

		m_nodeMouseAr[0] = m_objText.Print( m_nodeConfig, ITEM_X, MOUSE_Y, itemNameAr[0], (m_nMouse==1)? HIGHLIGHT:COLOR_WHITE );
		m_nodeMouseAr[1] = m_objText.Print( m_nodeConfig, ITEM_X, MOUSE_Y+8, itemNameAr[1], (m_nMouse!=1)? HIGHLIGHT:COLOR_WHITE );
	}

	function showInvincible() {
		let itemNameAr = ['ON', 'OFF'];

		m_nodeInvincibleAr[0] = m_objText.Print( m_nodeConfig, ITEM_X, INVINCIBLE_Y, itemNameAr[0], (m_nInvincible==1)? HIGHLIGHT:COLOR_WHITE );
		m_nodeInvincibleAr[1] = m_objText.Print( m_nodeConfig, ITEM_X, INVINCIBLE_Y+8, itemNameAr[1], (m_nInvincible!=1)? HIGHLIGHT:COLOR_WHITE );
	}

	function showShadow() {
		let itemNameAr = ['ON', 'OFF'];

		m_nodeShadowAr[0] = m_objText.Print( m_nodeConfig, ITEM_X, SHADOW_Y, itemNameAr[0], (m_nShadow==1)? HIGHLIGHT:COLOR_WHITE );
		m_nodeShadowAr[1] = m_objText.Print( m_nodeConfig, ITEM_X, SHADOW_Y+8, itemNameAr[1], (m_nShadow!=1)? HIGHLIGHT:COLOR_WHITE );
	}

	function showHighScores() {
		let itemNameAr = ['KEEP', 'RESET'];

		m_nodeHighScoresAr[0] = m_objText.Print( m_nodeConfig, ITEM_X, HIGHSCORE_Y, itemNameAr[0], (m_nResetHiScore!=1)? HIGHLIGHT:COLOR_WHITE );
		m_nodeHighScoresAr[1] = m_objText.Print( m_nodeConfig, ITEM_X, HIGHSCORE_Y+8, itemNameAr[1], (m_nResetHiScore==1)? HIGHLIGHT:COLOR_WHITE );
	}

	function recreateScreen() {
		m_objText.Clear( m_nodeConfig );
		m_objText.Print( m_nodeConfig, 8*8-4, 8*0, 'CONFIGURATION' );
		m_objText.Print( m_nodeConfig, MENU_X, DIFFICULTY_Y, 'DIFFICULTY' );
		m_objText.Print( m_nodeConfig, MENU_X, SOLVALOUS_Y, 'SOLVALOUS' );
		m_nodeSolvalousDec = m_objText.Print( m_nodeConfig, ITEM_X, SOLVALOUS_Y, '     <DEC' );
		m_nodeSolvalousDec.style.zIndex = 1;
		m_nodeSolvalousInc = m_objText.Print( m_nodeConfig, ITEM_X, SOLVALOUS_Y+8, '     >INC' );
		m_nodeSolvalousInc.style.zIndex = 1;
		m_objText.Print( m_nodeConfig, MENU_X, AREA_Y, 'START AREA' );
		m_nodeStartAreaDec = m_objText.Print( m_nodeConfig, ITEM_X, AREA_Y, '     <DEC' );
		m_nodeStartAreaDec.style.zIndex = 1;
		m_nodeStartAreaInc = m_objText.Print( m_nodeConfig, ITEM_X, AREA_Y+8, '     >INC' );
		m_nodeStartAreaInc.style.zIndex = 1;
		m_objText.Print( m_nodeConfig, MENU_X, KEY_Y, 'ZAPPER/BLASTER' )
		m_objText.Print( m_nodeConfig, MENU_X, MOUSE_Y, 'MOUSE' );
		m_objText.Print( m_nodeConfig, MENU_X, INVINCIBLE_Y, 'INVINCIBLE' );
		m_objText.Print( m_nodeConfig, MENU_X, SHADOW_Y, 'SHADOW' );
		m_objText.Print( m_nodeConfig, MENU_X, HIGHSCORE_Y, 'HIGH SCORES' );
		m_nodeExit = m_objText.Print( m_nodeConfig, EXIT_X, EXIT_Y, 'EXIT' );
		m_objText.Print( m_nodeConfig, MENU_X+8*3-4, INSTRUCTION_Y, 'SELECT:  ARROW KEYS' );
		m_objText.Print( m_nodeConfig, MENU_X+8*3-4, INSTRUCTION_Y+8, 'DETERMIN:Z/X KEY' );
		m_nodeSolvalous = createNumField( ITEM_X, SOLVALOUS_Y );
		m_nodeStartArea = createNumField( ITEM_X, AREA_Y );
		createCursor();
		showDifficulty();
		showSolvalous(0);
		showStartArea(0);
		showKeyAsign();
		showMouse();
		showInvincible();
		showShadow();
		showHighScores();
		setCursor();
		setMouseBehavior();
	}

	function loadConfig() {
		_loadData( COOKIE );
		if( _retrieveDataFromCookie() ) {
			m_nDifficulty = Number(_loadData('df'));
			m_nSolvalous = Number(_loadData('sl'));
			m_nStartArea = Number(_loadData('sa'));
			m_nKeyAsign = Number(_loadData('ka'));
			m_nMouse = Number(_loadData('ms'));
			m_nInvincible = Number(_loadData('iv'));
			m_nShadow = Number(_loadData('sd'));
		}
	}
	loadConfig();

	this.Initialize = function() {
		loadConfig();
		m_nodeConfig.style.visibility = 'visible';
		m_nMenu = m_nDifficulty;
		recreateScreen();
		g_App.GetScoreObject().ShowScore( false );
	}
	
	this.End = function() {
		_saveData( 'df', m_nDifficulty );
		_saveData( 'sl', m_nSolvalous );
		_saveData( 'sa', m_nStartArea );
		_saveData( 'ka', m_nKeyAsign );
		_saveData( 'ms', m_nMouse );
		_saveData( 'iv', m_nInvincible );
		_saveData( 'sd', m_nShadow );
		_storeDataToCookie();

		const nodeZapperKey = document.getElementById('idZapperKey');
		const nodeBlasterKey = document.getElementById('idBlasterKey');
		if( m_nKeyAsign == 0 ) {
			nodeZapperKey.innerHTML = 'X Key';
			nodeBlasterKey.innerHTML = 'Z Key';
		}
		else {
			nodeZapperKey.innerHTML = 'Z Key';
			nodeBlasterKey.innerHTML = 'X Key';
		}

		m_objApp.SetDemoMode( true );
		if( m_nResetHiScore ) {
			g_App.GetScoreObject().ResetHighScores();
		}

		m_nodeConfig.removeChild( m_nodeSolvalous );
		m_nodeConfig.removeChild( m_nodeStartArea );
		m_nodeConfig.removeChild( m_nodeCursor );
		m_nodeConfig.style.visibility = 'hidden';
		g_App.GetScoreObject().ShowScore( true );
	}
	
	const objThis = this;
	this.Act = function( nFrameSwitch ) {
		if( g_bKeyUp ) {
			g_bKeyUp = false;
			m_nMenu--;
			if( m_nMenu == 5 || m_nMenu == 7 )
				m_nMenu--;
			if( m_nMenu < 0 )
				m_nMenu = 18;
			setCursor();
		}
		if( g_bKeyDown ) {
			g_bKeyDown = false;
			m_nMenu++;
			if( m_nMenu == 5 || m_nMenu == 7 )
				m_nMenu++;
			if( m_nMenu > 18 )
				m_nMenu = 0;
			setCursor();
		}
		if( g_bKeyLeft ) {
			g_bKeyLeft = false;
			if( m_nMenu == 4 )
				showSolvalous(-1);
			else if( m_nMenu == 6 )
				showStartArea(-1);
		}
		if( g_bKeyRight ) {
			g_bKeyRight = false;
			if( m_nMenu == 4 )
				showSolvalous(1);
			else if( m_nMenu == 6 )
				showStartArea(1);
		}
		
		const nKeyCode = GetLastKeyCode();
		if( nKeyCode == KEY_SPACE || nKeyCode == KEY_ENTER )
			g_bKeyFire = true;
		if( g_bKeyFire || g_bKeyBomb ) {
			g_bKeyFire = false;
			g_bKeyBomb = false;
			switch( m_nMenu ) {
				case 0:
				case 1:
				case 2:
				case 3:
					m_nDifficulty = m_nMenu;
					m_nMenu = 4;
					break;
				case 4:
				case 5:
					m_nMenu = 6;
					break;
				case 6:
				case 7:
					m_nMenu = 8;
					if( m_nKeyAsign )
						m_nMenu = 9;
					break;
				case 8:
					m_nKeyAsign = 0;
					m_nMenu = 10;
					if( !m_nMouse )
						m_nMenu = 11;
					break;
				case 9:
					m_nKeyAsign = 1;
					m_nMenu = 10;
					if( !m_nMouse )
						m_nMenu = 11;
					break;
				case 10:
					m_nMouse = 1;
					m_nMenu = 12;
					if( !m_nInvincible )
						m_nMenu = 13;
					break;
				case 11:
					m_nMouse = 0;
					m_nMenu = 12;
					if( !m_nInvincible )
						m_nMenu = 13;
					break;
				case 12:
					m_nInvincible = 1;
					m_nMenu = 15;
					if( m_nShadow )
						m_nMenu = 14;
					break;
				case 13:
					m_nInvincible = 0;
					m_nMenu = 15;
					if( m_nShadow )
						m_nMenu = 14;
					break;
				case 14:
					m_nShadow = 1;
					m_nMenu = 16;
					if( m_nResetHiScore )
						m_nMenu = 15;
					break;
				case 15:
					m_nShadow = 0;
					m_nMenu = 16;
					if( m_nResetHiScore )
						m_nMenu = 15;
					break;
				case 16:
					m_nResetHiScore = 0;
					m_nMenu = 18;
					break;
				case 17:
					m_nResetHiScore = 1;
					m_nMenu = 18;
					break;
				case 18:
					objThis.End();
					break;
			}
			recreateScreen();
		}
	}
}
