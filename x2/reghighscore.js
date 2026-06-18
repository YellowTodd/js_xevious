
function RegHighScore( objApp ) {
	const m_objApp = objApp;
	const m_nodeCongrats = document.getElementById('idCongrats');
	const m_nodeRanking = document.getElementById('idRanking');
	const m_objScore = m_objApp.GetScoreObject();
	const m_objText = m_objApp.GetTextObject();
	m_objText.Print( m_nodeCongrats, 51, 0, 'CONGRATULATIONS!', COLOR_RED );
	m_objText.Print( m_nodeCongrats, 43,24, 'ENTER YOUR INITIAL', COLOR_RED );

	let m_nFrameCount = 0;
	let m_bShow1UP = true;
	let m_strName = '';
	let m_nCurAscii = 0x40;
	let m_nodeName;

	this.IsInRank = function( nCurScore ) {
//nCurScore=88230;
//m_objScore.ResetHighScores();
//m_objScore.AddScore(nCurScore);
		const highScoreAr = m_objScore.GetHighScores();
		m_nRank = 99;
		for( let i=4; i>=0; i-- ) {
			if( nCurScore > highScoreAr[i].nScore )
				m_nRank = i;
		}
		if( m_nRank > 4 )
			return false;

		m_objScore.RegisterScore( nCurScore, ' ' );
		m_nScore = nCurScore;
		m_strName = '';
		m_nFrameCount = 0;
		m_nCurAscii = 0x40;
		return true;
	}

	this.Act = function() {
		function endRegister() {
			const highScoreAr = m_objScore.GetHighScores();
			highScoreAr[m_nRank].sName = m_strName;
			m_objScore.SaveHighScores();
			m_objScore.ShowRanking( false );
			m_nodeCongrats.style.visibility = 'hidden';
			g_objSound.Stop('idSndNameEntry1');
			g_objSound.Stop('idSndNameEntry2');

		}

		if( m_nFrameCount == 0 ) {
			m_nodeCongrats.style.visibility = 'visible';
			m_objScore.ShowRanking( true, m_nRank, m_nScore );
			m_nodeName = m_objText.Print( m_nodeRanking, 0, 0, '' );
			if( m_nRank == 0 )
				g_objSound.Play('idSndNameEntry1');
			else
				g_objSound.Play('idSndNameEntry2');
		}

		if( g_bKeyLeft ) {
			g_bKeyLeft = false;
			m_nCurAscii--;
			if( m_nCurAscii == 0x3f )
				m_nCurAscii = 0x5a;
		}
		else if( g_bKeyRight ) {
			g_bKeyRight = false;
			m_nCurAscii++;
			if( m_nCurAscii == 0x5b )
				m_nCurAscii = 0x40;
		}

		let nAscii = m_nCurAscii;
		g_Debug.Clear();
		if( g_bKeyBomb ) {
			g_Debug.Print('Shift');
			nAscii |= 0x20;
		}
		let strChar = String.fromCharCode( nAscii );
		if( strChar == '@' )
			strChar = ' ';
		if( strChar == '`' )
			strChar = '.';

		m_objText.RemoveText( m_nodeRanking, m_nodeName );
		m_nodeName = m_objText.Print( m_nodeRanking, 43+11*8, 24+m_nRank*16, m_strName+strChar, COLOR_YELLOW );

		if( g_bKeyFire ) {
			g_bKeyFire = false;
			m_strName += strChar;
			m_nCurAscii = 0x40;
			if( m_strName.length >= 10 ) {
				endRegister();
				return true;
			}
		}

		if( (m_nFrameCount % 16) == 0 ) {
			m_bShow1UP = !m_bShow1UP;
			m_objScore.Show1Up( m_bShow1UP );
		}
		m_nFrameCount++;
		if( m_nFrameCount > 4000 ) {
			endRegister();
			return true;
		}

		return false;
	}
}
