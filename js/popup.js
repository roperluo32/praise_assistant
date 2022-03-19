
let config = {
  "praise_switch": false,
  "interval": 5,
  "praise_num": 20,
  "keyword": "我的世界"
}

function set_config() {
  config["praise_switch"] = document.getElementById('praise_switch').checked
  config["interval"] = document.getElementById('interval').value
  config["praise_num"] = document.getElementById('praise_num').value
  config["keyword"] = document.getElementById('keyword').value
  console.log(`pop up init config:${JSON.stringify(config)}`)

  //发送配置变更通知
  chrome.runtime.sendMessage({"cmd": "POPUP_change_config", "config": config}, res=>{
    console.log(`send POPUP_change_config success.res:${res}`)
  })
}

document.getElementById('submit').onclick = set_config;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`popup receive message:${JSON.stringify(message)}, sender:${JSON.stringify(sender)}`)
  // message的数据格式取决于发送时的数据
  // const { start } = message;
  const {cmd} = message
  switch(cmd)
  {
    
  }
});