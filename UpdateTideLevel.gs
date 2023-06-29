function updateTideLevel() {
  const url = "https://www.data.jma.go.jp/gmd/kaiyou/data/db/tide/suisan/txt/2023/NG.txt"
  var allContent = UrlFetchApp.fetch(url).getContentText()
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("潮位");
  var row = allContent.split(/\r\n|\n/)
  var rowLength = row.length
  
  tideLevel_row = [];
  for (var i=0; i<rowLength-1; i++){
    tideLevel_row[i] = row[i].slice(0,72);
  }

  var tideLevel = [];
  //iが日、jが時間
  for (var i=0; i<rowLength-1; i++){
    var time = 0;
    var tideLevel_day = [];
    for (var j=0; j<24; j++){
      tideLevel_day[j] = tideLevel_row[i].slice(time, time+3);
      time += 3;
    }
    tideLevel[i] = tideLevel_day;
  }
  
  var resultTideLevel = tideLevel.slice(countDays());
  var lastColumn = resultTideLevel[0].length;
  var lastRow = resultTideLevel.length;

  sheet.getRange(2,2,lastRow,lastColumn).setValues(resultTideLevel);
  writeFutureDays();
}

function writeFutureDays() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("潮位");
  var today = new Date();
  var year = today.getFullYear(); // 今年の年を取得
  var date = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // 今日の日付を作成
  var row = 2; // A列の2行目
  var lastRow = sheet.getLastRow(); // 最終行を取得
  while (date.getFullYear() === year) { // 今年の全日程を書き込む
    var month = date.getMonth() + 1; // 月を取得（0から始まるので1を加算）
    var day = date.getDate(); // 日を取得
    sheet.getRange(row, 1).setValue(month + "月" + day + "日"); // A列に書き込む
    row++; // 次の行に進む
    date.setDate(date.getDate() + 1); // 次の日付に進む
  }
  // 記入した場所より下に書いてある内容を削除する
  if (lastRow > row-1) { // 削除する行がある場合
    var range = sheet.getRange(row, 1, lastRow - row + 1, sheet.getLastColumn()); // 削除する範囲を指定
    range.clearContent(); // 指定範囲の内容を削除
  }
}

function countDays() {
  var today = new Date();
  var startOfYear = new Date(today.getFullYear(), 0, 1);
  var yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  var days = Math.floor((yesterday - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
  return days;
}

function scrapeWeatherData() {
  var ss = SpreadsheetApp.openById('134zJDnrUY2e3dAtaon5LwuGkRz6etC8D696GeZc9_Rg');
  var sheet = ss.getSheetByName('今日の気候');
  var url = 'https://tenki.jp/forecast/5/26/5110/23110/1hour.html';
  var response = UrlFetchApp.fetch(url);
  var html = response.getContentText();
  var $ = Cheerio.load(html);

  var topic_block_today = Parser.data(html).from('id = forecast-point-1h-today').to('</table').build();

  //気温
  var topic_block = Parser.data(topic_block_today).from('class="temperature"').to('</tr>').build();
  var content_block = Parser.data(topic_block).from('<span class="past">').to('</span>').iterate();
  var content_block_future = Parser.data(topic_block).from('<span>').to('</span>').iterate();
  Array.prototype.push.apply(content_block, content_block_future);
  const temperature = [content_block] 
  var range = sheet.getRange('B2:Y2');
  range.setValues(temperature)

  //風速
  var topic_block = Parser.data(topic_block_today).from('class="wind-speed"').to('</tr>').build();
  // var windspeed_list  new Array();
  var content_block = Parser.data(topic_block).from('<span class="past">').to('</span>').iterate();
  var content_block_future = Parser.data(topic_block).from('<span>').to('</span>').iterate();
  Array.prototype.push.apply(content_block, content_block_future);
  const wind_speed = [content_block] 
  var range = sheet.getRange('B4:Y4');
  range.setValues(wind_speed)

  //風向
  var topic_block = Parser.data(topic_block_today).from('class="wind-blow"').to('</tr>').build();
  // var windspeed_list  new Array();
  var content_block = Parser.data(topic_block).from('<p class="past">').to('</p>').iterate();
  var content_block_future = Parser.data(topic_block).from('<p>').to('</p>').iterate();
  Array.prototype.push.apply(content_block, content_block_future);
  const wind_blow = [content_block] 
  var range = sheet.getRange('B5:Y5');
  range.setValues(wind_blow)

  //降水量
  var topic_block = Parser.data(topic_block_today).from('class="precipitation"').to('</tr>').build();
  // var windspeed_list  new Array();
  var content_block = Parser.data(topic_block).from('<span class="past">').to('</span>').iterate();
  var content_block_future = Parser.data(topic_block).from('<span>').to('</span>').iterate();
  Array.prototype.push.apply(content_block, content_block_future);
  const precipitation = [content_block] 
  var range = sheet.getRange('B6:Y6');
  range.setValues(precipitation)
  
  //日の出、日の入り
  var url2 = "https://www.hinode-hinoiri.com/231002.html"
  var response2 = UrlFetchApp.fetch(url2);
  var html2 = response2.getContentText();

  var hinode_topic_block = Parser.data(html2).from('class="table_line"').to('</div>').build();
  var hinode_hinoiri = Parser.data(hinode_topic_block).from('<strong>').to('</strong>').iterate();
  const hinode = [hinode_hinoiri[0]];
  const hinoiri = [hinode_hinoiri[1]]
  var range = sheet.getRange('B7');
  range.setValue(hinode);
  var range = sheet.getRange('B8');
  range.setValue(hinoiri);

}

