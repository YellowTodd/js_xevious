
function Score( objApp ) {
	const m_objApp = objApp;
	const m_objText = m_objApp.GetTextObject();
	const m_nodeScoreBoard = document.getElementById('idScoreBoard');
	const m_node1Up = document.getElementById('id1UP');
	const m_nodeHighScore = document.getElementById('idHighScore');
	const m_nodeScore = document.getElementById('idScore');
	const m_nodeRanking = document.getElementById('idRanking');

	m_objText.Print( m_node1Up, 0, 0, '1UP' );
	m_objText.Print( m_nodeHighScore, 0, 0, 'HIGH SCORE', COLOR_ORANGE );

	const FIRST_THRESHOLD = 20000;
	const SECOND_THRESHOLD = 60000;

	let m_nScore = FIRST_THRESHOLD;
	let m_nHighScore = 40000;
	let m_highScoreAr = [
			{nScore:0, sName:''},
			{nScore:0, sName:''},
			{nScore:0, sName:''},
			{nScore:0, sName:''},
			{nScore:0, sName:''}
		];

	this.SaveHighScores = function() {
		for( let i=0; i<m_highScoreAr.length; i++ ) {
			_saveData( 'sc'+i, m_highScoreAr[i].nScore );
			_saveData( 'nm'+i, m_highScoreAr[i].sName );
		}
		_storeDataToCookie();
	}

	this.Initialize = function() {
		m_nNextScore = FIRST_THRESHOLD;
		m_nScore = 0;

		let bOK = false;
		_loadData( COOKIE );
		if( _retrieveDataFromCookie() ) {
			if( _loadData('sc0') != '' ) {
				bOK = true;
				for( let i=0; i<m_highScoreAr.length; i++ ) {
					m_highScoreAr[i].nScore  = Number(_loadData('sc'+i));
					m_highScoreAr[i].sName = _loadData('nm'+i);
				}
				m_nHighScore = m_highScoreAr[0].nScore;
			}
		}
		if( !bOK )
			this.InitializeHighScores();
		this.ShowScore( true );
	}
	
	this.InitializeHighScores = function() {
		m_nHighScore = 40000;
		m_highScoreAr[0].nScore = 40000;  m_highScoreAr[0].sName = 'M.Nakamura';
		m_highScoreAr[1].nScore = 35000;  m_highScoreAr[1].sName = 'Eirry Mou.';
		m_highScoreAr[2].nScore = 30000;  m_highScoreAr[2].sName = 'Evezoo End';
		m_highScoreAr[3].nScore = 25000;  m_highScoreAr[3].sName = 'S.Okamoto';
		m_highScoreAr[4].nScore = 20000;  m_highScoreAr[4].sName = 'S.Kojima';
	}

	this.ResetHighScores = function() {
		m_nScores = 0;
		this.InitializeHighScores();
		this.SaveHighScores();
	}

	this.RegisterScore = function( nScore, strName ) {
		for( let i=0; i<m_highScoreAr.length; i++ ) {
			if( m_highScoreAr[i].nScore < nScore ) {
				for( let j=m_highScoreAr.length-1; j>=i+1; j-- ) {
					m_highScoreAr[j].nScore = m_highScoreAr[j-1].nScore;
					m_highScoreAr[j].sName = m_highScoreAr[j-1].sName;
				}
				m_highScoreAr[i].nScore = nScore;
				m_highScoreAr[i].sName = strName;
				break;
			}
		}
		this.SaveHighScores();
	}

	this.GetScore = function() {
		return m_nScore;
	}

	this.GetHighScores = function() {
		return m_highScoreAr;
	}

	this.AddScore = function( nAdd ) {
		if( g_App.IsDemoMode() )
			return;

		m_nScore += nAdd;
		if( m_nScore > 9999990 )
			m_nScore = 9999990;
		if( m_nScore > m_nHighScore )
			m_nHighScore = m_nScore;

		if( m_nScore > m_nNextScore ) {
			g_App.GetRemainObject().Increase( true );
			if( m_nNextScore == FIRST_THRESHOLD )
				m_nNextScore = SECOND_THRESHOLD;
			else
				m_nNextScore += SECOND_THRESHOLD;
		}

		this.ShowScore( true );
	}

	this.ShowScore = function( bShow ) {
		if( bShow ) {
			let str;
			m_objText.Clear( m_nodeScore );
			str = ('       ' + m_nScore).slice(-7);
			if( m_nScore == 0 )
				str = '     00';
			m_objText.Print( m_nodeScore,3, 0, str );
			str = ('       ' + m_nHighScore).slice(-7);
			m_objText.Print( m_nodeScore, 83, 0, str );
			m_nodeScoreBoard.style.visibility = 'visible';
			this.Show1Up( true );
		}
		else {
			m_nodeScoreBoard.style.visibility = 'hidden';
			this.Show1Up( false );
		}
	}

	this.Show1Up = function( bShow ) {
		m_node1Up.style.visibility = bShow? 'visible' : 'hidden';
	}

	this.ShowCongrats = function( bShow ) {
		m_nodeCongrats.style.visibility = bShow? 'visible' : 'hidden';
	}

	this.ShowRanking = function( bShow, nHighlightRow ) {
		if( bShow ) {
			m_objText.Clear( m_nodeRanking );
			m_objText.Print( m_nodeRanking, 43, 0, 'Best Five WARRIORS' );

			const strRankAr = ['1st', '2nd', '3rd', '4th', '5th'];
			for( let i=0; i<5; i++ ) {
				let strColor = COLOR_WHITE;
				if( i == nHighlightRow ) {
					strColor = COLOR_YELLOW;
				}
				m_objText.Print( m_nodeRanking, 19, 24+i*16, strRankAr[i], strColor );
				let strScore = ('         ' + m_highScoreAr[i].nScore).slice(-9);
				m_objText.Print( m_nodeRanking, 43, 24+i*16, strScore, strColor );
				m_objText.Print( m_nodeRanking, 43+11*8, 24+i*16, m_highScoreAr[i].sName );
			}
			m_nodeRanking.style.visibility = 'visible';
		}
		else {
			m_nodeRanking.style.visibility = 'hidden';
		}
	}
	
	this.Initialize();
}
