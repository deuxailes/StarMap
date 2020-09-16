//*****************//
// StarMap - StarbaseFrozenByte
//*****************//


// Variable - Element = [div]
var text2 = document.createElement('div');
var text3 = document.createElement('div');
var helperText = document.createElement('div');
var spawnButton = document.getElementById('spawnButton');
var delspawnButton = document.getElementById('despawnButton');

// Variable - Firebase 
var database = firebase.database();

// Variable - Libraries 
var controls;
var transformControl;
var ambientLight;

// Variable - Base Scene
var scene;
var renderer, obj1, obj2, objColor;
var lineX, lineZ, lineY;

// Variables - UserInputs
var userHasClicked = false,isDistanceClicked = false, userHasRightClick = false;
var userRequestDelete = false, userShiftClick = false, userDblClick = false;


var EOSsphere, EOSClouds, stationCounter = 0, spawnedLocal = [], spawnedLocalFlag = false, isSpriteActive = false;
var camera, auth;

var numLine = 0;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(1,1);

var sprite,connectedline;
var pairs = [], stations = [], lines = [], distTexts = [];
var loaded = false;

var paramaters = {
    a: "Name 1",
    b: "",
    c: true,
    d: false,
    e: 1, f: 1, g: 1,
    h: 1, i: 1, j: 1,
    k: 1, l: 1, m: 1,
    x: false, y: false, z: false,
    n: true,
    o: ""
}
var initialPosition
var THEREALBOUNDINGSPHEREBITCH;
//Handle Loading
//Create new loading manager
var manager = new THREE.LoadingManager(() =>{
var firstSpawnFlag = false;


});

manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

//Run once loading has been completed
manager.onLoad = function ( ) {
    console.log( 'Loading complete!');
    //time in ms extra for loading
    sleep(0);

    init()
    render()

    //fade out loading screen
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    // remove loader from DOM via event listener
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
};

//run each time a new file begins loading
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

//Run when an error occurs
manager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};
function onTransitionEnd( event ) {
    const element = event.target;
    element.remove();

}

//Assign loader to loader manager
var loader = new THREE.OBJLoader(manager);

//JSON for faction data
const FactionJSON =  [
    {
        "name": "Collective",
        "color": 0xFF5151
    },
    {
        "name": "Kingdom",
        "color": 0xfc5a03
    },
    {
        "name": "Empire",
        "color": 0x40a3ff
    },
    {
        "name": "Dark Star Imperium",
        "color": 0xFFFFFF
    },
    {
        "name": "Machine",
        "color": 0xd4923b
    },
    {
        "name": "Mechanicus",
        "color": 0xc29d6d
    },
    {
        "name": "Imperium of Man",
        "color": 0xc2b44f
    },
    {
        "name": "Dark 0xc20000",
        "color": 0xFF5151
    },
    {
        "name": "Aegis Dynamics",
        "color": 0x8f8383
    },
    {
        "name": "Asage Fleetworks",
        "color": 0xd9cf84
    },
    {
        "name": "Alpha Legion Regime",
        "color": 0xffa557
    },
    {
        "name": "Rising Sun Corporation",
        "color": 0xf0eea5
    },
    {
        "name": "The Grey Legion",
        "color": 0xd577f7
    },
    {
        "name": "Star Industries",
        "color": 0x8dd45d
    },
    {
        "name": "The Solarian Empire",
        "color": 0xf7c143
    },
    {
        "name": "Interstellar Inc.",
        "color": 0xeb73ab
    },
    {
        "name": "Neutral",
        "color": 0xb5b5b5
    }
];
//JSON for model data
const ObjectJSON = [
    {
        "type":"Station",
        "model":"assets-map/models/station.obj",
        "sprite":"assets-map/mesh/station.svg"
    },
    {
        "type":"Flagship",
        "model":"assets-map/models/warship1.obj",
        "sprite":"assets-map/mesh/hostile.svg"
    }

]

//Handle loading the models from Json
let loadedModels = [];
for(let i = 0; i < ObjectJSON.length; i++){
    loader.load(ObjectJSON[i].model, function (object) {
        object.name = ObjectJSON[i].type
        loadedModels.push(object)
    })
}

//Handle loading the models from Json
let spriteLoader =  new THREE.TextureLoader(manager)
let loadedSprites = [];
for(let i = 0; i < ObjectJSON.length; i++){
    spriteLoader.load(ObjectJSON[i].sprite, function (object) {
        object.name = ObjectJSON[i].type
        loadedSprites.push(object)
    })
}

//Load BG
let bgLoad = new THREE.CubeTextureLoader(manager)
    .setPath( 'assets-map/mesh/skybox/' )
    .load( [
        'back.png',
        'front.png',
        'right.png',
        'top.png',
        'left.png',
        'bot.png'
    ] );

//load planet texture
let texture_eos = new THREE.TextureLoader(manager).load( 'assets-map/mesh/earth.png');

//load cloud texture
let texture_cloud = new THREE.TextureLoader(manager).load( 'assets-map/mesh/cloud3.png');

let spriteStation = new THREE.TextureLoader(manager).load( 'assets-map/mesh/Station.svg');

