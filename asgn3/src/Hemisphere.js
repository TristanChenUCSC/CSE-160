class Hemisphere {
    constructor() {
        this.type = 'hemisphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let segments = 10;
        let stacks = 6;

        // Surface
        for (let i = 0; i < stacks; i++) {
            let phi1 = (i / stacks) * Math.PI / 2;
            let phi2 = ((i + 1) / stacks) * Math.PI / 2;

            let y1 = Math.cos(phi1);
            let y2 = Math.cos(phi2);

            let r1 = Math.sin(phi1);
            let r2 = Math.sin(phi2);

            let angleStep = 360 / segments;

            for (let angle = 0; angle < 360; angle += angleStep) {
                let a1 = angle * Math.PI / 180;
                let a2 = (angle + angleStep) * Math.PI / 180;

                let p1 = [r1 * Math.cos(a1), y1, r1 * Math.sin(a1)];
                let p2 = [r1 * Math.cos(a2), y1, r1 * Math.sin(a2)];
                let p3 = [r2 * Math.cos(a2), y2, r2 * Math.sin(a2)];
                let p4 = [r2 * Math.cos(a1), y2, r2 * Math.sin(a1)];

                drawTriangle3D([
                p1[0], p1[1], p1[2],
                p2[0], p2[1], p2[2],
                p3[0], p3[1], p3[2]
                ]);

                drawTriangle3D([
                p1[0], p1[1], p1[2],
                p3[0], p3[1], p3[2],
                p4[0], p4[1], p4[2]
                ]);
            }
        }

        // Base
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        for (let j = 0; j < segments; j++) {
            let theta1 = (j / segments) * 2 * Math.PI;
            let theta2 = ((j + 1) / segments) * 2 * Math.PI;

            let p1 = [Math.cos(theta1), 0, Math.sin(theta1)];
            let p2 = [Math.cos(theta2), 0, Math.sin(theta2)];

            drawTriangle3D([
                0, 0, 0,
                p1[0], p1[1], p1[2],
                p2[0], p2[1], p2[2]
            ]);
        }
    }
}