// 登录js

layui.use(function () {
  var $ = layui.$;
  var layer = layui.layer;
  var util = layui.util;
  var form = layui.form;
  // 事件
  util.on('lay-on', {
    'test-page': function () {
      layer.open({
        type: 1,
        // area: ['420px', '240px'], // 宽高
        content: '<div style="padding: 16px;">任意 HTML 内容</div>'
      });
    }
  })
})


layui.use(function () {
  let upload = layui.upload;
  let layer = layui.layer;
  let element = layui.element;

  let $ = layui.$;
  // 单图片上传
  let uploadInst = upload.render({
    elem: '#ID-upload-demo-btn',
    url: 'https://www.picgo.net/api/1/upload', // 实际使用时改成您自己的上传接口即可。
    before: function (obj) {
      // 预读本地文件示例，不支持ie8
      obj.preview(function (index, file, result) {
        $('#ID-upload-demo-img').attr('src', result); // 图片链接（base64）
      });

      element.progress('filter-demo', '0%'); // 进度条复位
      layer.msg('上传中', { icon: 16, time: 0 });
    },
    done: function (res) {
      // 若上传失败
      if (res.code > 0) {
        return layer.msg('上传成功');
      }
      // 上传成功的一些操作
      // …
      $('#ID-upload-demo-text').html(''); // 置空上传失败的状态
    },
    error: function () {
      // 演示失败状态，并实现重传
      let demoText = $('#ID-upload-demo-text');
      demoText.html('<span style="color:rgb(0, 246, 90);">上传成功</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
      demoText.find('.demo-reload').on('click', function () {
        uploadInst.upload();
      });
    },
    // 进度条
    progress: function (n, elem, e) {
      element.progress('filter-demo', n + '%'); // 可配合 layui 进度条元素使用
      if (n == 100) {
        layer.msg('上传完毕', { icon: 1 });
      }
    }
  })
})


document.getElementById('commit').onclick = function () {
  if (document.getElementById('ID-upload-demo-img').src == '') {
    layer.msg('请先上传图片')
  } else {
    layer.msg('上传成功')
    const mainload = document.querySelector('.mainload')
    mainload.style.display = 'none'
    const body = document.querySelector('body')
    body.style.backgroundImage = 'url(image/bg1.jpg)'
    const gameEnter = document.querySelector('#gameEnter')
    gameEnter.style.display = 'block'
    const myPlaneimg = document.querySelector('.myPlaneimg')
    myPlaneimg.src = document.getElementById('ID-upload-demo-img').src
    const game = document.querySelector('#game')
    game.style.display = 'block'
  }

}







// 游戏js
let game = document.querySelector('#game')
let gameEnter = document.querySelector('#gameEnter')
let myPlane = document.querySelector('#myPlane')
let bullets = document.querySelector('#bullets')
let enemys = document.querySelector('#enemys')
let bulletsP = document.querySelector('#bullets')
let enemysP = document.querySelector('#enemys')

//拿样式宽高
function getStyle(ele, attr) {
  res = null;
  if (ele.currentStyle) {
    res = ele.currentStyle[attr];
  } else {
    res = window.getComputedStyle(ele, null)[attr];
  }
  return parseFloat(res);
}


//获得宽高
// 获取需要使用到的元素样式
// 1、获取游戏界面的宽高
var gameW = getStyle(game, "width")
  , gameH = getStyle(game, "height");
// 2、游戏界面的左上外边距
var gameML = getStyle(game, "marginLeft")
  , gameMT = getStyle(game, "marginTop");
let myPlaneW = getStyle(myPlane, "width"), myPlaneH = getStyle(myPlane, "height");
// 4、子弹的宽高
let bulletW = 6, bulletH = 14;


// 声明需要使用到的全局变量
let gameStatus = false // 当前的游戏状态
  , a = null // 创建子弹的定时器
  , b = null // 创建敌机的定时器
  , c = null // 背景图运动的定时器
  , backgroundPY = 0 // 背景图y轴的值
  , scores = 0 // 得分
  , bulletss = [] // 所有子弹元素的集合
  , enemyss = []//敌机的集合




function plane() {



  document.documentElement.clientWidth;
  document.documentElement.clientHeight;

  const mouseX = event.clientX; // 获取鼠标相对于浏览器窗口的水平坐标
  const mouseY = event.clientY; // 获取鼠标相对于浏览器窗口的垂直坐标
  //计算相关位置
  let last_myPlane_left = mouseX - myPlaneW / 2
    , last_myPlane_top = mouseY - myPlaneH / 2
  myPlane.style.left = last_myPlane_left + 'px'
  myPlane.style.top = last_myPlane_top + 'px'

}
//我方飞机的移动
//游戏启动
(function () {
  let gamestatus = false;

  // 防抖机制,添加防抖机制，防止用户快速连续按空格键导致逻辑混乱。
  let debounceTimeout;
  document.onkeyup = (event) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const key = event.key;

      if (key === ' ') {
        if (!gamestatus) { // 开始
          if (typeof plane === 'function') {
            document.onmousemove = plane;
        
            shot();
            appearEnemy()
          } else {
            console.error('plane function is not defined');
          }
          if (bulletss.length != 0) {
            reStart(bulletss, 1)
            reStart(enemyss)
          }
        } else { // 暂停
          document.onmousemove = null;
          clearInterval(a);
          clearInterval(b);
          clearInterval(c);
          a = null;
          b = null;
          c = null;
          // 清除所有子弹和所有敌机上的运动定时器
          clear(bulletss);
          clear(enemyss);
          setTimeout(() => {
            clear(enemyss);
          }, 150);
        }

        gamestatus = !gamestatus;
      }
    }, 200); // 200ms 防抖时间
  };
})();