//Sleep function for testing loading screen
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

// Creates distance text sprite above user generated line
function displayDistance(distance, x, y, z) {

    var stringA =  distance.toFixed(1) + "km";

    sprite = new THREE.TextSprite({
        fillStyle: '#eb4034',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 10,
        fontStyle: 'italic',
        text: stringA,
    });

    scene.add(sprite);
    sprite.position.set(x,y,z);

    for(let i =0; i < pairs.length;i++)
        if(pairs[i].length < 4)
        {
            pairs[i].push(sprite);
            distTexts.push(sprite);
            break;
        }
}

// Takes two objects and finds correlated distance text and updates its value and position
function updateDistance(obj1, obj2)
{
    scene.updateMatrixWorld()
    let position1 = obj1.getWorldPosition();
    let position2 = obj2.getWorldPosition();

    var dx = position2.x - position1.x;
    var dy = position2.y - position1.y;
    var dz = position2.z - position1.z;

    if (position2.z == 0 && position1.z == 0) {
        var distance = Math.sqrt((dx * dx) + (dy * dy));

    }
    else {
        var distance = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));

    }
    console.log("Text X: " + (dx/2)*(-1));

    let newPos = new THREE.Vector3((position2.x) + (dx/2)*(-1), (position2.y) + (dy/2)*(-1) + 25, (position2.z) + (dz/2)*(-1))
    return newPos;
}

// Creates the line between two objects
function drawDistance() {


    let lineMaterial = new THREE.LineBasicMaterial({color: 0xeafc7b, transparent: true, opacity: 0.7});
    let lineGeometry = new THREE.Geometry();

    // Gets position of both selected objects
    let position1 = obj1.getWorldPosition();
    let position2 = obj2.getWorldPosition();

    // If second selected object is the planet, then switch positions of 1 and 2
    if (position2.x == 0 && position2.y == 0 && position2.z == 0) {
        position2.x = position1.x;
        position2.y = position1.y;
        position2.z = position1.z;
        position1.x = 0;
        position1.y = 0;
        position1.z = 0;
    }
    lineGeometry.vertices.push(position1);
    lineGeometry.vertices.push(position2);
    let line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    lines.push(line);

    line.name = "Line";
    line.myid = numLine;
    pairs.push(new Array(obj1, obj2, line));
    var dx = position2.x - position1.x;
    var dy = position2.y - position1.y;
    var dz = position2.z - position1.z;

    //If both objects are on 2D plane of X and Y
    if (position2.z == 0 && position1.z == 0) {

        var distance = Math.sqrt((dx * dx) + (dy * dy));
        console.log(distance)
        console.log(obj1.position.distanceTo(obj2.position))
    }
    else
    {
        var distance = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
        console.log(distance)
        console.log(obj1.position.distanceTo(obj2.position))
    }
    if (position2.x == 0 && position2.y == 0 && position2.z == 0 || position1.x == 0 && position1.y == 0 && position1.z == 0) {
        var newCoords = new THREE.Vector3((position2.x) + (dx/35)*(-1), (position2.y) + (dy/35)*(-1) + 25, (position2.z) + (dz/35)*(-1));
        displayDistance(((distance - 448) * 9.06344), newCoords.x, newCoords.y, newCoords.z, line);
    }
    else {
        var newCoords = new THREE.Vector3((position2.x) + (dx/2)*(-1), (position2.y) + (dy/2)*(-1) + 25, (position2.z) + (dz/2)*(-1));
        displayDistance((distance * 9.06344), newCoords.x, newCoords.y, newCoords.z, line);
    }

    return distance;
}

function determineModel(type) {
    for(let i = 0; i < loadedModels.length; i++){
        if (type == loadedModels[i].name){
            return loadedModels[i]
        }
    }
    for(let i = 0; i < loadedModels.length; i++){
        if (loadedModels[i].name == "Station"){
            return loadedModels[i]
        }
    }
}

function determineColor(faction){
    let i = 0;
    while(i < FactionJSON.length){
        if(FactionJSON[i].name == faction){
            return FactionJSON[i].color
        }
        i++
    }
    return 0xb5b5b5
}
function setMat(object, setMat){
    object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material = setMat;
        }
    } );
}

function determineSprite(type) {
    for(let i = 0; i < loadedSprites.length; i++){
        if (type == loadedSprites[i].name){
            return loadedSprites[i]
        }
    }
    for(let i = 0; i < loadedSprites.length; i++){
        if (loadedSprites[i].name == "Station"){
            return loadedSprites[i]
        }
    }
}

