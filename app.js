'use strict';
const fs = require('fs'); // ファイルを扱うモジュール
const readline = require('readline'); // ファイルを1行ずつ読み込むためのモジュール

const rs = fs.createReadStream('./popu-pref.csv'); // CSVファイルから読み込みを行うStreamを作成
const rl = readline.createInterface({input: rs, output: {} }); // Streamをreadlineのinputとして設定

const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// lineイベントが発生したらこの無名関数を呼ぶ
rl.on('line', lineString => {
    // lineStringをカンマで区切り、配列columnsにしている
    const columns = lineString.split(',');

    const year = parseInt(columns[0]); // 集計年
    const prefecture = columns[1]; // 都道府県
    const popu = parseInt(columns[3]); // 15～19歳の人口

    // 2010年と2015年のデータを判定
    if(year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture); // 連想配列からデータを取得

        if(!value) {
            // value の値がFalsyの時、初期値となるオブジェクトを代入
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }

        if(year === 2010) {
            value.popu10 = popu;
        }

        if(year === 2015) {
            value.popu15 = popu;
        }

        // 人口のデータを連想配列に保存
        prefectureDataMap.set(prefecture, value);
    }

    //console.log(lineString);
});

// すべての行を読み込み終わったらこの無名関数を呼ぶ
rl.on('close', () => {
    // for-of構文でMapの要素分処理を繰り返す
    for(let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }

    // 連想配列を普通の配列に変換し、sort関数でchangeの降順に並び変える
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    // 必要なデータをきれいに整形して出力する
    // map関数で配列の各要素に関数を適用する
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
            key + 
            ': ' + 
            value.popu10 +
            '=>' +
            value.popu15 +
            ' 変化率: ' +
            value.change
        );
    });

    console.log(rankingStrings);
});