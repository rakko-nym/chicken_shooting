const canvas = document.getElementById('shooting');
const ctx = canvas.getContext('2d'); 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chickenImg = new Image();
chickenImg.src = 'chicken.png';
ctx.imageSmoothingEnabled = false;
let playerX = canvas.width / 2 ;
let playerY = canvas.height / 2 ;
let frameCounter = 0;
const playerSize = 50 ;
const playerSpeed = 5 ;
let mouseX = null ;
let mouseY = null ;
let keys = {};
let pShots = [];
let Enemies = [];
const pShotSize = 10 ;
const pShotSpeed = 5 ;
const EnemySize = 35 ;
let EnemySpawnQueue = 2000 ;
const EnemyType = ['penguin','parrot','toucan'];
let lastSpawnTime = 0 ;
//ロード
function road (){
if (!chickenImg.complete || chickenImg.naturalWidth === 0) {
            return; 
        }}
road();
let Muki = 0;
addEventListener('keyup',(event)=>{keys[event.key] = false ;})
addEventListener('keydown',(event)=>{keys[event.key] = true ;})
addEventListener('mousemove',(event)=>{
     mouseX = event.clientX;
     mouseY = event.clientY;})
addEventListener('mouseup',(event)=>{keys['click'] = false})
addEventListener('mousedown',(event)=>{keys['click'] = true})
function gameLoop (time){
ctx.clearRect(0,0,canvas.width,canvas.height);
player();
pShotMove();
EnemySpawn(time);
EnemyMove();
collision();
frameCounter++

window.requestAnimationFrame(gameLoop);
// デバッグ
ctx.fillStyle = "white";
ctx.font = "20px Arial";
ctx.fillText("敵の数: " + Enemies.length, 20, 30);
};
gameLoop();

function mukeru (x1,x2,y1,y2){return(Math.atan2(y2-y1,x2-x1));}
function drawImg(index,X,Y,size){
ctx.drawImage(chickenImg,index * 64,0,64,64,X,Y,size,size);
}

function player () {
ctx.save();
ctx.translate(playerX + playerSize / 2, playerY + playerSize / 2);
if(mouseX - playerX > 0){
    ctx.scale(1,1);}
    else{
    ctx.scale(-1,1);
    }

//muki
if(keys.w){playerY -= playerSpeed;};
if(keys.s){playerY += playerSpeed;};
if(keys.d){playerX += playerSpeed;};
if(keys.a){playerX -= playerSpeed;};
if(keys.click){
    pShots.push(new playerShot(playerX+playerSize/2,playerY+playerSize/2));
    keys.click = false ;
    drawImg(10 , -playerSize / 2, -playerSize / 2, playerSize);}else{
    drawImg((Math.floor(frameCounter / 10) % 3) + 7, -playerSize / 2, -playerSize / 2, playerSize);
    }
    ctx.restore();
}
class playerShot {
    constructor(pShotX,pShotY){
        this.pShotX = pShotX ;
        this.pShotY = pShotY ;
         this.ShotDx = mouseX - this.pShotX;
         this.ShotDy = mouseY - this.pShotY; 
         this.ShotAngle = Math.atan2(this.ShotDy,this.ShotDx);
         this.vx = Math.cos(this.ShotAngle) * pShotSpeed;
         this.vy = Math.sin(this.ShotAngle) * pShotSpeed;
         this.active = true ;
    }
    move (){
     this.pShotX += this.vx ;
     this.pShotY += this.vy ;
     if(this.pShotY < 0 || 
        this.pShotY > canvas.height || 
        this.pShotX < 0 || 
        this.pShotX > canvas.width){
        this.active = false
     }
    }
    draw(){
        ctx.save();
        ctx.translate(this.pShotX + pShotSize / 2, this.pShotY + pShotSize / 2);
        ctx.rotate(this.ShotAngle)
        drawImg(4, -pShotSize / 2, -pShotSize / 2, pShotSize);
        ctx.restore();
    }
}
function pShotMove(){
    for(let i = 0 ; i < pShots.length ; i++){
        pShots[i].move() ;
        pShots[i].draw() ;
    }
    pShots = pShots.filter(pShot => pShot.active);
}
function collision(){
    for (let i = pShots.length -1; i>=0; i--){
        let p = pShots[i];
        for (let j = Enemies.length -1; j>=0; j--){
        let e = Enemies[j];
        if(
        p.pShotX + pShotSize > e.EnemyX &&
        p.pShotX < e.EnemyX + EnemySize &&
        p.pShotY + pShotSize > e.EnemyY &&
        p.pShotY < e.EnemyY + EnemySize
        )
        {
        e.active = false ;
        p.active = false ;
        }
    }

    }
}
class Enemy {
    constructor(EnemyX,EnemyY,EnemySpeed,EnemyHP,type){
        this.type = type ;
        this.EnemyX = EnemyX ;
        this.EnemyY = EnemyY ;
        this.EnemySpeed = EnemySpeed ;
        this.EnemyHP = EnemyHP ;
        this.EnemyDx = 0 ;
        this.EnemyDy = 0 ;
        this.EnemyAngle = 0 ;
        this.active = true ;

    }
    move (){
         this.EnemyDx = playerX - this.EnemyX ;
         this.EnemyDy = playerY - this.EnemyY ;
         this.EnemyAngle = Math.atan2(this.EnemyDy,this.EnemyDx) ;
         this.EnemyVx = Math.cos(this.EnemyAngle) * this.EnemySpeed ;
         this.EnemyVy = Math.sin(this.EnemyAngle) * this.EnemySpeed ;
         this.EnemyX += this.EnemyVx ;
         this.EnemyY += this.EnemyVy ;
    }
    draw (){
        ctx.save();
        ctx.translate(this.EnemyX + EnemySize / 2, this.EnemyY + EnemySize / 2);
        if(playerX - this.EnemyX > 0){
        ctx.scale(1,1);}else{
        ctx.scale(-1,1);
         }
         switch(this.type){
            case 'penguin' :
                drawImg((Math.floor(frameCounter / 10) % 3) + 13, -EnemySize / 2, -EnemySize / 2, EnemySize); 
                break;
            case 'parrot' : 
                drawImg((Math.floor(frameCounter / 10) % 2) + 11, -EnemySize / 2, -EnemySize / 2, EnemySize); 
                break;
            case 'toucan' :
                drawImg((Math.floor(frameCounter / 10) % 2) + 19, -EnemySize / 2, -EnemySize / 2, EnemySize); 
                break;
         }

         ctx.restore();
             }
}
function EnemyMove(){
    for(let i = 0 ; i < Enemies.length ; i++){
        Enemies[i].move() ;
        Enemies[i].draw() ;
    }
    Enemies = Enemies.filter(Enemy => Enemy.active);
    }
function EnemySpawn(currentTime){
    if(currentTime - lastSpawnTime > EnemySpawnQueue){
        Enemies.push(new Enemy(0,0,2,20,EnemyType[Math.floor(Math.random()*3)])) ;
        lastSpawnTime = currentTime ;
    }

}
//githubここまで