// Function that spawns in object e.g. station/flagship
function spawnPOI(type = "Station", owner = "Neutral", info = {"name":"Station","description":null}, newPlace = false, x = 0, y = 500, z = 0, scale = 1,  colorOverride = null  ){
    //Create new ThreeJS object
    let object = new THREE.Object3D();

    //Find model to clone
    let toCloneModel = determineModel(type)

    //Parent a clone of the loaded mesh to the object
    object.add(toCloneModel.clone())

    //Handle colouring
    let color;
    if(!colorOverride){color = determineColor(owner)}
    else{color = colorOverride};

    let mat = new THREE.MeshStandardMaterial({color: new THREE.Color( color), roughness:1, transparent: true, opacity: .4})
    setMat(object, mat)



    //Handle scaling and positioning
    object.children[0].scale.set(0.15 * scale, .15 * scale, .15 * scale);
    object.position.set(x, y, z);

    let map = determineSprite()
    const spritemat = new THREE.SpriteMaterial({
        map: map ,
        color: color,



    });

    let sprite = new THREE.Sprite(spritemat);
    sprite.scale.set(50, 50, 50);
    sprite.position.set(object.position.x, object.position.y, object.position.z)
    //sprite.renderOrder =  1
    //scene.add(sprite)


    object.sprite = sprite

    object.name = info["name"];
    object.description = info["description"]
    object.faction = owner
    object.objectType = type
    object.colorOverride = null
    object.hidden = false

    //Push locally spawned station to spawnedLocal[] stack to be popped by "save to DB button" later
    if (spawnedLocalFlag == true) {
        spawnedLocalFlag = false;
        spawnedLocal.push(object);
        spawnedLocal[stationCounter][0] = owner;
        console.log(spawnedLocal[stationCounter][0])
        spawnedLocal[stationCounter][1] = objColor;
        stationCounter++;
    }

    //Add object into scene
    scene.add(object)
    //scene.add(sprite)
    stations.push(object)
    //camera.lookAt(object)
    //Create and attach transform control
    if (newPlace) {
        transformControl.attach(object);
        scene.add(transformControl);  //TODO remove this cleanly as it only needs to be done the first time it is used

    }
    refreshFilters()
}


//Randomly fill with POIs
function populate(number){
    for(let i = 0; i < number; i++){
        let o = FactionJSON[Math.floor((Math.random() * FactionJSON.length))]
        let distance = 4000
        spawnPOI(ObjectJSON[Math.floor((Math.random() * ObjectJSON.length))].type, FactionJSON[Math.floor((Math.random() * FactionJSON.length))].name , undefined, false, Math.floor((Math.random() * distance)-(distance/2)), Math.floor((Math.random() * distance)-(distance/2)), Math.floor((Math.random() * distance)-(distance/2)), undefined, undefined);
    }
}

function removeLine(line)
{
  scene.remove(line)

  //remove the distance text paired with line from the scene
  let i = findRightPair(line);
  
  if(pairs[i][2].uuid == line.uuid){

    for(let j = 0; j < distTexts.length; j++) // remove the distance text from the list since it is out of the scene         
      if(distTexts[j].uuid == pairs[i][3].uuid)
        distTexts.splice(j,1);

    scene.remove(pairs[i][3]) //removes the text
    pairs.splice(i,1) //remove the pair from list   

    for(let j = 0; j < lines.length; j++) // update the current list of lines in the scene after remove 
      if(lines[j].uuid == line.uuid)
        lines.splice(j,1);
      
    }
  
}
let o;

//Filters presets, press "k" on map to cycle through
let filtersA =  [
    {filters:[
            {
                name: "faction",
                terms:["Kingdom", "Collective", ]
            },
            {
                name:"objectType",
                terms:["Station"]
            }
        ]},
    {filters:[
            {
                name: "faction",
                terms:["Neutral"]
            },
            {
                name:"objectType",
                terms:["Flagship"]
            }
        ]},

]

let filtersB =  [
    {filters:[
            {
                name: "faction",
                terms:["Neutral",]
            },
            {
                name:"objectType",
                terms:["Station"]
            }
        ]},
    {filters:[
            {
                name: "faction",
                terms:["Machine"]
            },
            {
                name:"objectType",
                terms:["Station"]
            }
        ]},

]
let currentFilters;



function checkAgainstFilters(object, filterSet = currentFilters) {
    let match = false
    //Loop through filter sets
    if (filterSet) {
        for (let i = 0; i < filterSet.length; i++) {
            let internalMatch = true

            //Loop through filters
            for (let k = 0; k < filterSet[i].filters.length; k++) {

                if (internalMatch) {

                    //If the object follows this parameter then do nothing else, make it not match
                    if (filterSet[i].filters[k].terms.includes(object[filterSet[i].filters[k].name])) {
                    } else {
                        internalMatch = false
                    }
                }
            }
            if (internalMatch) {
                match = true;
                break;
            }


        }
        return match
    }
    else{
        match = true
        return match
    }
}
function refreshFilters(){

    //console.log(currentFilters)

    if(stations.length > 0) {
        //Loop through each object
        for (let i = 0; i < stations.length; i++){
            let object = stations[i]

            let match = checkAgainstFilters(object, currentFilters)
           // console.log(i)

            //Show or hide
            if(match){
                if(object.hidden != false){
                    object.hidden = false
                    //console.log(object)

                }
            }
            else{
                if(match != true){
                    object.hidden = true
                }
            }
        }
    }
}

