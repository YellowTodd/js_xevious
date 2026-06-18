
function Remain() {
	const m_nodeRemain = document.getElementById('idRemain');
	let m_nRemain = 2;

	function updateRemain() {
		let nRemain = m_nRemain;
		if( nRemain < 0 )
			nRemain = 0;
		if( nRemain > 28 )
			nRemain = 28;
		const nXOft = -(28-nRemain)*8;
		m_nodeRemain.style.backgroundPosition = nXOft + 'px 0px';
	}

	this.Show = function( bShow ) {
		m_nodeRemain.style.visibility = bShow? 'visible' : 'hidden';
	}

	this.Initialize = function() {
		m_nRemain = g_App.GetConfigObject().NumSolvalous()-1;
		updateRemain();
	}

	this.Decrease = function() {
		m_nRemain--;
		updateRemain();
		return (m_nRemain<0)? false : true;
	}
	
	this.Increase = function( bSound ) {
		m_nRemain++;
		if( m_nRemain > 255 )
			m_nRemain = 255;
		updateRemain();
		if( bSound )
			g_objSound.Play( 'idSndExtend' );
	}

	this.GetRemain = function() {
		return m_nRemain;
	}
}
