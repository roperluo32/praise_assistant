//配置
praise_switch = false

function parse_config(config)
{
    praise_switch = config["praise_switch"]
    console.log(`after parse config,praise_switch:${praise_switch}`)
}

function show_config()
{
    console.log(`show config,praise_switch:${praise_switch}`)
}


function is_video_url()
{
    url = window.location.href
    if (url.indexOf("bilibili.com/video/") < 0)
    {
        return false;
    }

    return true;
}

function is_search_url()
{
    if (window.location.href.indexOf("search.bilibili.com/all?keyword") < 0) 
        return false;
    return true;
}
  
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function get_comment() {
    comments = [
        "哈哈，内容很不错，点个赞~~~~~",
        "阅",
        "你的视频我看啦，非常不错！已经点赞关注啦，我经常更新视频，有兴趣也可以关注下我[打call][打call]，多谢啦",
        "我以为…",
        "想要网址下载",
        "下载地址嘞  我特地来评论区找下载地址的[无语]",
        "内容不错！已点赞，关注，收藏。也欢迎关注我 ^_^",
        "Mine craft[妙啊]",
        "下次一定点个赞，算了，这次给个三连把，加油哈哈~~~~~~~[滑稽][滑稽][滑稽][滑稽]",
        "很好啊！[doge]，三连拿去",
        "我去，我出息了，1分钟【已三连】，欢迎关注我",
        "Minecraft我喜欢^_^, ",
        "up主制作不易，已san lian。",
        "准备加载三连:10％，20％，30％，40％。。已断开连接。。哈哈开玩笑，三连收好，也可以关注下我[脱单doge][脱单doge]",
        "奥利给，内容我很喜欢333333,",
        "给我点赞，我认作阿婆主爸爸[打call]",
        "三联了,求关",
        "333333333333",
        "有基岩版吗[doge]",
        "已三连，有个基岩版服务器哎，有没有意向一起玩？顺带着宣传一下。",
        "3333,看完之后才发现我看完了[藏狐]",
        "纯路人，点个赞~可以的话关注下我",
        "好像有人叫我[滑稽][滑稽]",
        "YYDS，请查收你的新粉丝，顺便能关注下我么[脱单doge][脱单doge][脱单doge][脱单doge]",
        "妙极了[doge]",
        "好耶, 赞了",
        "没币了，先点个赞吧~能关注下我就更好啦",
        "一起玩么",
        "一起来玩MC么，加个关注",
        "一起来玩MC么，加个关注，我经常更新视频，有兴趣也可以关注下我[打call][打call]，多谢啦",
        "评论",
        "已。日常三连。求关求赞",
        "QwQ    赞了"
    ]

    var index = Math.floor((Math.random()*comments.length));
    return comments[index]
}



const praise_func = async ()=>{
    if (false == praise_switch)
    {
        console.log(`switch is false.praise_switch:${praise_switch}`)
        window.close()
        return
    }

    //是视频页面，开始点赞
    if (is_video_url())
    {
        console.log('start to sleep 3s')
        await sleep(3000)
        console.log('sleep over')

        console.log("本页面是视频页面，开始点赞")

        //点赞
        if ($(".video-toolbar-v1 .like").eq(0).hasClass('on') == false)   //还没被点过赞
        {
            $(".video-toolbar-v1 .like")[0].click()
        }

        //点击收藏
        $(".video-toolbar-v1 .collect")[0].click()
        console.log('start to sleep 2s')
        await sleep(2000)
        console.log('sleep over')
        $(".collection-m-exp input[type=checkbox]")[0].click()
        console.log('start to sleep 2s')
        await sleep(2000)
        console.log('sleep over')
        $(".btn.submit-move")[0].click()
        
        //关注
        console.log('start to sleep 1s')
        await sleep(1000)
        console.log('sleep over.start to guanzhu')
        if ($('.follow-btn').eq(0).hasClass('not-follow'))
        {
            $('.up-info_right .follow-btn span')[0].click()
        }

        window.scrollTo(0, 500)
        console.log('start to sleep 2s')
        await sleep(3000)
        console.log('sleep over.start to comment')
        //评论
        $(".textarea-container .ipt-txt")[0].value = get_comment()
        console.log('start to sleep 1s')
        await sleep(1000)
        console.log('sleep over.start to comment')
        $(".comment-submit")[0].click()

        await sleep(Math.floor(Math.random() * 5000))
        window.close();
    }

    //获取视频列表
    //https://search.bilibili.com/all?keyword=我的世界&from_source=websuggest_search&order=pubdate&duration=0&tids_1=0
    if (is_search_url())
    {
        console.log("本页面是搜索页面，开始爬取视频列表...")
        console.log('start to sleep 5s')
        await sleep(5000)

        video_list = $(".video-item .img-anchor")
        // video_list[0].click()
        video_urls = video_list.map(i => video_list[i].href);

        register_url_message = {
            cmd: "CONTENT_register_bilibili_video_urls",
            urls: video_urls,
        }
        console.log(`register_url_message: ${JSON.stringify(register_url_message)}`)
        chrome.runtime.sendMessage(register_url_message, res=>{
            console.log(`content recevive response: ${res}`)
        })

        console.log('start to sleep 2s')
        await sleep(2000)
        window.close();
    }
}

//页面加载时，先拉取配置后，再执行praise_func
$(async ()=>{
    await sleep(2000)
    //拉取配置
    chrome.runtime.sendMessage({"cmd": "GET_config"}, res=>{
        console.log(`get popup config:${JSON.stringify(res)}`)
        parse_config(res)
        praise_func()
    })

    //60s后必定关闭，防止开太多窗口
    setTimeout(()=>{window.close()}, 60000)
})


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`content receive message:${JSON.stringify(message)}, sender:${JSON.stringify(sender)}`)

    // message的数据格式取决于发送时的数据
    const { cmd } = message;
  
    switch(cmd)
    {
        case 'POPUP_change_config':
            const {config} = message
            console.log(`receive config change notify.config:${JSON.stringify(config)}`)
            parse_config(config)
    }
    
});