function render() {
    requestAnimationFrame(render);
    EOSsphere.rotation.y += 0.00025;
    EOSClouds.rotation.y = EOSsphere.rotation.y + 0.002;
    
    raycaster.setFromCamera( mouse, camera );
    var stationList = raycaster.intersectObjects(stations,true);
    
    //hover event spawn in sprite label
    if (stationList.length > 0) {
        obj = stationList[0].object.parent.parent;
        if (obj.name.includes("Station",0) && isSpriteActive == false) {

            var factionName = obj.faction;
            var stationLoc = obj.position;
            var stationPop = 0;
            
            let sprite = makeTextSprite(" Faction: " + factionName + "\n Location: [ " + stationLoc.x.toFixed(1) +", "+ stationLoc.y.toFixed(1) + ", "+ stationLoc.z.toFixed(1) + " ]"  + "\n Est. Population: " + stationPop);
            scene.add(sprite);
            isSpriteActive = true;
            sprite.name = "sprite"
            sprite.position.set(obj.position.x,obj.position.y + 60,obj.position.z)
        }
    }
    else if (stationList.length == 0 && isSpriteActive == true) // remove sprite label
    {

        for(let i = 0; i < scene.children.length; i++)
            if(scene.children[i].name == "sprite"){
                let sprite = scene.children[i];
                scene.remove(sprite);
                isSpriteActive = false;
            }
    }
    


    if(userShiftClick) {
        userShiftClick = false;
        userHasClicked = false;

        raycaster.setFromCamera( mouse, camera );
        intersects = raycaster.intersectObjects( scene.children,true );

        if (intersects.length > 1)
        {
            transformControl.detach();

            console.log(obj1 + " " + obj2 + "!!!!!!!");
           
            //first station is selected
            if (obj1 == null && obj2 == null) {
                    obj1 = intersects[0].object.parent.parent;
                    helperText.innerHTML = " First object has been selected. ";
                    document.body.appendChild(helperText);
                    $("#helperText").fadeIn();
                    setTimeout(function() {
                        $("#helperText").fadeOut();
                      }, 3000);

                    console.log(obj1.getWorldPosition());
            }
            else if (obj1 != null && obj2 == null) { //second station is selected
                    obj2 = intersects[0].object.parent.parent;

                    

                    if ((obj1.uuid == obj2.uuid)) {
                        helperText.innerHTML = "Please select two different objects.";
                        $("#helperText").fadeIn();
                        setTimeout(function() {
                            $("#helperText").fadeOut();
                        }, 3000);
                        console.log("farts");
                        obj1 = null;
                        obj2 = null;
                    }
                    else{
                        helperText.innerHTML = " Second object has been selected.";
                        $("#helperText").fadeIn();
                        setTimeout(function() {
                            $("#helperText").fadeOut();
                          }, 3000);
                        isDistanceClicked = false;
                        console.log(obj2.getWorldPosition());
                        

                        var distance = drawDistance();

                        obj1 = null;
                        obj2 = null;
                    }

            }

            else
                console.log("error retard");
        
        }
    }
    //Ronin7151 1/17/2020: userDblClick function to focus and zoom in to selected object.  Updated object lookAt function to include object coords and added zoom change
    else if (userDblClick) {
        userDblClick = false;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects(stations,true);
        var obj = intersects[0].object.parent.parent;
        if (intersects.length > 0){
            controls.target = new THREE.Vector3(obj.position.x,obj.position.y,obj.position.z);
            zoomIn()
        }
        camera.updateProjectionMatrix();
        lineY.visible = false;
        lineX.visible = false;
        lineZ.visible = false;
    }

    else if (userHasClicked) {
        userHasClicked = false;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects(scene.children,true);

        if (intersects.length > 1) {

            var nameobj = intersects[1].object.parent.name;
            if (nameobj.includes("Station", 0) || nameobj.includes("Flagship", 0)) {

                transformControl.attach(intersects[1].object.parent.parent);
                scene.add(transformControl);
                initialPosition = intersects[1].object.parent.parent.position;
                console.log(intersects[1].object.parent.parent.position.x + " poop");

            }
        }
    }


    window.addEventListener('resize', function() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    
    if(transformControl != null && transformControl.object != null){

        
        if(transformControl.dragging) {
            scene.updateMatrixWorld()
            let selectedObj = transformControl.object;
            let compareObj;
            for(let i = 0; i < pairs.length; i++) {
                for(let j = 0; j < 2; j++) {

                    compareObj = pairs[i][j];

                    if(selectedObj.uuid == compareObj.uuid) {

                        connectedline = pairs[i][2];
                        connectedline.geometry.verticesNeedUpdate = true;

                        let position1 = new THREE.Vector3();
                        let position2 = new THREE.Vector3();
                        pairs[i][0].getWorldPosition(position1);
                        pairs[i][1].getWorldPosition(position2);
                        connectedline.geometry.vertices[0] = position1
                        connectedline.geometry.vertices[1] = position2

                        if (position2.x == 0 && position2.y == 0 && position2.z == 0) {
                            position2.x = position1.x;
                            position2.y = position1.y;
                            position2.z = position1.z;
                            position1.x = 0;
                            position1.y = 0;
                            position1.z = 0;
                        }

                        var dx = position2.x - position1.x;
                        var dy = position2.y - position1.y;
                        var dz = position2.z - position1.z;
                        let distance;
                        if (position2.z == 0 && position1.z == 0)
                            distance = Math.sqrt((dx*dx) + (dy*dy));
                        else
                            distance = Math.sqrt((dx*dx)+(dy*dy)+(dz*dz));



                        if (position2.x == 0 && position2.y == 0 && position2.z == 0 || position1.x == 0 && position1.y == 0 && position1.z == 0) {
                            var newCoords = new THREE.Vector3((position2.x) + (dx/35)*(-1), (position2.y) + (dy/36)*(-1) + 25, (position2.z) + (dz/35)*(-1));
                            pairs[i][3].text = ((distance - 448) * 9.0634).toFixed(1) + "km";
                        }
                        else {
                            var newCoords = new THREE.Vector3((position2.x) + (dx/2)*(-1), (position2.y) + (dy/2)*(-1) + 25, (position2.z) + (dz/2)*(-1));
                            pairs[i][3].text = (distance * 9.0634).toFixed(1) + "km";
                        }
                        pairs[i][3].position.set(newCoords.x,newCoords.y,newCoords.z);


                    }
                }
            }
            
            lineY.visible = true;
            lineX.visible = true;
            lineZ.visible = true;
            
            lineY.geometry.vertices[0] = new THREE.Vector3(transformControl.object.position.x, 0, transformControl.object.position.z);
            lineY.geometry.vertices[1] = new THREE.Vector3(transformControl.object.position.x, transformControl.object.position.y, transformControl.object.position.z);
            lineX.geometry.vertices[0] = new THREE.Vector3(transformControl.object.position.x, 0, 2200);
            lineX.geometry.vertices[1] = new THREE.Vector3(transformControl.object.position.x, 0, -2200);
            lineZ.geometry.vertices[0] = new THREE.Vector3(2200, 0, transformControl.object.position.z);
            lineZ.geometry.vertices[1] = new THREE.Vector3(-2200, 0, transformControl.object.position.z);
            lineX.geometry.verticesNeedUpdate = true;
            lineZ.geometry.verticesNeedUpdate = true;
            lineY.geometry.verticesNeedUpdate = true;
            

        }
        else {
            lineX.visible = false;
            lineZ.visible = false;
            lineY.visible = false;

            if(THEREALBOUNDINGSPHEREBITCH.containsPoint(new THREE.Vector3(transformControl.object.position.x,transformControl.object.position.y,transformControl.object.position.z)))
            {
                transformControl.object.position.x = 0;
                transformControl.object.position.y = 588;
                transformControl.object.position.z = 0;
                
                let pairX = findRightPair(transformControl.object)
                for (let i = 0; i < pairX.length; i++) {
                        correctPairLocation(pairX[i]);
                }
                

                transformControl.detach();

                text3.id = "errorDialog"
                text3.style.position = 'absolute';
                text2.style.border = "dashed solid #0000FF";
                text3.style.width = 100;
                text3.style.height = 100;
                text3.style.backgroundColor = "blue";
                text3.innerHTML = "ERROR: CANNOT PLACE OBJECT IN PLANET";
                text3.style.top = 300 + 'px';
                text3.style.left = 600 + 'px';
                text3.style.color = "red";
                document.body.appendChild(text3);

                $("#errorDialog").fadeIn();
                setTimeout(function() {
                    $("#errorDialog").fadeOut();
                  }, 3000);
     
            }

        }
    }


    if(connectedline)
        connectedline.geometry.verticesNeedUpdate = true;


    controls.update();
    renderer.render(scene, camera);

}

function makeTextSprite( message, parameters )
{
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:171, g:144, b:144, a:.41 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:248, g:57, b:57, a:.41 };

    //var spriteAlignment = THREE.SpriteAlignment.topLeft;


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth =500;

    // background color
    context.fillStyle   = "rgba(248, 57, 57, .46)";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, 296, 145, 6);


    // text color
    context.fillStyle = "rgba(255, 255, 255, 1.0)";

    let infoText = message.split('\n');
    context.fillText( infoText[0], 10, 25);
    context.fillText( infoText[1], 10, 50);
    context.fillText( infoText[2], 10, 75);
    // context.fillText( message, 10, 25);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, transparent: true} );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;
}

