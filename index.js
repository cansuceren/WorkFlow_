const pi = Math.PI;
var id = 1;
const typeSizeMap = {
    "decision": {
        width: 80,
        height: 80
    },
    "input": {
        width: 100,
        height: 40
    },
    "start": {
        width: 100,
        height: 40
    },
    "process": {
        width: 100,
        height: 40
    },
}
class Box {
    constructor(x,y,w,h,id){
        this.x=x; this.y=y; this.w=w,this.h=h; this.id=id;
    }
}
class Element {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.id = id++;
        this.active = false;
        this.text = "";
        this.type = type;
        this.deg = 0;
        this.width = typeSizeMap[this.type].width;
        this.height = typeSizeMap[this.type].height;
    }
}
class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.id=id++;
        this.active = "";
        this.text = "";
        this.type = "line";
    }
}

class FlowChart {
    isDragActive=false;
    activeElementId = "";
    lines = [];
    elements = [];
    boxs = [];
    mouseOrg={
        x:0,
        y:0
    };
    constructor(config) {
        this.canvas = config.host;
        this.ctx = this.canvas.getContext("2d");
        var window_height = window.innerHeight;
        var window_width = window.innerWidth;
        this.canvas.width = window_width;
        this.canvas.height = window_height;

        //Calculating the correct coordinates of the mouse
        this.canvas.addEventListener("mousemove", (event) => {
            this.mouseX = event.clientX - this.canvas.offsetLeft + window.scrollX;
            this.mouseY = event.clientY - this.canvas.offsetTop + window.scrollY;
        });
        this.canvas.addEventListener("mousedown", ()=>{
            this.isDragActive=true;
            this.mouseOrg.x=this.mouseX;
            this.mouseOrg.y=this.mouseY;
            //Finds whether the selected element will be moved or the edges will change
            const a = this.boxs.some((bx)=>{
                if(bx.x-5<=this.mouseX && bx.x+bx.w+5>=this.mouseX && bx.y-5<=this.mouseY && bx.y+bx.h+5 >= this.mouseY){
                    this.activeElementId = bx.id;
                    if((bx.x-4<=this.mouseX && bx.x+6>=this.mouseX && bx.y+6<=this.mouseY && bx.y+bx.y+bx.h-4>=this.mouseY) ||
                    (bx.x+6<=this.mouseX && bx.x+bx.w-6>=this.mouseX && bx.y-4<=this.mouseY && bx.y+6>=this.mouseY) ||
                    (bx.x+6<=this.mouseX && bx.x+bx.w-6>=this.mouseX && bx.y+bx.h-4<=this.mouseY && bx.y+bx.h+6>=this.mouseY) ||
                    (bx.x+bx.w-5<=this.mouseX && bx.x+bx.w+5>=this.mouseX && bx.y+6<=this.mouseY && bx.y+bx.y+bx.h-4>=this.mouseY)){
                        this.elements.some((element)=>{
                            if(element.id==bx.id){
                                element.active="large";
                            }
                        });
                    }
                    if((bx.x-5<=this.mouseX && bx.x+5>=this.mouseX && bx.y-5<=this.mouseY && bx.y+5>=this.mouseY) ||
                        (bx.x+bx.w-5<=this.mouseX && bx.x+bx.w+5>=this.mouseX && bx.y-5<=this.mouseY && bx.y+5>=this.mouseY) ||
                        (bx.x-5<=this.mouseX && bx.x+5>=this.mouseX && bx.y+bx.h-5<=this.mouseY && bx.y+bx.h+5>=this.mouseY) ||
                        (bx.x+bx.w-5<=this.mouseX && bx.x+bx.w+5>=this.mouseX && bx.y+bx.h-5<=this.mouseY && bx.y+bx.h+5>=this.mouseY)){
                        this.elements.some((element)=>{
                            if(element.id==bx.id){
                                element.active="deg";
                            }
                        });
                    }
                    return true;
                }
            });
            //Finds which end of the line is held
            const b = this.lines.some((line)=>{
                if(line.x1-10<this.mouseX && line.x1+10>this.mouseX && line.y1-10<this.mouseY && line.y1+10>this.mouseY) {
                    this.activeElementId=line.id;
                    line.active="1";
                    console.log("1")
                    return true;
                }else if(line.x2-10<=this.mouseX && line.x2+10>=this.mouseX && line.y2-10<=this.mouseY && line.y2+10>=this.mouseY){
                    this.activeElementId=line.id;
                    line.active="2";
                    return true;
                }
            });
            if (!a && !b) this.activeElementId="";
        });
        this.canvas.addEventListener("mouseup",()=>{
            if(this.isDragActive==true && this.activeElementId!="" && this.mouseOrg.x !=this.mouseX && this.mouseOrg.y != this.mouseY){
                this.elements.some((element)=>{
                    if(element.id == this.activeElementId){
                        //It causes the selected element to grow or shrink from the selected edge when its corners are pulled
                        if(element.active=="large"){
                            this.boxs.some((bx)=>{
                                if(bx.id==this.activeElementId){
                                    if((bx.x-4<=this.mouseOrg.x && bx.x+6>=this.mouseOrg.x && bx.y+6<=this.mouseOrg.y && bx.y+bx.y+bx.h-4>=this.mouseOrg.y)){
                                        element.x += (this.mouseX-this.mouseOrg.x);
                                        element.width -=  (this.mouseX-this.mouseOrg.x);
                                    }
                                    else if((bx.x+6<=this.mouseOrg.x && bx.x+bx.w-6>=this.mouseOrg.x && bx.y-4<=this.mouseOrg.y && bx.y+6>=this.mouseOrg.y)){
                                        element.y += (this.mouseY-this.mouseOrg.y);
                                        element.height -= (this.mouseY-this.mouseOrg.y);
                                    }
                                    else if((bx.x+6<=this.mouseOrg.x && bx.x+bx.w-6>=this.mouseOrg.x && bx.y+bx.h-4<=this.mouseOrg.y && bx.y+bx.h+6>=this.mouseOrg.y)){
                                        element.height +=  (this.mouseY-this.mouseOrg.y);
                                    }
                                    else{
                                        element.width +=  (this.mouseX-this.mouseOrg.x);
                                    }
                                    return true;
                                }
                            });
                        }
                        //Allows the selected element to be moved
                        else{
                            let newmouseX, newmouseY;
                            newmouseX = this.mouseOrg.x - element.x;
                            newmouseY = this.mouseOrg.y - element.y;
                            element.x=this.mouseX-newmouseX;
                            element.y=this.mouseY-newmouseY;
                        }
                        element.active="";
                        return true;
                    }
                });
                //It allows you to move the line by holding the ends of the lines
                this.lines.some((line)=>{
                    if(this.activeElementId == line.id){
                        if(line.active=="1"){
                            line.x1 = this.mouseX;
                            line.y1 = this.mouseY;
                            return true;
                        }else if(line.active=="2"){
                            line.x2 = this.mouseX;
                            line.y2 = this.mouseY;   
                            return true;     
                        }
                        line.active="";
                    }
                });
            }
            //Clicking on the element's corners rotates it by 10 degrees
            if(this.isDragActive==true && this.activeElementId!="" && this.mouseOrg.x ==this.mouseX && this.mouseOrg.y == this.mouseY){
                this.elements.some((element)=>{
                    if(element.id == this.activeElementId){
                        if(element.active=="deg"){
                            element.deg+=10;
                            if(element.deg==100) element.deg=0;
                            element.active="";
                        }
                    }
                    return true;
                });
            }
 
            this.isDragActive=false;
        });
        //Allows text to be written when double-clicking on the selected elemnet or line.
        this.canvas.addEventListener("dblclick", ()=>{
            if(this.activeElementId!=""){
                let textt = prompt("Please enter text : ");
                this.elements.some((element)=>{
                    if(this.activeElementId==element.id){
                        element.text=textt;
                        return true;
                    }
                });               
                this.lines.some((line)=>{
                    if(this.activeElementId == line.id){
                        line.text=textt;
                            return true;     
                    }
                });
            }
            this.isDragActive=false;
        });
        //When the delete key is pressed while there is a selected element or line, the element or line is deleted
        document.addEventListener("keydown",(event)=>{
            if(event.key=="Backspace" &&  this.activeElementId!=""){
                this.elements.some((element)=>{
                    if(this.activeElementId==element.id){
                        this.elements.splice(this.elements.indexOf(element), 1);
                        return true;
                    }
                });
                this.lines.some((line)=>{
                    if(this.activeElementId==line.id){
                        this.lines.splice(this.lines.indexOf(line), 1);
                        return true;
                    }                       
                });
            }
            this.isDragActive=false;
            this.activeElementId=""
        });
        this.render();
        this.export();
    }
    //convert canvas to png
    export(){
        let canvasUrl = this.canvas.toDataURL("image/png");
        const createEl = document.createElement('a');
        createEl.href = canvasUrl;
        createEl.download = "download-this-canvas";
        createEl.click();
        createEl.remove();
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 3;
        this.ctx.arc(this.mouseX, this.mouseY, 10, 0, 2 * pi);
        this.ctx.stroke();
        this.drawElement();
        this.boundingBox();
        this.drawLine();
        this.boundingBoxLine();
        if(this.activeElementId!=""){
            this.elements.some((element)=>{
                if(element.id==this.activeElementId){
                    this.boundingBoxActive(this.activeElementId);
                    return true;
                }
            });
        }
        requestAnimationFrame(
            this.render.bind(this)//referans kaybettiği için bind ediliyor.
        );
    }
    boundingBox(){
        this.elements.forEach((element)=>{
            let x=element.x, y=element.y, w=element.width, h=element.height, deg=element.deg;
            if(element.type=="input"){
                w=w+30;
            }
            else if(element.type=="decision"){
                x=x-element.width/2;
            }
            if(deg!=0){
                let ax=w*Math.cos(deg*pi/180);
                let ay=-w*Math.sin(deg*pi/180);
                let bx=-h*Math.sin(deg*pi/180);
                let by=h*Math.cos(deg*pi/180);
                let cx=w*Math.cos(deg*pi/180)-h*Math.sin(deg*pi/180);
                let cy=w*Math.sin(deg*pi/180)+h*Math.cos(deg*pi/180);
                let xxs=[x,x+ax,x+bx,x+cx];
                let yys=[y,y-ay,y+by,y+cy];
    
                xxs = xxs.sort();
                yys = yys.sort();

                if((yys[3]-yys[0])<0){
                    let k,b;
                    for(let i=0;i<yys.length-1;i++){
                        if(yys[i]<yys[i+1]) k=yys[i];
                        else k=yys[i+1];

                        if(yys[i]>yys[i+1]) b=yys[i];
                        else b=yys[i+1];
                    }
                    console.log(b,k);
                    h=b-k;
                }else{

                    h=yys[3]-yys[0];
                }
                x=xxs[0];
                y=yys[0];
                w=xxs[3]-xxs[0];

            }

                const a = this.boxs.some((bx)=>{
                    if(bx.id==element.id){
                        bx.x=x; bx.y=y; 
                        bx.w=w;
                        bx.h=h;
                        return true;
                    }
                });
            if(!a){
                this.boxs.push(new Box(x,y,w,h,element.id));
            }
        });
    }
    boundingBoxActive(id){
        this.boxs.some((bx)=>{
            if(bx.id==id){
                let x= bx.x;    let y=bx.y; let w=bx.w; let h=bx.h;
                //console.log(x,y,w,h);
                this.ctx.save();
                this.ctx.lineWidth=1;
                this.ctx.beginPath();
                this.ctx.strokeStyle="black";
                this.ctx.strokeRect(x, y, w, h);
    
                this.ctx.strokeRect(x-5, y-5, 6, 6);
                this.ctx.strokeRect(x+w, y-5, 6, 6);
                this.ctx.strokeRect(x-5, y+h, 6, 6);
                this.ctx.strokeRect(x+w, y+h, 6 ,6);
    
    
                this.ctx.strokeRect(x+w/2, y-5, 6, 6);
                this.ctx.strokeRect(x+w/2-5, y+h, 6, 6);
                this.ctx.strokeRect(x-5, y+h/2, 6, 6);
                this.ctx.strokeRect(x+w, y+h/2-5, 6 ,6);
                this.ctx.restore();
            }
        });
            
    }
    boundingBoxLine(){
        let x1, x2,y1,y2;
        this.lines.forEach((line)=>{
            x1= line.x1-4;  y1= line.y1-4;  x2= line.x2-4;  y2=line.y2-4;
            this.ctx.save();
            
            this.ctx.lineWidth=1;
            this.ctx.beginPath();
            this.ctx.strokeStyle="black";
            this.ctx.strokeRect(x1, y1, 6, 6);
            this.ctx.strokeRect(x2, y2, 6, 6);
    
            this.ctx.restore();
        })
    }
    drawLine(){
        this.lines.forEach((line)=>{
            this.ctx.beginPath();
            this.ctx.fillText(line.text, line.x1 + 20, line.y1 + 20);
            this.ctx.moveTo(line.x1,line.y1);
            this.ctx.lineTo(line.x2, line.y2);
            this.ctx.stroke();
        })
    }
    drawElement() {
        this.elements.forEach((element) => {
            this.ctx.save();
            switch (element.type) {
                case "process":
                    this.ctx.beginPath();
                    this.ctx.fillText(element.text, element.x + 20, element.y + 20);
                    this.ctx.translate(element.x, element.y)
                    this.ctx.rotate(element.deg*pi/180);
                    this.ctx.strokeRect(0, 0, element.width, element.height);
                    break;
                case "start":
                    this.ctx.beginPath();
                    this.ctx.fillText(element.text, element.x + 20, element.y + 20);
                    this.ctx.translate(element.x, element.y);
                    this.ctx.rotate(element.deg*pi/180);
                    this.ctx.roundRect(0,0, element.width, element.height, 30);
                    this.ctx.stroke();
                    break;
                case "input":
                    this.ctx.beginPath();
                    this.ctx.fillText(element.text, element.x + 20, this.y + 20);
                    this.ctx.translate(element.x, element.y);
                    this.ctx.rotate(element.deg*pi/180);
                    this.ctx.moveTo(0,0);
                    this.ctx.lineTo(element.width,0);
                    this.ctx.lineTo(element.width+30, element.height);
                    this.ctx.moveTo(0,0);
                    this.ctx.lineTo(30, +element.height);
                    this.ctx.lineTo(element.width+30, element.height);
                    this.ctx.stroke();
                    break;
                case "decision":
                    this.ctx.beginPath();
                    this.ctx.fillText(element.text, element.x - 8, element.y + 20);
                    this.ctx.translate(element.x, element.y);
                    this.ctx.rotate(element.deg*pi/180);
                    this.ctx.moveTo(0,0);
                    this.ctx.lineTo(-element.width/2, element.height/2);
                    this.ctx.lineTo(0,element.height);
                    this.ctx.moveTo(0,0);
                    this.ctx.lineTo(element.width/2, element.height/2);
                    this.ctx.lineTo(0,element.height);
                    this.ctx.stroke();
                    break;
                default:
                    break;
            }
            this.ctx.restore();
        });
    }
    addItem(type) {
        if(type=="line"){
            const li = new Line(Math.random() * this.canvas.width, Math.random() * this.canvas.height,Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.lines.push(li);
            this.activeElementId=li.id
        }else if(type!="export"){
            const el=new Element(Math.random() * this.canvas.width, Math.random() * this.canvas.height, type)
            this.elements.push(el);
            this.activeElementId=el.id;
        }
        else{
            this.export();
        }
    }
}

const flw = new FlowChart({
    host: document.getElementById("cvs")
})
Array.from(document.getElementsByClassName("component")).forEach((button) => {
    button.addEventListener("click", (event) => {
        const type = button.getAttribute('data-flow-component')
        flw.addItem(type)
    });
});
