const canvas = document.getElementById('shooting');
const ctx = canvas.getContext('2d'); 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chickenImg = new Image();
chickenImg.src = 'chicken.png';
ctx.imageSmoothingEnabled = false;
function playSE(fileName) {
    const audio = new Audio(`./音/${fileName.toLowerCase()}.mp3`);    
    audio.play().catch(e => console.error("再生エラー:", e));
}
const player = {
    playerX : canvas.width / 2 , 
    playerY : canvas.height /2 , 
    playerSize : 30 , 
    playerSpeed : 5 , 
    playerHP : 100 , 
    playerInvincible : false ,
    lastInvincivleTime : 0 ,
    invincivleTime : 1000 , 
    maxAmmo : 15 , 
    ammo : 15 ,
    isReload : false ,
    lastReloadTime : 0 ,
    reloadTime : 2000 ,
    score : 0
};
let gameover = false ;
let playerHit = 0 ;
let frameCounter = 0;
let mouseX = null ;
let mouseY = null ;
let keys = {};
let pShots = [];
let Enemies = [];
const pShotSize = 10 ;
const pShotSpeed = 5 ;
const EnemySize = 35 ;
let bossAngle = 0 ;
let EnemySpawnQueue = 2000 ;
const EnemyType = ['penguin','parrot','toucan'];
let lastSpawnTime = 0 ;
let Muki = 0;


addEventListener('keyup',(event)=>{keys[event.key] = false ;})
addEventListener('keydown',(event)=>{keys[event.key] = true ;})
addEventListener('mousemove',(event)=>{
     mouseX = event.clientX;
     mouseY = event.clientY;})
addEventListener('mouseup',(event)=>{keys['click'] = false})
addEventListener('mousedown',(event)=>{keys['click'] = true})

function gameLoop (time){
    if(player.playerHP <= 0){
    gameover = true ;
    playSE('chicken1');
    playSE('chicken2');
}
if(gameover === true){
ctx.fillStyle = 'red' ;
ctx.font = "100px Arial";
ctx.textAlign = "center"; 
ctx.textBaseline = "middle";
ctx.fillText("GAME OVER" , canvas.width /2 , canvas.height /2);
}
if(gameover === false){
ctx.clearRect(0,0,canvas.width,canvas.height);
playerMove(time);
pShotMove();
EnemySpawn(time);
EnemyMove(time);
playerEnemyHit(time);
pShotEnemyHit();

frameCounter++

window.requestAnimationFrame(gameLoop);
// デバッグ
ctx.fillStyle = "white";
ctx.font = "20px Arial";
ctx.fillText("HP : " + Math.floor(player.playerHP), 20, 30);
ctx.fillText("score : " + player.score , 20 , 50);
ctx.fillText("reload : " + player.isReload,20,70) ;
}};

gameLoop(0);