function roundRect(ctx, x, y, w, h, r)
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function onMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
  
function MouseWheelHandler(event)
{
    if(camera.fov != 55){
        camera.fov = 55;
        camera.updateProjectionMatrix()
        controls.target = new THREE.Vector3(0,0,0)
    }
}


function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({antialias:true,  });
    renderer.sortObjects = false;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera = new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,10,30000);
    controls = new THREE.OrbitControls(camera,renderer.domElement);
    transformControl = new THREE.TransformControls( camera, renderer.domElement );
    transformControl = new THREE.TransformControls( camera, renderer.domElement );
    ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    camera.position.set(2405,1080,-300);
    document.body.appendChild(renderer.domElement);
    controls.maxDistance = 20000;
    controls.minDistance = 100
    controls.enabled = true;
    var firstRound = true;

   let directionalLight = new THREE.DirectionalLight( 0xffffff, 2);
    scene.add( directionalLight );
    directionalLight.position.set(1000,300,0)

    currentFilters = filtersA

    spawnPOI("Station", "Kingdom",undefined,false,778.8065, 0, 41.9717); // kingdom
    spawnPOI("Station", "Empire",undefined,false,778.8065, 0, -41.9717); // empire
    spawnPOI("Station", "Neutral",undefined,false,725.8065, 0, 0); // neutral
    spawnPOI("Station", "Neutral",undefined,false,831.8065, 0, 0); // neutral
    spawnPOI("Station", undefined,undefined,false,820.8065, 25, -15);
    spawnPOI("Station", undefined,undefined,false,745.8065, -20, 30);
    spawnPOI("Station", undefined,undefined,false,760.8065, -10, -25);
    spawnPOI("Station", undefined,undefined,false,780.8065, 0, 10);

    let lineMaterial = new THREE.LineBasicMaterial({color: 0x00ff00, transparent: false, opacity: 0.7}); 	
    let lineMaterialY = new THREE.LineBasicMaterial({color: 0x0000FF, transparent: false, opacity: 0.7});
    let lineXGeometry = new THREE.Geometry();
    let lineZGeometry = new THREE.Geometry();
    let lineYGeometry = new THREE.Geometry();

    lineX = new THREE.Line(lineXGeometry, lineMaterial);
    lineZ = new THREE.Line(lineZGeometry, lineMaterial);
    lineY = new THREE.Line(lineYGeometry, lineMaterialY);

    lineYGeometry.vertices.push(new THREE.Vector3(0, 1000, 0));
    lineYGeometry.vertices.push(new THREE.Vector3(0, -1000, 0));
    lineXGeometry.vertices.push(new THREE.Vector3(0, 0, 1000));
    lineXGeometry.vertices.push(new THREE.Vector3(0, 0, -1000));
    lineZGeometry.vertices.push(new THREE.Vector3(1000, 0, 0));
    lineZGeometry.vertices.push(new THREE.Vector3(-1000, 0, 0));
    scene.add(lineX);
    scene.add(lineZ);
    scene.add(lineY);

    lineX.visible = false;
    lineZ.visible = false;
    lineY.visible = false;

    helperText.id = "helperText"
    helperText.style.position = 'absolute';
    helperText.style.border = "solid #FFFFFF";
    helperText.style.width = 600;
    helperText.style.height = 600;
    helperText.style.fontSize = "x-large"; 
    helperText.style.backgroundColor = "transparent";
    helperText.innerHTML = " Successfully logged in... ";
    helperText.style.padding = "5px 10px 5px 10px";
    helperText.style.top = 150 + 'px';
    helperText.style.left = 150 + 'px';
    helperText.style.color = "white";
    helperText.style.visibility = "false";
    

    
    //Uncomment this for random stations

     //populate(1000)


    /*Spawn in asteroid belt. 
    loader.load('assets-map/models/roid_ring1',
        function ( object ) {
            scene.add( object );
        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function ( error ) {
            console.log( 'An error happened' );
        }
    );*/

    document.addEventListener( 'mousemove', onMouseMove, false );

    document.addEventListener('click', function (e) {
        if (e.shiftKey) {
            userShiftClick = true;

            transformControl.detach();


        }

    });

    document.addEventListener('keydown', function (e) {
        if (e.which == 46) {//delete key is pressed

          raycaster.setFromCamera( mouse, camera );
          var linesList = raycaster.intersectObjects(lines);
          var textList = raycaster.intersectObjects(distTexts);
          
          if(linesList.length > 0)
            removeLine(linesList[0].object)
          else if(textList.length > 0)
          {
            let i = findRightPair(textList[0].object) //get index for right pair
            removeLine(pairs[i][2]); 
          }
        }
    });
    window.addEventListener('mousedown', function (e) {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;

        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        if(e.button == 2)
            userHasRightClick = true;
        else
            userHasClicked = true;

    });

    window.addEventListener('dblclick', function(){
        transformControl.detach();
        userDblClick = true;
    });
    let l = 1

    document.onkeydown = function(evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27 && transformControl.enabled == true) {
            console.log("HELLO");
            transformControl.detach();
        }
    };

    //Toms debug output
    window.addEventListener("keypress", function (e) {
        if(e.key == "k" ){
            //console.log(camera.position)
            //console.log(stations)


            switch (l) {
                case 0:
                    currentFilters = filtersA;
                    break;

                case 1:
                    currentFilters = filtersB;
                    break;

                case 2:
                    currentFilters = null;
                    break;
            }

            if(l < 2){l++}
            else{l = 0}
            refreshFilters()
            console.log(currentFilters)
        }
    });



    renderer.domElement.addEventListener('wheel', MouseWheelHandler ,false);


    $('#spawnButton').on('click', function (e) {
        let objType = $('#basicA').val();
        let objColor = $('#basicB').val();
        spawnedLocalFlag = true;

        helperText.style.fontSize = "x-large";
        helperText.innerHTML = "Spawning in a " + objColor + " " + objType + ".";

        $("#helperText").fadeIn();
        setTimeout(function() {
            $("#helperText").fadeOut();
          }, 3000);

        spawnPOI(objType, objColor, undefined ,true);
        scene.remove(ring);
        scene.add(ring);
    });


    $('#delspawnButton').on('click', function (e) {

            if (transformControl.object != null) {
                var objectDeleted = transformControl.object;
            }
            transformControl.detach();
            firebase.database().ref("object/zGQRSHnZ15ENJum2mChA/spawnedObjects").on('value', function(snap){

                snap.forEach(function(childNodes){

                    if (childNodes.val().posx == objectDeleted.position.x && childNodes.val().posy == objectDeleted.position.y && childNodes.val().posz == objectDeleted.position.z) {
                        ref.child(childNodes.key).remove();
                    }
                });
            });
            console.log("test " + transformControl.object);
            scene.remove( objectDeleted );
            e.preventDefault();
        }
    );

    $('#saveButton').on('click', function (f) {
        console.log("SAVE BUTTON PRESSED!");
        let index = 0;
        var postsRef = firebase.database().ref("object/zGQRSHnZ15ENJum2mChA/spawnedObjects");
        for (index = 0; index < spawnedLocal.length; index++) {
            console.log("Pushing | " + spawnedLocal[index].faction + " | " + spawnedLocal[index].objectType)
            postsRef.push({
                posx: Math.floor(spawnedLocal[index].position.x),
                posy: Math.floor(spawnedLocal[index].position.y),
                posz: Math.floor(spawnedLocal[index].position.z),
                id: spawnedLocal[index].faction + spawnedLocal[index].objectType + Math.floor(spawnedLocal[index].position.x) + Math.floor(spawnedLocal[index].position.y) + Math.floor(spawnedLocal[index].position.z),
                faction: spawnedLocal[index].faction,
                type: spawnedLocal[index].objectType,
                description: spawnedLocal[index].description,
                colorOverride: spawnedLocal[index].colorOverride
            });
        }
        spawnedLocal = [];
        stationCounter = 0;
        f.preventDefault();
    });

    $('#btnLogin').on('click', function (e) {
        console.log("LOGIN BUTTON PRESSED!");
        let txtEmail = document.getElementById('txtEmail');
        let txtPassword = document.getElementById('txtPassword');

        let email = txtEmail.value;
        let pass = txtPassword.value;
        auth = firebase.auth();


        firebase.auth().signInWithEmailAndPassword(email, pass).then(function(user) {
            
            document.body.appendChild(helperText);
            helperText.style.visibility = "true";

            $("#helperText").fadeIn();
            setTimeout(function() {
                $("#helperText").fadeOut();
              }, 3000);

            document.getElementById("btnLogin").style.visibility="hidden";
            document.getElementById("btnSignUp").style.visibility="hidden";

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(function() {
                console.log("PERSISTENCE SET TO LOCAL");
            })
            .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
            });

            firebase.database().ref("object/zGQRSHnZ15ENJum2mChA/spawnedObjects").on('value', function(snap){
                snap.forEach(function(childNodes){
                        if(loaded != true)
                            spawnPOI(childNodes.val().type,childNodes.val().faction, undefined, false, childNodes.val().posx, childNodes.val().posy, childNodes.val().posz, undefined, undefined);
                });
            });
            scene.remove(ring);
            scene.add(ring);
            loaded = true;
         }).catch(function(error) {
             var errorCode = error.code;
             var errorMessage = error.message;
         
             if (errorCode === 'auth/wrong-password') {
                 alert('Wrong password.');
             } else {
                 alert(errorMessage);         
             }
             console.log(error);
         });
         e.preventDefault();
         
    });

    

    $('#btnSignUp').on('click', e => {
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();

        const promise = auth.createUserWithEmailAndPassword(email, pass);

        promise
            .catch(e => console.log(e.message));

    });

    $('#btnLogout').on('click',  function (e) {
        firebase.auth().signOut();
        window.location.reload(false);
    });

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width  = canvas.clientWidth  * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) { // Important for having MAX pixels.
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    scene.background = bgLoad;

    // EOS'  geometry, material then rotation speed.
    var EOSgeometry = new THREE.SphereGeometry( 75, 100, 100 );
    var EOSmaterial = new THREE.MeshStandardMaterial( {map: texture_eos, roughness:1} );
    EOSsphere = new THREE.Mesh( EOSgeometry, EOSmaterial );
    EOSsphere.scale.set(6,6,6);
    scene.add( EOSsphere );
    EOSsphere.geometry.computeBoundingSphere();
    EOSsphere.geometry.boundingSphere.set(new THREE.Vector3(0,0,0),453.8);
    THEREALBOUNDINGSPHEREBITCH = new THREE.Sphere(new THREE.Vector3(0,0,0),453.8);

    let EOSCloudsGeom = new THREE.SphereGeometry( 76, 100, 100);
    let EOSCloudmaterial = new THREE.MeshStandardMaterial( {color:0xCDDDFD, transparent: true, opacity: 0.5, alphaMap: texture_cloud} );
    EOSCloudmaterial.depthWrite = false;
    EOSClouds = new THREE.Mesh(EOSCloudsGeom, EOSCloudmaterial);
    EOSClouds.scale.set(6,6,6);
    scene.add(EOSClouds);


    var geometry = new THREE.RingGeometry( 1022, 780, 80 );
    var material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide, transparent: true, opacity: 0.05 } );
    var ring = new THREE.Mesh( geometry, material );
    scene.add( ring );
    ring.rotation.x = Math.PI / 2   

    var helper = new THREE.PolarGridHelper(1989, 30, 8.225, 100, 0xFD4747, 0xFD4747);//radius, radials, circles, divisions
    helper.material.transparent = true;
    helper.material.opacity = 0.3;
    scene.add( helper);

    resizeRendererToDisplaySize(renderer);

    // So camera doesnt move.
    transformControl.addEventListener('mouseDown', function () {
        controls.enabled = false;
    });
    transformControl.addEventListener('mouseUp', function () {
        controls.enabled = true;
    });


    var ref = firebase.database().ref("object/zGQRSHnZ15ENJum2mChA/spawnedObjects");

    ref.on("value", function(snapshot) {
        console.log(snapshot.val());
    }, function (error) {
        console.log("Error: " + error.code);
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user != null) {
            firebase.database().ref("object/zGQRSHnZ15ENJum2mChA/spawnedObjects").on('value', function(snap){
                console.log("SPAWNING!");
                snap.forEach(function(childNodes){
                    spawnPOI(childNodes.val().id,childNodes.val().faction, undefined, false, childNodes.val().posx, childNodes.val().posy, childNodes.val().posz, undefined, undefined);
                });
                scene.remove(ring);
                scene.add(ring);
            });
        }
    //Run once everything is spawned
    refreshFilters()
    });
}
function zoomIn() {
    if(camera.fov > 3) {

        transition(cameraZoomIn,30);
    }

}

