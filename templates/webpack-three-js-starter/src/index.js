import { WebGLRenderer, Scene, PerspectiveCamera } from "three";

class MyWorld {
  constructor() {
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.scene = new Scene();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );
  }
}

const world = new MyWorld();
