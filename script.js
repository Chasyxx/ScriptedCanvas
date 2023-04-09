globalThis.RUN = new class {

    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        this.button = document.getElementById('Generate-button');
        this.inputs = {
            x: document.getElementById('dimX'),
            y: document.getElementById('dimY'),
            s: document.getElementById('scal'),
            c: document.getElementById('colored'),
            m: document.getElementById('mode'),
            slow: document.getElementById('slow'),
            fV: document.getElementById('functionV')
        }
    }

    async runScript() {
        const smol = window.innerWidth < 1056
        this.button.title = ""
        const X = smol ? 256 : 512//this.inputs.x.value
        const Y = 256//this.inputs.y.value
        const colored = this.inputs.c.checked
        const slow = this.inputs.slow.checked
        const SCALE = this.inputs.s.value
        let func = null;
        let getVal = null;
        let done = false;
        switch (this.inputs.m.value) {
            case 'N': getVal = (x)=>(x); break;
            case 'S': getVal = (x)=>(x+128); break;
            case 'F': getVal = (x)=>(Math.max(-1,Math.min(1,x)))*127.5+128; break;

            default: getVal = (x)=>(NaN); break;
        }
        // Easy math functions
        const params = Object.getOwnPropertyNames(Math);
        const values = params.map(k => Math[k]);
        params.push('int', 'window');
        values.push(Math.floor, globalThis);
        //Compiling
        try {
            func = new Function(...params, 't,x,y', `return 0,\n${this.inputs.fV.value || 0};`)
                .bind(globalThis, ...values);
            func(0)
            done = func
        } catch (err) {
            this.button.innerText = "In compilation: " + err.message
            this.button.title = err.stack
        }
        if (done) {
            window.location.hash = encodeURIComponent(btoa(JSON.stringify({code: this.inputs.fV.value, mode:this.inputs.m.value})))
            try {
                for (let xP = 0; xP < X; xP++) {
                    for (let yP = 0; yP < Y; yP++) {
                        const y = Math.floor(yP / Y * 256)
                        const x = Math.floor(xP / X * (smol ? 256 : 512) * SCALE)
                        const t = (x << 8) + y

                        const V = Number(getVal(func(t, x, y))); // Value
                        const N = isNaN(V) ? 100 : 0; // NaN

                        // Convert brightness to grayscale color
                        const color = `rgb(${N ? 100 : (!colored ? V & 255 : V >> 16 & 255)}, ${N ? 0 : (!colored ? V & 255 : V >> 0 & 255)}, ${N ? 0 : (!colored ? V & 255 : V >> 8 & 255)})`;
                        // Draw pixel on the canvas
                        this.ctx.fillStyle = color;
                        this.ctx.fillRect(xP * Math.ceil(this.canvas.width / X), yP * Math.ceil(this.canvas.height / Y), Math.ceil(this.canvas.width / X), Math.ceil(this.canvas.height / Y));
                    }
                    if (slow) {
                        this.button.innerText = (xP + "/" + X)
                        await new Promise(resolve => { setTimeout(resolve, 2) })
                    }
                }
                this.button.innerText = "Generate Another"
            } catch (err) { this.button.innerText = err.message; this.button.title = err.stack }
        }
    }
}

let hash = window.location.hash

if(hash){
    try {
        const data = JSON.parse(atob(decodeURIComponent(hash.slice(1))))
        console.log(data)
        RUN.inputs.fV.value = data.code
        RUN.inputs.m.value = data.mode
    } catch (error) {
        console.error(`CODELOADERROR: ${error.message}`)
    }
}