//Create a transition for the movement func (go left, up, zoom,...) where func must move with amount quantity
function transition(func, quantity) {
    var intervalTime = 15;
    //We make a small version of the same movement : move 1/10 of the original quantity every intervalTime
    var interval = setInterval(function(){func(quantity/10)}, intervalTime);
    //We stop doing the movement when we have done 10 times the small movement
    setTimeout(function(){clearInterval(interval)}, intervalTime*10)
}

//small amount of zoom
function cameraZoomIn(quantity){
    camera.fov -= quantity;
    camera.updateProjectionMatrix();
}

//small amount of zoom
function cameraZoomOut(quantity){
    camera.fov += quantity;
    camera.updateProjectionMatrix();
}

function findRightPair(pairObj) //just to a helper function to make code cleaner
{

    let pairLocs = [];

  if(pairObj.name == "Station"){
    for(let i = 0; i < pairs.length; i++)
      for(let j = 0; j < 4; j++)
        if(pairObj.uuid == pairs[i][j].uuid)
          pairLocs.push(i);
  }
  else if(pairObj.name == "Line"){
    for(let i = 0; i < pairs.length; i++)
      if(pairObj.uuid == pairs[i][2].uuid)
        pairLocs.push(i);

  }
  else{
    for(let i = 0; i < pairs.length; i++)
      if(pairObj.uuid == pairs[i][3].uuid)
        pairLocs.push(i);
  }

  return pairLocs;
}

