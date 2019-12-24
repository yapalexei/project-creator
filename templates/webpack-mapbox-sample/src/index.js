mapboxgl.accessToken =  "pk.eyJ1IjoieWFwYWxleGVpIiwiYSI6ImNqNGVuaDRwdjBwZ2MycW1rM2FrMmpmNTQifQ.ouDro4DGQ4viVjdBgaI_Xg";
const { MercatorCoordinate } = mapboxgl;

const origCenter = [-122.67118367793355, 45.520579458294915];
// const center = [0,0];
const originPont = MercatorCoordinate.fromLngLat(origCenter);
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  center: origCenter,
  zoom: 17,
  pitch: 50,
  antialias: true
});
map.showTileBoundaries = true;

map.on("load", function() {
  // map.addControl(new GeoJsonControl(), "bottom-right");
  map.addLayer(new DrawLayer());
  map.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
      'fill-extrusion-color': '#aaa',
      
      // use an 'interpolate' expression to add a smooth transition effect to the
      // buildings as the user zooms in
      'fill-extrusion-height': [
        "interpolate", ["linear"], ["zoom"],
        15, 0,
        15.05, ["get", "height"]
      ],
      'fill-extrusion-base': [
        "interpolate", ["linear"], ["zoom"],
        15, 0,
        15.05, ["get", "min_height"]
      ],
      'fill-extrusion-opacity': .6
    }
  });
});

class GeoJsonControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl controls-container";
    this._container.innerText = 'controls container';
    this._container.setAttribute("tabindex", 0);
    return this._container;
  }
  onRemove(map) {}
}

class DrawLayer {
  constructor() {
    this.id = 'threejs-layer';
    this.type = 'custom';
    this.renderingMode = '3d';
    
    this.cameraCenterPoint = MercatorCoordinate.fromLngLat(origCenter);
    this.modelAltitude = 0;
    this.modelRotate = [Math.PI / 2, 0, 0];
    // this.worldScaleFactor = 0.000001;//5.41843220338983e-8;
    this.worldScaleFactor = 1;
    
    this.myCamera = new THREE.PerspectiveCamera({
      near: 100,
      far: 200
    });
    this.myScene = new THREE.Scene();
    this.geoms = [];
    this.curZoom = null;
    this.curCenter = null;
  }
  
  createGeometryFromFeature(feature) {
    const { geometry, properties } = feature || {};
    if (!geometry) return;
    const { coordinates: coords, type } = geometry;
    const res = { originPoint: null, originLngLat: null, points: [], vectors: [] };
    const HEIGHT_MULTI = 0.035615;
    switch (type) {
      case 'Polygon':
      const path = new THREE.Shape();
      
      coords[0].reduce((sum, item, index, array) => {
        const mPoint = MercatorCoordinate.fromLngLat([item[0], item[1]]);
        // first point is the origin 0, 0 but remember it as the offset for the rest
        if (!sum.originPoint) {
          sum.originLngLat = item;
          sum.originPoint = mPoint;
          path.moveTo(0, 0);
          return sum;
        }
        const originPoint = sum.originPoint;
        const x = (originPoint.x - mPoint.x) * 1000000;
        const y = (originPoint.y - mPoint.y) * 1000000;
        path.lineTo(x, y);
        return sum;
      }, res);
      const material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
      material.overdraw = true;
      const height = properties.height ? HEIGHT_MULTI * properties.height : 0;
      var extrudeSettings = {
        amount: height,
        bevelEnabled: false,
        // steps: 16,
        // depth: 16,
        // bevelThickness: 1,
        // bevelSize: 1,
        // bevelOffset: 0,
        // bevelSegments: 1
      };
      
      var geom = new THREE.ExtrudeGeometry( path, extrudeSettings );
      res.mesh = new THREE.Mesh( geom, material );
      res.mesh.castShadow = true;
      res.mesh.rotation.x = Math.PI / 2;
      res.mesh.rotation.z = Math.PI;
      res.mesh.position.y = height;
      
      console.log(res);
    }
    if (res.mesh) {
      this.myScene.add(res.mesh);
      this.geoms.push(res.mesh);
    }
    return res;
  }
  
