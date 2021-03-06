
//待点赞的视频页面
bilibili_video_urls = []        
//配置
praise_switch = false
praise_num = 20  //每次点赞的数量
keyword = "我的世界"  //搜索页的关键词
const praise_hours = [7, 12, 20]

//上次批量点赞的时间
last_praise_hour = 12

//拉取配置
// chrome.runtime.sendMessage({"cmd": "GET_config"}, res=>{
//     console.log(`read config:${JSON.stringify(res)}`)
//     g_config = res
// })

function parse_config(config)
{
    praise_switch = config["praise_switch"]
    praise_num = config["praise_num"]  //每次点赞的数量
    keyword = config["keyword"]  //搜索页的关键词
    console.log(`after parse config,praise_switch:${praise_switch},  praise_num:${praise_num}, keyword:${keyword}`)
}

function show_config()
{
    console.log(`config,{praise_switch:${praise_switch},  praise_num:${praise_num}, keyword:${keyword}}`)
    console.log(`last_praise_hour: ${last_praise_hour}`)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // message的数据格式取决于发送时的数据
    // const { start } = message;
    const {cmd} = message;
    console.log(`service worker receive message. cmd:${cmd}`)

    switch(cmd)
    {
        //注册要点赞的视频页面
        case 'CONTENT_register_bilibili_video_urls':
            const {urls} = message
            console.log(`receive REGISTER_BILIBILI_VIDEO_URLS.len:${urls.length} `)
            for (i = 0; i < urls.length; i++)
                bilibili_video_urls.push(urls[i])
            sendResponse("register urls success")
            break;
        //配置变更通知
        case 'POPUP_change_config':
            const {config} = message
            console.log(`receive config change notify.config:${JSON.stringify(config)}`)
            parse_config(config)
            sendResponse("background get config success")
            break;
        case "GET_config":
            sendResponse({"praise_switch": praise_switch, "keyword": keyword})
            break;
    }
});

function get_now_timestamp()
{
    return Math.floor(new Date().getTime() / 1000)
}

function get_video_list_by_search()
{
    let search_url = `https://search.bilibili.com/all?keyword=${keyword}&from_source=websuggest_search&order=pubdate&duration=0&tids_1=0`
    chrome.tabs.create({
        url: search_url
    });
}


function praise_one_video()
{
    let video_url = bilibili_video_urls.shift()
    console.log(`start praise_one_video.bilibili_video_urls length:${bilibili_video_urls.length}, url:${video_url}`)

    //定时给content发送消息，跳转到一个video页面点赞
    chrome.tabs.create({
        url: video_url
    });
}

function is_need_praise()
{
    //检查是否需要开始拉取一批视频列表
    let now_hour = (new Date()).getHours()

    if (now_hour == last_praise_hour)
    {
        console.log(`now_hour is equal to last_praise_hour.last_praise_Hour:${last_praise_hour}`)
        return false;
    }
    for (i in praise_hours)
    {
        if (praise_hours[i] == now_hour)
        {
            console.log(`is_need_praise is true.now_hour:${now_hour}, last_praise_hour:${last_praise_hour}, i:${i}`)
            last_praise_hour = now_hour
            return true;
        }
    }
    return false;
}


//定时器，每隔0.4*60 = 24秒执行一次
chrome.alarms.create("background-periodic-alarm", {delayInMinutes: 0.1, periodInMinutes: 0.4});

chrome.alarms.onAlarm.addListener((alarm)=>{

    console.log(`backgourd onAlarm.praise_switch:${praise_switch}, keyword:${keyword}, last_praise_hour:${last_praise_hour}`)
    //检查开关
    if (false == praise_switch){
        console.log(`switch is off...`)
        show_config()
        return;
    }

    //处理待爬取的视频列表
    if (bilibili_video_urls.length > 0)
    {
        praise_one_video()
    }
    else
    {
        console.log(`onAlarm.bilibili_video_urls is empty...`)
    }

    //检查是否需要开始点赞
    if (is_need_praise())
    {
        console.log("start to get_video_list")
        get_video_list_by_search()
        return;
    }
    // chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
	// 	chrome.tabs.sendMessage(tabs[0].id, msg);
	// });
})

