"use strict";

g_Image = new ImageLoader();

function ImageLoader() {
  this.m_nLoading = 0;
  this.m_nLoaded = 0;
  this.m_nFailed = 0;
  this.nodeImageAr = new Array();
}

ImageLoader.prototype.NumLoadingData = function () {
  return this.m_nLoading;
};

ImageLoader.prototype.NumLoadedData = function () {
  return this.m_nLoaded;
};

ImageLoader.prototype.NumFailed = function () {
  return this.m_nFailed;
};

ImageLoader.prototype.LoadImage = function (strID, strFilename) {
  var cb_retry = function cb_retry() {
    g_Image.LoadImage(strID, strFilename);
  };

  var nodeImg = this.GetNode(strID);
  if (nodeImg) return nodeImg;
  nodeImg = new Image();
  this.m_nLoading++;

  nodeImg.onload = function () {
    g_Image.m_nLoaded++;
    nodeImg.onload = null;
  };

  nodeImg.onerror = function () {
    g_Image.m_nLoading--;
    g_Image.m_nFailed++;
    setTimeout(cb_retry, 300);
  };

  nodeImg.src = strFilename; // srcの設定はonloadの後でないといけない

  nodeImg.id = strID;
  this.nodeImageAr[strID] = nodeImg;
  return nodeImg;
};

ImageLoader.prototype.GetNode = function (strID) {
  return this.nodeImageAr[strID];
};

ImageLoader.prototype.GetSrc = function (strID) {
  var nodeImage = this.GetNode(strID);
  return nodeImage.src;
};

ImageLoader.prototype.GetURL = function (strID) {
  return 'url(\'' + this.GetSrc(strID) + '\')';
};

ImageLoader.prototype.IsLoaded = function (strID) {
  var node = this.GetNode(strID);
  if (!node) return false;
  return node.onload ? false : true;
};

g_Image.LoadImage('idImgAndorGen', 'images/andorgen.gif');
g_Image.LoadImage('idImgBack', 'images/back.png');
g_Image.LoadImage('idImgBacura', 'images/bacura.gif');
g_Image.LoadImage('idImgBlaster', 'images/blaster.gif');
g_Image.LoadImage('idImgBlaster', 'images/bridge.gif');
g_Image.LoadImage('idImgBSpario', 'images/bspario.gif');
g_Image.LoadImage('idImgBZakato', 'images/bzakato.gif');
g_Image.LoadImage('idImgFExp', 'images/f-explosion.gif');
g_Image.LoadImage('idImgFObj', 'images/f-object.gif');
g_Image.LoadImage('idImgFonts', 'images/fonts.gif');
g_Image.LoadImage('idImgForest', 'images/forest.gif');
g_Image.LoadImage('idImgGExp', 'images/g-explosion.gif');
g_Image.LoadImage('idImgGObject', 'images/g-object1.gif');
g_Image.LoadImage('idImgBigGObject', 'images/g-object2.gif');
g_Image.LoadImage('idImgGSpario', 'images/gspario.gif');
g_Image.LoadImage('idImgGSpario', 'images/logopalette.gif');
g_Image.LoadImage('idImgNamco', 'images/namco.gif');
g_Image.LoadImage('idImgRemain', 'images/remain.gif');
g_Image.LoadImage('idImgSExp', 'images/s_explosion.gif');
g_Image.LoadImage('idImgSheonite', 'images/shionite.gif');
g_Image.LoadImage('idImgSol', 'images/sol.gif');
g_Image.LoadImage('idImgSpario', 'images/spario.gif');
g_Image.LoadImage('idImgSparc', 'images/spark.gif');
g_Image.LoadImage('idImgTitle', 'images/title.gif');
g_Image.LoadImage('idImgTitle2', 'images/title2.gif');
g_Image.LoadImage('idImgZakato', 'images/zakato.gif');
g_Image.LoadImage('idImgZapper', 'images/zapper.gif');
g_Image.LoadImage('idImgBtnSEOn', 'button/seon.gif');
g_Image.LoadImage('idImgBtnSEOff', 'button/seoff.gif');
//# sourceMappingURL=image.dev.js.map