  onAdd(map, gl) {
    this.map = map;
    map.on('moveend', () => {
      this.curZoom = ~~map.getZoom() || 1;
      this.curCenter = map.getCenter();
      console.log(this.curZoom, this.curCenter, this.worldScaleFactor);
      if (this.curCenter) {
        this.cameraCenterPoint = MercatorCoordinate.fromLngLat(this.curCenter);
        // this.setCubePos(this.curCenter);
      }
    });
    // map.on('click', (e) => {
    //     const features = map.queryRenderedFeatures(e.point);
    //     // console.log(features);
    //     const building = features.find((obj) => obj.layer.id === 'building' || obj.layer.id === '3d-building');
    //     if (this.geoms.length) {
    //         this.geoms.forEach((geom) => {
    //             this.myScene.remove(geom);
    //         });
    //     }
    //     const res = this.createGeometryFromFeature(building);
    //     const center = res ? res.originLngLat : e.lngLat.toArray();
    
    //     this.setCubePos(center);
    // });
    const renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
      precision: 'highp', //"highp", // "mediump" or "lowp"
      // preserveDrawingBuffer: true,
      powerPreference: 'low-power',
      // logarithmicDepthBuffer: true,
      // depth: true
    });
    // renderer.setPixelRatio( window.devicePixelRatio );
    renderer.autoClear = false;
    renderer.shadowMap.enabled = true;
    
    this.renderer = renderer;
    this.setupLights();
    this.setupShadowPlain();
    this.setupMesh();
    this.renderer.shadowMap.needsUpdate = true;
    this.setCubePos = this.setCubePos.bind(this);
  }
  
  setupLights() {
    this.light = new THREE.DirectionalLight(0xffffff, 0.5);
    this.light.position.set(-10, 13, 8);
    this.light.castShadow = true;
    this.light.shadow.camera.far = 1000;
    this.light.shadow.camera.near = 0;
    this.light.shadow.mapSize.width = 2048*2;
    this.light.shadow.mapSize.height = 2048*2;
    this.myScene.add(this.light);
    // this.myScene.add( new THREE.CameraHelper( this.light.shadow.camera ) );
    
    const ambientLight = new THREE.AmbientLight( 0x404040 );
    this.myScene.add(ambientLight);
    
  }
  
  setupShadowPlain() {
    const outlineShadowMesh = true;
    const scaler = ~~( this.worldScaleFactor / 2 );
    const planeMaterial = (outline) => {
      if (outline) {
        const planeGeometry = new THREE.CircleGeometry( scaler, 32 );
        const material = new THREE.LineDashedMaterial({dashSize: 2, gapSize: 2, color: 0xff0000});
        // planeGeometry.computeLineDistances();
        return {
          material,
          planeGeometry,
        }; 
      }
      cons
      const planeGeometry = new THREE.PlaneGeometry( scaler, scaler );
      const material = new THREE.ShadowMaterial();
      material.opacity = 0.4;
      material.shadowSide = THREE.DoubleSide;
      return {
        material,
        planeGeometry,
      };
    }
    const {
      material,
      planeGeometry,
    } = planeMaterial(outlineShadowMesh);
    this.shadowPlane = outlineShadowMesh ? new THREE.Line( planeGeometry, material ) : new THREE.Mesh( planeGeometry, material );
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = 0;
    this.shadowPlane.receiveShadow = true;
    this.myScene.add( this.shadowPlane );
  }
  
  setCubePos(loc) {
    const center = loc && loc instanceof Array ? loc : loc.toArray && loc.toArray();
    if (center) {
      const p = MercatorCoordinate.fromLngLat(center);
      const mult = this.worldScaleFactor;
      const offset = mult / 2;
      const res = { x: p.x * mult, y: p.y * mult };
      const diffRes = { x: res.x, y: res.y };
      if (this.cube) {
        this.cube.position.x = diffRes.x - offset;
        this.cube.position.z = diffRes.y - offset;                
      }
    }
  }
  
  setupMesh() {
    const scale = .125;
    const segs = 1;
    const mat = new THREE.MeshLambertMaterial( { color: 0x00ff00 } )
    mat.overdraw = true;
    var cube = new THREE.Mesh(new THREE.BoxGeometry( scale, scale, scale, segs, segs, segs ), mat);
    this.cube = cube;
    const l = [0, 0];
    cube.castShadow = true;
    cube.position.y = scale / 2;
    
    // this.setCubePos(l);
    this.myScene.add(cube);
  }
  
  render(gl, matrix) {
    this.modelTransform = {
      translateX: this.cameraCenterPoint.x,
      translateY: this.cameraCenterPoint.y,
      translateZ: 0,
      rotateX: this.modelRotate[0],
      rotateY: this.modelRotate[1],
      rotateZ: this.modelRotate[2],
      scale: (this.worldScaleFactor / 50000)
    };
    var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), this.modelTransform.rotateX);
    var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), this.modelTransform.rotateY);
    var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), this.modelTransform.rotateZ);
          
    var m = new THREE.Matrix4().fromArray(matrix);
    var l = new THREE.Matrix4().makeTranslation(
      this.modelTransform.translateX,
      this.modelTransform.translateY,
      this.modelTransform.translateZ
    )
    .scale(new THREE.Vector3(this.modelTransform.scale, -this.modelTransform.scale, this.modelTransform.scale))
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);
        
    this.myCamera.projectionMatrix = m.multiply(l);
    this.renderer.state.reset();
    this.renderer.render(this.myScene, this.myCamera);
    this.map.triggerRepaint();
  }
}

function normalizePoint(center) {
  const p = MercatorCoordinate.fromLngLat(center);
  const mult = 1/this.worldScaleFactor;
  const offset = mult / 2;
  const res = { x: p.x * mult, y: p.y * mult };
  return { res, offset };
}