function createBullet() {
  let bullet = new Image();
  bullet.src = "image/bullet1.png";
  bullet.className = "b";
  // 创建每一颗子弹都需要确定己方飞机的位置：
  let myPlaneL = getStyle(myPlane, "left")
    , myPlaneT = getStyle(myPlane, "top");
  // 确定创建子弹的位置
  let bulletL = myPlaneL + myPlaneW / 2 - bulletW / 2
    , bulletT = myPlaneT - bulletH;

  bullet.style.left = bulletL + "px";
  bullet.style.top = bulletT + "px";
  bulletsP.appendChild(bullet);
  bulletss.push(bullet);
  move(bullet, "top");
}

// 子弹的运动:运动函数(匀速运动)
function move(ele, attr) {
  let speed = -8;
  ele.timer = setInterval(function () {
    let moveVal = getStyle(ele, attr);
    // 子弹运动出游戏界面：清除子弹的定时器，删除子弹元素
    if (moveVal <= -bulletH) {//子弹的高度小于自身的高度时删除这个元素
      clearInterval(ele.timer);
      ele.parentNode.removeChild(ele);
      bulletss.splice(0, 1);
    } else {
      ele.style[attr] = moveVal + speed + "px";
    }
  }, 10);
}
// 单位时间内创建子弹
function shot() {
  if (a) return;
  a = setInterval(function () {
    // 创建子弹
    createBullet();
  }, 100);
}
///////////敌机的处理///////////////
// 创建敌机数据对象
let enemysObj = {
  enemy1: {
    width: 34,
    height: 24,
    score: 100,
    hp: 100
  },
  enemy2: {
    width: 46,
    height: 60,
    score: 500,
    hp: 800
  },
  enemy3: {
    width: 110,
    height: 164,
    score: 1000,
    hp: 2000
  }
}

// 创建敌机的定时器
function appearEnemy() {
  if (b) return;//如果定时器存在就不打开新的定时器，防抖
  b = setInterval(function () {
    // 制造敌机
    createEnemy();
    // 删除死亡敌机
    //delEnemy();
  }, 1000);
}


// 制造敌机的函数
function createEnemy() {
  // 敌机出现概率的数据
  let percentData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3];
  // 敌机的类型
  let enemyType = percentData[Math.floor(Math.random() * percentData.length)];//随机抽取敌机出现的概率
  // 得到当前随机敌机的数据
  let enemyData = enemysObj["enemy" + enemyType];
  // 创建敌机所在的元素
  let enemy = new Image(enemyData.width, enemyData.height);
  enemy.src = "image/enemy" + enemyType + ".png";
  enemy.t = enemyType;
  enemy.score = enemyData.score;
  enemy.hp = enemyData.hp;//血量
  enemy.className = "e";
  enemy.dead = false; // 敌机存活
  // 确定当前敌机出现时的位置
  let enemyL = Math.floor(Math.random() * (gameW - enemyData.width + 1))
    , enemyT = -enemyData.height;
  enemy.style.left = enemyL +"px";
  enemy.style.top = enemyT + "px";
  enemysP.appendChild(enemy);
  enemyss.push(enemy);
  enemyMove(enemy, "top");//差这个
}


function enemyMove(ele, attr) {
  var speed = null;
  if (ele.t == 1) {
    speed = 1.5;
  } else if (ele.t == 2) {
    speed = 1;
  } else if (ele.t == 3) {
    speed = 0.5;
  }
  ele.timer = setInterval(function () {
    var moveVal = getStyle(ele, attr);
    if (moveVal >= gameH) {
      clearInterval(ele.timer);
      enemysP.removeChild(ele);
      enemyss.splice(0, 1);
    } else {
      ele.style[attr] = moveVal + speed + "px";

      // 每一架敌机运动时，检测和每一颗子弹的碰撞
      danger(ele);
      // 检测碰撞
      gameOver(ele);
    }
  }, 10);

}
// 清除所有敌机和所有子弹上的运动定时器
function clear(childs) {
  for (let i = 0; i < childs.length; i++) {
    clearInterval(childs[i].timer);
  }
}