function correctPairLocation(pairIndex){

    connectedline = pairs[pairIndex][2];


    let position1 = pairs[pairIndex][0].getWorldPosition();
    let position2 = pairs[pairIndex][1].getWorldPosition();
    connectedline.geometry.vertices[0] = position1
    connectedline.geometry.vertices[1] = position2
    connectedline.geometry.verticesNeedUpdate = true;

    if (position2.x == 0 && position2.y == 0 && position2.z == 0) {
        position2.x = position1.x;
        position2.y = position1.y;
        position2.z = position1.z;
        position1.x = 0;
        position1.y = 0;
        position1.z = 0;
    }

    var dx = position2.x - position1.x;
    var dy = position2.y - position1.y;
    var dz = position2.z - position1.z;
    let distance;
    if (position2.z == 0 && position1.z == 0)
        distance = Math.sqrt((dx*dx) + (dy*dy));
    else
        distance = Math.sqrt((dx*dx)+(dy*dy)+(dz*dz));



    if (position2.x == 0 && position2.y == 0 && position2.z == 0 || position1.x == 0 && position1.y == 0 && position1.z == 0) {
        var newCoords = new THREE.Vector3((position2.x) + (dx/35)*(-1), (position2.y) + (dy/36)*(-1) + 25, (position2.z) + (dz/35)*(-1));
        pairs[pairIndex][3].text = ((distance - 448) * 9.0634).toFixed(1) + "km";
    }
    else {
        var newCoords = new THREE.Vector3((position2.x) + (dx/2)*(-1), (position2.y) + (dy/2)*(-1) + 25, (position2.z) + (dz/2)*(-1));
        pairs[pairIndex][3].text = (distance * 9.0634).toFixed(1) + "km";
    }
    pairs[pairIndex][3].position.set(newCoords.x,newCoords.y,newCoords.z)
}

          
