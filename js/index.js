let $btn = $('.music_icon');
let $contentBox = $('.content_box');
let $footerBox = $('.footer_box');
let $lyric_box = $('.lyric_box');
let $audio = $('#audio');
let $currentBox = $('.currentT');
let $bar = $('.progressInner');
let $endBox = $('.endT');
let isRunning = false;

// 点击音乐按钮开始旋转 再次点击停止
$btn.on('touchend', function () {

    if (isRunning) {
        // 点击时如果按钮在旋转；则转让他停止
        $(this).css({animationPlayState: 'paused'});
        isRunning = false;
        $audio[0].pause();
        clearInterval(timer)
    } else {
        // 点击时如果按钮没有旋转；则让他旋转
        $(this).css({animationPlayState: 'running'});
        isRunning = true;
        $audio[0].play();
        setTime();
    }
});
$audio[0].addEventListener('canplay', function () {
    let str = dealTime(this.duration);
    $endBox.html(str)
});

// 初始化歌词部分的高度
function initHeight() {
    // 用底部盒子到body的距离 - 歌词盒子到body的距离 就是歌词盒子的高度
    let H = $footerBox.offset().top - $contentBox.offset().top;
    $contentBox.css({height: H})
}

initHeight();

// 获取歌词
function getLyric() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'data.json',
            type: 'GET',
            success: function (data) {
                // 成功获取数据
                resolve(data)
            },
            error: function (err) {
                // err 是失败的信息
                reject(err)
            }
        })
    });
}

getLyric().then(function (data) {
    let ary = changeLyric(data);
});

function changeLyric(data) {
    // console.log(data);
    let str = data.lyric;
    // console.log(str);
    let reg = /\[(\d{2}):(\d{2})\.\d+\]([^\[]*)/g;
    str.replace(reg, function () {
        // 只要字符串中 有符合正则的 就会执行replace的回调函数

        // console.log(arguments);

        // 目的是把获取到的时间和歌词展示到页面上
        let sty = '';
        sty += `<p m="${arguments[1]}" p="${arguments[2]}">${arguments[3]}</p>`;
        // console.log(sty);
        $($lyric_box).append(sty);
    });
}


// getLyric().then((data) => {
//     console.log(data);
//     return 123
// },(data) => {
//     console.log(data);
// }).then((data => {
//     // 第二个then中函数的参数 是由第一个then的回调函数的return值决定的
//     // 第二个then中的两个回调函数 是针对第一个then中函数执行的结果来说的
//     console.log(data);
// }),data => {
//     console.log(123456);
// });

// getLyric().then((data) => {
//
// });


// 处理音乐的播放进度条
// 用currentTime (当前时间) 和 duration （总时间） 做处理
// 把时间处理成 00:00的格式
// 进度条的宽度是由 currentTime/duration 来决定的；

function dealTime(num) {
    let m = parseInt(num / 60); // 分钟数
    let s = parseInt(num - m * 60); // 秒数
    m = m < 10 ? '0' + m : m; // 如果m小于10 就会补个0
    s = s < 10 ? '0' + s : s;

    return m + ':' + s;
}

// dealTime(9);

// 设置播放时间和进度条

let timer = null;

function setTime() {
    timer = setInterval(() => {
        // 当前的播放时间
        let ct = $audio[0].currentTime;
        let dt = $audio[0].duration;
        $currentBox.html(dealTime(ct));
        $bar.css({
            width: ct / dt * 100 + '%'
        });
        matchLyric(); // 匹配歌词
        if ($audio[0].ended) {
            // 若为ture 说明结束
            clearInterval(timer); // 清除定时器
            isRunning = false;
            $btn.css({animationPlayState: 'paused'}) // 让按钮停止旋转
        }
    }, 500)
}

// 匹配歌词
function matchLyric() {
    // 需要当前播放时间来匹配的歌词
    let ct = $audio[0].currentTime;
    let ary = dealTime(ct).split(':');
    // console.log(ary);
    let $p = $lyric_box.find('p'); // 获取到了所有的歌词
    // console.log($p);
    // $p.filter('.select') // 从所有p中筛选出带有select类名的p
    let curEle = $p.filter(`[m="${ary[0]}"]`).filter(`[p="${ary[1]}"]`);
    // console.log(curEle);

    // 从所有的p中筛选出m是ary[0]并且s是ary[1]的p标签
    // 把当前的p加上active类名 兄弟移除类名；在这之前curEle有可能是空
    // 若是空 则不用进行类名操作
    if (!curEle.length) return;

    if (curEle.hasClass('active')) return; // 若两个定时器内唱的是同一句歌词；不在执行下边的函数

    moveLyric();
    // $('.active'); // 需要上移的那一行
    curEle.addClass('active').siblings().removeClass('active');
}


// 移动歌词的思路；
// 改变 歌词盒子的top 或 translateY;  每次改变的值是当前歌词的高度
let translateY = 0;
let index = 0; // 控制唱到第几句上移的
function moveLyric() {
    index ++;
    if (index < 3) return;
    let t = $('.active').offset().height; // 要移动的那一行的高度
    translateY +=t; // 每次上移都需要在原来的基础上接着上移
    $lyric_box.css({transform: `translateY(${-translateY}px)`})
}