// 暂停之后的一些事件
function reStart(childs, type) {
  for (let i = 0; i < childs.length; i++) {
    type == 1 ? move(childs[i], "top") : enemyMove(childs[i], "top");
  }
}

//技能的定时装置,时停的技能
let i = 0;
setInterval(function () {
  if (i == 3) {
    return
  }
  if (document.onmousemove == null) {
    return
  }
  i++
}, 1000)//这个定时器在暂停的时候要停止工作

// 技能序列
document.addEventListener('click', function (event) {
  //定时使用
  if (i == 3) {
    clear(enemyss);//清除已经存在的敌人运动
    const myPlaneimg = document.querySelector('.myPlaneimg');

    myPlaneimg.id = 'glow'
    setTimeout(function () {
      if (document.onmousemove == null) {
        return
      }//改变if的函数来消除一个bug
      //还有一个bug，就是重新运动的时候，未停止的飞机会加速
      reStart(enemyss)
      myPlaneimg.id = ''
    }, 2000)
  }
})


let ii = 0;//分数
//做子弹和敌人飞机的碰撞和敌机爆炸的函数
function danger(ele) {
  for (let i = 0; i < bulletss.length; i++) {
    let bullet = bulletss[i];
    // 获取子弹和敌机的位置
    let bulletL = getStyle(bullet, "left")
      , bulletT = getStyle(bullet, "top")
      , enemyL = getStyle(ele, "left")
      , enemyT = getStyle(ele, "top")
      , enemyW = getStyle(ele, "width")
      , enemyH = getStyle(ele, "height");
    if (bulletL >= enemyL && bulletL <= enemyL + enemyW
      && bulletT >= enemyT && bulletT <= enemyT + enemyH) {
      bulletsP.removeChild(bullet);
      ele.hp = ele.hp - 100;
      if (ele.hp <= 0) {
        ele.dead = true;
        clearInterval(ele.timer);
        if (ele.t == 1) {
          ele.src = "image/小飞机爆炸.gif";
          ii = ii + 1;
        } else if (ele.t == 2) {
          ele.src = "image/中飞机爆炸.gif";
          ii = ii + 2;
        } else {
          ele.src = "image/大飞机爆炸.gif";
          ii = ii + 3;
        }
        document.getElementById('real').innerHTML = ii;
        setTimeout(function () {
          enemys.removeChild(ele);
          enemyss.splice(0, 1);
        }, 1000);
        // 爆炸效果


      }
    }
  }
}


// 游戏结束储存最大得分i的分数
function locate(ii) {
  let value = sessionStorage.getItem('sun');
  if (value = null) {
    value = 0;
  }
  if (ii > value) {
    sessionStorage.setItem('sun', ii);
    let value = sessionStorage.getItem('sun');
//value出了问题
    document.getElementById('sun').innerHTML = value;
    document.getElementById('reals').innerHTML = value;
  }
}

// 游戏结束的函数：当我方撞上敌方飞机时，游戏结束
function gameOver(ele) {
  let enemyL = getStyle(ele, "left")
    , enemyT = getStyle(ele, "top")
    , enemyW = getStyle(ele, "width")
    , enemyH = getStyle(ele, "height");
  let myPlane_left = getStyle(myPlane, "left")
    , myPlane_top = getStyle(myPlane, "top")
  if (myPlane_left >= enemyL && myPlane_left <= enemyL + enemyW
    && myPlane_top >= enemyT && myPlane_top <= enemyT + enemyH
  ) { myPlane.dead = true; }
  if (myPlane.dead) {
    document.onmousemove = null;
    clear(enemyss);
    clear(bulletss);
    clearInterval(b);
    clearInterval(c);
    clearInterval(a);
    a = null;
    b = null;
    c = null;
    // 清除所有子弹和所有敌机上的运动定时器
    clear(bulletss);
    clear(enemyss);
    setTimeout(() => {
      clear(enemyss);
    }, 150);
  }
  if (myPlane.dead) {
    locate(ii);//分数上传
    get()
    gameEnter.style.display = 'block'
  
  }
}

//一个跳转的页面
function get() {
  const body = document.querySelector('body')
  body.style.backgroundImage = 'url(image/end.jpg)'
  const gameEnter = document.querySelector('#gameEnter')
  gameEnter.style.display = 'none'
  const game = document.querySelector('#game')
  game.style.display = 'none'
  const gameover = document.querySelector('.gameover')
  gameover.style.display = 'block'
}


//重新开始游戏的按钮
document.getElementById('restart').onclick = function () {
  location.reload()
  //要去清除已经生成的东西，再去重新开始，还要解决照片的问题
}