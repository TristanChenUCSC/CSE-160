class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0, 0.4, 4]);
        this.at = new Vector3([0, 0.4, -1]);
        this.up = new Vector3([0, 1, 0]);

        this.speed = 0.3;

    }

    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }

    moveBackwards() {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);
        this.eye.add(b);
        this.at.add(b);
    }

    moveLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();

        let s = new Vector3();
        s = Vector3.cross(this.up, f); 
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }
    
    moveRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();

        let s = new Vector3();
        s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }

    panLeft(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panRight(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panUp(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = new Vector3();
        s = Vector3.cross(this.up, f); 
        s.normalize();
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, s.elements[0], s.elements[1], s.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);
        
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panDown(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let s = new Vector3();
        s = Vector3.cross(this.up, f); 
        s.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, s.elements[0], s.elements[1], s.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }
}