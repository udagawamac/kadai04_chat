//firebaseApiKey.jsからexportされているオブジェクトを
//main.jsでfirebaseConfigという変数名で取り扱う旨の記述。
import firebaseConfig from "./firebaseApiKey.js"

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onChildAdded, onChildChanged, onChildRemoved }
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

console.log(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig); //本人確認
const db = getDatabase(app); //RealtimeDBに接続
const dbRef = ref(db, "chat"); //RealtimeDB内の"chat"を使う。/で階層を作れる

    // ★テキストボックスでエンターキーを押しても送信可能にする
    $("#text").keypress(function(e){
      if(e.keyCode == 13){
        $("#send").click();
      }});
    // 送信ボタンを押したらFirebaseにデータ送信
    $("#send").on("click", function () {             
        const msg = {
            uname: $("#uname").val(),
            text: $("#text").val(),
            month:(new Date()).getMonth()+1,
            date:(new Date()).getDate(),
            hour:("0"+(new Date()).getHours()).slice(-2),
            minute:("0"+(new Date()).getMinutes()).slice(-2),
        }                
        const newPostRef = push(dbRef);//ユニークキーを生成※重要※
        console.log(newPostRef);
        set(newPostRef, msg);
        //★送信したらテキストボックスだけクリアする
        $("#text").val("");
    });
    
    //リアルタイムデータベースを監視して、入ってきたデータを取得。
    onChildAdded(dbRef,function(data){
        const msg = data.val();
        console.log(msg.uname)
        const key = data.key; //ユニークキー（削除・更新に必須！）
        let h = '<p id="'+key+'">';
            h += msg.uname;
            h += '<br>';
            h += '<span contentEditable="true" id="'+key+'_update">'+msg.text+'</span>';
            h += '<br>';
            h += msg.month+"月"+msg.date+"日"+msg.hour+":"+msg.minute;
            h += '<span class="remove" data-key="'+key+'">🚮</span>'
            h += '<span class="update" data-key="'+key+'">🆙</span>'
            h += '</p>'
        //★自分以外のメッセージは左寄せ、かつ編集不可とする
        if(msg.uname==="自分"){
            let h = '<p id="'+key+'" class="migiyose">';
            h += msg.uname;
            h += '<br>';
            h += '<span contentEditable="true" id="'+key+'_update">'+msg.text+'</span>';
            h += '<br>';
            h += msg.month+"月"+msg.date+"日"+msg.hour+":"+msg.minute;
            h += '<span class="remove" data-key="'+key+'">🚮</span>'
            h += '<span class="update" data-key="'+key+'">🆙</span>'
            h += '</p>'                
        $("#output").prepend(h);
        }else if(msg.uname==="友達"){
            let h = '<p id="'+key+'" class="hidariyose">';
            h += msg.uname;
            h += '<br>';
            h += '<span contentEditable="false" id="'+key+'_update">'+msg.text+'</span>';
            h += '<br>';
            h += msg.month+"月"+msg.date+"日"+msg.hour+":"+msg.minute;
            h += '<span class="remove" data-key="'+key+'">🚮</span>'
            h += '<span class="update" data-key="'+key+'">🆙</span>'
            h += '</p>'
        $("#output").prepend(h)
    }else if(msg.uname==="家族"){
            let h = '<p id="'+key+'" class="hidariyose">';
            h += msg.uname;
            h += '<br>';
            h += '<span contentEditable="false" id="'+key+'_update">'+msg.text+'</span>';
            h += '<br>';
            h += msg.month+"月"+msg.date+"日"+msg.hour+":"+msg.minute;
            h += '<span class="remove" data-key="'+key+'">🚮</span>'
            h += '<span class="update" data-key="'+key+'">🆙</span>'
            h += '</p>'
        $("#output").prepend(h)
        };
    });

    //削除イベント
    $("#output").on("click", ".remove", function(){
        const key = $(this).attr("data-key");
        const remove_item = ref(db, "chat/"+key);
        remove(remove_item); //Firebaseデータ削除関数
    });

    //更新イベント
    $("#output").on("click", ".update", function(){
        const key = $(this).attr("data-key");
        update(ref(db, "chat/"+key),{
            text: $("#"+key+'_update').html()
        });
    });

    //削除処理がFirebase側で実行されたらイベント発生
    onChildRemoved(dbRef, (data) => {
        $("#"+data.key).remove(); //DOM操作関数（対象を削除）
    });

    //更新処理がFirebase側で実行されたらイベント発生
    onChildChanged(dbRef, (data) => {
        $("#"+data.key+'_update').html(data.val().text);
    //★更新されたら「編集済」と表示    
        $("#"+data.key+'_update').append("<br>"+"編集済");
        $("#"+data.key+'_update').fadeOut(800).fadeIn(800);
    });

//サイズ変更（font-size：数値の変更）
$("#range").on("change",function(){
const range = $("#range").val();
$("body").css("font-size",range+"px");
});
//色変更（カラー選択）
$("#color").on("change",function(){
const color = $("#color").val();
$("#output").css("color",color);
});