function mukeru (x1,x2,y1,y2){return(Math.atan2(y2-y1,x2-x1));}
function drawImg(index,X,Y,size){
ctx.drawImage(chickenImg,index * 64,0,64,64,X,Y,size,size);
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function playerMove (currentTime) {
ctx.save();
ctx.translate(player.playerX + player.playerSize / 2, player.playerY + player.playerSize / 2);
if(mouseX - player.playerX > 0){
    ctx.scale(1,1);}
    else{
    ctx.scale(-1,1);
    }
        if(player.ammo <= 0 && !player.isReload){
            player.lastReloadTime = currentTime;
            player.isReload = true;
         }
        if(player.isReload && currentTime - player.lastReloadTime > player.reloadTime){
            player.isReload = false ;
            player.ammo = player.maxAmmo ;
         }

        if(currentTime - player.lastInvincivleTime > player.invincivleTime){
            player.playerInvincible = false ;
            } 
//muki
if(keys.w){player.playerY -= player.playerSpeed;};
if(keys.s){player.playerY += player.playerSpeed;};
if(keys.d){player.playerX += player.playerSpeed;};
if(keys.a){player.playerX -= player.playerSpeed;};
if(keys.click && !player.isReload){
    playSE('egg');
    pShots.push(new playerShot(player.playerX+player.playerSize/2, player.playerY+player.playerSize/2));
    keys.click = false ;

    drawImg(10 , -player.playerSize / 2, -player.playerSize / 2, player.playerSize);}else{
    drawImg((Math.floor(frameCounter / 10) % 3) + 7, -player.playerSize / 2, -player.playerSize / 2, player.playerSize);
    }
    ctx.restore();
}
class playerShot {
    constructor(pShotX,pShotY){
        this.pShotX = pShotX ;
        this.pShotY = pShotY ;
        this.pShotSize = pShotSize
         this.ShotDx = mouseX - this.pShotX;
         this.ShotDy = mouseY - this.pShotY; 
         this.ShotAngle = Math.atan2(this.ShotDy,this.ShotDx);
         this.vx = Math.cos(this.ShotAngle) * pShotSpeed;
         this.vy = Math.sin(this.ShotAngle) * pShotSpeed;
         this.active = true ;
         player.ammo -= 1 ;

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
        ctx.translate(this.pShotX + this.pShotSize / 2, this.pShotY + this.pShotSize / 2);
        ctx.rotate(this.ShotAngle)
        drawImg(4, -this.pShotSize / 2, -this.pShotSize / 2, this.pShotSize);
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

class Enemy {
    constructor(EnemyX,EnemyY,EnemyHP,type,EnemySize,Angle){
        this.type = type ;
        this.EnemyX = EnemyX ;
        this.EnemyY = EnemyY ;
        this.EnemyHP = EnemyHP ;
        this.Angle = Angle ;
        this.EnemyPower = Math.floor(Math.random()*3) + 3 ;
        this.EnemyDx = 0 ;
        this.EnemyDy = 0 ;
        this.EnemyAngle = 0 ;
        this.active = true ;
        this.EnemySpeed = 0 ;
        this.EnemySize = EnemySize
    switch(this.type){
        case 'penguin' :
             this.EnemyPower = 3 ;
             this.EnemySpeed = 4 ;
            break;
        case 'parrot' : 
            this.EnemyPower = 5 ;
            this.EnemySpeed = 2.5 ;
            break;
        case 'toucan' :
            this.EnemyPower = 8 ;
            this.EnemySpeed = 1.5 ;
            break;
        case 'boss'   :
            this.EnemySpeed = 0.5 ;
            this.EnemyHP = 30 ;
            this.EnemySize = 300 ;
            this.Angle = 0 ;
            this.foo = 1 ;
            this.lastShotTime = 0 ;
            break;
        case 'shot'   :
             this.Angle = Angle ;
             this.EnemySpeed = 3 ;
             this.EnemyVx = Math.cos(this.Angle) * this.EnemySpeed ;
             this.EnemyVy = Math.sin(this.Angle) * this.EnemySpeed ;
            break;
             }

    }
    move (currentTime){
        if(this.type !== 'shot'){
         this.EnemyDx = (player.playerX + player.playerSize /2) - (this.EnemyX + this.EnemySize /2) ;
         this.EnemyDy = (player.playerY + player.playerSize /2) - (this.EnemyY + this.EnemySize /2) ; 
         this.EnemyAngle = Math.atan2(this.EnemyDy,this.EnemyDx) ;
         this.EnemyVx = Math.cos(this.EnemyAngle) * this.EnemySpeed ;
         this.EnemyVy = Math.sin(this.EnemyAngle) * this.EnemySpeed ;
        }
         this.EnemyX += this.EnemyVx ;
         this.EnemyY += this.EnemyVy ;
         const margin = this.EnemySize * 2 ;
        if(this.EnemyY < -margin || 
        this.EnemyY > canvas.height + margin || 
        this.EnemyX < -margin || 
        this.EnemyX > canvas.width + margin||
        this.EnemyHP <= 0){
        this.active = false
        }
if(this.type === 'boss') {
    if(currentTime - this.lastShotTime > 20){
        this.shot(20,this.Angle);
        this.lastShotTime = currentTime ;
    }
    this.Angle += Math.log(this.foo + 1) * 0.5; 
    this.foo += 3; 
}
}
    draw (){
        ctx.save();
        ctx.translate((this.EnemyX + this.EnemySize /2), (this.EnemyY + this.EnemySize /2));
        if((player.playerX + player.playerSize /2) - (this.EnemyX + this.EnemySize /2) > 0){
        ctx.scale(1,1);}else{
        ctx.scale(-1,1);
         }
         switch(this.type){
            case 'penguin' :
                drawImg((Math.floor(frameCounter / 10) % 3) + 13, -this.EnemySize / 2, -this.EnemySize / 2, this.EnemySize); 
                break;
            case 'parrot' : 
                drawImg((Math.floor(frameCounter / 10) % 2) + 11, -this.EnemySize / 2, -this.EnemySize / 2, this.EnemySize); 
                break;
            case 'toucan' :
                drawImg((Math.floor(frameCounter / 10) % 2) + 19, -this.EnemySize / 2, -this.EnemySize / 2, this.EnemySize); 
                break;
            case 'boss'   :
                drawImg((Math.floor(frameCounter / 10) % 2) + 2, -this.EnemySize / 2, -this.EnemySize / 2, this.EnemySize); 
                break;
            case 'shot'   :
                drawImg((Math.floor(frameCounter / 10) % 2) + 16, -this.EnemySize / 2, -this.EnemySize / 2, this.EnemySize);
                break;
         }

         ctx.restore();
             }
    shot(size,mukimuki){
        Enemies.push(new Enemy(this.EnemyX + this.EnemySize /2,this.EnemyY + this.EnemySize /2,20,'shot',size,mukimuki)) ;
    }
}
function EnemyMove(currentTime){
    for(let i = 0 ; i < Enemies.length ; i++){
        Enemies[i].move(currentTime) ;
        Enemies[i].draw() ;
    }
    Enemies = Enemies.filter(Enemy => Enemy.active);
    }
function EnemySpawn(currentTime){
    if(currentTime - lastSpawnTime > EnemySpawnQueue){
        spawn(EnemyType[Math.floor(Math.random()*3)]);
        lastSpawnTime = currentTime ;
        playSE('Chirp');
    }
}
function spawn (type){
    const random = Math.floor(Math.random()*4) ;
const size = EnemySize; // 余裕を持たせるためのサイズ

    switch (random) {
        case 0:
            Enemies.push(new Enemy(Math.random() * canvas.width, -size, 20, type, size));
            break;
        case 1:
            Enemies.push(new Enemy(Math.random() * canvas.width, canvas.height + size, 20, type, size));
            break;
        case 2:
            Enemies.push(new Enemy(-size, Math.random() * canvas.height, 20, type, size));
            break;
        case 3:
            Enemies.push(new Enemy(canvas.width + size, Math.random() * canvas.height, 20, type, size));
            break;
    }
    }    

function boss (){
    spawn('boss')
}

function collision(object1,object2,Size1,Size2,x1,x2,y1,y2){
    for (let i = object1.length -1; i>=0; i--){
        let p = object1[i];
        for (let j = object2.length -1; j>=0; j--){
        let e = object2[j];
        if(
        p[x1] + p[Size1] > e[x2] &&
        p[x1] < e[x2] + e[Size2] &&
        p[y1] + p[Size1] > e[y2] &&
        p[y1] < e[y2] + e[Size2]
        )
        {
         return [p,e];
     }
    }
   } 
     return null ;
}

function playerEnemyHit(currentTime){
const result = collision([player],Enemies,'playerSize','EnemySize','playerX','EnemyX','playerY','EnemyY');
if(result !== null && result[1].type === 'shot'){
    player.playerHP -= 0.1 ;
    result[1].active = false;
}else if(result !== null && player.playerInvincible === false)
{
player.playerHP -= result[1].EnemyPower ;
player.lastInvincivleTime = currentTime ;
player.playerInvincible = true ;
playSE('Crunch');
}
}

function pShotEnemyHit() {
    for (let i = pShots.length - 1; i >= 0; i--) {
        let p = pShots[i];        
        for (let j = Enemies.length - 1; j >= 0; j--) {
            let e = Enemies[j];
            if (
                p.pShotX < e.EnemyX + e.EnemySize/1.5 &&
                p.pShotX + pShotSize > e.EnemyX &&
                p.pShotY < e.EnemyY + e.EnemySize/1.5 &&
                p.pShotY + pShotSize > e.EnemyY
            ) {
               if(e.type === 'boss'){
                    p.active = false;
                    e.EnemyHP -= 1 ;
                    playSE('Clang') ;
                if(e.EnemyHP <= 0){
                    e.active = false;
                    player.score += 3000;
                }
                    break;
               }
                else{
                p.active = false;
                e.active = false;
                if(e.type !== 'shot'){
                player.score += 100 ;
                }
                break;                
                } 
            }
        }
    }
    pShots = pShots.filter(pShot => pShot.active);
    Enemies = Enemies.filter(enemy => enemy.active);
}
boss();