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
        const check = (x = 0) => (isNaN(x) || (typeof x != 'number'))
        let func = null;
        let done = false;
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
            try {
                for (let xP = 0; xP < X; xP++) {
                    for (let yP = 0; yP < Y; yP++) {
                        const y = Math.floor(yP / Y * 256)
                        const x = Math.floor(xP / X * (smol ? 256 : 512) * SCALE)
                        const t = (x << 8) + y

                        const V = func(t, x, y); // Value
                        const N = check(V) ? 100 : 0; // NaN

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