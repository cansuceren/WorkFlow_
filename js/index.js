
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
            const a = this.boxs.some((box)=>{
                if(box.x+10<=this.mouseX && box.x+box.w-10>=this.mouseX && box.y+10<=this.mouseY && box.y+box.h-10>=this.mouseY){
                    this.activeElementId=box.id;
                    return true;
                }
                else if(box.x-10<=this.mouseX && box.x+box.w+10>=this.mouseX && box.y-10<=this.mouseY && box.y+box.h+10>=this.mouseY){
                    this.activeElementId=box.id;
                    this.elements.some((element)=>{
                        if(element.id==box.id)
                        element.active="large";
                    })
                    
                    return true;
                }
            });
            /*const a = this.elements.some((element)=>{
                if(element.x+5<=this.mouseX && element.x+element.width-5>=this.mouseX && element.y+5<=this.mouseY && element.y+element.height-5>=this.mouseY){
                    this.activeElementId=element.id;
                    return true;
                }
                else if(element.x-5<=this.mouseX && element.x+element.width+5>=this.mouseX && element.y-5<=this.mouseY && element.y+element.height+5>=this.mouseY){
                    this.activeElementId=element.id;
                    element.active="large";
                    console.log("large,", element.id);
                    return true;
                }
            });*/
            //Finds which end of the line is held
            const b = this.lines.some((line)=>{
                if(line.x1-10<this.mouseX && line.x1+10>this.mouseX && line.y1-10<this.mouseY && line.y1+10>this.mouseY) {
                    this.activeElementId=line.id;
                    line.active="1";
                    return true;
                }else if(line.x2-10<=this.mouseX && line.x2+10>=this.mouseX && line.y2-10<=this.mouseY && line.y2+10>=this.mouseY){
                    this.activeElementId=line.id;
                    line.active="2";
                    return true;
                }
            });
            if (!a && !b) this.activeElementId=""
        });
        this.canvas.addEventListener("mouseup",()=>{
            if(this.isDragActive && this.activeElementId!="" && this.mouseOrg.x!=this.mouseX && this.mouseOrg.y!= this.mouseY){
                    this.elements.some((element)=>{
                        if(this.activeElementId==element.id){
                            //Allows the selected element to be moved
                            if(element.active!="large"){
                                let newmouseX, newmouseY;
                                newmouseX = this.mouseOrg.x - element.x;
                                newmouseY = this.mouseOrg.y - element.y;
                                element.x=this.mouseX-newmouseX;
                                element.y=this.mouseY-newmouseY;
                                
                                return true;
                            }else{
                            //It causes the selected element to grow or shrink from the selected edge when its corners are pulled
                                this.boxs.some((bx)=>{
                                    if(this.activeElementId == bx.id){
                                        console.log(this.mouseOrg.y, bx.y, this.mouseOrg.x, bx.x);
                                        if(this.mouseOrg.y-3<=bx.y){
                                            element.y += (this.mouseY-this.mouseOrg.y);
                                            element.height -= (this.mouseY-this.mouseOrg.y);
                                            bx.y=element.y;bx.h=element.height;
                                        }
                                        else if(this.mouseOrg.x-3<=bx.x){
                                            element.x += (this.mouseX-this.mouseOrg.x);
                                            element.width -=  (this.mouseX-this.mouseOrg.x);
                                        }
                                        else if(bx.y+bx.h-3<=this.mouseOrg.y && bx.y+bx.h+10>=this.mouseOrg.y){
                                            element.height +=  (this.mouseY-this.mouseOrg.y);
                                        }
                                        else if(bx.x+bx.w-3<=this.mouseOrg.x && bx.x+bx.w+10>=this.mouseOrg.x){
                                            element.width +=  (this.mouseX-this.mouseOrg.x);
                                        }
                                        element.active="";                                         
                                        return true;
                                    }
                                });   
                            }
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
            //Clicking on the upper left corner of the selected element causes it to rotate 10 degrees each time
            if(this.isDragActive && this.activeElementId!="" && this.mouseOrg.x==this.mouseX && this.mouseOrg.y== this.mouseY){
                this.elements.some((element)=>{
                    if(this.activeElementId==element.id){
                            if(element.x-5<=this.mouseX && element.x+5>=this.mouseX && element.y-5<=this.mouseY && element.y+5>=this.mouseY){
                                   element.deg+=10;
                            }
                        }
                });
            }    
            this.isDragActive=false;
        });

        //Allows text to be written when double-clicking on the selected elemnet or line.
        this.canvas.addEventListener("dblclick", ()=>{
            console.log("dbl", this.isDragActive, this.activeElementId);
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
            this.activeElementId=""
        });
        this.render()
    }

    render() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 3;
        this.ctx.arc(this.mouseX, this.mouseY, 10, 0, 2 * pi);
        this.ctx.stroke();

        this.drawElement();
        this.drawLine();
        this.boundingBoxLine();
        if(this.activeElementId!=""){
            let a = this.elements.some((element)=>{
                if(this.activeElementId==element.id){
                    this.boundingBox(element);
                    return true;
                }
            })
        }
        requestAnimationFrame(
            this.render.bind(this)//referans kaybettiği için bind ediliyor.
        );
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
    boundingBox(element){
        this.boxs.some((bx)=>{
            if(bx.id == element.id){
                this.boxs.splice(this.boxs.indexOf(bx), 1);
                return true
            }
        });
        let x=element.x-2;        let y=element.y-2;        let w=element.width+4;        let h=element.height+4;

        
        if(element.type=="input"){
            w=w+30;
        }
        else if(element.type=="decision"){
            x=x-element.width/2;
        }
        this.ctx.save();
        
        this.ctx.lineWidth=1;
        this.ctx.beginPath();
        this.ctx.strokeStyle="black";
        this.ctx.strokeRect(x, y, w, h);

        this.ctx.strokeRect(x-3, y-3, 6, 6);
        this.ctx.strokeRect(x+w-3, y-3, 6, 6);
        this.ctx.strokeRect(x-3, y+h-3, 6, 6);
        this.ctx.strokeRect(x+w-3, y+h-3, 6 ,6);

        this.ctx.strokeRect(x+w/2, y-3, 6, 6);
        this.ctx.strokeRect(x+w/2, y+h-3, 6, 6);
        this.ctx.strokeRect(x-3, y+h/2, 6, 6);
        this.ctx.strokeRect(x+w-3, y+h/2, 6 ,6);

        this.ctx.restore();
        
        const bx = new Box(x, y,w,h,element.id);
        this.boxs.push(bx);
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
        })
    }

    addItem(type) {
        if(type=="line"){
            const li = new Line(Math.random() * this.canvas.width, Math.random() * this.canvas.height,Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.lines.push(li);
            this.activeElementId=li.id
        }else{
            const el=new Element(Math.random() * this.canvas.width, Math.random() * this.canvas.height, type)
            this.elements.push(el);
            this.activeElementId=el.id
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

