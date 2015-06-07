function addAdditionalfunctionsToCtx(ctx) {
    ctx.roundRect = function (x, y, width, height, radius, fill, stroke) {
        if (stroke === undefined) 
            stroke = true;
        if (!radius) 
            radius = 5;

        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        if (stroke) this.stroke();
        if (fill) this.fill();
    };

    ctx.circle = function (x, y, radius, fill, stroke) {
        this.beginPath();
        if (fill) this.fillStyle = fill;
        this.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.fill();
        if (stroke) {
            this.strokeStyle = stroke;
            this.stroke();
        }
        return this;
    };
    
    ctx.style = function(o) {
        extend(ctx, o);
    };
    
    ctx.drawRect = function(x, y, width, height, fill, stroke) {
        if (fill) this.fillStyle = fill;
            this.fillRect(x, y, width, height);
        if(stroke) {
            this.strokeStyle = stroke;
            this.strokeRect(x, y, width, height);
        }
    };

    ctx.handDrawnText = function (txt, x, y, stroke, fill, isCenter, sound) {
        var dashLen = 220,
            dashOffset = dashLen,
            speed = 15,
            lineWidth = this.lineWidth = 3,
            fontSize = 50,
            font = this.font = fontSize + "px Comic Sans MS, cursive, TSCu_Comic, sans-serif",
            alpha = 0.2,
            i = 0,
            callback = function () { },
            self = this;

        self.textAlign = 'left';
        fill = fill || '#000';
        stroke = stroke || 'rgba(0, 0, 0, 0.5)';

        if (isCenter === true) {
            x -= (this.measureText(txt).width + lineWidth * txt.length / 2) / 2;
            console.log(x);
        }
        
        // odgłos pierwszej litery
        sound && txt[i] !== ' ' && sound.cloneNode().play();

        (function loop() {
            self.lineWidth = lineWidth;
            self.textAlign = 'left';
            self.save();
            self.font = font;
            self.lineJoin = "round";
            self.globalAlpha = alpha;
            self.textBaseline = "hanging";
           
            // self.clearRect(x, y, 60, fontSize);
            self.setLineDash([dashLen - dashOffset, dashOffset - speed]);
            dashOffset -= speed;
            self.strokeStyle = stroke;
            self.strokeText(txt[i], x, y);

            if (dashOffset > 0) requestAnimationFrame(loop);
            else {
                
                self.fillStyle = fill;
                self.fillText(txt[i], x, y);
                dashOffset = dashLen;
                x += self.measureText(txt[i++]).width + lineWidth * Math.random();
                self.setTransform(1, 0, 0, 1, 0, 4 * Math.random());
                if (i < txt.length) {
                    sound && txt[i] !== ' ' && sound.cloneNode().play();
                    requestAnimationFrame(loop);
                }
                else callback();
            }
            self.restore();
        })();
        return {
            next: function (fn) {
                callback = fn;
            },
            wait: function (timeout, fn) {
                callback = function() {
                    window.setTimeout(fn, timeout);
                };
            }
        };
    };
}